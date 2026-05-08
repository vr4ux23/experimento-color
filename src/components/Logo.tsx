import React from 'react';

const Logo = () => (
  <div className="flex flex-col items-center justify-center p-4">
    <div className="relative w-16 h-16 mb-2 flex items-center justify-center bg-gradient-to-tr from-[#1a73e8] via-[#9334e6] to-[#ff4081] rounded-2xl shadow-lg transform rotate-3">
      <svg viewBox="0 0 24 24" className="w-10 h-10 text-white drop-shadow-md">
        <path fill="currentColor" d="M12,2L4.5,20.29L5.21,21L12,18L18.79,21L19.5,20.29L12,2Z" />
      </svg>
      <div className="absolute -inset-1 bg-gradient-to-tr from-[#1a73e8] to-[#9334e6] rounded-2xl blur opacity-30 -z-10"></div>
    </div>
    <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#1a73e8] to-[#9334e6]">
      Color<span className="font-medium">Attention</span>
    </h1>
    <div className="h-1 w-8 bg-gradient-to-r from-[#1a73e8] to-[#9334e6] rounded-full mt-1"></div>
  </div>
);

export default Logo;
