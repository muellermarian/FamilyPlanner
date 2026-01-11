import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

interface UsePushNotificationsReturn {
  isSupported: boolean;
  isSubscribed: boolean;
  permission: NotificationPermission;
  subscribe: () => Promise<void>;
  unsubscribe: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

// WICHTIG: Diese Keys musst du generieren!
// Führe aus: npx web-push generate-vapid-keys
// Und setze sie als Environment Variables
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replaceAll(/-/g, '+').replaceAll(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushNotifications(
  userId?: string,
  familyId?: string
): UsePushNotificationsReturn {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Prüfe ob Push-Notifications unterstützt werden
    const supported = 'serviceWorker' in navigator && 'PushManager' in window;
    setIsSupported(supported);

    if (supported && 'Notification' in window) {
      setPermission(Notification.permission);
      checkSubscription();
    }
  }, []);

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (err) {
      console.error('Error checking subscription:', err);
    }
  };

  const subscribe = async () => {
    if (!isSupported) {
      setError('Push-Benachrichtigungen werden nicht unterstützt');
      return;
    }

    if (!VAPID_PUBLIC_KEY) {
      setError('VAPID Public Key fehlt - siehe .env.example');
      return;
    }

    if (!userId || !familyId) {
      setError('User ID oder Family ID fehlt');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Request permission
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result !== 'granted') {
        setError('Benachrichtigungen wurden abgelehnt');
        setLoading(false);
        return;
      }

      // Registriere Service Worker falls noch nicht geschehen
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      await navigator.serviceWorker.ready;

      // Subscribe to push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
      });

      // Speichere Subscription in Supabase
      const subscriptionData = {
        user_id: userId,
        family_id: familyId,
        subscription: JSON.stringify(subscription.toJSON()),
        endpoint: subscription.endpoint,
      };

      const { error: dbError } = await supabase
        .from('push_subscriptions')
        .upsert(subscriptionData, {
          onConflict: 'endpoint',
        });

      if (dbError) throw dbError;

      setIsSubscribed(true);
      console.log('Push subscription successful');
    } catch (err: any) {
      console.error('Error subscribing to push:', err);
      setError(err.message || 'Fehler beim Aktivieren der Benachrichtigungen');
    } finally {
      setLoading(false);
    }
  };

  const unsubscribe = async () => {
    setLoading(true);
    setError(null);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();

        // Lösche aus Supabase
        const { error: dbError } = await supabase
          .from('push_subscriptions')
          .delete()
          .eq('endpoint', subscription.endpoint);

        if (dbError) throw dbError;
      }

      setIsSubscribed(false);
      console.log('Push unsubscription successful');
    } catch (err: any) {
      console.error('Error unsubscribing from push:', err);
      setError(err.message || 'Fehler beim Deaktivieren der Benachrichtigungen');
    } finally {
      setLoading(false);
    }
  };

  return {
    isSupported,
    isSubscribed,
    permission,
    subscribe,
    unsubscribe,
    loading,
    error,
  };
}
