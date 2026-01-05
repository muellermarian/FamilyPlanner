import { useState } from 'react';
import { usePushNotifications } from '../../hooks/usePushNotifications';

interface PushNotificationToggleProps {
  userId: string;
  familyId: string;
}

export default function PushNotificationToggle({ userId, familyId }: PushNotificationToggleProps) {
  const { isSupported, isSubscribed, permission, subscribe, unsubscribe, loading, error } =
    usePushNotifications(userId, familyId);
  const [showInfo, setShowInfo] = useState(false);

  if (!isSupported) {
    return null; // Verstecke Button wenn nicht unterstützt
  }

  const handleToggle = async () => {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      await subscribe();
    }
  };

  return (
    <div className="bg-white border rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">🔔</span>
          <h3 className="font-semibold">Tägliche Erinnerungen</h3>
        </div>
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="text-gray-500 hover:text-gray-700 text-sm"
        >
          {showInfo ? '▼' : '▶'}
        </button>
      </div>

      {showInfo && (
        <p className="text-sm text-gray-600 mb-3">
          Erhalte jeden Morgen eine Benachrichtigung mit deinen Terminen, Geburtstagen und To-dos
          für den Tag.
        </p>
      )}

      {error && (
        <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="text-sm">
          {permission === 'denied' && (
            <span className="text-red-600">
              Benachrichtigungen wurden blockiert. Bitte in den Browser-Einstellungen aktivieren.
            </span>
          )}
          {permission === 'default' && <span className="text-gray-600">Noch nicht aktiviert</span>}
          {permission === 'granted' && isSubscribed && (
            <span className="text-green-600">✓ Aktiviert</span>
          )}
        </div>

        <button
          onClick={handleToggle}
          disabled={loading || permission === 'denied'}
          className={`px-4 py-2 rounded font-medium text-sm transition-colors ${
            isSubscribed
              ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {loading
            ? '...'
            : isSubscribed
            ? 'Deaktivieren'
            : permission === 'denied'
            ? 'Blockiert'
            : 'Aktivieren'}
        </button>
      </div>
    </div>
  );
}
