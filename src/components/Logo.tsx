import React from 'react';

const Logo = () => (
  <div className="flex flex-col items-center justify-center p-8 bg-slate-900 rounded-3xl shadow-2xl border border-slate-700">
    <div className="relative w-32 h-32 mb-4">
      <div className="absolute inset-0 bg-blue-500 rounded-full blur-2xl opacity-20 animate-pulse"></div>
      <svg viewBox="0 0 24 24" className="w-full h-full text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]">
        <path fill="currentColor" d="M12,2L4.5,20.29L5.21,21L12,18L18.79,21L19.5,20.29L12,2Z" />
      </svg>
    </div>
    <h1 className="text-4xl font-black tracking-tighter text-white">
      COLOR<span className="text-blue-500 underline decoration-2 underline-offset-4">ATTENTION</span>
    </h1>
    <p className="mt-2 text-slate-400 font-medium tracking-wide uppercase text-xs">Nano Banana Pro Engine</p>
  </div>
);

export default Logo;
