import React, { useEffect, useState } from 'react';

interface SafeAvatarProps {
  src: string;
  className?: string;
  alt?: string;
  isEcoMode?: boolean;
}

export function SafeAvatar({ src, className = '', alt = 'Avatar', isEcoMode = false }: SafeAvatarProps) {
  const [loadError, setLoadError] = useState(false);

  // Real GIFs should have .gif or data:image/gif.
  // Avoid false positives like "avatars%2F" which matches any files uploaded to that storage folder.
  const isGif = src && (
    src.toLowerCase().includes('.gif') || 
    src.includes('data:image/gif')
  );

  useEffect(() => {
    // Reset error state when src changes
    setLoadError(false);
  }, [src]);

  // Se Eco Mode estiver ativo e for um GIF animado, exibe o GIF em qualidade reduzida e otimizada por hardware para não travar
  if (isEcoMode && isGif) {
    return (
      <img 
        src={src || undefined} 
        className={`${className} filter brightness-95 contrast-90 saturate-90`} 
        style={{ 
          objectFit: 'cover',
          imageRendering: 'pixelated', 
          transform: 'translateZ(0)', // Força aceleração de hardware 3D (camada dedicada de compositor)
          willChange: 'transform'
        }}
        alt={alt}
        referrerPolicy="no-referrer" 
        loading="lazy"
        title="Modo Otimizado: GIF animado otimizado para desempenho"
      />
    );
  }

  // Se Eco Mode desativado ou imagem não for GIF, renderiza o GIF animado/imagem normal
  return (
    <img 
      src={src || undefined} 
      className={className} 
      alt={alt} 
      referrerPolicy="no-referrer" 
      loading="lazy"
    />
  );
}
