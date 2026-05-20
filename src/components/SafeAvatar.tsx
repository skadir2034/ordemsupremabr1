import React, { useEffect, useRef } from 'react';

interface SafeAvatarProps {
  src: string;
  className?: string;
  alt?: string;
  isEcoMode?: boolean;
}

export function SafeAvatar({ src, className = '', alt = 'Avatar', isEcoMode = false }: SafeAvatarProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isGif = src && (src.includes('.gif') || src.includes('data:image/gif') || src.includes('avatars%2F') || src.toLowerCase().endsWith('.gif'));

  useEffect(() => {
    // Se o modo Eco estiver ativado e for uma imagem do tipo GIF (ou suspeita de GIF),
    // desenhamos ela em um Canvas. O Canvas desenha apenas o primeiro frame (estático),
    // reduzindo o consumo de processamento/GPU do celular em 100% para GIFs animados!
    if (isEcoMode && src && canvasRef.current) {
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
    }
  }, [src, isEcoMode, isGif]);

  // Se Eco Mode estiver ativo e for um GIF animado, exibe o canvas estático
  if (isEcoMode && isGif) {
    return (
      <canvas 
        ref={canvasRef} 
        className={`${className} bg-zinc-950/40`} 
        style={{ borderRadius: 'inherit', objectFit: 'cover' }}
        title="Eco-mode: animação pausada para economizar bateria e desempenho"
      />
    );
  }

  // Se Eco Mode desativado ou imagem não for GIF, renderiza o GIF animado/imagem normal
  return (
    <img 
      src={src} 
      className={className} 
      alt={alt} 
      referrerPolicy="no-referrer" 
      loading="lazy"
    />
  );
}
