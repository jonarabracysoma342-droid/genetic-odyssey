import React from 'react';

/**
 * PixelValleyBackground
 * Lush 16-bit Stardew Valley-style Mendelian monastery & pea garden valley background.
 * Features:
 * - Ultra-detailed 16:9 pixel art illustration of Gregor Mendel's monastery, terraced orchards,
 *   flowering pea trellis vines, garden beds, research cabin, and mountains.
 * - Floating ambient clouds & gentle gene-sparkle fireflies for a lively living world.
 * - Customizable overlay opacity for optimal contrast across menus, maps, and codex screens.
 */
export const PixelValleyBackground = ({ overlay = 'subtle', children }) => {
  // Overlay styles
  const overlayClasses = {
    none: 'bg-transparent',
    subtle: 'bg-black/10',
    medium: 'bg-[#1a0b03]/25 backdrop-blur-[1px]',
    dark: 'bg-[#1a0b03]/45 backdrop-blur-xs'
  }[overlay] || 'bg-black/10';

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none overflow-hidden z-0 select-none bg-[#74c2e8]">
      {/* 1. Main Detailed Stardew Valley Pixel Landscape */}
      <img
        src="/assets/stardew_mendel_valley.jpg"
        alt="Mendel Stardew Valley Landscape"
        className="w-full h-full object-cover object-center image-pixelated transform scale-[1.01]"
      />

      {/* 2. Ambient Sky Floating Pixel Clouds */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[6%] left-[4%] pixel-cloud-1 opacity-75">
          <svg width="110" height="35" viewBox="0 0 110 35" className="image-pixelated">
            <rect x="20" y="8" width="55" height="20" fill="#ffffff" />
            <rect x="35" y="0" width="35" height="15" fill="#ffffff" />
            <rect x="10" y="14" width="80" height="14" fill="#ffffff" />
            <rect x="20" y="24" width="70" height="5" fill="#e0f2fe" />
          </svg>
        </div>

        <div className="absolute top-[14%] left-[68%] pixel-cloud-2 opacity-70">
          <svg width="130" height="40" viewBox="0 0 130 40" className="image-pixelated">
            <rect x="25" y="10" width="70" height="22" fill="#ffffff" />
            <rect x="45" y="0" width="45" height="16" fill="#ffffff" />
            <rect x="15" y="16" width="95" height="16" fill="#ffffff" />
            <rect x="25" y="28" width="85" height="6" fill="#e0f2fe" />
          </svg>
        </div>

        <div className="absolute top-[22%] left-[32%] pixel-cloud-3 opacity-60">
          <svg width="90" height="30" viewBox="0 0 90 30" className="image-pixelated">
            <rect x="15" y="6" width="45" height="18" fill="#ffffff" />
            <rect x="28" y="0" width="28" height="12" fill="#ffffff" />
            <rect x="10" y="12" width="65" height="12" fill="#ffffff" />
            <rect x="15" y="22" width="55" height="4" fill="#e0f2fe" />
          </svg>
        </div>
      </div>

      {/* 3. Ambient Gene Pollen / Golden Firefly Particles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-[28%] left-[18%] w-1.5 h-1.5 rounded-full bg-[#fde047] opacity-80 animate-ping" style={{ animationDuration: '3s' }} />
        <div className="absolute bottom-[35%] left-[45%] w-1 h-1 rounded-full bg-[#86efac] opacity-75 animate-pulse" style={{ animationDuration: '2.5s' }} />
        <div className="absolute bottom-[22%] right-[24%] w-1.5 h-1.5 rounded-full bg-[#fde047] opacity-80 animate-ping" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-[40%] right-[38%] w-1 h-1 rounded-full bg-[#cbd5e1] opacity-60 animate-pulse" style={{ animationDuration: '3.5s' }} />
      </div>

      {/* 4. Contrast & Vignette Overlay */}
      <div className={`absolute inset-0 ${overlayClasses} transition-colors duration-300`} />
      
      {/* Optional custom children */}
      {children}
    </div>
  );
};
