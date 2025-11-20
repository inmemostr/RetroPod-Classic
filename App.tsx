import React from 'react';
import { IPod } from './components/IPod';

export default function App() {
  return (
    <div className="min-h-screen w-full bg-[#e6e6e6] flex items-center justify-center p-4 font-sans overflow-hidden relative">
      {/* Background Pattern for aesthetics */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `radial-gradient(#000 1px, transparent 1px)`,
        backgroundSize: '20px 20px'
      }}></div>
      
      <div className="z-10 flex flex-col items-center gap-8">
        <IPod />
        
        <div className="text-gray-500 text-sm text-center max-w-md">
          <p className="font-semibold">Use mouse click & drag or touch to rotate the wheel.</p>
          <p className="text-xs mt-1">Click center to select, Menu to go back.</p>
        </div>
      </div>
    </div>
  );
}