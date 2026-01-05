import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')!;
const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY')!;
const VAPID_EMAIL = 'mailto:muellerm187@gmail.com'; // Deine E-Mail

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
          results.push({ success: false, familyId, error: String(error) });
        }
      }
    }

    return new Response(JSON.stringify({ results }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
