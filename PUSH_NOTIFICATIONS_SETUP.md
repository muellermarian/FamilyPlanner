# Push-Benachrichtigungen einrichten

## Problem

Die Edge Function `daily-calendar-notifications` existiert, aber wird nicht automatisch täglich um 06:15 Uhr ausgeführt.

## Lösung 1: Supabase pg_cron (Empfohlen für Production)

1. Gehe zum Supabase Dashboard → SQL Editor
2. Führe folgenden SQL-Code aus:

```sql
-- Aktiviere pg_cron Extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Erstelle einen Cron-Job, der täglich um 06:15 Uhr UTC läuft
SELECT cron.schedule(
  'daily-calendar-notifications',  -- Job-Name
  '15 6 * * *',                     -- Cron-Expression (06:15 UTC = 07:15 MEZ / 08:15 MESZ)
  $$
    SELECT
      net.http_post(
        url := 'https://[dein-projekt].supabase.co/functions/v1/daily-calendar-notifications',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer [dein-service-role-key]'
        ),
        body := '{}'::jsonb
      ) AS request_id;
  $$
);

-- WICHTIG: Ersetze:
-- - [dein-projekt] mit deiner Supabase-Projekt-ID
-- - [dein-service-role-key] mit deinem Service Role Key (aus Settings → API)
-- - Zeitzone beachten: 06:15 UTC = 07:15 MEZ (Winter) / 08:15 MESZ (Sommer)
```

3. Cron-Jobs anzeigen:

```sql
SELECT * FROM cron.job;
```

4. Cron-Job löschen (falls nötig):

```sql
SELECT cron.unschedule('daily-calendar-notifications');
```

## Lösung 2: Externe Cron-Service (Für Testing/Development)

Nutze einen kostenlosen Cron-Service wie:

- **cron-job.org** (kostenlos)
- **EasyCron** (kostenlos für 1 Job)

Richte einen HTTP GET/POST Request ein auf:

```
https://[dein-projekt].supabase.co/functions/v1/daily-calendar-notifications
```

Header:

```
Authorization: Bearer [dein-service-role-key]
```

Zeitplan: Täglich um 06:15 Uhr (Zeitzone beachten!)

## Lösung 3: GitHub Actions (Kostenlos)

Erstelle `.github/workflows/daily-notifications.yml`:

```yaml
name: Daily Calendar Notifications

on:
  schedule:
    - cron: '15 6 * * *' # 06:15 UTC
  workflow_dispatch: # Manuelles Auslösen für Tests

jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - name: Call Supabase Function
        run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}" \
            -H "Content-Type: application/json" \
            https://[dein-projekt].supabase.co/functions/v1/daily-calendar-notifications
```

Füge in GitHub Repository Settings → Secrets:

- `SUPABASE_SERVICE_ROLE_KEY`

## Test der Function

Manueller Test via Terminal:

```bash
curl -X POST \
  -H "Authorization: Bearer [dein-service-role-key]" \
  -H "Content-Type: application/json" \
  https://[dein-projekt].supabase.co/functions/v1/daily-calendar-notifications
```

Oder im Browser/Postman:

- URL: `https://[dein-projekt].supabase.co/functions/v1/daily-calendar-notifications`
- Method: POST
- Header: `Authorization: Bearer [service-role-key]`

## Zeitzone beachten!

- UTC 06:15 = 07:15 MEZ (Winter)
- UTC 06:15 = 08:15 MESZ (Sommer)

Wenn du 06:15 lokale Zeit (Deutschland) möchtest:

- Winter: `'15 5 * * *'` (05:15 UTC)
- Sommer: `'15 4 * * *'` (04:15 UTC)

Oder nutze die richtige Zeitzone:

```sql
-- Für Deutschland (Europe/Berlin)
'15 6 * * *' TZ='Europe/Berlin'
```

## Debugging

1. Push-Subscription prüfen:

```sql
SELECT * FROM push_subscriptions WHERE family_id = '[deine-family-id]';
```

2. Kalender-Events für heute prüfen:

```sql
SELECT * FROM calendar_events
WHERE family_id = '[deine-family-id]'
AND event_date = CURRENT_DATE;
```

3. Edge Function Logs im Supabase Dashboard → Edge Functions → Logs

4. Service Worker Status im Browser:
   - Developer Tools → Application → Service Workers
   - Sollte "activated and running" sein
