import React, { useEffect, useRef, useState } from 'react';

interface SafeAvatarProps {
  src: string;
  className?: string;
  alt?: string;
  isEcoMode?: boolean;
}

export function SafeAvatar({ src, className = '', alt = 'Avatar', isEcoMode = false }: SafeAvatarProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
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

  useEffect(() => {
    // Se o modo Eco estiver ativado e for uma imagem do tipo GIF,
    // desenhamos ela em um Canvas. O Canvas desenha apenas o primeiro frame (estático),
    // reduzindo o consumo de processamento/GPU do celular em 100% para GIFs animados!
    if (isEcoMode && isGif && src && !loadError && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      // Permitir carregar imagens do Firebase Storage cross-origin sem problemas
      img.crossOrigin = 'anonymous';
      img.src = src;
      img.onload = () => {
        if (!canvas || !ctx) return;
        // Definir dimensões pequenas de renderização estática para economizar memória ram
        canvas.width = 120;
        canvas.height = 120;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Desenha utilizando cobertura (aspect-ratio cover) similar ao object-cover do CSS
        const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
        const x = (canvas.width / 2) - (img.width / 2) * scale;
        const y = (canvas.height / 2) - (img.height / 2) * scale;
        
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
      };
      img.onerror = () => {
        console.warn('Failed to load/draw image to canvas (usually CORS or network). Falling back to native img rendering.');
        setLoadError(true);
      };
    }
  }, [src, isEcoMode, isGif, loadError]);

  // Se Eco Mode estiver ativo, for um GIF animado e não houver erro de carregamento, exibe o canvas estático
  if (isEcoMode && isGif && !loadError) {
    return (
      <canvas 
        ref={canvasRef} 
        className={`${className} bg-zinc-950/40`} 
        style={{ borderRadius: 'inherit', objectFit: 'cover' }}
        title="Eco-mode: animação pausada para economizar bateria e desempenho"
      />
    );
  }

  // Se Eco Mode desativado ou imagem não for GIF (ou falhar no canvas/CORS), renderiza o GIF animado/imagem normal
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
