import React, { useState, useRef, useEffect } from 'react';

interface MediaInputProps {
  mode: 'song' | 'photo';
  onSubmit: (url: string, metadata?: { title?: string; artist?: string; album?: string }) => void;
  onCancel: () => void;
}

export const MediaInput: React.FC<MediaInputProps> = ({ mode, onSubmit, onCancel }) => {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [error, setError] = useState('');
  const urlRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto-focus the URL input
    setTimeout(() => urlRef.current?.focus(), 100);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      setError('Please enter a URL');
      return;
    }
    // Basic URL validation
    if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
      setError('URL must start with http:// or https://');
      return;
    }
    setError('');
    onSubmit(trimmedUrl, {
      title: title.trim() || undefined,
      artist: artist.trim() || undefined,
    });
  };

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-b from-gray-100 to-gray-200 p-3 overflow-hidden">
      <div className="text-xs font-bold text-gray-700 mb-2">
        {mode === 'song' ? 'Add Music URL' : 'Add Photo URL'}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-1.5 flex-1">
        <input
          ref={urlRef}
          type="text"
          placeholder="https://example.com/audio.mp3"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full px-2 py-1 text-[11px] border border-gray-300 rounded bg-white focus:outline-none focus:border-blue-400 placeholder-gray-400"
          onKeyDown={(e) => e.stopPropagation()}
        />

        <input
          type="text"
          placeholder="Title (optional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-2 py-1 text-[11px] border border-gray-300 rounded bg-white focus:outline-none focus:border-blue-400 placeholder-gray-400"
          onKeyDown={(e) => e.stopPropagation()}
        />

        {mode === 'song' && (
          <input
            type="text"
            placeholder="Artist (optional)"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            className="w-full px-2 py-1 text-[11px] border border-gray-300 rounded bg-white focus:outline-none focus:border-blue-400 placeholder-gray-400"
            onKeyDown={(e) => e.stopPropagation()}
          />
        )}

        {error && (
          <div className="text-[10px] text-red-500">{error}</div>
        )}

        <div className="flex gap-2 mt-auto">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-2 py-1 text-[11px] bg-gray-300 hover:bg-gray-400 rounded text-gray-700 font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-2 py-1 text-[11px] bg-blue-500 hover:bg-blue-600 rounded text-white font-medium"
          >
            Add
          </button>
        </div>
      </form>
    </div>
  );
};
