import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import gifshot from 'gifshot';
// @ts-ignore
import { parseGIF, decompressFrames } from 'gifuct-js';
import { 
  User, 
  MessageSquare, 
  Shield, 
  Crown, 
  Palette, 
  Lock, 
  ChevronRight, 
  Camera, 
  Check, 
  X,
  Sparkles,
  Trophy,
  Coins,
  Flame,
  Image,
  Edit2
} from 'lucide-react';
import { useClan } from '../context/ClanContext';
import { SafeAvatar } from './SafeAvatar';
import { AVATAR_DECORATIONS, PROFILE_EFFECTS } from '../collectiblesData';
import { storage } from '../lib/firebase';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

export function PerfilView() {
  const { myMember, user, updateMemberData, completeMission, isEcoMode, isGuest } = useClan();
  
  // Controls if we are viewing the clean card (false) or the edit studio (true)
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'nick' | 'borders' | 'effects' | 'background' | 'nicknameColor' | 'titles'>('nick');
  
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [inlineBioText, setInlineBioText] = useState(myMember?.customBio || 'Guerreiro nobre do clã Alcatéia Suprema.');

  const [tempStatus, setTempStatus] = useState(myMember?.customStatus || '');
  const [tempName, setTempName] = useState(myMember?.name || '');
  const [tempBio, setTempBio] = useState(myMember?.customBio || 'Membro leal do Clã Alcatéia Suprema. Preparado para batalhas de arena, missões estratégicas e honra de elite militar.');
  const [tempPower, setTempPower] = useState(myMember?.heroPower || 0);

  const [tempAvatarUrl, setTempAvatarUrl] = useState('');
  const [tempBannerUrl, setTempBannerUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);

  useEffect(() => {
    if (myMember?.customStatus !== undefined) setTempStatus(myMember.customStatus);
    if (myMember?.name !== undefined) setTempName(myMember.name);
    if (myMember?.customBio !== undefined) {
      setTempBio(myMember.customBio);
      setInlineBioText(myMember.customBio);
    }
    if (myMember?.heroPower !== undefined) setTempPower(myMember.heroPower);
  }, [myMember]);

  useEffect(() => {
    if (isEditing) {
      setTempAvatarUrl(myMember?.avatarUrl || '');
      setTempBannerUrl(myMember?.profileBg || '');
    }
  }, [isEditing, myMember]);

  const [purchaseStatus, setPurchaseStatus] = useState<{ id: string, message: string, type: 'success' | 'error' } | null>(null);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [uploadAcceptType, setUploadAcceptType] = useState('image/*');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerFileInputRef = useRef<HTMLInputElement>(null);

  const equippedBorderItem = AVATAR_DECORATIONS.find(b => b.id === myMember?.profileBorder);
  const equippedEffectItem = PROFILE_EFFECTS.find(e => e.id === myMember?.bannerEffect);

  // Live preview override states
  const [selectedBorder, setSelectedBorder] = useState<string>('');
  const [selectedBg, setSelectedBg] = useState<string>('');
  const [selectedEffect, setSelectedEffect] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedTitle, setSelectedTitle] = useState<string>('');

  useEffect(() => {
    if (myMember) {
      setSelectedBorder(myMember.profileBorder || '');
      setSelectedBg(myMember.profileBg || 'https://cdnb.artstation.com/p/assets/images/images/017/680/475/small/andrej-otepka-square-04-tmp04web.jpg?1556922748');
      setSelectedEffect(myMember.bannerEffect || '');
      setSelectedColor(myMember.nicknameColor || 'color_white');
      setSelectedTitle(myMember.title || '');
    }
  }, [myMember, isEditing]);

  const borders = AVATAR_DECORATIONS;

  const titles = [
    { id: 'title_reaper', title: 'Ceifador de Almas', desc: 'Carrasco gélido do inferno.', price: 15, levelRequired: 1 },
    { id: 'title_legend', title: 'Lenda Viva', desc: 'Seu nome cantado pelo tempo.', price: 35, levelRequired: 2 },
    { id: 'title_protector', title: 'Guardião do Clã', desc: 'Escudo indestrutível do clã.', price: 10, levelRequired: 1 },
    { id: 'title_immortal', title: 'Eterno Imortal', desc: 'Aquele que transcendeu o fim.', price: 50, levelRequired: 3 },
    { id: 'title_supreme', title: 'Mestre Supremo', desc: 'Controle imensurável de energia.', price: 30, levelRequired: 2 },
    { id: 'title_shadow', title: 'Sombra Silenciosa', desc: 'Invisível, sorrateira, fatal.', price: 12, levelRequired: 1 },
    { id: 'title_cyberspy', title: 'Infiltrado Cyber', desc: 'Mestre da informação e do hack.', price: 18, levelRequired: 1 }
  ];

  const backgrounds = [
    { id: 'padrão', title: 'Alcatéia Alfa', desc: 'Fundo clássico rúnico de lobos.', price: 0, url: 'https://cdnb.artstation.com/p/assets/images/images/017/680/475/small/andrej-otepka-square-04-tmp04web.jpg?1556922748' },
    { id: 'cibernética', title: 'Hacker Cyber', desc: 'Terminal em neon azul.', price: 15, url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070' },
    { id: 'guerra', title: 'Campo de Batalha', desc: 'Solo devastado de guerra.', price: 20, url: 'https://images.unsplash.com/photo-1599394022918-6c276a570aba?q=80&w=2070' },
    { id: 'moderna', title: 'Neon Moderna', desc: 'Fluido moderno e futurista.', price: 25, url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=2070' },
    { id: 'cosmos', title: 'Nebula Profunda', desc: 'Cosmos absoluto galáctico.', price: 35, url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=2070' },
    { id: 'vulcao', title: 'Magma Vulcânico', desc: 'Lava ardente de destruição.', price: 45, url: 'https://images.unsplash.com/photo-1610296669228-602fa827fc1f?q=80&w=2070' }
  ];

  const effects = [
    { id: '', title: 'Nenhum Efeito', desc: 'Seu perfil limpo, sem nenhuma distração.', price: 0, imgSrc: '' },
    ...PROFILE_EFFECTS
  ];

  const nicknameColors = [
    { id: 'color_white', title: 'Branco Padrão', desc: 'Nome clássico de guerreiro.', price: 0, textClass: 'text-white' },
    { id: 'color_gold', title: 'Ouro Nobre', desc: 'Champagne clássico da realeza.', price: 15, textClass: 'text-[#c5a059] font-bold drop-shadow-[0_0_6px_rgba(197,160,89,0.4)]' },
    { id: 'color_red', title: 'Fúria do Alfa', desc: 'Tom carmesim escuro e imponente.', price: 10, textClass: 'text-[#b25d62] font-semibold drop-shadow-[0_0_6px_rgba(178,93,98,0.3)]' },
    { id: 'color_cyan', title: 'Prata da Geada', desc: 'Misty azul-gélido das montanhas.', price: 12, textClass: 'text-[#93c5fd] font-semibold drop-shadow-[0_0_6px_rgba(147,197,253,0.3)]' },
    { id: 'color_pink', title: 'Rosé de Inverno', desc: 'Toque místico de orquídea e névoa.', price: 15, textClass: 'text-[#c084fc] font-semibold drop-shadow-[0_0_6px_rgba(192,132,252,0.3)]' },
    { id: 'color_emerald', title: 'Sálvia do Bosque', desc: 'Verde sutil das florestas antigas.', price: 15, textClass: 'text-[#a7f3d0] font-semibold drop-shadow-[0_0_6px_rgba(167,243,208,0.3)]' },
    { id: 'color_purple', title: 'Névoa Cósmica', desc: 'Aura suave de lavanda do crepúsculo.', price: 12, textClass: 'text-[#c0a9df] font-semibold drop-shadow-[0_0_6px_rgba(192,169,223,0.3)]' },
    { id: 'color_rgb', title: 'Espírito Lunar', desc: 'Degradê suave do luar com prata e safira.', price: 30, textClass: 'text-transparent bg-clip-text bg-gradient-to-r from-[#e2e8f0] via-[#c5a059] to-[#93c5fd] font-extrabold drop-shadow-[0_0_4px_rgba(226,232,240,0.3)]' }
  ];

  const handleBuyBorder = async (border: any) => {
    const isOwned = border.price === 0 || 
                    (myMember?.unlockedBorders || []).includes(border.id) ||
                    myMember?.profileBorder === border.id;

    if (isOwned) {
      await updateMemberData({ profileBorder: border.id });
      setSelectedBorder(border.id);
      setPurchaseStatus({ id: border.id, message: "Moldura equipada com sucesso!", type: 'success' });
      setTimeout(() => setPurchaseStatus(null), 2500);
    } else {
      const diamondsBalance = myMember?.diamonds || 0;
      if (diamondsBalance < border.price) {
        setPurchaseStatus({ id: border.id, message: "Seus Diamantes são insuficientes!", type: 'error' });
        setTimeout(() => setPurchaseStatus(null), 2500);
        return;
      }

      const unlocked = [...(myMember?.unlockedBorders || []), border.id];
      await updateMemberData({
        diamonds: diamondsBalance - border.price,
        unlockedBorders: unlocked,
        profileBorder: border.id
      });
      setSelectedBorder(border.id);
      setPurchaseStatus({ id: border.id, message: `Adquirido e equipado por ${border.price} 💎!`, type: 'success' });
      setTimeout(() => setPurchaseStatus(null), 2500);
    }
  };

  const handleBuyTitle = async (titleItem: any) => {
    const userRoleLevel = myMember?.level || 0;
    if (userRoleLevel < titleItem.levelRequired) {
      setPurchaseStatus({ id: titleItem.id, message: `Requer Nível ${titleItem.levelRequired}!`, type: 'error' });
      setTimeout(() => setPurchaseStatus(null), 2500);
      return;
    }

    const isOwned = (myMember?.unlockedTitles || []).includes(titleItem.title) || 
                    myMember?.title === titleItem.title;

    if (isOwned) {
      await updateMemberData({ title: titleItem.title });
      setSelectedTitle(titleItem.title);
      setPurchaseStatus({ id: titleItem.id, message: "Título de honra equipado!", type: 'success' });
      setTimeout(() => setPurchaseStatus(null), 2500);
    } else {
      const diamondsBalance = myMember?.diamonds || 0;
      if (diamondsBalance < titleItem.price) {
        setPurchaseStatus({ id: titleItem.id, message: "Seus Diamantes são insuficientes!", type: 'error' });
        setTimeout(() => setPurchaseStatus(null), 2500);
        return;
      }

      const unlocked = [...(myMember?.unlockedTitles || []), titleItem.title];
      await updateMemberData({
        diamonds: diamondsBalance - titleItem.price,
        unlockedTitles: unlocked,
        title: titleItem.title
      });
      setSelectedTitle(titleItem.title);
      setPurchaseStatus({ id: titleItem.id, message: `Título conquistado e equipado por ${titleItem.price} 💎!`, type: 'success' });
      setTimeout(() => setPurchaseStatus(null), 2500);
    }
  };

  const handleBuyBackground = async (bgItem: any) => {
    const isDefault = bgItem.price === 0;
    const isOwned = isDefault || 
                    (myMember?.unlockedBanners || []).includes(bgItem.id) || 
                    myMember?.profileBg === bgItem.url;

    if (isOwned) {
      await updateMemberData({ profileBg: bgItem.url });
      setSelectedBg(bgItem.url);
      setPurchaseStatus({ id: bgItem.id, message: "Fundo de perfil equipado!", type: 'success' });
      setTimeout(() => setPurchaseStatus(null), 2500);
    } else {
      const diamondsBalance = myMember?.diamonds || 0;
      if (diamondsBalance < bgItem.price) {
        setPurchaseStatus({ id: bgItem.id, message: "Seus Diamantes são insuficientes!", type: 'error' });
        setTimeout(() => setPurchaseStatus(null), 2500);
        return;
      }

      const unlocked = [...(myMember?.unlockedBanners || []), bgItem.id];
      await updateMemberData({
        diamonds: diamondsBalance - bgItem.price,
        unlockedBanners: unlocked,
        profileBg: bgItem.url
      });
      setSelectedBg(bgItem.url);
      setPurchaseStatus({ id: bgItem.id, message: `Adquirido e equipado por ${bgItem.price} 💎!`, type: 'success' });
      setTimeout(() => setPurchaseStatus(null), 2500);
    }
  };

  const handleBuyColor = async (colorItem: any) => {
    const isDefault = colorItem.price === 0;
    const isOwned = isDefault || 
                    (myMember?.unlockedColors || []).includes(colorItem.id) || 
                    myMember?.nicknameColor === colorItem.id;

    if (isOwned) {
      await updateMemberData({ nicknameColor: colorItem.id });
      setSelectedColor(colorItem.id);
      setPurchaseStatus({ id: colorItem.id, message: "Cor equipada!", type: 'success' });
      setTimeout(() => setPurchaseStatus(null), 2500);
    } else {
      const diamondsBalance = myMember?.diamonds || 0;
      if (diamondsBalance < colorItem.price) {
        setPurchaseStatus({ id: colorItem.id, message: "Seus Diamantes são insuficientes!", type: 'error' });
        setTimeout(() => setPurchaseStatus(null), 2500);
        return;
      }

      const unlocked = [...(myMember?.unlockedColors || []), colorItem.id];
      await updateMemberData({
        diamonds: diamondsBalance - colorItem.price,
        unlockedColors: unlocked,
        nicknameColor: colorItem.id
      });
      setSelectedColor(colorItem.id);
      setPurchaseStatus({ id: colorItem.id, message: `Cor adquirida por ${colorItem.price} 💎!`, type: 'success' });
      setTimeout(() => setPurchaseStatus(null), 2500);
    }
  };

  const handleBuyEffect = async (effItem: any) => {
    const isDefault = effItem.price === 0;
    const isOwned = isDefault || 
                    (myMember?.unlockedEffects || []).includes(effItem.id) || 
                    myMember?.bannerEffect === effItem.id;

    if (isOwned) {
      await updateMemberData({ bannerEffect: effItem.id });
      setSelectedEffect(effItem.id);
      setPurchaseStatus({ id: effItem.id, message: "Efeito de perfil equipado!", type: 'success' });
      setTimeout(() => setPurchaseStatus(null), 2500);
    } else {
      const diamondsBalance = myMember?.diamonds || 0;
      if (diamondsBalance < effItem.price) {
        setPurchaseStatus({ id: effItem.id, message: "Seus Diamantes são insuficientes!", type: 'error' });
        setTimeout(() => setPurchaseStatus(null), 2500);
        return;
      }

      const unlocked = [...(myMember?.unlockedEffects || []), effItem.id];
      await updateMemberData({
        diamonds: diamondsBalance - effItem.price,
        unlockedEffects: unlocked,
        bannerEffect: effItem.id
      });
      setSelectedEffect(effItem.id);
      setPurchaseStatus({ id: effItem.id, message: `Efeito adquirido por ${effItem.price} 💎!`, type: 'success' });
      setTimeout(() => setPurchaseStatus(null), 2500);
    }
  };

  const getBorderClasses = (borderId?: string) => {
    return '';
  };

  const getNicknameColorClass = (colorId?: string) => {
    if (isEcoMode) {
      switch (colorId) {
        case 'color_gold': return 'text-[#c5a059] font-bold';
        case 'color_red': return 'text-[#b25d62] font-semibold';
        case 'color_cyan': return 'text-[#93c5fd] font-semibold';
        case 'color_pink': return 'text-[#c084fc] font-semibold';
        case 'color_emerald': return 'text-[#a7f3d0] font-semibold';
        case 'color_purple': return 'text-[#c0a9df] font-semibold';
        case 'color_rgb': return 'text-gaming-gold font-extrabold';
        default: return 'text-white';
      }
    }
    switch (colorId) {
      case 'color_gold': return 'text-[#c5a059] font-bold drop-shadow-[0_0_8px_rgba(197,160,89,0.4)]';
      case 'color_red': return 'text-[#b25d62] font-semibold drop-shadow-[0_0_8px_rgba(178,93,98,0.3)]';
      case 'color_cyan': return 'text-[#93c5fd] font-semibold drop-shadow-[0_0_8px_rgba(147,197,253,0.3)]';
      case 'color_pink': return 'text-[#c084fc] font-semibold drop-shadow-[0_0_8px_rgba(192,132,252,0.3)]';
      case 'color_emerald': return 'text-[#a7f3d0] font-semibold drop-shadow-[0_0_8px_rgba(167,243,208,0.3)]';
      case 'color_purple': return 'text-[#c0a9df] font-semibold drop-shadow-[0_0_8px_rgba(192,169,223,0.3)]';
      case 'color_rgb': return 'bg-gradient-to-r from-[#e2e8f0] via-[#c5a059] to-[#93c5fd] bg-clip-text text-transparent font-extrabold drop-shadow-[0_0_4px_rgba(226,232,240,0.3)]';
      default: return 'text-white';
    }
  };

  const compressGif = async (base64Url: string, width: number, height: number): Promise<string> => {
    return new Promise(async (resolve) => {
      try {
        const isUrl = base64Url.startsWith('http://') || base64Url.startsWith('https://');
        
        let binaryUrl = base64Url;
        
        // If it is just a URL or a Base64 data URL, let's fetch it
        const res = await fetch(binaryUrl);
        const arrayBuffer = await res.arrayBuffer();
        
        // @ts-ignore
        const gif = parseGIF(arrayBuffer);
        // @ts-ignore
        const frames = decompressFrames(gif, true);
        
        if (!frames || frames.length === 0) {
          console.warn("Nenhum frame extraído pelo gifuct-js");
          resolve(base64Url);
          return;
        }

        const gifWidth = gif.lsd.width;
        const gifHeight = gif.lsd.height;

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = gifWidth;
        tempCanvas.height = gifHeight;
        const tempCtx = tempCanvas.getContext('2d');
        if (!tempCtx) {
          resolve(base64Url);
          return;
        }

        const patchCanvas = document.createElement('canvas');
        const patchCtx = patchCanvas.getContext('2d');
        if (!patchCtx) {
          resolve(base64Url);
          return;
        }

        const frameImages: string[] = [];
        const delays: number[] = [];

        // Optimize frames total count to prevent freezing and keep the size small
        // Max 30 frames is a sweet spot for avatar/banner GIFs
        const maxFrames = 30;
        const skip = Math.max(1, Math.ceil(frames.length / maxFrames));

        for (let i = 0; i < frames.length; i += skip) {
          const frame = frames[i];
          
          if (frame.disposalType === 2) {
            tempCtx.clearRect(0, 0, gifWidth, gifHeight);
          }

          patchCanvas.width = frame.dims.width;
          patchCanvas.height = frame.dims.height;
          const patchData = patchCtx.createImageData(frame.dims.width, frame.dims.height);
          patchData.data.set(frame.patch);
          patchCtx.putImageData(patchData, 0, 0);

          tempCtx.drawImage(patchCanvas, frame.dims.left, frame.dims.top);

          const resizeCanvas = document.createElement('canvas');
          resizeCanvas.width = width;
          resizeCanvas.height = height;
          const resizeCtx = resizeCanvas.getContext('2d');
          if (resizeCtx) {
            resizeCtx.drawImage(tempCanvas, 0, 0, width, height);
            // Convert to JPEG with a slight quality drop to dramatically lower document payloads in Firestore
            frameImages.push(resizeCanvas.toDataURL('image/jpeg', 0.8));
            delays.push(frame.delay || 100);
          }
        }

        const avgDelay = delays.length > 0 ? (delays.reduce((sum, d) => sum + d, 0) / delays.length) / 1000 : 0.1;

        gifshot.createGIF({
          images: frameImages,
          gifWidth: width,
          gifHeight: height,
          interval: Math.max(0.04, avgDelay),
          numFrames: frameImages.length,
          sampleInterval: 10,
        }, (obj: any) => {
          if (!obj.error) {
            resolve(obj.image);
          } else {
            console.error("Erro no gifshot ao comprimir:", obj.errorMsg);
            resolve(base64Url);
          }
        });

      } catch (err) {
        console.error("Erro total ao descomprimir/comprimir GIF:", err);
        resolve(base64Url);
      }
    });
  };

  const compressImage = (base64: string, maxWidth = 300, maxHeight = 300, cropToSquare = false): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      // DO NOT set crossOrigin on base64 local data URLs as it triggers security blocks in many web environments
      if (!base64.startsWith('data:')) {
        img.crossOrigin = 'anonymous';
      }
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(base64);
            return;
          }

          if (cropToSquare) {
            const size = Math.min(img.width, img.height);
            const sx = (img.width - size) / 2;
            const sy = (img.height - size) / 2;
            canvas.width = maxWidth;
            canvas.height = maxWidth;
            ctx.drawImage(img, sx, sy, size, size, 0, 0, maxWidth, maxWidth);
          } else {
            let width = img.width;
            let height = img.height;
            if (width > height) {
              if (width > maxWidth) {
                height *= maxWidth / width;
                width = maxWidth;
              }
            } else {
              if (height > maxHeight) {
                width *= maxHeight / height;
                height = maxHeight;
              }
            }
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);
          }
          resolve(canvas.toDataURL('image/jpeg', 0.65)); 
        } catch (err) {
          console.error("Erro interno ao processar compressão em Canvas:", err);
          resolve(base64);
        }
      };
      img.onerror = (err) => {
        console.error("Erro ao decodificar imagem para compressão:", err);
        resolve(base64);
      };
      img.src = base64;
    });
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const originalSizeKb = Math.round(file.size / 1024);

    if (file.size > 15 * 1024 * 1024) {
      alert(`O arquivo selecionado tem ${originalSizeKb} KB, o que é muito grande (Máximo permitido: 15 MB).`);
      e.target.value = '';
      return;
    }

    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target?.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const isGif = file.type === 'image/gif' || file.name.toLowerCase().endsWith('.gif');
      if (!isGif) {
        const compressed = await compressImage(dataUrl, 150, 150, true);
        setTempAvatarUrl(compressed);
        setPurchaseStatus({ id: 'avatar_preview_success', message: 'Visualização da foto carregada! Clique em Confirmar no topo para salvar.', type: 'success' });
        setTimeout(() => setPurchaseStatus(null), 3000);
      } else {
        setIsCompressing(true);
        setPurchaseStatus({ id: 'compressing_gif', message: 'Comprimindo e otimizando seu GIF animado...', type: 'success' });
        
        const compressed = await compressGif(dataUrl, 120, 120);
        setTempAvatarUrl(compressed);
        
        const finalSizeKb = Math.round((compressed.length * 3) / 4 / 1024);
        setPurchaseStatus({ id: 'avatar_preview_success', message: `GIF otimizado e carregado com sucesso (${finalSizeKb} KB)!`, type: 'success' });
        setTimeout(() => setPurchaseStatus(null), 3000);
      }
    } catch (err: any) {
      console.error('Failed to preview avatar:', err);
      alert(`Erro ao ler o arquivo de imagem: ${err.message || err}`);
    } finally {
      setIsCompressing(false);
      e.target.value = '';
    }
  };

  const handleBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const originalSizeKb = Math.round(file.size / 1024);

    if (file.size > 15 * 1024 * 1024) {
      alert(`O arquivo de banner selecionado tem ${originalSizeKb} KB, o que é muito grande (Máximo permitido: 15 MB).`);
      e.target.value = '';
      return;
    }

    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target?.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const isGif = file.type === 'image/gif' || file.name.toLowerCase().endsWith('.gif');
      if (!isGif) {
        const compressed = await compressImage(dataUrl, 500, 250);
        setTempBannerUrl(compressed);
        setPurchaseStatus({ id: 'banner_preview_success', message: 'Visualização do banner carregada! Clique em Confirmar no topo para salvar.', type: 'success' });
        setTimeout(() => setPurchaseStatus(null), 3000);
      } else {
        setIsCompressing(true);
        setPurchaseStatus({ id: 'compressing_gif', message: 'Comprimindo e otimizando seu Banner animado...', type: 'success' });
        
        const compressed = await compressGif(dataUrl, 450, 200);
        setTempBannerUrl(compressed);
        
        const finalSizeKb = Math.round((compressed.length * 3) / 4 / 1024);
        setPurchaseStatus({ id: 'banner_preview_success', message: `Banner GIF otimizado com sucesso (${finalSizeKb} KB)!`, type: 'success' });
        setTimeout(() => setPurchaseStatus(null), 3000);
      }
    } catch (err: any) {
      console.error('Failed to preview banner:', err);
      alert(`Erro ao ler o arquivo de banner: ${err.message || err}`);
    } finally {
      setIsCompressing(false);
      e.target.value = '';
    }
  };

  const handleSaveChanges = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const updates: any = {};
      
      const isUnconfiguredFirebase = !storage?.app?.options?.storageBucket || 
                                     storage.app.options.storageBucket.includes('remixed-') || 
                                     storage.app.options.projectId === 'remixed-project-id';
      
      const skipStorage = isGuest || isUnconfiguredFirebase;
      
      // Helper for enforcing timeouts on promises
      const withTimeout = async <T,>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> => {
        return Promise.race([
          promise,
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error(`${label} timed out after ${timeoutMs}ms`)), timeoutMs))
        ]);
      };
      
      // 1. Verify and upload avatar if changed
      if (tempAvatarUrl !== undefined && tempAvatarUrl !== myMember?.avatarUrl) {
        if (tempAvatarUrl === '') {
          updates.avatarUrl = '';
        } else if (tempAvatarUrl.startsWith('data:')) {
          if (skipStorage) {
            updates.avatarUrl = tempAvatarUrl;
          } else {
            try {
              const isGif = tempAvatarUrl.includes('image/gif');
              const mimeType = isGif ? 'image/gif' : 'image/jpeg';
              
              const ext = isGif ? 'gif' : 'jpg';
              const fileRef = storageRef(storage, `avatars/${user?.uid || 'unknown'}/${Date.now()}_profile.${ext}`);
              
              const arr = tempAvatarUrl.split(',');
              const bstr = atob(arr[1]);
              let n = bstr.length;
              const u8arr = new Uint8Array(n);
              while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
              }
              const blobToUpload = new Blob([u8arr], { type: mimeType });
              const metadata = { contentType: mimeType };
              
              const snapshot = await withTimeout(
                uploadBytes(fileRef, blobToUpload, metadata),
                2500,
                'Avatar Upload'
              );
              
              const downloadUrl = await withTimeout(
                getDownloadURL(snapshot.ref),
                1500,
                'Avatar URL fetch'
              );
              
              updates.avatarUrl = downloadUrl;
            } catch (storageErr: any) {
              console.warn('Firebase Storage blocked, disabled or unconfigured. Falling back to direct document base64 save.', storageErr);
              
              const payloadSizeKb = Math.round((tempAvatarUrl.length * 3) / 4 / 1024);
              if (payloadSizeKb > 800) {
                alert(`A foto de perfil tem ${payloadSizeKb} KB, o que excede o limite máximo para salvamento direto no Firestore (800 KB).\n\nPara consertar isso e poder usar qualquer GIF animado livremente, use a nova opção "Link de Imagem ou GIF da Web" abaixo colando o link direto dele (ex: do Discord, Tenor, Imgur ou ImgBB)! Isso não consome espaço no banco.`);
                setIsSaving(false);
                return;
              }
              updates.avatarUrl = tempAvatarUrl;
            }
          }
        } else {
          updates.avatarUrl = tempAvatarUrl;
        }
      }

      // 2. Verify and upload banner if changed
      if (tempBannerUrl !== undefined && tempBannerUrl !== myMember?.profileBg) {
        if (tempBannerUrl === '') {
          updates.profileBg = '';
        } else if (tempBannerUrl.startsWith('data:')) {
          if (skipStorage) {
            updates.profileBg = tempBannerUrl;
          } else {
            try {
              const isGif = tempBannerUrl.includes('image/gif');
              const mimeType = isGif ? 'image/gif' : 'image/jpeg';
              
              const ext = isGif ? 'gif' : 'jpg';
              const fileRef = storageRef(storage, `banners/${user?.uid || 'unknown'}/${Date.now()}_banner.${ext}`);
              
              const arr = tempBannerUrl.split(',');
              const bstr = atob(arr[1]);
              let n = bstr.length;
              const u8arr = new Uint8Array(n);
              while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
              }
              const blobToUpload = new Blob([u8arr], { type: mimeType });
              const metadata = { contentType: mimeType };
              
              const snapshot = await withTimeout(
                uploadBytes(fileRef, blobToUpload, metadata),
                2500,
                'Banner Upload'
              );
              
              const downloadUrl = await withTimeout(
                getDownloadURL(snapshot.ref),
                1500,
                'Banner URL fetch'
              );
              
              updates.profileBg = downloadUrl;
            } catch (storageErr: any) {
              console.warn('Firebase Storage blocked for banners. Falling back to direct document base64 save.', storageErr);
              
              const payloadSizeKb = Math.round((tempBannerUrl.length * 3) / 4 / 1024);
              if (payloadSizeKb > 800) {
                alert(`O banner de perfil tem ${payloadSizeKb} KB, o que excede o limite máximo para salvamento direto no Firestore (800 KB).\n\nPara resolver isso e usar qualquer GIF animado de qualquer tamanho, utilize a nova opção "Link de Banner ou GIF da Web" abaixo colando o link direto do GIF de sua preferência!`);
                setIsSaving(false);
                return;
              }
              updates.profileBg = tempBannerUrl;
            }
          }
        } else {
          updates.profileBg = tempBannerUrl;
        }
      }

      // 3. Save name, bio, power and complete edit check
      if (tempName && tempName.trim() !== myMember?.name) {
        updates.name = tempName.trim();
      }
      if (tempBio !== myMember?.customBio) {
        updates.customBio = tempBio;
      }
      if (Number(tempPower) !== myMember?.heroPower) {
        updates.heroPower = Number(tempPower);
      }

      // Perform a single atomic database or localstate update!
      if (Object.keys(updates).length > 0) {
        await updateMemberData(updates);
      }

      completeMission('edit_hero_power', 50);

      setIsEditing(false);
      setPurchaseStatus({ id: 'all_save_success', message: 'Seu perfil foi atualizado e salvo com sucesso!', type: 'success' });
      setTimeout(() => setPurchaseStatus(null), 2500);
    } catch (err: any) {
      console.error('Failed to save profile modifications:', err);
      alert(`Ocorreu um erro ao salvar as alterações:\n\n${err?.message || err}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    handleSaveChanges();
  };

  const handleSaveStatus = (evt: React.FormEvent) => {
    evt.preventDefault();
    updateMemberData({ customStatus: tempStatus });
    setPurchaseStatus({ id: 'status_save', message: 'Status Atualizado!', type: 'success' });
    setTimeout(() => setPurchaseStatus(null), 2000);
  };

  const handleSaveNickAndPower = (e: React.FormEvent) => {
    e.preventDefault();
    handleSaveChanges();
  };

  const handleSaveBioOnly = (e: React.FormEvent) => {
    e.preventDefault();
    handleSaveChanges();
  };

  const statusTemplates = [
    "🎮 Jogando: Elden Ring",
    "🛡️ Em chamada tática da aliança",
    "⛏️ Farmando recursos na base principal",
    "⚡ Modo Tryhard Ativado!",
    "☕ Recarregando baterias...",
    "💤 AFK (Ausente no momento)"
  ];

  const sidebarItems = [
    { id: 'nick', group: 'DADOS GERAIS', label: '1. Nick & Dados', icon: User, isDev: false },
    { id: 'borders', group: 'ESTILOS', label: '2. Moldura Dinâmica', icon: Shield, isDev: true },
    { id: 'effects', group: 'ESTILOS', label: '3. Efeito de Entrada', icon: Flame, isDev: true },
    { id: 'background', group: 'ESTILOS', label: '4. Banner de Fundo', icon: Image, isDev: false },
    { id: 'nicknameColor', group: 'ESTILOS', label: '5. Cor do Apelido', icon: Palette, isDev: true },
    { id: 'titles', group: 'ESTILOS', label: '6. Título Honorífico', icon: Crown, isDev: true }
  ];

  // Helper component to render the beautiful real Discord Card itself
  const renderDiscordCard = (customIdPrefix: string) => {
    const activeBorderItem = AVATAR_DECORATIONS.find(b => b.id === selectedBorder);
    const activeEffectItem = PROFILE_EFFECTS.find(e => e.id === selectedEffect);

    return (
      <div 
        id={`${customIdPrefix}-discord-card-container`} 
        className="w-full max-w-[340px] bg-[#18191c] border border-black/50 rounded-2xl overflow-hidden shadow-2xl relative font-sans flex flex-col text-left border border-white/5"
      >
        {/* CARD BANNER CHAMELEON */}
        <div className="h-28 relative overflow-hidden bg-zinc-800 shrink-0 select-none">
          <img
            src={selectedBg || "https://cdnb.artstation.com/p/assets/images/images/017/680/475/small/andrej-otepka-square-04-tmp04web.jpg?1556922748"}
            alt="Banner Base"
            className="w-full h-full object-cover opacity-75"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#18191c] to-black/30" />

          {/* Real Dynamic Profile Effect Overlay */}
          {activeEffectItem && (
            <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden flex items-center justify-center">
              <img 
                src={activeEffectItem.imgSrc} 
                alt={activeEffectItem.title} 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover opacity-80 mix-blend-color-dodge scale-110 animate-pulse"
              />
            </div>
          )}
        </div>

        {/* OVERLAPPING AVATAR SPHERE WITH ONLINE STATUS */}
        <div className="px-5 pb-5 pt-1.5 flex flex-col relative select-none">
          
          <div className="absolute -top-12 left-5 select-none">
            <div className="w-20 h-20 rounded-full bg-[#18191c] p-1 relative flex items-center justify-center transition-all">
              <SafeAvatar
                src={tempAvatarUrl || myMember?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid}`}
                alt="Profile Avatar"
                className="w-full h-full rounded-full object-cover relative z-10 animate-fade-in"
                isEcoMode={isEcoMode}
              />
              {/* Real transparent overlay decoration */}
              {activeBorderItem && (
                <img 
                  src={activeBorderItem.imgSrc} 
                  alt={activeBorderItem.title} 
                  referrerPolicy="no-referrer"
                  className="absolute -inset-2.5 w-[calc(100%+20px)] h-[calc(100%+20px)] max-w-none pointer-events-none z-20"
                />
              )}
              {/* Online Indicator */}
              <div className="absolute bottom-0 right-0 w-5 h-5 bg-[#18191c] rounded-full flex items-center justify-center p-0.5 z-25 shadow-lg">
                <div className="w-full h-full bg-[#23a55a] rounded-full animate-pulse shadow-[0_0_5px_rgba(35,165,90,0.5)]" />
              </div>
            </div>
          </div>

          {/* EDIT PROFILE BUTTON PLACED INTEGRATED ON THE UPPER RIGHT AREA */}
          {!isEditing && (
            <div className="flex justify-end h-8 mb-3">
              <button
                id="edit-profile-btn"
                onClick={() => setIsEditing(true)}
                className="px-3.5 py-1.5 bg-[#4e5058] hover:bg-[#6d6f78] text-white rounded-md text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1 my-auto shadow-md"
              >
                <Palette size={10} className="text-gaming-gold" />
                Editar Perfil
              </button>
            </div>
          )}

          {isEditing && (
            <div className="flex justify-end h-8 mb-3">
              <span className="px-2.5 py-1 bg-gaming-gold/15 text-gaming-gold rounded text-[8px] font-black tracking-wider uppercase flex items-center gap-1 my-auto border border-gaming-gold/10">
                <Sparkles size={8} /> Modo Edição
              </span>
            </div>
          )}

          {/* Card core sections wrapper */}
          <div className="mt-4 flex flex-col bg-[#111214] border border-[#232428] rounded-xl p-4 gap-3.5 shadow-inner">
            
            {/* Visual Nick display */}
            <div className="flex flex-col text-left">
              <span className={`text-base font-black tracking-tight uppercase truncate leading-tight ${getNicknameColorClass(selectedColor)}`}>
                {tempName || myMember?.name || 'Recruta'}
              </span>
              <span className="text-[8px] font-mono font-bold text-[#949ba4] uppercase tracking-wider mt-0.5 block">
                {user?.email}
              </span>
            </div>

            {/* Custom status bubble */}
            <div className="h-[1px] bg-white/[0.04] w-full shrink-0" />

            <div className="flex flex-col gap-1 text-left">
              <span className="text-[7px] uppercase font-black text-[#949ba4] tracking-widest font-sans">STATUS SUPREMA</span>
              {tempStatus ? (
                <div className="text-[9px] text-[#dbdee1] font-bold italic flex items-center gap-1.5 bg-[#1e1f22] p-2 rounded-lg border border-white/5 w-fit">
                  <span>{tempStatus}</span>
                </div>
              ) : (
                <span className="text-[8px] text-white/20 uppercase font-black tracking-widest italic py-0.5">Sem status definido</span>
              )}
            </div>

            {/* Bio text block */}
            <div className="h-[1px] bg-white/[0.04] w-full shrink-0" />

            <div className="flex flex-col gap-1 text-left">
              <span className="text-[7.5px] uppercase font-black text-[#949ba4] tracking-widest font-sans">SOBRE MIM</span>
              <p className="text-[9px] text-[#dbdee1]/85 leading-relaxed font-semibold transition-all">
                {tempBio || 'Guerreiro nobre do clã Alcatéia Suprema.'}
              </p>
            </div>

            {/* Badges / Insígnias */}
            <div className="h-[1px] bg-white/[0.04] w-full shrink-0" />

            <div className="flex flex-col gap-1.5 text-left">
              <span className="text-[7.5px] uppercase font-black text-[#949ba4] tracking-widest font-sans">INSÍGNIAS SUPREMA</span>
              <div className="flex gap-1.5 flex-wrap">
                {selectedTitle && (
                  <span className="px-2 py-0.5 bg-gaming-gold/10 text-gaming-gold border border-gaming-gold/25 rounded text-[7px] font-black uppercase tracking-widest">
                    🏅 {selectedTitle}
                  </span>
                )}
                {myMember?.showLevel !== false && (
                  <span className="px-2 py-0.5 bg-[#5865f2]/10 text-[#5865f2] border border-[#5865f2]/20 rounded text-[7px] font-black uppercase tracking-widest">
                    🛡️ Nv. {myMember?.level || 1}
                  </span>
                )}
                {myMember?.premiumPass && myMember?.showPremium !== false && (
                  <span className="px-2 py-0.5 bg-[#f0b232]/10 text-[#f0b232] border border-[#f0b232]/25 rounded text-[7px] font-black uppercase tracking-widest animate-pulse">
                    💎 Nitro Premium
                  </span>
                )}
              </div>
            </div>

            {/* Combat Power & Wealth roles */}
            <div className="h-[1px] bg-white/[0.04] w-full shrink-0" />

            <div className="flex flex-col gap-1 text-left">
              <span className="text-[7.5px] uppercase font-black text-[#949ba4] tracking-widest font-sans mb-1">CARGOS E STATUS DE COMBATE</span>
              <div className="flex gap-1.5 flex-wrap">
                {myMember?.showPower !== false && (
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-[#232428] border border-white/5 rounded text-[7.5px] font-bold text-white uppercase tracking-wider shadow">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    Poder: {tempPower?.toLocaleString() || 0} HP
                  </span>
                )}
                {myMember?.showCoins !== false && (
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-[#232428] border border-white/5 rounded text-[7.5px] font-bold text-white uppercase tracking-wider shadow">
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                    Moedas: {myMember?.coins?.toLocaleString() || 0}
                  </span>
                )}
                {myMember?.showDonations !== false && (
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-[#232428] border border-white/5 rounded text-[7.5px] font-bold text-white uppercase tracking-wider shadow">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1da0f2]" />
                    Doou: {myMember?.donations?.toLocaleString() || 0}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-full relative" id="perfil-view-ambient-container">
      {/* Hidden input for file picking */}
      <input 
        type="file"
        ref={fileInputRef}
        accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
        onChange={handleAvatarChange}
        className="hidden"
      />

      <input 
        type="file"
        ref={bannerFileInputRef}
        accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
        onChange={handleBannerChange}
        className="hidden"
      />

      <AnimatePresence mode="wait">
        {/* CASE 1: CLEAN VIEW (DEFAULT STATE) */}
        {!isEditing ? (
          <motion.div
            key="clean-profile-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col w-full min-h-[calc(100vh-90px)] text-[#dbdee1] font-sans relative overflow-y-auto px-4 md:px-8 pb-12"
          >
            {/* Panoramic Banner Area */}
            <div className="w-full h-48 sm:h-64 md:h-80 rounded-2xl md:rounded-3xl overflow-hidden relative border border-white/5 shadow-2xl shrink-0 select-none">
              <img
                src={myMember?.profileBg || "https://cdnb.artstation.com/p/assets/images/images/017/680/475/small/andrej-otepka-square-04-tmp04web.jpg?1556922748"}
                alt="Banner Base"
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/25" />

              {/* Real Dynamic Profile Effect Overlay */}
              {equippedEffectItem && (
                <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden flex items-center justify-center">
                  <img 
                    src={equippedEffectItem.imgSrc} 
                    alt={equippedEffectItem.title} 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover opacity-80 mix-blend-color-dodge scale-110 animate-pulse"
                  />
                </div>
              )}
            </div>

            {/* Avatar & Portrait Overlay Area */}
            <div className="relative z-10 px-4 md:px-10 flex flex-col md:flex-row md:items-end justify-between -mt-12 sm:-mt-16 md:-mt-24 mb-6">
              <div className="flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-6">
                {/* Avatar sphere */}
                <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-38 md:h-38 rounded-full bg-[#18191c] p-1.5 relative flex items-center justify-center transition-all shadow-2xl">
                  <SafeAvatar
                    src={myMember?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid}`}
                    alt="Profile Avatar"
                    className="w-full h-full rounded-full object-cover relative z-10"
                    isEcoMode={isEcoMode}
                  />
                  {/* Real transparent overlay decoration */}
                  {equippedBorderItem && (
                    <img 
                      src={equippedBorderItem.imgSrc} 
                      alt={equippedBorderItem.title} 
                      referrerPolicy="no-referrer"
                      className="absolute -inset-3 w-[calc(100%+24px)] h-[calc(100%+24px)] max-w-none pointer-events-none z-20"
                    />
                  )}
                  {/* Online status indicator */}
                  <div className="absolute bottom-1 right-1 w-6 h-6 bg-[#18191c] rounded-full flex items-center justify-center p-0.5 z-25 shadow-lg">
                    <div className="w-full h-full bg-[#23a55a] rounded-full animate-pulse shadow-[0_0_8px_rgba(35,165,90,0.6)]" />
                  </div>
                </div>

                {/* Nickname, Titles, and Status details */}
                <div className="flex flex-col items-center md:items-start text-center md:text-left gap-1 md:pb-2">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                    <h2 className={`text-2xl sm:text-3xl md:text-4xl font-display font-black tracking-tight uppercase leading-none filter drop-shadow [text-shadow:_0_2px_10px_rgba(0,0,0,0.5)] ${getNicknameColorClass(myMember?.nicknameColor)}`}>
                      {myMember?.name || 'Recruta'}
                    </h2>
                    {myMember?.title && myMember?.showTitle !== false && (
                      <span className="px-2.5 py-0.5 bg-gaming-gold/10 text-gaming-gold border border-gaming-gold/20 rounded-md text-[8px] font-black uppercase tracking-widest h-fit">
                        🏅 {myMember.title}
                      </span>
                    )}
                  </div>
                  
                  <span className="text-[9px] font-mono font-bold text-[#949ba4] uppercase tracking-wider">
                    {user?.email}
                  </span>

                  {myMember?.customStatus && (
                    <div className="text-[10px] text-zinc-300 font-bold italic mt-1.5 bg-black/40 hover:bg-black/55 py-1 px-3 rounded-full border border-white/5 w-fit flex items-center gap-1.5 shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-gaming-gold animate-bounce" />
                      <span>{myMember.customStatus}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Edit Profile Button on the right */}
              <div className="mt-4 md:mt-0 flex justify-center md:pb-2.5">
                <button
                  id="edit-profile-action-btn"
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-3 bg-[#5865f2] hover:bg-[#4752c4] active:bg-[#3c45a5] text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-200 flex items-center gap-2 shadow-[0_4px_15px_rgba(88,101,242,0.3)] hover:scale-105"
                >
                  <Palette size={14} className="text-gaming-gold" />
                  Editar Meu Perfil
                </button>
              </div>
            </div>

            {/* Split Grid for Bio + Statistics */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4">
              
              {/* Bio Block */}
              <div className="lg:col-span-7 bg-black/25 border border-white/5 p-6 rounded-2xl flex flex-col gap-3 text-left relative group">
                <div className="flex items-center justify-between gap-2 w-full">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-[9px] uppercase font-black text-[#949ba4] tracking-widest">Sobre Mim</span>
                    <div className="h-[1px] bg-white/5 flex-1" />
                  </div>
                  {!isEditingBio && (
                    <button
                      type="button"
                      onClick={() => {
                        setInlineBioText(myMember?.customBio || 'Guerreiro nobre do clã Alcatéia Suprema.');
                        setIsEditingBio(true);
                      }}
                      className="text-zinc-500 hover:text-gaming-gold transition-colors p-1 flex items-center gap-1 cursor-pointer"
                      title="Editar Biografia"
                    >
                      <Edit2 size={11} />
                      <span className="text-[8px] font-black uppercase tracking-wider">Editar</span>
                    </button>
                  )}
                </div>
                {isEditingBio ? (
                  <div className="flex flex-col gap-2 mt-1 w-full">
                    <textarea
                      value={inlineBioText}
                      onChange={(e) => setInlineBioText(e.target.value)}
                      maxLength={180}
                      rows={3}
                      className="w-full bg-[#111214] border border-[#232428] focus:border-[#5865f2] rounded-xl p-3 outline-none text-zinc-200 text-xs sm:text-sm font-semibold tracking-wide resize-none transition-colors"
                      placeholder="Fale um pouco sobre você e seus objetivos de guerra..."
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setIsEditingBio(false)}
                        className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white text-[9px] font-black uppercase tracking-widest rounded-lg transition-colors cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await updateMemberData({ customBio: inlineBioText });
                            setIsEditingBio(false);
                          } catch (err) {
                            alert("Erro ao salvar biografia!");
                          }
                        }}
                        className="px-3 py-1.5 bg-gaming-gold hover:bg-white text-black text-[9px] font-black uppercase tracking-widest rounded-lg transition-colors cursor-pointer"
                      >
                        Salvar
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm md:text-base text-zinc-300 leading-relaxed font-semibold font-sans italic break-words">
                    "{myMember?.customBio || 'Guerreiro nobre do clã Alcatéia Suprema.'}"
                  </p>
                )}
              </div>

              {/* Stats Block */}
              <div className="lg:col-span-5 bg-black/25 border border-white/5 p-6 rounded-2xl flex flex-col gap-3 text-left">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[9px] uppercase font-black text-[#949ba4] tracking-widest">Estatísticas Militares</span>
                  <div className="h-[1px] bg-white/5 flex-1" />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  {myMember?.showLevel !== false && (
                    <div className="bg-white/[0.02] border border-white/[0.04] p-3 rounded-xl flex flex-col gap-0.5">
                      <span className="text-[8px] text-[#949ba4] uppercase font-bold">Nível Militar</span>
                      <span className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                        ⚔️ Nível {myMember?.level || 1}
                      </span>
                    </div>
                  )}

                  {myMember?.showPower !== false && (
                    <div className="bg-white/[0.02] border border-white/[0.04] p-3 rounded-xl flex flex-col gap-0.5">
                      <span className="text-[8px] text-[#949ba4] uppercase font-bold">Poder de Herói</span>
                      <span className="text-sm font-black text-red-400 uppercase tracking-wider">
                        🔥 {myMember?.heroPower?.toLocaleString() || 0} HP
                      </span>
                    </div>
                  )}

                  {myMember?.showCoins !== false && (
                    <div className="bg-white/[0.02] border border-white/[0.04] p-3 rounded-xl flex flex-col gap-0.5">
                      <span className="text-[8px] text-[#949ba4] uppercase font-bold">Riqueza Pessoal</span>
                      <span className="text-sm font-black text-gaming-gold uppercase tracking-wider">
                        🪙 {myMember?.coins?.toLocaleString() || 0} Moedas
                      </span>
                    </div>
                  )}

                  {myMember?.showDonations !== false && (
                    <div className="bg-white/[0.02] border border-white/[0.04] p-3 rounded-xl flex flex-col gap-0.5">
                      <span className="text-[8px] text-[#949ba4] uppercase font-bold">Doações Totais</span>
                      <span className="text-sm font-black text-blue-400 uppercase tracking-wider">
                        🛡️ {myMember?.donations?.toLocaleString() || 0}
                      </span>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </motion.div>
        ) : (
          /* CASE 2: DISCORD SETTINGS STUDIO (EDIT MODE STATE RE-DESIGNED) */
          <motion.div
            key="edit-profile-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col w-full min-h-[calc(100vh-90px)] text-[#dbdee1] font-sans relative overflow-y-auto px-2 md:px-4 pb-12 max-w-6xl mx-auto gap-6 text-left"
          >
            {/* Header / Studio Area */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4 shrink-0 mt-2">
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-mono font-black text-gaming-gold uppercase tracking-widest">Estúdio de Customização</span>
                <h1 className="text-xl sm:text-2xl font-display font-black text-white uppercase tracking-tight">Ateliê da Aliança</h1>
              </div>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                disabled={isSaving}
                className="px-4 py-2 bg-[#4e5058] hover:bg-[#6d6f78] text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 flex items-center gap-1.5 shadow"
              >
                <X size={12} /> Fechar Estúdio
              </button>
            </div>

            {/* TWO COLUMNS DUAL LAYOUT: Desktop Split Preview & Form Store */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* LEFT COLUMN: LIVE DISCORD CARDS PREVIEW */}
              <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-24 flex flex-col gap-4">
                <div className="bg-[#111214] p-5 rounded-2xl border border-white/5 flex flex-col gap-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                    <span className="text-[10px] uppercase font-black text-[#949ba4] tracking-widest font-mono">Live Preview</span>
                    <span className="text-[9px] bg-emerald-500/10 text-emerald-400 font-extrabold uppercase px-2 py-0.5 rounded animate-pulse">Ativo</span>
                  </div>
                  
                  <div className="flex justify-center w-full">
                    {renderDiscordCard("studio-preview")}
                  </div>

                  <p className="text-[8.5px] text-zinc-500 font-medium uppercase tracking-wider text-center max-w-[280px] mx-auto mt-1 leading-normal">
                    Selecione molduras, efeitos, cores ou títulos à direita para visualizá-los e testá-los instantaneamente no preview em tempo real.
                  </p>
                </div>
              </div>

              {/* RIGHT COLUMN: INTERACTIVE SHOP & DATA FORMS */}
              <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-5">
                
                 {/* Horizontal Minimal Tabs Menu - Optimized grid layout for mobile and flex layout for desktop */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:flex md:flex-wrap gap-2.5 select-none border-b border-white/5 pb-4">
                  {sidebarItems.map(item => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setActiveTab(item.id as any);
                          setPurchaseStatus(null);
                        }}
                        className={`flex items-center justify-center md:justify-start gap-2 px-3 py-3 md:px-4 md:py-2.5 rounded-xl border text-[10px] md:text-[11px] font-black tracking-wider uppercase transition-all duration-150 relative cursor-pointer ${
                          isActive 
                            ? 'bg-gaming-gold text-black border-gaming-gold shadow-[0_4px_12px_rgba(251,191,36,0.25)] scale-[1.01]' 
                            : 'bg-[#1e1f22]/30 border-white/5 text-zinc-400 hover:text-white hover:bg-[#1e1f22]/60 hover:border-white/10'
                        }`}
                      >
                        <Icon size={12} className={isActive ? 'text-black font-extrabold' : 'text-zinc-500'} />
                        <span className="flex items-center gap-1.5 truncate">
                          {item.label.split('. ')[1] || item.label}
                          {item.isDev && (
                            <span className="text-[7px] font-mono font-black tracking-normal px-1 py-0.5 rounded uppercase leading-none bg-amber-500/10 text-amber-500 border border-amber-500/20 shrink-0">
                              Dev.
                            </span>
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Subheader category describer */}
                <div className="bg-[#1e1f22]/40 border border-white/5 p-4 rounded-xl text-left">
                  <span className="text-[10px] uppercase font-black text-gaming-gold tracking-widest flex items-center gap-2">
                    Categoria: {sidebarItems.find(i => i.id === activeTab)?.label}
                    {sidebarItems.find(i => i.id === activeTab)?.isDev && (
                      <span className="text-[7.5px] font-black tracking-widest bg-amber-500/15 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded uppercase">
                        Em Desenvolvimento
                      </span>
                    )}
                  </span>
                  <p className="text-[9.5px] text-zinc-400 font-semibold uppercase tracking-wider mt-1 leading-relaxed">
                    {activeTab === 'nick' && 'Preencha seus dados de guerra e dados de visualização gerais.'}
                    {activeTab === 'borders' && 'Adquira e equipe molduras de perfil usando diamantes.'}
                    {activeTab === 'effects' && 'Deixe seu card de perfil imponente com efeitos visuais de entrada e movimento.'}
                    {activeTab === 'background' && 'Destaque-se com banners exclusivos ou use seu próprio link de imagem/GIF personalizado.'}
                    {activeTab === 'nicknameColor' && 'Selecione e mude a cor ou degradê rúnico do seu apelido de guerra.'}
                    {activeTab === 'titles' && 'Selecione e equipe títulos de nobreza e renome militar.'}
                  </p>
                </div>

                {/* Tab body content container */}
                <div className="flex flex-col gap-4">
                  
                  {/* DATA FORMS TAB */}
                  {activeTab === 'nick' && (
                    <div className="bg-[#1e1f22]/60 border border-white/5 rounded-2xl p-5 md:p-6 flex flex-col gap-5 text-left">
                      <h3 className="text-xs font-black text-white uppercase tracking-widest border-b border-white/5 pb-2">Identidade Principal</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Nome de Guerra (Nick)</label>
                          <input
                            type="text"
                            value={tempName}
                            onChange={(e) => setTempName(e.target.value)}
                            maxLength={18}
                            placeholder="Ex: Guerreiro Alfa"
                            className="bg-[#111214] border border-white/5 focus:border-[#5865f2] w-full rounded-xl px-4 py-3 outline-none text-xs font-bold text-white uppercase transition-all tracking-wider"
                          />
                        </div>

                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Status Customizado</label>
                          <input
                            type="text"
                            value={tempStatus}
                            onChange={(e) => setTempStatus(e.target.value)}
                            maxLength={35}
                            placeholder="Ex: Treinando pesado..."
                            className="bg-[#111214] border border-white/5 focus:border-[#5865f2] w-full rounded-xl px-4 py-3 outline-none text-xs font-bold text-white transition-all tracking-wider"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Poder de Herói (HP)</label>
                          <input
                            type="number"
                            value={tempPower}
                            onChange={(e) => setTempPower(Number(e.target.value))}
                            placeholder="Ex: 5000"
                            className="bg-[#111214] border border-white/5 focus:border-[#5865f2] w-full rounded-xl px-4 py-3 outline-none text-[#dbdee1] text-xs font-bold transition-all tracking-wider"
                          />
                        </div>

                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest font-sans">Sua Biografia / Apresentação</label>
                          <input
                            type="text"
                            value={tempBio}
                            onChange={(e) => setTempBio(e.target.value)}
                            maxLength={130}
                            placeholder="Ex: Líder de ataques de guerra do clã..."
                            className="bg-[#111214] border border-white/5 focus:border-[#5865f2] w-full rounded-xl px-4 py-3 outline-none text-[#dbdee1] text-xs font-bold transition-all tracking-wider"
                          />
                        </div>
                      </div>

                      {/* Photo / Avatar selector options inside Identidade */}
                      <div className="border-t border-white/5 pt-4 flex flex-col gap-3">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Foto ou Link do Avatar de Perfil</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              setUploadAcceptType('image/*');
                              setTimeout(() => fileInputRef.current?.click(), 100);
                            }}
                            className="p-3 bg-black/40 hover:bg-black/60 border border-white/5 rounded-xl flex items-center gap-3 transition-all text-left"
                          >
                            <Camera size={14} className="text-gaming-gold" />
                            <div className="flex flex-col">
                              <span className="text-[10px] font-black uppercase text-white">Carregar Imagem / GIF</span>
                              <span className="text-[8px] text-zinc-500 uppercase font-black">PNG, JPG, GIF do dispositivo</span>
                            </div>
                          </button>

                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Cole o link do avatar (ex: Imgur, Discord URL)"
                              defaultValue={tempAvatarUrl}
                              onBlur={(e) => {
                                const val = e.target.value.trim();
                                if (val) {
                                  setTempAvatarUrl(val);
                                  setPurchaseStatus({ id: 'link-avatar-preview', message: 'Url de foto carregada!', type: 'success' });
                                  setTimeout(() => setPurchaseStatus(null), 2500);
                                }
                              }}
                              className="bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-[9px] font-semibold text-white outline-none focus:border-gaming-gold/40 flex-1 transition-all"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-4 pt-4 border-t border-white/5">
                        <span className="text-[8.5px] text-[#949ba4] uppercase font-bold">* Clique para salvar as mudanças principais de identidade rúnica.</span>
                        <button
                          type="button"
                          onClick={async () => {
                            setIsSaving(true);
                            await updateMemberData({
                              name: tempName,
                              customStatus: tempStatus,
                              heroPower: tempPower,
                              customBio: tempBio,
                              avatarUrl: tempAvatarUrl
                            });
                            setIsSaving(false);
                            setPurchaseStatus({ id: 'nick_only_save', message: 'Identidade militar gravada com sucesso!', type: 'success' });
                            setTimeout(() => setPurchaseStatus(null), 2500);
                          }}
                          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-md"
                        >
                          Salvar Alterações
                        </button>
                      </div>
                    </div>
                  )}

                  {/* SHOP CATEGORY: DYNAMIC RENDER OF STORE ITEMS */}
                  {activeTab !== 'nick' && (
                    <div className="bg-[#1e1f22]/60 border border-white/5 rounded-2xl p-5 md:p-6 flex flex-col gap-4 text-left overflow-hidden">
                      {sidebarItems.find(i => i.id === activeTab)?.isDev ? (
                        <div className="py-12 px-4 flex flex-col items-center text-center justify-center gap-6 select-none my-4">
                          <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 text-gaming-gold flex items-center justify-center animate-pulse shadow-[0_0_15px_rgba(245,158,11,0.05)]">
                            <Lock size={28} />
                          </div>
                          
                          <div className="flex flex-col gap-2 max-w-sm">
                            <h3 className="text-sm font-black text-white uppercase tracking-widest">
                              Recurso Em Desenvolvimento
                            </h3>
                            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider leading-relaxed">
                              O ateliê de <span className="text-gaming-gold font-black">"{sidebarItems.find(i => i.id === activeTab)?.label.split('. ')[1]}"</span> está em fase de refinamento tático. Em breve, novos colecionáveis exclusivos estarão disponíveis para resgate usando seus Diamantes rúnicos!
                            </p>
                          </div>

                          <div className="flex items-center gap-3 bg-black/40 px-4 py-2 border border-white/5 rounded-2xl text-[9px] font-black uppercase text-amber-500 tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                            Previsão: Atualização de Temporada
                          </div>

                          {/* Frosted locked item placeholders to tease future look */}
                          <div className="grid grid-cols-2 gap-3 w-full max-w-md opacity-30 pointer-events-none mt-2">
                            <div className="p-3 bg-zinc-900/50 border border-white/5 rounded-xl flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-zinc-800" />
                              <div className="flex-1 flex flex-col gap-1 items-start">
                                <div className="h-2 bg-zinc-700 rounded w-16" />
                                <div className="h-1.5 bg-zinc-800 rounded w-10" />
                              </div>
                            </div>
                            <div className="p-3 bg-zinc-900/50 border border-white/5 rounded-xl flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-zinc-800" />
                              <div className="flex-1 flex flex-col gap-1 items-start">
                                <div className="h-2 bg-zinc-700 rounded w-12" />
                                <div className="h-1.5 bg-zinc-800 rounded w-8" />
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                            <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-1.5">
                              Conquistar Itens de {sidebarItems.find(i => i.id === activeTab)?.label.split('. ')[1]}
                            </h3>
                            <div className="flex items-center gap-1 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5 text-gaming-gold font-black text-[10px] tracking-wider uppercase">
                              <span>Saldo: {(myMember?.diamonds || 0).toLocaleString()} 💎</span>
                            </div>
                          </div>

                          {/* BANNER TAB ADDITIONAL MANUAL LINK OPINION */}
                          {activeTab === 'background' && (
                            <div className="p-3 bg-black/35 border border-white/5 rounded-xl flex flex-col gap-2.5 mb-2">
                              <label className="text-[9.5px] font-black text-gaming-gold uppercase tracking-wider">Usar seu próprio Banner (URL / Arquivo)</label>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setUploadAcceptType('image/*');
                                    setTimeout(() => bannerFileInputRef.current?.click(), 100);
                                  }}
                                  className="px-3 py-2 bg-zinc-900 border border-white/5 hover:border-gaming-gold/40 rounded-xl flex items-center gap-2 transition-all text-left"
                                >
                                  <Camera size={13} className="text-gaming-gold" />
                                  <span className="text-[9px] font-black uppercase tracking-wider text-white">Carregar Imagem de Banner</span>
                                </button>
                                <input
                                  type="text"
                                  placeholder="Ou cole o link direto (ex: GIF, Imgur)"
                                  defaultValue={tempBannerUrl}
                                  onBlur={(e) => {
                                    const val = e.target.value.trim();
                                    if (val) {
                                      setSelectedBg(val);
                                      setTempBannerUrl(val);
                                      updateMemberData({ profileBg: val });
                                      setPurchaseStatus({ id: 'manual-bg-url', message: 'URL de fundo aplicada!', type: 'success' });
                                      setTimeout(() => setPurchaseStatus(null), 2500);
                                    }
                                  }}
                                  className="bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-[9px] font-bold text-white outline-none focus:border-gaming-gold/40 transition-all"
                                />
                              </div>
                            </div>
                          )}

                          {/* CONSOLIDATED INTERACTIVE ITEMS GRID */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                            {(activeTab === 'borders' ? borders :
                              activeTab === 'effects' ? effects :
                              activeTab === 'background' ? backgrounds :
                              activeTab === 'nicknameColor' ? nicknameColors :
                              activeTab === 'titles' ? titles : []).map((item: any) => {
                              
                              // Dynamic State computation
                              const isCurrentlyEquipped = 
                                activeTab === 'borders' ? selectedBorder === item.id :
                                activeTab === 'effects' ? selectedEffect === item.id :
                                activeTab === 'background' ? selectedBg === item.url :
                                activeTab === 'nicknameColor' ? selectedColor === item.id :
                                activeTab === 'titles' ? selectedTitle === item.title : false;

                              const isOwned = 
                                item.price === 0 ||
                                (activeTab === 'borders' && (myMember?.unlockedBorders || []).includes(item.id)) ||
                                (activeTab === 'effects' && (myMember?.unlockedEffects || []).includes(item.id)) ||
                                (activeTab === 'background' && (myMember?.unlockedBanners || []).includes(item.id)) ||
                                (activeTab === 'nicknameColor' && (myMember?.unlockedColors || []).includes(item.id)) ||
                                (activeTab === 'titles' && (myMember?.unlockedTitles || []).includes(item.title));

                              const isLOCKED = activeTab === 'titles' && (myMember?.level || 1) < item.levelRequired;

                              const handleItemSelect = () => {
                                if (isLOCKED) return;
                                if (activeTab === 'borders') setSelectedBorder(item.id);
                                else if (activeTab === 'effects') setSelectedEffect(item.id);
                                else if (activeTab === 'background') { setSelectedBg(item.url); setTempBannerUrl(item.url); }
                                else if (activeTab === 'nicknameColor') setSelectedColor(item.id);
                                else if (activeTab === 'titles') setSelectedTitle(item.title);
                              };

                              const handleItemAction = async () => {
                                if (isLOCKED) return;
                                if (activeTab === 'borders') await handleBuyBorder(item);
                                else if (activeTab === 'effects') await handleBuyEffect(item);
                                else if (activeTab === 'background') await handleBuyBackground(item);
                                else if (activeTab === 'nicknameColor') await handleBuyColor(item);
                                else if (activeTab === 'titles') await handleBuyTitle(item);
                              };

                              return (
                                <div 
                                  key={item.id}
                                  onClick={handleItemSelect}
                                  className={`p-3.5 rounded-xl border transition-all text-left flex items-center justify-between cursor-pointer group ${
                                    isLOCKED 
                                      ? 'opacity-55 cursor-not-allowed bg-black/20 border-red-950/20'
                                      : isCurrentlyEquipped 
                                        ? 'bg-gaming-gold/10 border-gaming-gold shadow-[0_0_12px_rgba(197,160,89,0.15)]' 
                                        : 'bg-black/35 border-white/5 hover:border-white/15'
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    {/* Left visual indicator */}
                                    {activeTab === 'borders' && (
                                      <div className={`w-10 h-10 rounded-full bg-zinc-805 p-0.5 relative flex items-center justify-center border-2 ${item.color || ''} ${item.animated ? 'animate-pulse' : ''}`}>
                                        <div className="w-full h-full rounded-full bg-zinc-900" />
                                      </div>
                                    )}
                                    {activeTab === 'background' && (
                                      <img src={item.url} alt={item.title} className="w-11 h-9 rounded object-cover border border-white/5 shrink-0" />
                                    )}
                                    {activeTab === 'effects' && (
                                      <div className="w-9 h-9 rounded-lg bg-orange-950/20 border border-white/5 flex items-center justify-center text-orange-400 shrink-0">
                                        <Sparkles size={13} />
                                      </div>
                                    )}
                                    {activeTab === 'nicknameColor' && (
                                      <div className="w-8 h-8 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-xs shrink-0">
                                        🎨
                                      </div>
                                    )}
                                    {activeTab === 'titles' && (
                                      <div className="w-8 h-8 rounded-full bg-yellow-950/20 border border-yellow-500/20 flex items-center justify-center text-gaming-gold shrink-0">
                                        <Crown size={12} />
                                      </div>
                                    )}

                                    <div className="flex flex-col text-left">
                                      <span className={`text-[11.5px] font-black uppercase tracking-wide ${activeTab === 'nicknameColor' ? item.textClass : 'text-white'}`}>
                                        {item.title}
                                      </span>
                                      <span className="text-[8.5px] text-zinc-400 font-semibold leading-relaxed uppercase whitespace-normal max-w-[150px]">
                                        {isLOCKED ? `Requer Nv. Militar ${item.levelRequired}` : item.desc}
                                      </span>
                                    </div>
                                  </div>

                                  <button
                                    type="button"
                                    disabled={isLOCKED}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleItemAction();
                                    }}
                                    className={`px-2.5 py-1.5 rounded-lg font-black text-[9px] tracking-wider uppercase transition-all shrink-0 ${
                                      isLOCKED
                                        ? 'bg-red-950/10 text-red-400 border border-red-500/10'
                                        : isCurrentlyEquipped
                                          ? 'bg-zinc-700 text-zinc-100'
                                          : isOwned
                                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                                            : 'bg-[#5865f2] hover:bg-[#4752c4] text-white shadow-md hover:scale-105'
                                    }`}
                                  >
                                    {isLOCKED ? 'Bloqueado' : isCurrentlyEquipped ? 'Equipado' : isOwned ? 'Equipar' : `${item.price} 💎`}
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* Feedback Status Alert */}
                  {purchaseStatus && (
                    <div className={`p-4 rounded-xl border text-center font-bold text-xs uppercase tracking-wider ${
                      purchaseStatus.type === 'success' 
                        ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-400' 
                        : 'bg-red-950/30 border-red-500/30 text-red-400'
                    }`}>
                      {purchaseStatus.message}
                    </div>
                  )}

                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PICTURE SELECTION MODAL */}
      <AnimatePresence>
        {avatarModalOpen && (
          <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
            onClick={() => setAvatarModalOpen(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#2f3136] border border-white/5 p-6 rounded-3xl max-w-sm w-full flex flex-col gap-5 shadow-2xl text-left"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col gap-1 text-center">
                <h3 className="text-sm font-display font-black uppercase text-gaming-gold tracking-wider">Alterar Foto de Perfil</h3>
                <p className="text-[9px] text-[#949ba4] uppercase font-black tracking-widest">Escolha o formato adequado ao Suprema</p>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    setUploadAcceptType('image/png, image/jpeg, image/jpg, image/webp');
                    setAvatarModalOpen(false);
                    setTimeout(() => fileInputRef.current?.click(), 150);
                  }}
                  className="p-4 bg-[#1e1f22]/60 hover:bg-[#1e1f22] hover:border-gaming-gold border border-white/5 rounded-2xl flex items-center gap-4 transition-all text-left group"
                >
                  <div className="w-10 h-10 rounded-xl bg-gaming-gold/10 flex items-center justify-center text-gaming-gold shrink-0">
                    <Camera size={18} />
                  </div>
                  <div className="flex flex-col gap-0.5 text-left">
                    <span className="text-xs font-black uppercase tracking-wider text-white">Foto Estática</span>
                    <span className="text-[9px] text-[#949ba4] uppercase font-black tracking-wide">PNG, JPG, WEBP, JPEG estático</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setUploadAcceptType('image/gif');
                    setAvatarModalOpen(false);
                    setTimeout(() => fileInputRef.current?.click(), 150);
                  }}
                  className="p-4 bg-[#1e1f22]/60 hover:bg-[#1e1f22] hover:border-gaming-gold border border-white/5 rounded-2xl flex items-center gap-4 transition-all text-left group"
                >
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 font-display font-black flex items-center justify-center text-xs shrink-0">
                    GIF
                  </div>
                  <div className="flex flex-col gap-0.5 text-left">
                    <span className="text-xs font-black uppercase tracking-wider text-white">GIF Animado</span>
                    <span className="text-[9px] text-[#949ba4] uppercase font-black tracking-wide">Para avatares e fotos dinâmicas</span>
                  </div>
                </button>
              </div>

              <button
                onClick={() => setAvatarModalOpen(false)}
                className="w-full py-2.5 bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/10 text-[#dbdee1] uppercase font-black text-[9px] tracking-widest rounded-xl transition-all"
              >
                Fechar
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
