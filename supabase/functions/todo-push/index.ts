// supabase/functions/task-push/index.ts (KOMPLETT)
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import webpush from 'npm:web-push@3.6.6';

const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')!;
const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY')!;
webpush.setVapidDetails('mailto:your-email@example.com', VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    
    const payload = await req.json();
    const newTodo = payload.record; // Webhook-Payload-Struktur
    
    if (!newTodo?.family_id || newTodo.isDone) {
      return new Response('No family_id or todo completed', { status: 200 });
    }

    // Hole alle Family-Subscriptions
    const { data: subscriptions } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('family_id', newTodo.family_id);

    let body = `✅ Neues Todo: ${newTodo.task || 'Unbenannt'}`;
    if (newTodo.due_at) body += ` (Fällig: ${newTodo.due_at.slice(0, 10)})`;

    await sendFamilyPush(subscriptions, 'Neues Todo', body, '/todos');

    return new Response('Todo push sent', { status: 200 });
  } catch (error) {
    console.error('Todo push error:', error);
    return new Response(JSON.stringify({ error: String(error) }), { status: 500 });
  }
});

async function sendFamilyPush(subs: any[], title: string, body: string, url: string) {
  for (const sub of subs || []) {
    if (!sub.p256dh || !sub.auth) {
      console.warn('Skipping invalid subscription:', sub.endpoint);
      continue;
    }
    
    const payload = {
      title,
      body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      data: { url }
    };
    
    try {
      await webpush.sendNotification({
        endpoint: sub.endpoint,
        keys: { 
          p256dh: sub.p256dh, 
          auth: sub.auth 
        }
      }, JSON.stringify(payload));
      console.log('Push sent to:', sub.endpoint);
    } catch (e) {
      console.error('Push failed for', sub.endpoint, ':', e);
    }
  }
}
