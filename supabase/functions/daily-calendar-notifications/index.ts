import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import webpush from 'npm:web-push@3.6.6';

const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')!;
const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY')!;

webpush.setVapidDetails(
  'mailto:your-email@example.com',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    const { data: subscriptions } = await supabase
      .from('push_subscriptions')
      .select('*, families!inner(*)');

    if (!subscriptions || subscriptions.length === 0) {
      return new Response('No subscriptions found', { status: 200 });
    }

    // Group subscriptions by family
    const familyMap = new Map<string, any[]>();
    subscriptions.forEach((sub: any) => {
      if (!familyMap.has(sub.family_id)) {
        familyMap.set(sub.family_id, []);
      }
      familyMap.get(sub.family_id)!.push(sub);
    });

    const results = [];

    // Process each family
    for (const [familyId, familySubs] of familyMap) {
      // Fetch calendar events for today
      const { data: events } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('family_id', familyId)
        .eq('event_date', dateStr);

      // Fetch todos due today
      const { data: todos } = await supabase
        .from('todos')
        .select('*')
        .eq('family_id', familyId)
        .like('due_at', `${dateStr}%`)
        .eq('isDone', false);

      // Fetch shopping items with deal_date today
      const { data: shoppingItems } = await supabase
        .from('shopping_items')
        .select('*')
        .eq('family_id', familyId)
        .eq('deal_date', dateStr)
        .eq('purchased', false);

      // Fetch contacts with birthdays
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

      const hasEvents = (events?.length || 0) > 0;
      const hasTodos = (todos?.length || 0) > 0;
      const hasBirthdays = birthdaysToday.length > 0;
      const hasShoppingItems = (shoppingItems?.length || 0) > 0;

      // Only send notification if there's at least something to show
      if (!hasEvents && !hasTodos && !hasBirthdays && !hasShoppingItems) continue;

      // Build notification message
      const parts: string[] = [];
      
      if (hasEvents) {
        parts.push(`📅 ${events!.length} Termin${events!.length > 1 ? 'e' : ''}`);
      }
      if (hasTodos) {
        parts.push(`✅ ${todos!.length} To-Do${todos!.length > 1 ? 's' : ''}`);
      }
      if (hasBirthdays) {
        parts.push(`🎂 ${birthdaysToday.length} Geburtstag${birthdaysToday.length > 1 ? 'e' : ''}`);
      }
      if (hasShoppingItems) {
        parts.push(`🛒 ${shoppingItems!.length} Einkauf${shoppingItems!.length > 1 ? 'artikel' : ''}`);
      }

      let body = parts.join(', ') + '\n\n';
      events?.forEach((e: any) => (body += `📅 ${e.title}\n`));
      todos?.forEach((t: any) => (body += `✅ ${t.task}\n`));
      birthdaysToday.forEach((b: any) => (body += `🎂 ${b.first_name} ${b.last_name}\n`));
      shoppingItems?.forEach((s: any) => (body += `🛒 ${s.item_name}\n`));

      // Send notification to all subscriptions for this family
      for (const sub of familySubs) {
        const subscription = JSON.parse(sub.subscription);

        try {
          const pushPayload = {
            title: 'Deine Tagesübersicht',
            body: body.trim(),
            icon: '/icons/icon-192x192.png',
            data: { url: '/calendar' },
          };

          await webpush.sendNotification(subscription, JSON.stringify(pushPayload));
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
