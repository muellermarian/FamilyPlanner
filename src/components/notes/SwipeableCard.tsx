import { useState } from 'react';
import type { ReactNode } from 'react';
import { useSwipeable } from 'react-swipeable';

// SwipeableCard component: enables swipe-to-delete gesture for its children.
// Props:
// - onSwipeDelete: callback triggered when card is swiped left
// - children: content to be rendered inside the card
interface SwipeableCardProps {
  readonly onSwipeDelete: () => void;
  readonly children: ReactNode;
}

// Main component function
export default function SwipeableCard({ onSwipeDelete, children }: SwipeableCardProps) {
  // State for horizontal swipe offset
  const [swipeOffset, setSwipeOffset] = useState(0);
  // State to indicate if user is currently swiping
  const [isSwiping, setIsSwiping] = useState(false);

  // Helper to check if swipe is horizontal
  const isHorizontalSwipe = (deltaX: number, deltaY: number) => {
    return Math.abs(deltaX) > Math.abs(deltaY);
  };

  // Resets swipe state and offset
  const resetSwipe = () => {
    setSwipeOffset(0);
    setIsSwiping(false);
  };

  // Handlers for swipe events using useSwipeable hook
  const handlers = useSwipeable({
    onSwiping: (eventData) => {
      if (isHorizontalSwipe(eventData.deltaX, eventData.deltaY)) {
        setIsSwiping(true);
        setSwipeOffset(Math.min(0, Math.max(-80, eventData.deltaX)));
      }
    },
    onSwipedLeft: (eventData) => {
      if (isHorizontalSwipe(eventData.deltaX, eventData.deltaY)) {
        resetSwipe();
        onSwipeDelete();
      }
    },
    onSwipedRight: resetSwipe,
    preventScrollOnSwipe: false,
    trackMouse: false,
    delta: 10,
  });

  return (
    <div {...handlers} className="relative overflow-hidden rounded">
      {/* Red background shown when swiping left for delete */}
      <div
        className={`absolute inset-0 bg-red-500 flex justify-end items-center p-3 transition-opacity duration-200 ${
          isSwiping ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <span className="text-white font-bold">Löschen</span>
      </div>

      {/* Main card content, moves horizontally while swiping */}
      <div
        className="relative border rounded p-3 flex flex-col transition-transform duration-200 ease-out bg-white"
        style={{ transform: `translateX(${swipeOffset}px)` }}
      >
        {children}
      </div>
    </div>
  );
}
