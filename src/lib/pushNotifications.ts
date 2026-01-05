import { supabase } from './supabaseClient';

/**
 * Speichert eine Push-Subscription in der Datenbank
 */
export async function savePushSubscription(
  userId: string,
  familyId: string,
  subscription: PushSubscription
) {
  const { data, error } = await supabase.from('push_subscriptions').upsert(
    {
      user_id: userId,
      family_id: familyId,
      subscription: JSON.stringify(subscription.toJSON()),
      endpoint: subscription.endpoint,
    },
    {
      onConflict: 'endpoint',
    }
  );

  if (error) throw error;
  return data;
}

/**
 * Löscht eine Push-Subscription aus der Datenbank
 */
export async function deletePushSubscription(endpoint: string) {
  const { error } = await supabase.from('push_subscriptions').delete().eq('endpoint', endpoint);

  if (error) throw error;
}

/**
 * Holt alle aktiven Subscriptions für eine Familie
 * (Wird für Edge Function benötigt)
 */
export async function getPushSubscriptionsForFamily(familyId: string) {
  const { data, error } = await supabase
    .from('push_subscriptions')
    .select('*')
    .eq('family_id', familyId);

  if (error) throw error;
  return data || [];
}
