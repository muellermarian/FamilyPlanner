# Push-Benachrichtigungen Setup-Anleitung

Die Push-Benachrichtigungen sind jetzt im Frontend vorbereitet! Hier sind die nächsten Schritte:

## 1. VAPID Keys generieren

```bash
npx web-push generate-vapid-keys
```

Das generiert zwei Keys. Füge sie zu deiner `.env` hinzu:

```env
VITE_VAPID_PUBLIC_KEY=dein-public-key-hier
VAPID_PRIVATE_KEY=dein-private-key-hier  # Nur für Backend/Edge Function!
```

⚠️ **WICHTIG**: Der PRIVATE KEY darf NICHT ins Frontend! Nur in Supabase Edge Function Environment Variables.

## 2. Supabase Datenbank Setup

Führe das SQL-Script aus:

1. Öffne Supabase Dashboard → SQL Editor
2. Kopiere den Inhalt von `supabase_push_subscriptions.sql`
3. Führe es aus

## 3. Supabase Edge Function erstellen

Die Edge Function sendet täglich Push-Notifications. Erstelle sie so:

### a) Supabase CLI installieren (falls noch nicht geschehen)

**Für Windows - Option 1: Scoop (empfohlen)**

```powershell
# Installiere Scoop falls noch nicht vorhanden
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex

# Installiere Supabase CLI
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

**Für Windows - Option 2: Als npm Dev-Dependency**

```bash
# Im Projektverzeichnis
npm install supabase --save-dev

# Dann mit npx verwenden
npx supabase login
```

Nach der Installation:

```bash
supabase login
# Oder mit npx:
npx supabase login
```

### b) Edge Function erstellen

```bash
# Mit Scoop/direkter Installation:
supabase functions new daily-calendar-notifications

# Oder mit npx:
npx supabase functions new daily-calendar-notifications
```

### c) Function Code (`supabase/functions/daily-calendar-notifications/index.ts`):

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')!;
const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY')!;
const VAPID_EMAIL = 'mailto:your-email@example.com'; // Deine E-Mail

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Hole heute's Datum
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    // Hole alle Familien mit Push-Subscriptions
    const { data: subscriptions } = await supabase
      .from('push_subscriptions')
      .select('*, families!inner(*)');

    if (!subscriptions || subscriptions.length === 0) {
      return new Response('No subscriptions found', { status: 200 });
    }

    // Gruppiere nach Familie
    const familyMap = new Map<string, any[]>();
    subscriptions.forEach((sub: any) => {
      if (!familyMap.has(sub.family_id)) {
        familyMap.set(sub.family_id, []);
      }
      familyMap.get(sub.family_id)!.push(sub);
    });

    const results = [];

    // Für jede Familie: Hole Events und sende Notifications
    for (const [familyId, familySubs] of familyMap) {
      // Hole Calendar Events
      const { data: events } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('family_id', familyId)
        .eq('event_date', dateStr);

      // Hole Todos mit due_at heute
      const { data: todos } = await supabase
        .from('todos')
        .select('*')
        .eq('family_id', familyId)
        .like('due_at', `${dateStr}%`)
        .eq('isDone', false);

      // Hole Geburtstage
      const { data: contacts } = await supabase
        .from('contacts')
        .select('*')
        .eq('family_id', familyId)
        .not('birthdate', 'is', null);

      const birthdaysToday =
        contacts?.filter((c: any) => {
          if (!c.birthdate) return false;
          const bday = new Date(c.birthdate);
          return bday.getMonth() === today.getMonth() && bday.getDate() === today.getDate();
        }) || [];

      const totalItems = (events?.length || 0) + (todos?.length || 0) + birthdaysToday.length;

      if (totalItems === 0) continue;

      // Erstelle Notification-Text
      let body = `Du hast heute ${totalItems} Termin(e):\n`;
      events?.forEach((e: any) => (body += `📅 ${e.title}\n`));
      todos?.forEach((t: any) => (body += `⬜ ${t.task}\n`));
      birthdaysToday.forEach((b: any) => (body += `🎂 ${b.first_name} ${b.last_name}\n`));

      // Sende an alle Subscriptions dieser Familie
      for (const sub of familySubs) {
        const subscription = JSON.parse(sub.subscription);

        try {
          const pushPayload = {
            title: 'Deine Termine heute',
            body: body.trim(),
            icon: '/icons/icon-192x192.png',
            url: '/calendar',
          };

          // Web Push senden
          await fetch('https://fcm.googleapis.com/fcm/send', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `key=${VAPID_PRIVATE_KEY}`,
            },
            body: JSON.stringify({
              to: subscription.endpoint,
              notification: pushPayload,
            }),
          });

          results.push({ success: true, familyId });
        } catch (error) {
          console.error('Push error:', error);
          results.push({ success: false, familyId, error: error.message });
        }
      }
    }

    return new Response(JSON.stringify({ results }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
```

### d) Deploy Function

```bash
supabase functions deploy daily-calendar-notifications
```

### e) Set Environment Variables in Supabase Dashboard

Gehe zu: **Edge Functions → daily-calendar-notifications → Settings**

Füge hinzu:

- `VAPID_PRIVATE_KEY`: dein-private-key
- `VAPID_PUBLIC_KEY`: dein-public-key

## 4. Cron Job einrichten

### Option A: Supabase Cron (empfohlen)

```sql
-- In Supabase SQL Editor
SELECT cron.schedule(
  'daily-calendar-notifications',
  '0 8 * * *',  -- Jeden Tag um 8:00 Uhr
  $$
  SELECT net.http_post(
    url := 'https://dein-projekt.supabase.co/functions/v1/daily-calendar-notifications',
    headers := jsonb_build_object('Authorization', 'Bearer ' || current_setting('app.service_role_key'))
  );
  $$
);
```

### Option B: GitHub Actions (Alternative)

Erstelle `.github/workflows/daily-notifications.yml`:

```yaml
name: Daily Calendar Notifications
on:
  schedule:
    - cron: '0 8 * * *' # 8:00 UTC täglich
  workflow_dispatch: # Manuell auslösbar

jobs:
  send-notifications:
    runs-on: ubuntu-latest
    steps:
      - name: Call Edge Function
        run: |
          curl -X POST \
            https://dein-projekt.supabase.co/functions/v1/daily-calendar-notifications \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}"
```

## 5. UI in Dashboard einbauen

Füge die Notification-Toggle-Komponente zum Dashboard hinzu:

```tsx
// In Dashboard.tsx
import PushNotificationToggle from '../components/shared/PushNotificationToggle';

// In der render-Funktion:
<PushNotificationToggle userId={currentUserId} familyId={familyId} />;
```

## 6. Testing

### Lokales Testing:

```bash
# Test Edge Function lokal
supabase functions serve daily-calendar-notifications

# In einem anderen Terminal:
curl -X POST http://localhost:54321/functions/v1/daily-calendar-notifications \
  -H "Authorization: Bearer ANON_KEY"
```

### Browser Testing:

1. Öffne die App
2. Klicke auf "Aktivieren" bei den Benachrichtigungen
3. Erlaube Benachrichtigungen im Browser
4. Trigger die Edge Function manuell zum Testen

## Fertig! 🎉

Deine User bekommen jetzt jeden Morgen um 8 Uhr eine Push-Notification mit allen Terminen des Tages!
