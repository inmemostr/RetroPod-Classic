import React from 'react';
import { Photo } from '../../types';

interface PhotoViewerProps {
  photos: Photo[];
  selectedIndex: number;
  /** Gesture-driven offset in "photo units". Positive = swiping toward next photo. */
  slideOffset?: number;
  /** When true, CSS transition is applied to snap to nearest photo on drag end. */
  transitioning?: boolean;
}

export const PhotoViewer: React.FC<PhotoViewerProps> = ({
  photos,
  selectedIndex,
  slideOffset = 0,
  transitioning = false,
}) => {
  if (photos.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-black">
        <p className="text-gray-400 text-sm">No Photos</p>
      </div>
    );
  }

  const safeIndex = Math.min(Math.max(0, selectedIndex), photos.length - 1);
  const prevIndex = safeIndex - 1;
  const nextIndex = safeIndex + 1;

  // Strip is 300% wide (prev | current | next), starting at marginLeft -100%.
  // slideOffset positive → moving toward next → strip slides left → negative translateX.
  // translateX is expressed as % of strip width (300%), so divide by 3.
  const translateX = -slideOffset * (100 / 3);

  return (
    <div className="w-full h-full bg-black overflow-hidden relative">
      {/* Sliding strip */}
      <div
        className="absolute inset-y-0 flex"
        style={{
          width: '300%',
          marginLeft: '-100%',
          transform: `translateX(${translateX}%)`,
          transition: transitioning
            ? 'transform 260ms cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            : 'none',
          willChange: 'transform',
        }}
      >
        {/* Prev slot */}
        <div className="w-1/3 h-full flex items-center justify-center bg-black">
          {prevIndex >= 0 && (
            <img
              src={photos[prevIndex].url}
              alt={photos[prevIndex].title}
              className="max-w-full max-h-full object-contain"
              draggable={false}
            />
          )}
        </div>

        {/* Current slot */}
        <div className="w-1/3 h-full flex items-center justify-center bg-black">
          <img
            src={photos[safeIndex].url}
            alt={photos[safeIndex].title}
            className="max-w-full max-h-full object-contain"
            draggable={false}
            onError={(e) => {
              (e.target as HTMLImageElement).alt = 'Failed to load';
            }}
          />
        </div>

        {/* Next slot */}
        <div className="w-1/3 h-full flex items-center justify-center bg-black">
          {nextIndex < photos.length && (
            <img
              src={photos[nextIndex].url}
              alt={photos[nextIndex].title}
              className="max-w-full max-h-full object-contain"
              draggable={false}
            />
          )}
        </div>
      </div>

      {/* Counter — stays above strip */}
      <div className="absolute bottom-2 right-2 text-[10px] text-white/70 font-mono bg-black/40 px-1.5 py-0.5 rounded z-10 pointer-events-none">
        {safeIndex + 1} / {photos.length}
      </div>
    </div>
  );
};
