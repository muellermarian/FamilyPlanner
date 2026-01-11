import { usePullToRefresh } from '../../hooks/usePullToRefresh';

// PullToRefresh component: enables pull-to-refresh gesture for its children.
// Uses a custom hook to handle the gesture and refresh logic.

// Props:
// - onRefresh: callback function to trigger when user pulls down far enough
// - children: content to be wrapped and refreshed
// - disabled: disables pull-to-refresh if true
interface PullToRefreshProps {
  readonly onRefresh: () => void | Promise<void>;
  readonly children: React.ReactNode;
  readonly disabled?: boolean;
}

// Main component function
export function PullToRefresh({ onRefresh, children, disabled = false }: PullToRefreshProps) {
  // Custom hook manages pull gesture, refresh state, and progress
  const { pullDistance, isRefreshing, progress } = usePullToRefresh({
    onRefresh,
    disabled,
  });

  return (
    <div className="relative">
      {/* Pull-to-refresh indicator shown above content while pulling or refreshing */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-center pointer-events-none transition-all duration-200"
        style={{
          height: `${pullDistance}px`,
          opacity: progress,
        }}
      >
        <div className="flex flex-col items-center gap-1">
          {/* Spinner icon rotates while pulling or refreshing */}
          <div
            className={`text-2xl transition-transform duration-300 ${
              isRefreshing ? 'animate-spin' : ''
            }`}
            style={{
              transform: `rotate(${progress * 360}deg)`,
            }}
          >
            🔄
          </div>
          {/* Show status text depending on refresh state */}
          {isRefreshing && (
            <span className="text-xs text-gray-600 dark:text-gray-400">Aktualisieren...</span>
          )}
          {!isRefreshing && progress > 0.8 && (
            <span className="text-xs text-gray-600 dark:text-gray-400">
              Loslassen zum Aktualisieren
            </span>
          )}
        </div>
      </div>

      {/* Main content, offset vertically while pulling */}
      <div
        className="transition-transform duration-200"
        style={{
          transform: `translateY(${pullDistance}px)`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
