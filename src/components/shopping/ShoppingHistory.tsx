// Props for the ShoppingHistory component: purchases, users, and close handler
import type { ShoppingPurchase } from '../../lib/types';

interface ShoppingHistoryProps {
  purchases: ShoppingPurchase[];
  users: { id: string; name: string }[];
  onClose: () => void;
}

type ReadonlyShoppingHistoryProps = Readonly<ShoppingHistoryProps>;

// ShoppingHistory component displays a list of past purchases
export default function ShoppingHistory({
  purchases,
  users,
  onClose,
}: ReadonlyShoppingHistoryProps) {
  // Get the user name by user ID
  const getUserName = (userId: string) => {
    return users.find((u) => u.id === userId)?.name ?? 'Unbekannt';
  };

  // Format the purchase date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    // Render the shopping history UI
    <div className="max-w-4xl mx-auto mt-10 p-4">
      <div className="flex items-center gap-3 mb-6">
        {/* Close button and title */}
        <button onClick={onClose} className="text-2xl">
          ←
        </button>
        <h3 className="text-xl font-bold">Einkaufshistorie</h3>
      </div>
      <div className="space-y-4">
        {/* Show message if there are no purchases */}
        {purchases.length === 0 ? (
          <div className="text-center text-gray-500 py-8">Noch keine Einkäufe</div>
        ) : (
          // List all purchases
          <div className="space-y-4">
            {purchases.map((purchase) => (
              <div key={purchase.id} className="border rounded p-4 bg-gray-50">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    {/* Purchaser name and date */}
                    <div className="font-medium">{getUserName(purchase.purchased_by_id)}</div>
                    <div className="text-sm text-gray-500">{formatDate(purchase.purchased_at)}</div>
                  </div>
                  {/* Number of items in purchase */}
                  <div className="text-sm text-gray-600">{purchase.items.length} Artikel</div>
                </div>
                {/* List of purchased items */}
                <ul className="space-y-1">
                  {purchase.items.map((item) => (
                    <li key={item.id} className="text-sm flex justify-between">
                      <span>{item.name}</span>
                      <span className="text-gray-500">
                        {item.quantity} {item.unit}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
