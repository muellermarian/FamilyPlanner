import { useState } from 'react';
import type { ReactNode } from 'react';
import { useSwipeable } from 'react-swipeable';

interface SwipeableCardProps {
  onSwipeDelete: () => void;
  children: ReactNode;
}

export default function SwipeableCard({ onSwipeDelete, children }: SwipeableCardProps) {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);

  const isHorizontalSwipe = (deltaX: number, deltaY: number) => {
    return Math.abs(deltaX) > Math.abs(deltaY);
  };

  const resetSwipe = () => {
    setSwipeOffset(0);
    setIsSwiping(false);
  };

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
      {/* Delete background */}
      <div
        className={`absolute inset-0 bg-red-500 flex justify-end items-center p-3 transition-opacity duration-200 ${
          isSwiping ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <span className="text-white font-bold">Löschen</span>
      </div>

      {/* Main card */}
      <div
        className="relative border rounded p-3 flex flex-col transition-transform duration-200 ease-out bg-white"
        style={{ transform: `translateX(${swipeOffset}px)` }}
      >
        {children}
      </div>
    </div>
  );
}
