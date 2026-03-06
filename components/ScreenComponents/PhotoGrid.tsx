import React, { useRef } from 'react';
import { Photo } from '../../types';

interface PhotoGridProps {
  photos: Photo[];
  selectedIndex: number;
  cols?: number;
  visibleRows?: number;
  squareCells?: boolean;
}

// How many rows to show for each column count (for square-cell mode)
const ROWS_FOR_COLS: Record<number, number> = {
  3: 2,
  4: 2,
  5: 3,
  6: 4,
  7: 4,
  8: 5,
};

export const PhotoGrid: React.FC<PhotoGridProps> = ({
  photos,
  selectedIndex,
  cols = 3,
  visibleRows: visibleRowsProp,
  squareCells = false,
}) => {
  // When squareCells is active, compute rows from cols unless explicitly overridden
  const visibleRows = visibleRowsProp ?? (squareCells ? (ROWS_FOR_COLS[cols] ?? 3) : 2);

  if (photos.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-black">
        <p className="text-gray-400 text-sm">No Photos</p>
      </div>
    );
  }

  const safeIndex = Math.min(selectedIndex, photos.length - 1);
  const selectedRow = Math.floor(safeIndex / cols);
  const totalRows = Math.ceil(photos.length / cols);

  // Track scroll offset to keep focused row visible
  const scrollOffsetRef = useRef(0);
  let scrollOffset = scrollOffsetRef.current;
  if (selectedRow < scrollOffset) {
    scrollOffset = selectedRow;
  } else if (selectedRow >= scrollOffset + visibleRows) {
    scrollOffset = selectedRow - visibleRows + 1;
  }
  scrollOffsetRef.current = scrollOffset;

  // Build visible cells
  const cells: (Photo | null)[] = [];
  for (let r = scrollOffset; r < scrollOffset + visibleRows; r++) {
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;
      cells.push(idx < photos.length ? photos[idx] : null);
    }
  }

  const selectedPhoto = photos[safeIndex];
  const gapClass = squareCells ? 'gap-[2px] p-[2px]' : 'gap-1 p-1';

  return (
    <div className="w-full h-full bg-black relative overflow-hidden flex flex-col">
      {/* Grid area */}
      <div
        className={`flex-1 grid ${gapClass} overflow-hidden`}
        style={{
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: squareCells ? `repeat(${visibleRows}, auto)` : `repeat(${visibleRows}, 1fr)`,
          alignContent: squareCells ? 'start' : 'stretch',
        }}
      >
        {cells.map((photo, i) => {
          const globalIndex = (scrollOffset + Math.floor(i / cols)) * cols + (i % cols);
          const isFocused = globalIndex === safeIndex;

          if (!photo) {
            return (
              <div
                key={`empty-${i}`}
                className="bg-gray-900/20 rounded-[2px]"
                style={squareCells ? { aspectRatio: '1/1' } : undefined}
              />
            );
          }

          return (
            <div
              key={photo.id}
              className={`relative overflow-hidden rounded-[2px] transition-all duration-200 ease-out ${
                isFocused
                  ? 'scale-[1.07] z-10 shadow-[0_0_10px_rgba(255,255,255,0.5)] ring-[1.5px] ring-white/80'
                  : 'scale-100'
              }`}
              style={{
                transformOrigin: 'center center',
                ...(squareCells ? { aspectRatio: '1/1' } : {}),
              }}
            >
              <img
                src={photo.url}
                alt={photo.title}
                className="w-full h-full object-cover"
                draggable={false}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Bottom info bar */}
      <div className="h-6 bg-gradient-to-t from-black via-black/90 to-transparent flex items-center justify-between px-2 shrink-0">
        <span className="text-[10px] text-white/80 font-medium truncate max-w-[220px]">
          {selectedPhoto?.title}
        </span>
        <span className="text-[10px] text-white/50 font-mono">
          {safeIndex + 1}/{photos.length}
        </span>
      </div>

      {/* Scroll indicator (right edge) */}
      {totalRows > visibleRows && (
        <div className="absolute right-0.5 top-1 bottom-7 w-0.5 flex flex-col">
          <div
            className="bg-white/30 rounded-full w-full transition-all duration-200"
            style={{
              height: `${(visibleRows / totalRows) * 100}%`,
              marginTop: `${(scrollOffset / Math.max(1, totalRows - visibleRows)) * (100 - (visibleRows / totalRows) * 100)}%`,
            }}
          />
        </div>
      )}
    </div>
  );
};
