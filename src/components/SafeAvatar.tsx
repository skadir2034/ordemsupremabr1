import React, { useEffect, useState } from 'react';

interface SafeAvatarProps {
  src: string;
  className?: string;
  alt?: string;
  isEcoMode?: boolean;
}

// A highly polished, offline-first procedural gaming avatar generator that replaces DiceBear URLs
export function getProceduralAvatar(seed: string, className: string = '') {
  // Simple deterministic hash function based on seed string
  let hash = 0;
  const cleanSeed = seed || 'player-guerreiro';
  for (let i = 0; i < cleanSeed.length; i++) {
    hash = cleanSeed.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Premium gaming colors (deep royal gradients matching the Season of Glory, assault reds, and onyx golds)
  const gradients = [
    { from: '#4c1d95', to: '#1e1b4b', accent: '#f59e0b', label: 'Glória Purple' },  // Purple to dark blue
    { from: '#7c2d12', to: '#18181b', accent: '#fbbf24', label: 'Assault Crimson' }, // Fire/red to black
    { from: '#1e3a8a', to: '#172554', accent: '#60a5fa', label: 'Royal Knight' },   // Blue to deep blue
    { from: '#701a75', to: '#4a044e', accent: '#f472b6', label: 'Void Muse' },      // Magenta to pink
    { from: '#18181b', to: '#09090b', accent: '#fbbf24', label: 'Onyx Gold' },      // Pitch black to dark grey
    { from: '#781111', to: '#2a0808', accent: '#f87171', label: 'Vampire Blood' }    // Deep dark red
  ];
  
  const gIndex = Math.abs(hash) % gradients.length;
  const grad = gradients[gIndex];
  
  // Distinct vector gaming symbols
  const emblems = [
    // Swords
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m-6-6h12M7.5 7.5L16.5 16.5M16.5 7.5L7.5 16.5" />,
    // Shield
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
    // Helmet / Crown
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4L3 8v11h18V8L12 4zm0 4v8m-4-4h8" />,
    // Trophy
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 17a5 5 0 100-10 5 5 0 000 10zm0 0v3m-3 0h6m-9-8h2m10 0h2" />,
    // Runes / Star of Valor
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v18M3 12h18M5.5 5.5L18.5 18.5M18.5 5.5L5.5 18.5" />,
    // Emblem of command
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  ];
  const eIndex = Math.abs(hash >> 3) % emblems.length;
  const emblem = emblems[eIndex];
  
  const gradId = `grad-${gIndex}-${cleanSeed.replace(/[^a-zA-Z0-9]/g, '')}`;
  
  return (
    <div 
      className={`${className} flex items-center justify-center overflow-hidden shrink-0`}
      style={{ aspectRatio: '1/1' }}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-[65%] h-[65%] text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={grad.from} />
            <stop offset="100%" stopColor={grad.to} />
          </linearGradient>
        </defs>
        <circle cx="12" cy="12" r="11" fill={`url(#${gradId})`} stroke={grad.accent} strokeWidth="1.2" />
        <g stroke={grad.accent} strokeWidth="1.5" className="opacity-90">
          {emblem}
        </g>
      </svg>
    </div>
  );
}

export function SafeAvatar({ src, className = '', alt = 'Avatar', isEcoMode = false }: SafeAvatarProps) {
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    setLoadError(false);
  }, [src]);

  // Extract seed from DiceBear URL if present, otherwise use alt or random
  const getSeedFromUrl = (url: string) => {
    if (!url) return alt || 'guerreiro';
    try {
      const parsedUrl = new URL(url);
      const seedParam = parsedUrl.searchParams.get('seed');
      if (seedParam) return seedParam;
    } catch (e) {
      // Not a valid URL, search within string
      const match = url.match(/seed=([^&]+)/);
      if (match) return decodeURIComponent(match[1]);
    }
    return alt || 'guerreiro';
  };

  const isDicebear = src && (src.includes('dicebear.com') || src.includes('api.dicebear.com'));

  // If there's an error, or no source, or (in Eco Mode only) it's a DiceBear fallback, let's render the gorgeous procedural SVG
  if (loadError || !src || (isEcoMode && isDicebear)) {
    const seed = getSeedFromUrl(src);
    return getProceduralAvatar(seed, className);
  }

  const isGif = src && (
    src.toLowerCase().includes('.gif') || 
    src.includes('data:image/gif')
  );

  if (isEcoMode && isGif) {
    return (
      <img 
        src={src} 
        className={`${className} filter brightness-95 contrast-90 saturate-90 bg-zinc-900`} 
        style={{ 
          objectFit: 'cover',
          imageRendering: 'pixelated', 
          transform: 'translateZ(0)', 
          willChange: 'transform'
        }}
        alt={alt}
        onError={() => setLoadError(true)}
        referrerPolicy="no-referrer" 
        loading="lazy"
        title="Modo Otimizado: GIF animado otimizado para desempenho"
      />
    );
  }

  return (
    <img 
      src={src} 
      className={`${className} bg-zinc-900`} 
      alt={alt} 
      onError={() => setLoadError(true)}
      referrerPolicy="no-referrer" 
      loading="lazy"
      style={{ objectFit: 'cover' }}
    />
  );
}
