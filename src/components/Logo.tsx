import React from 'react';

const Logo = () => (
  <div className="flex flex-col items-center justify-center p-6 bg-white/50 backdrop-blur-md rounded-[2.5rem] shadow-sm border border-white/20">
    <div className="relative w-20 h-20 mb-3 flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl shadow-inner">
      <svg viewBox="0 0 24 24" className="w-12 h-12 text-slate-800 opacity-80">
        <path fill="currentColor" d="M12,2L4.5,20.29L5.21,21L12,18L18.79,21L19.5,20.29L12,2Z" />
      </svg>
    </div>
    <h1 className="text-2xl font-semibold tracking-tight text-slate-800">
      Color<span className="font-light text-slate-500">Attention</span>
    </h1>
    <p className="mt-1 text-[10px] text-slate-400 font-bold tracking-[0.2em] uppercase">Investigación Visual</p>
  </div>
);

export default Logo;
