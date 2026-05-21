import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  Coins
} from 'lucide-react';
import { useClan } from '../context/ClanContext';
import { SafeAvatar } from './SafeAvatar';
import { storage } from '../lib/firebase';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

export function PerfilView() {
  const { myMember, user, updateMemberData, completeMission, isEcoMode } = useClan();
  
  // Controls if we are viewing the clean card (false) or the edit studio (true)
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'nick' | 'bio' | 'avatar' | 'effects' | 'nameplate' | 'achievements'>('nick');
  
  const [tempStatus, setTempStatus] = useState(myMember?.customStatus || '');
  const [tempName, setTempName] = useState(myMember?.name || '');
  const [tempBio, setTempBio] = useState(myMember?.customBio || 'Membro leal do Clã Alcatéia Suprema. Preparado para batalhas de arena, missões estratégicas e honra de elite militar.');
  const [tempPower, setTempPower] = useState(myMember?.heroPower || 0);

  useEffect(() => {
    if (myMember?.customStatus !== undefined) setTempStatus(myMember.customStatus);
    if (myMember?.name !== undefined) setTempName(myMember.name);
    if (myMember?.customBio !== undefined) setTempBio(myMember.customBio);
    if (myMember?.heroPower !== undefined) setTempPower(myMember.heroPower);
  }, [myMember]);

  const [purchaseStatus, setPurchaseStatus] = useState<{ id: string, message: string, type: 'success' | 'error' } | null>(null);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [uploadAcceptType, setUploadAcceptType] = useState('image/*');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerFileInputRef = useRef<HTMLInputElement>(null);

  const borders = [
    { id: 'border_cyan', title: 'Cibernética Blue', desc: 'Aura neon azul do submundo.', price: 50, color: 'border-cyan-400' },
    { id: 'border_purple', title: 'Aura Púrpura', desc: 'Proteção mística violeta.', price: 80, color: 'border-purple-500' },
    { id: 'border_gold', title: 'Fogo Dourado', desc: 'A aura lendária animada.', price: 150, color: 'border-gaming-gold', animated: true },
    { id: 'border_dark', title: 'Vazio Sombrio', desc: 'Glow vermelho do abismo.', price: 100, color: 'border-red-600' },
    { id: 'border_emerald', title: 'Jade Imperial', desc: 'Pulso de jade mística.', price: 120, color: 'border-emerald-400', animated: true },
    { id: 'border_rgb', title: 'Chroma RGB', desc: 'Arco-íris dinâmico supremo.', price: 200, color: 'border-pink-500', animated: true }
  ];

  const premiumBorders = [
    { id: 'border_laser', title: 'Laser Arco-íris', desc: 'Pulso de laser dinâmico.', colorClass: 'border-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.7)] animate-pulse' },
    { id: 'border_cyber', title: 'Glow Cyberpunk', desc: 'Feixe de néon ciano e magenta.', colorClass: 'border-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.7)] animate-pulse' },
    { id: 'border_cosmic', title: 'Vórtice Cósmico', desc: 'Círculo celestial violeta profundo.', colorClass: 'border-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.7)] animate-pulse' },
    { id: 'border_fire', title: 'Magma Sombrio', desc: 'Chamas ardentes sobre fundo rubi.', colorClass: 'border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.7)] animate-pulse' },
  ];

  const titles = [
    { id: 'title_reaper', title: 'Ceifador de Almas', desc: 'Carrasco gélido do inferno.', price: 70, levelRequired: 1 },
    { id: 'title_legend', title: 'Lenda Viva', desc: 'Seu nome cantado pelo tempo.', price: 150, levelRequired: 2 },
    { id: 'title_protector', title: 'Guardião do Clã', desc: 'Escudo indestrutível da ordem.', price: 50, levelRequired: 1 },
    { id: 'title_immortal', title: 'Eterno Imortal', desc: 'Aquele que transcendeu o fim.', price: 200, levelRequired: 3 },
    { id: 'title_supreme', title: 'Mestre Supremo', desc: 'Controle imensurável de energia.', price: 120, levelRequired: 2 },
    { id: 'title_shadow', title: 'Sombra Silenciosa', desc: 'Invisível, sorrateira, fatal.', price: 60, levelRequired: 1 },
    { id: 'title_cyberspy', title: 'Infiltrado Cyber', desc: 'Mestre da informação e do hack.', price: 80, levelRequired: 1 }
  ];

  const backgrounds = [
    { id: 'padrão', title: 'Alcatéia Alfa', desc: 'Fundo clássico rúnico de lobos.', price: 0, url: 'https://cdnb.artstation.com/p/assets/images/images/017/680/475/small/andrej-otepka-square-04-tmp04web.jpg?1556922748' },
    { id: 'cibernética', title: 'Hacker Cyber', desc: 'Terminal em neon azul.', price: 40, url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070' },
    { id: 'guerra', title: 'Campo de Batalha', desc: 'Solo devastado de guerra.', price: 60, url: 'https://images.unsplash.com/photo-1599394022918-6c276a570aba?q=80&w=2070' },
    { id: 'moderna', title: 'Neon Moderna', desc: 'Fluido moderno e futurista.', price: 50, url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=2070' },
    { id: 'cosmos', title: 'Nebula Profunda', desc: 'Cosmos absoluto galáctico.', price: 100, url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=2070' },
    { id: 'vulcao', title: 'Magma Vulcânico', desc: 'Lava ardente de destruição.', price: 120, url: 'https://images.unsplash.com/photo-1610296669228-602fa827fc1f?q=80&w=2070' }
  ];

  const premiumBanners = [
    { id: 'none', title: 'Classic', desc: 'Apenas plano do clã original.' },
    { id: 'effect_fire', title: 'Chamas de Sangue', desc: 'Chamas vulcânicas sobre fundo rubi.' },
    { id: 'effect_neon', title: 'Néon Cyberpunk', desc: 'Cascatas verticais luminosas.' },
    { id: 'effect_matrix', title: 'Catarata Digital', desc: 'Hacker binário flutuante.' },
    { id: 'effect_cosmic', title: 'Nebulosa Galáctica', desc: 'Vórtice cósmico celestial.' }
  ];

  const nicknameColors = [
    { id: 'color_white', title: 'Branco Padrão', desc: 'Nome clássico de guerreiro.', price: 0, textClass: 'text-white' },
    { id: 'color_gold', title: 'Ouro Nobre', desc: 'Champagne clássico da realeza.', price: 60, textClass: 'text-[#c5a059] font-bold drop-shadow-[0_0_6px_rgba(197,160,89,0.4)]' },
    { id: 'color_red', title: 'Fúria do Alfa', desc: 'Tom carmesim escuro e imponente.', price: 40, textClass: 'text-[#b25d62] font-semibold drop-shadow-[0_0_6px_rgba(178,93,98,0.3)]' },
    { id: 'color_cyan', title: 'Prata da Geada', desc: 'Misty azul-gélido das montanhas.', price: 40, textClass: 'text-[#93c5fd] font-semibold drop-shadow-[0_0_6px_rgba(147,197,253,0.3)]' },
    { id: 'color_pink', title: 'Rosé de Inverno', desc: 'Toque místico de orquídea e névoa.', price: 50, textClass: 'text-[#c084fc] font-semibold drop-shadow-[0_0_6px_rgba(192,132,252,0.3)]' },
    { id: 'color_emerald', title: 'Sálvia do Bosque', desc: 'Verde sutil das florestas antigas.', price: 55, textClass: 'text-[#a7f3d0] font-semibold drop-shadow-[0_0_6px_rgba(167,243,208,0.3)]' },
    { id: 'color_purple', title: 'Névoa Cósmica', desc: 'Aura suave de lavanda do crepúsculo.', price: 45, textClass: 'text-[#c0a9df] font-semibold drop-shadow-[0_0_6px_rgba(192,169,223,0.3)]' },
    { id: 'color_rgb', title: 'Espírito Lunar', desc: 'Degradê suave do luar com prata e safira.', price: 120, textClass: 'text-transparent bg-clip-text bg-gradient-to-r from-[#e2e8f0] via-[#c5a059] to-[#93c5fd] font-extrabold drop-shadow-[0_0_4px_rgba(226,232,240,0.3)]' }
  ];

  const handleBuyBorder = (border: any) => {
    if ((myMember?.coins || 0) < border.price) {
      setPurchaseStatus({ id: border.id, message: "Moedas insuficientes!", type: 'error' });
      setTimeout(() => setPurchaseStatus(null), 2000);
      return;
    }
    updateMemberData({
      coins: (myMember?.coins || 0) - border.price,
      profileBorder: border.id
    });
    setPurchaseStatus({ id: border.id, message: "Equipado com Sucesso!", type: 'success' });
    setTimeout(() => setPurchaseStatus(null), 2000);
  };

  const handleBuyTitle = (selectedTitleItem: any) => {
    const userRoleLevel = myMember?.level || 0;
    if (userRoleLevel < selectedTitleItem.levelRequired) {
      setPurchaseStatus({ id: selectedTitleItem.id, message: `Requer Nv. ${selectedTitleItem.levelRequired}!`, type: 'error' });
      setTimeout(() => setPurchaseStatus(null), 2500);
      return;
    }
    const alreadyUnlocked = myMember?.unlockedTitles || [];
    const isAlreadyUnlocked = alreadyUnlocked.includes(selectedTitleItem.title);
    const cost = isAlreadyUnlocked ? 0 : selectedTitleItem.price;

    if (!isAlreadyUnlocked && (myMember?.coins || 0) < cost) {
      setPurchaseStatus({ id: selectedTitleItem.id, message: "Moedas insuficientes!", type: 'error' });
      setTimeout(() => setPurchaseStatus(null), 2000);
      return;
    }

    const updatedUnlocked = isAlreadyUnlocked 
      ? alreadyUnlocked 
      : [...alreadyUnlocked, selectedTitleItem.title];

    updateMemberData({
      coins: (myMember?.coins || 0) - cost,
      title: selectedTitleItem.title,
      unlockedTitles: updatedUnlocked
    });
    setPurchaseStatus({ id: selectedTitleItem.id, message: isAlreadyUnlocked ? "Equipado!" : "Comprado & Equipado!", type: 'success' });
    setTimeout(() => setPurchaseStatus(null), 2000);
  };

  const handleBuyBackground = (bgItem: any) => {
    const currentBg = myMember?.profileBg || 'https://cdnb.artstation.com/p/assets/images/images/017/680/475/small/andrej-otepka-square-04-tmp04web.jpg?1556922748';
    const isAlreadyUnlocked = currentBg === bgItem.url || bgItem.price === 0;
    const cost = isAlreadyUnlocked ? 0 : bgItem.price;

    if (!isAlreadyUnlocked && (myMember?.coins || 0) < cost) {
      setPurchaseStatus({ id: bgItem.id, message: "Moedas insuficientes!", type: 'error' });
      setTimeout(() => setPurchaseStatus(null), 2000);
      return;
    }

    updateMemberData({
      coins: (myMember?.coins || 0) - cost,
      profileBg: bgItem.url
    });
    setPurchaseStatus({ id: bgItem.id, message: "Fundo Aplicado!", type: 'success' });
    setTimeout(() => setPurchaseStatus(null), 2000);
  };

  const handleBuyColor = (colorItem: any) => {
    const alreadyUnlocked = myMember?.unlockedColors || [];
    const isAlreadyUnlocked = alreadyUnlocked.includes(colorItem.id) || colorItem.price === 0;
    const cost = isAlreadyUnlocked ? 0 : colorItem.price;

    if (!isAlreadyUnlocked && (myMember?.coins || 0) < cost) {
      setPurchaseStatus({ id: colorItem.id, message: "Moedas insuficientes!", type: 'error' });
      setTimeout(() => setPurchaseStatus(null), 2000);
      return;
    }

    const updatedUnlocked = isAlreadyUnlocked
      ? alreadyUnlocked
      : [...alreadyUnlocked, colorItem.id];

    updateMemberData({
      coins: (myMember?.coins || 0) - cost,
      nicknameColor: colorItem.id,
      unlockedColors: updatedUnlocked
    });
    setPurchaseStatus({ id: colorItem.id, message: isAlreadyUnlocked ? "Equipado!" : "Comprado & Equipado!", type: 'success' });
    setTimeout(() => setPurchaseStatus(null), 2000);
  };

  const getBorderClasses = (borderId?: string) => {
    if (isEcoMode) {
      switch (borderId) {
        case 'border_cyan': return 'border-2 border-cyan-400';
        case 'border_purple': return 'border-2 border-purple-500';
        case 'border_gold': return 'border-2 border-gaming-gold';
        case 'border_dark': return 'border-2 border-red-600';
        case 'border_emerald': return 'border-2 border-emerald-400';
        case 'border_rgb': return 'border-2 border-pink-500';
        case 'border_laser': return 'border-2 border-purple-500';
        case 'border_cyber': return 'border-2 border-cyan-400';
        case 'border_cosmic': return 'border-2 border-indigo-400';
        case 'border_fire': return 'border-2 border-red-500';
        default: return 'border-2 border-white/10';
      }
    }
    switch (borderId) {
      case 'border_cyan': return 'border-2 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)]';
      case 'border_purple': return 'border-2 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]';
      case 'border_gold': return 'border-2 border-gaming-gold shadow-[0_0_20px_rgba(251,191,36,0.6)] animate-pulse';
      case 'border_dark': return 'border-2 border-red-600 shadow-[0_0_20px_rgba(220,38,38,0.7)]';
      case 'border_emerald': return 'border-2 border-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.6)] animate-pulse';
      case 'border_rgb': return 'border-2 border-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.7)] animate-bounce';
      case 'border_laser': return 'border-2 border-transparent bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 shadow-[0_0_20px_rgba(239,68,68,0.7)] animate-pulse';
      case 'border_cyber': return 'border-2 border-cyan-400 ring-2 ring-pink-500/40 shadow-[0_0_20px_rgba(6,182,212,0.7)] animate-pulse';
      case 'border_cosmic': return 'border-2 border-indigo-500 shadow-[0_0_20px_rgba(168,85,247,0.8)] animate-pulse ring-4 ring-purple-600/20';
      case 'border_fire': return 'border-2 border-red-500 shadow-[0_0_25px_rgba(239,68,68,0.8)] animate-pulse';
      default: return 'border-2 border-gaming-gold/30';
    }
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

  const compressImage = (base64: string, maxWidth = 300, maxHeight = 300): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64;
      img.onload = () => {
        const canvas = document.createElement('canvas');
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
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.6)); 
      };
    });
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("O arquivo é muito grande (Máximo de 10MB).");
      return;
    }

    try {
      let fileToUpload: Blob | File = file;
      let mimeType = file.type || 'image/jpeg';

      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target?.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      let compressedDataUrl = dataUrl;
      const isGif = file.type === 'image/gif';

      if (!isGif) {
        compressedDataUrl = await compressImage(dataUrl, 180, 180);
        
        const arr = compressedDataUrl.split(',');
        const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        fileToUpload = new Blob([u8arr], { type: mime });
        mimeType = mime;
      } else {
        if (file.size > 800 * 1024) {
          alert("GIFs de perfil devem ter menos de 800KB para garantir boa performance.");
          return;
        }
      }

      try {
        const fileRef = storageRef(storage, `avatars/${user?.uid || 'unknown'}/${Date.now()}_${file.name}`);
        const metadata = { contentType: mimeType };
        const snapshot = await uploadBytes(fileRef, fileToUpload, metadata);
        const downloadUrl = await getDownloadURL(snapshot.ref);

        await updateMemberData({ avatarUrl: downloadUrl });
      } catch (storageErr) {
        console.warn('Firebase Storage blocked or unconfigured. Falling back to high-performance direct document save.', storageErr);
        await updateMemberData({ avatarUrl: compressedDataUrl });
      }

      setAvatarModalOpen(false);
      setPurchaseStatus({ id: 'avatar_upload_success', message: 'A foto de perfil foi atualizada com sucesso!', type: 'success' });
      setTimeout(() => setPurchaseStatus(null), 2500);
    } catch (err: any) {
      console.error('Failed to upload/update avatar:', err);
      alert(`Erro de upload: ${err?.message || String(err)}`);
    }
  };

  const handleBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("O arquivo de banner é muito grande (Máximo de 15MB).");
      return;
    }

    try {
      let fileToUpload: Blob | File = file;
      let mimeType = file.type || 'image/jpeg';

      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target?.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      let compressedDataUrl = dataUrl;
      const isGif = file.type === 'image/gif';

      if (!isGif) {
        compressedDataUrl = await compressImage(dataUrl, 500, 250);
        
        const arr = compressedDataUrl.split(',');
        const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        fileToUpload = new Blob([u8arr], { type: mime });
        mimeType = mime;
      } else {
        if (file.size > 1.2 * 1024 * 1024) {
          alert("Banners de GIF animado estão limitados a 1.2MB para preservar performance.");
          return;
        }
      }

      try {
        const fileRef = storageRef(storage, `banners/${user?.uid || 'unknown'}/${Date.now()}_${file.name}`);
        const metadata = { contentType: mimeType };
        const snapshot = await uploadBytes(fileRef, fileToUpload, metadata);
        const downloadUrl = await getDownloadURL(snapshot.ref);

        await updateMemberData({ profileBg: downloadUrl });
      } catch (storageErr) {
        console.warn('Firebase Storage blocked or unconfigured for banners. Falling back to direct document save.', storageErr);
        await updateMemberData({ profileBg: compressedDataUrl });
      }

      setPurchaseStatus({ id: 'banner_upload_success', message: 'Banner atualizado com sucesso!', type: 'success' });
      setTimeout(() => setPurchaseStatus(null), 2500);
    } catch (err: any) {
      console.error('Failed to upload/update banner:', err);
      alert(`Erro de upload do banner: ${err?.message || String(err)}`);
    }
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    updateMemberData({
      name: tempName,
      customBio: tempBio,
      heroPower: Number(tempPower)
    });
    completeMission('edit_hero_power', 50);
    setPurchaseStatus({ id: 'account_save', message: 'Estatísticas Atualizadas!', type: 'success' });
    setTimeout(() => setPurchaseStatus(null), 2000);
  };

  const handleSaveStatus = (evt: React.FormEvent) => {
    evt.preventDefault();
    updateMemberData({ customStatus: tempStatus });
    setPurchaseStatus({ id: 'status_save', message: 'Status Atualizado!', type: 'success' });
    setTimeout(() => setPurchaseStatus(null), 2000);
  };

  const handleSaveNickAndPower = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempName.trim()) return;
    updateMemberData({
      name: tempName.trim(),
      heroPower: Number(tempPower)
    });
    setPurchaseStatus({ id: 'nick_only_save', message: 'Estatísticas e Poder militar atualizados com sucesso!', type: 'success' });
    setTimeout(() => setPurchaseStatus(null), 2000);
  };

  const handleSaveBioOnly = (e: React.FormEvent) => {
    e.preventDefault();
    updateMemberData({
      customBio: tempBio
    });
    setPurchaseStatus({ id: 'bio_only_save', message: 'Biografia salva com sucesso!', type: 'success' });
    setTimeout(() => setPurchaseStatus(null), 2000);
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
    { id: 'nick', group: 'DADOS', label: '1. Nick & Força', icon: User },
    { id: 'bio', group: 'DADOS', label: '2. Mudar a Bio', icon: MessageSquare },
    { id: 'avatar', group: 'CUSTOMIZAÇÃO', label: '3. Foto de Perfil', icon: Camera },
    { id: 'effects', group: 'CUSTOMIZAÇÃO', label: '4. Banner de Perfil', icon: Sparkles },
    { id: 'nameplate', group: 'CUSTOMIZAÇÃO', label: '5. Placa de Identificação', icon: Palette },
    { id: 'achievements', group: 'PRESTÍGIO', label: '6. Escolher Conquistas', icon: Trophy }
  ];

  // Helper component to render the beautiful real Discord Card itself
  const renderDiscordCard = (customIdPrefix: string) => {
    return (
      <div 
        id={`${customIdPrefix}-discord-card-container`} 
        className="w-full max-w-[350px] bg-[#18191c] border border-black/50 rounded-2xl overflow-hidden shadow-2xl relative w-full font-sans flex flex-col text-left border border-white/5"
      >
        {/* CARD BANNER CHAMELEON */}
        <div className="h-28 relative overflow-hidden bg-zinc-800 shrink-0 select-none">
          <img
            src={myMember?.profileBg || "https://cdnb.artstation.com/p/assets/images/images/017/680/475/small/andrej-otepka-square-04-tmp04web.jpg?1556922748"}
            alt="Banner Base"
            className="w-full h-full object-cover opacity-75"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#18191c] to-black/30" />

          {/* Dynamic banner animations simulated in preview */}
          {myMember?.bannerEffect === 'effect_fire' && (
            <div className="absolute inset-0 bg-gradient-to-tr from-red-950/30 via-orange-900/10 to-red-600/25 mix-blend-color-dodge animate-pulse">
              <div className="absolute -inset-10 bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.25)_0,transparent_60%)] blur-2xl animate-bounce" style={{ animationDuration: '6s' }} />
            </div>
          )}
          {myMember?.bannerEffect === 'effect_neon' && (
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/20 via-purple-900/15 to-cyan-950/20">
              <div className="absolute top-0 bottom-0 left-1/3 w-0.5 bg-gradient-to-b from-cyan-400 to-transparent opacity-40 animate-pulse" />
              <div className="absolute top-0 bottom-0 left-2/3 w-0.5 bg-gradient-to-b from-purple-400 to-transparent opacity-60 animate-pulse" style={{ animationDuration: '2s' }} />
            </div>
          )}
          {myMember?.bannerEffect === 'effect_matrix' && (
            <div className="absolute inset-0 overflow-hidden font-mono text-[5px] text-green-500/25 select-none whitespace-nowrap">
              <div className="absolute top-2 left-2 animate-pulse">10101011101</div>
              <div className="absolute top-8 left-16 animate-pulse" style={{ animationDelay: '300ms' }}>01011010010</div>
              <div className="absolute top-14 left-4 animate-pulse" style={{ animationDelay: '150ms' }}>11001101011</div>
            </div>
          )}
          {myMember?.bannerEffect === 'effect_cosmic' && (
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -inset-12 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.25)_0,transparent_55%)] blur-2xl animate-pulse" style={{ animationDuration: '8s' }} />
            </div>
          )}
        </div>

        {/* OVERLAPPING AVATAR SPHERE WITH ONLINE STATUS */}
        <div className="px-5 pb-5 pt-1.5 flex flex-col relative select-none">
          
          <div className="absolute -top-12 left-5">
            <div className={`w-20 h-20 rounded-full bg-[#18191c] p-1 relative flex items-center justify-center transition-all ${getBorderClasses(myMember?.profileBorder)}`}>
              <SafeAvatar
                src={myMember?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid}`}
                alt="Profile Avatar"
                className="w-full h-full rounded-full object-cover relative z-10"
                isEcoMode={isEcoMode}
              />
              {/* Online Indicator */}
              <div className="absolute bottom-0 right-0 w-5 h-5 bg-[#18191c] rounded-full flex items-center justify-center p-0.5 z-20 shadow-lg">
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
              <span className={`text-base font-black tracking-tight uppercase truncate leading-tight ${getNicknameColorClass(myMember?.nicknameColor)}`}>
                {myMember?.name || 'Recruta'}
              </span>
              <span className="text-[8px] font-mono font-bold text-[#949ba4] uppercase tracking-wider mt-0.5 block">
                {user?.email}
              </span>
            </div>

            {/* Custom status bubble */}
            <div className="h-[1px] bg-white/[0.04] w-full shrink-0" />

            <div className="flex flex-col gap-1 text-left">
              <span className="text-[7px] uppercase font-black text-[#949ba4] tracking-widest font-sans">STATUS SUPREMA</span>
              {myMember?.customStatus ? (
                <div className="text-[9px] text-[#dbdee1] font-bold italic flex items-center gap-1.5 bg-[#1e1f22] p-2 rounded-lg border border-white/5 w-fit">
                  <span>{myMember.customStatus}</span>
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
                {myMember?.customBio || 'Guerreiro nobre do clã Alcatéia Suprema.'}
              </p>
            </div>

            {/* Badges / Conquistas */}
            <div className="h-[1px] bg-white/[0.04] w-full shrink-0" />

            <div className="flex flex-col gap-1.5 text-left">
              <span className="text-[7.5px] uppercase font-black text-[#949ba4] tracking-widest font-sans">CONQUISTAS SUPREMA</span>
              <div className="flex gap-1.5 flex-wrap">
                {myMember?.title && myMember?.showTitle !== false && (
                  <span className="px-2 py-0.5 bg-gaming-gold/10 text-gaming-gold border border-gaming-gold/25 rounded text-[7px] font-black uppercase tracking-widest">
                    🏅 {myMember.title}
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
                    Poder: {myMember?.heroPower?.toLocaleString() || 0} HP
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

              {/* Dynamic banner animations simulated in preview */}
              {myMember?.bannerEffect === 'effect_fire' && (
                <div className="absolute inset-0 bg-gradient-to-tr from-red-950/40 via-orange-900/15 to-red-600/35 mix-blend-color-dodge animate-pulse" />
              )}
              {myMember?.bannerEffect === 'effect_neon' && (
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/30 via-purple-900/20 to-cyan-950/30 animate-pulse" />
              )}
              {myMember?.bannerEffect === 'effect_matrix' && (
                <div className="absolute inset-0 overflow-hidden font-mono text-[6px] text-green-500/30 select-none whitespace-nowrap">
                  <div className="absolute top-4 left-4 animate-pulse">10101011101</div>
                  <div className="absolute top-12 left-24 animate-pulse">01011010010</div>
                  <div className="absolute top-20 left-10 animate-pulse">11001101011</div>
                </div>
              )}
              {myMember?.bannerEffect === 'effect_cosmic' && (
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute -inset-12 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.35)_0,transparent_60%)] blur-2xl animate-pulse" style={{ animationDuration: '8s' }} />
                </div>
              )}
            </div>

            {/* Avatar & Portrait Overlay Area */}
            <div className="relative z-10 px-4 md:px-10 flex flex-col md:flex-row md:items-end justify-between -mt-12 sm:-mt-16 md:-mt-24 mb-6">
              <div className="flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-6">
                {/* Avatar sphere */}
                <div className={`w-24 h-24 sm:w-32 sm:h-32 md:w-38 md:h-38 rounded-full bg-[#18191c] p-1.5 relative flex items-center justify-center transition-all shadow-2xl ${getBorderClasses(myMember?.profileBorder)}`}>
                  <SafeAvatar
                    src={myMember?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid}`}
                    alt="Profile Avatar"
                    className="w-full h-full rounded-full object-cover relative z-10"
                    isEcoMode={isEcoMode}
                  />
                  {/* Online status indicator */}
                  <div className="absolute bottom-1 right-1 w-6 h-6 bg-[#18191c] rounded-full flex items-center justify-center p-0.5 z-20 shadow-lg">
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
              <div className="lg:col-span-7 bg-black/25 border border-white/5 p-6 rounded-2xl flex flex-col gap-3 text-left">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] uppercase font-black text-[#949ba4] tracking-widest">Sobre Mim</span>
                  <div className="h-[1px] bg-white/5 flex-1" />
                </div>
                <p className="text-sm md:text-base text-zinc-300 leading-relaxed font-semibold font-sans italic">
                  "{myMember?.customBio || 'Guerreiro nobre do clã Alcatéia Suprema.'}"
                </p>
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
            className="flex flex-col w-full min-h-[calc(100vh-90px)] text-[#dbdee1] font-sans relative overflow-y-auto px-4 md:px-8 pb-12 max-w-4xl mx-auto gap-6"
          >
            {/* Panoramic Banner Area */}
            <div className="w-full h-48 sm:h-64 md:h-80 rounded-2xl md:rounded-3xl overflow-hidden relative border border-white/5 shadow-2xl shrink-0 select-none">
              <img
                src={myMember?.profileBg || "https://cdnb.artstation.com/p/assets/images/images/017/680/475/small/andrej-otepka-square-04-tmp04web.jpg?1556922748"}
                alt="Banner Base"
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/25" />

              {/* Dynamic banner animations simulated in preview */}
              {myMember?.bannerEffect === 'effect_fire' && (
                <div className="absolute inset-0 bg-gradient-to-tr from-red-950/40 via-orange-900/15 to-red-600/35 mix-blend-color-dodge animate-pulse" />
              )}
              {myMember?.bannerEffect === 'effect_neon' && (
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/30 via-purple-900/20 to-cyan-950/30 animate-pulse" />
              )}
              {myMember?.bannerEffect === 'effect_matrix' && (
                <div className="absolute inset-0 overflow-hidden font-mono text-[6px] text-green-500/30 select-none whitespace-nowrap">
                  <div className="absolute top-4 left-4 animate-pulse">10101011101</div>
                  <div className="absolute top-12 left-24 animate-pulse">01011010010</div>
                  <div className="absolute top-20 left-10 animate-pulse">11001101011</div>
                </div>
              )}
              {myMember?.bannerEffect === 'effect_cosmic' && (
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute -inset-12 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.35)_0,transparent_60%)] blur-2xl animate-pulse" style={{ animationDuration: '8s' }} />
                </div>
              )}

              {/* Back button integrated inside high-end header */}
              <div className="absolute top-4 right-4 flex items-center gap-2.5 z-30">
                <span className="px-2 py-0.5 bg-gaming-gold/20 text-gaming-gold border border-gaming-gold/30 rounded text-[7.5px] font-black uppercase tracking-widest">
                  Modo Edição
                </span>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 bg-black/50 hover:bg-black/70 border border-white/10 text-white rounded-lg text-[9px] font-black uppercase tracking-wider transition-all hover:scale-105 active:scale-95 shadow-md flex items-center gap-1"
                >
                  <Check size={11} /> Confirmar & Sair
                </button>
              </div>
            </div>

            {/* Avatar & Portrait Overlay Area */}
            <div className="relative z-10 px-4 md:px-10 flex flex-col md:flex-row md:items-end justify-between -mt-12 sm:-mt-16 md:-mt-24 mb-6">
              <div className="flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-6 w-full">
                {/* Avatar sphere */}
                <div className={`w-24 h-24 sm:w-32 sm:h-32 md:w-38 md:h-38 rounded-full bg-[#18191c] p-1.5 relative flex items-center justify-center transition-all shadow-2xl ${getBorderClasses(myMember?.profileBorder)}`}>
                  <SafeAvatar
                    src={myMember?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid}`}
                    alt="Profile Avatar"
                    className="w-full h-full rounded-full object-cover relative z-10"
                    isEcoMode={isEcoMode}
                  />
                  {/* Online status indicator */}
                  <div className="absolute bottom-1 right-1 w-6 h-6 bg-[#18191c] rounded-full flex items-center justify-center p-0.5 z-20 shadow-lg">
                    <div className="w-full h-full bg-[#23a55a] rounded-full animate-pulse shadow-[0_0_8px_rgba(35,165,90,0.6)]" />
                  </div>
                </div>

                {/* Nickname and active setting instructions */}
                <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left gap-1 md:pb-2">
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
                  <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest leading-none mt-1">
                    Painel de Personalização do Guerreiro
                  </span>
                </div>
              </div>
            </div>

            {/* Flat, Minimalist Navigation Buttons / Row of menus right below */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 w-full select-none">
              {sidebarItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as any);
                      setPurchaseStatus(null);
                    }}
                    className={`flex flex-col items-center justify-center gap-1.5 px-3 py-3 rounded-xl border text-[9px] font-black tracking-widest uppercase transition-all text-center h-16 ${
                      isActive 
                        ? 'bg-gaming-gold text-black border-gaming-gold shadow-[0_0_15px_rgba(197,160,89,0.15)] scale-[1.02]' 
                        : 'bg-black/30 border-white/5 text-zinc-400 hover:text-white hover:bg-black/40 hover:border-white/10'
                    }`}
                  >
                    <Icon size={13} className={isActive ? 'text-black' : 'text-zinc-500'} />
                    <span className="leading-none">{item.label.split('. ')[1]}</span>
                  </button>
                );
              })}
            </div>

            {/* Active editing form card based on horizontal tabs (Centered & Clean) */}
            <div className="bg-[#18191c]/80 backdrop-blur-sm border border-white/5 rounded-2xl p-5 md:p-6 text-left flex flex-col gap-6">
              
              <div className="border-b border-white/5 pb-3">
                <span className="text-[10px] uppercase font-black text-gaming-gold tracking-widest">
                  Personalizando: {sidebarItems.find(i => i.id === activeTab)?.label}
                </span>
                <p className="text-[9px] text-zinc-400 font-semibold uppercase tracking-wider mt-1">
                  {activeTab === 'nick' && 'Defina seu novo nome de guerra para os canais do clã.'}
                  {activeTab === 'bio' && 'Escreva uma frase marcante sobre suas conquistas e história militar.'}
                  {activeTab === 'avatar' && 'Personalize a moldura e mude a foto/GIF de exibição para destacar seu avatar.'}
                  {activeTab === 'effects' && 'Equipe fundos rúnicos estáticos ou ative efeitos de movimento no seu banner.'}
                  {activeTab === 'nameplate' && 'Personalize a cor ou degradê da placa de identificação do seu apelido.'}
                  {activeTab === 'achievements' && 'Controle quais de suas conquistas e emblemas militares aparecem no perfil.'}
                </p>
              </div>

              <div className="flex-1 w-full">
                
                {/* TAB 1: MUDAR NICK */}
                {activeTab === 'nick' && (
                    <form onSubmit={handleSaveNickAndPower} className="bg-black/20 p-5 md:p-6 rounded-2xl border border-white/5 flex flex-col gap-5 text-left max-w-md">
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Nome de Guerra (Nick)</label>
                        <input
                          type="text"
                          value={tempName}
                          onChange={(e) => setTempName(e.target.value)}
                          maxLength={18}
                          placeholder="Ex: Guerreiro Alfa"
                          className="bg-[#111214] border border-white/5 focus:border-[#5865f2] focus:ring-2 focus:ring-[#5865f2]/20 w-full rounded-xl px-4 py-3.5 outline-none text-xs font-bold text-white uppercase transition-all tracking-wider"
                        />
                        <p className="text-[9px] text-zinc-500 font-semibold uppercase tracking-wider mt-1">Nome visível em toda a aliança militar.</p>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Poder de Herói (HP)</label>
                        <input
                          type="number"
                          value={tempPower}
                          onChange={(e) => setTempPower(Number(e.target.value))}
                          placeholder="Ex: 5000"
                          className="bg-[#111214] border border-white/5 focus:border-[#5865f2] focus:ring-2 focus:ring-[#5865f2]/20 w-full rounded-xl px-4 py-3.5 outline-none text-[#dbdee1] text-xs font-bold transition-all tracking-wider"
                        />
                        <p className="text-[9px] text-zinc-500 font-semibold uppercase tracking-wider mt-1">Sua força militar de elite exibida no card do Clã.</p>
                      </div>

                      <div className="flex items-center justify-between gap-4 pt-3 border-t border-white/5">
                        {purchaseStatus?.id === 'nick_only_save' ? (
                          <span className="text-[10px] text-green-400 font-black uppercase tracking-wider animate-pulse">{purchaseStatus.message}</span>
                        ) : <span />}
                        <button
                          type="submit"
                          className="px-5 py-2.5 bg-[#248046] hover:bg-[#1a6535] text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all hover:scale-105 active:scale-95 shadow-md"
                        >
                          Salvar Alterações
                        </button>
                      </div>
                    </form>
                  )}

                  {/* TAB 2: MUDAR BIO */}
                  {activeTab === 'bio' && (
                    <form onSubmit={handleSaveBioOnly} className="bg-black/20 p-5 md:p-6 rounded-2xl border border-white/5 flex flex-col gap-5 text-left max-w-lg">
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Frase / Biografia de Apresentação</label>
                          <span className="text-[9px] font-mono text-zinc-500 font-bold">{tempBio.length}/130</span>
                        </div>
                        <textarea
                          value={tempBio}
                          onChange={(e) => setTempBio(e.target.value)}
                          maxLength={130}
                          rows={3}
                          placeholder="Escreva sua história militar resumida..."
                          className="bg-[#111214] border border-white/5 focus:border-[#5865f2] focus:ring-2 focus:ring-[#5865f2]/20 w-full rounded-xl px-4 py-3 outline-none text-xs font-bold text-white transition-all resize-none leading-relaxed"
                        />
                      </div>

                      <div className="flex items-center justify-between gap-4 pt-3 border-t border-white/5">
                        {purchaseStatus?.id === 'bio_only_save' ? (
                          <span className="text-[10px] text-green-400 font-black uppercase tracking-wider animate-pulse">{purchaseStatus.message}</span>
                        ) : <span />}
                        <button
                          type="submit"
                          className="px-5 py-2.5 bg-[#248046] hover:bg-[#1a6535] text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all hover:scale-105 active:scale-95 shadow-md"
                        >
                          Salvar Biografia
                        </button>
                      </div>
                    </form>
                  )}

                  {/* TAB 3: foto de perfil personalizada */}
                  {activeTab === 'avatar' && (
                    <div className="bg-black/20 p-5 md:p-6 rounded-2xl border border-white/5 flex flex-col gap-5 text-left max-w-md">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Foto de Perfil Personalizada</label>
                        <p className="text-[9px] text-zinc-500 font-semibold uppercase tracking-wider leading-normal">
                          Mude sua foto para uma de seu computador, incluindo GIFs animados!
                        </p>
                      </div>

                      <div className="flex flex-col gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setUploadAcceptType('image/png, image/jpeg, image/jpg, image/webp, image/gif');
                            setTimeout(() => fileInputRef.current?.click(), 100);
                          }}
                          className="p-4 bg-[#1e1f22]/60 hover:bg-[#1e1f22] hover:border-gaming-gold/50 border border-white/5 rounded-2xl flex items-center gap-4 transition-all text-left group"
                        >
                          <div className="w-10 h-10 rounded-xl bg-gaming-gold/10 flex items-center justify-center text-gaming-gold shrink-0">
                            <Camera size={18} />
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs font-black uppercase tracking-wider text-white">Carregar Foto ou GIF</span>
                            <span className="text-[9px] text-zinc-400 uppercase font-black tracking-wide">Aceita PNG, JPEG, WEBP ou GIF Animado</span>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* TAB 4: banner de perfil personalizado */}
                  {activeTab === 'effects' && (
                    <div className="bg-black/20 p-5 md:p-6 rounded-2xl border border-white/5 flex flex-col gap-5 text-left max-w-md">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Banner de Perfil Personalizado</label>
                        <p className="text-[9px] text-zinc-500 font-semibold uppercase tracking-wider leading-normal">
                          Destaque seu painel enviando uma foto de fundo customizada ou um GIF animado!
                        </p>
                      </div>

                      <div className="flex flex-col gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setUploadAcceptType('image/png, image/jpeg, image/jpg, image/webp, image/gif');
                            setTimeout(() => bannerFileInputRef.current?.click(), 100);
                          }}
                          className="p-4 bg-[#1e1f22]/60 hover:bg-[#1e1f22] hover:border-gaming-gold/50 border border-white/5 rounded-2xl flex items-center gap-4 transition-all text-left group"
                        >
                          <div className="w-10 h-10 rounded-xl bg-gaming-gold/10 flex items-center justify-center text-gaming-gold shrink-0">
                            <Sparkles size={18} />
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs font-black uppercase tracking-wider text-white">Carregar Banner ou GIF</span>
                            <span className="text-[9px] text-zinc-400 uppercase font-black tracking-wide">Aceita PNG, JPEG, WEBP ou GIF Animado</span>
                          </div>
                        </button>

                        {purchaseStatus?.id === 'banner_upload_success' && (
                          <p className="text-[9px] text-green-400 font-black uppercase tracking-wider animate-pulse pt-1">
                            {purchaseStatus.message}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB 5: PLACA DE IDENTIFICAÇÃO */}
                  {activeTab === 'nameplate' && (
                    <div className="bg-black/30 p-8 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center gap-4 py-16">
                      <div className="w-16 h-16 rounded-full bg-gaming-gold/10 border border-gaming-gold/25 flex items-center justify-center text-gaming-gold relative shadow-[0_0_20px_rgba(197,160,89,0.15)]">
                        <Lock size={26} className="animate-pulse" />
                        <div className="absolute -inset-1 rounded-full border border-gaming-gold/25 animate-ping opacity-25" />
                      </div>
                      <div className="flex flex-col gap-1.5 max-w-sm mt-3">
                        <span className="text-sm font-display font-black text-white uppercase tracking-wider">
                          Módulo em Desenvolvimento
                        </span>
                        <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider leading-relaxed">
                          Novos degradês do luar e placas com assinaturas de veterano estão sendo forjados para os lutadores.
                        </p>
                      </div>
                      
                      <div className="w-48 h-1.5 rounded-full overflow-hidden mt-4 bg-zinc-800">
                        <div className="bg-gaming-gold h-full rounded-full animate-pulse" style={{ width: '55%' }} />
                      </div>
                      <span className="text-[7.5px] font-mono uppercase text-[#949ba4] tracking-widest mt-1">
                        Próxima Atualização do Clã • Alfa v2.4
                      </span>
                    </div>
                  )}

                  {/* TAB 6: QUAIS CONQUISTAS GANHAS PARA APARECER */}
                  {activeTab === 'achievements' && (
                    <div className="bg-black/30 p-8 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center gap-4 py-16">
                      <div className="w-16 h-16 rounded-full bg-gaming-gold/10 border border-gaming-gold/25 flex items-center justify-center text-gaming-gold relative shadow-[0_0_20px_rgba(197,160,89,0.15)]">
                        <Lock size={26} className="animate-pulse" />
                        <div className="absolute -inset-1 rounded-full border border-gaming-gold/25 animate-ping opacity-25" />
                      </div>
                      <div className="flex flex-col gap-1.5 max-w-sm mt-3">
                        <span className="text-sm font-display font-black text-white uppercase tracking-wider">
                          Módulo em Desenvolvimento
                        </span>
                        <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider leading-relaxed">
                          O sistema de medalhas de honra e insígnias dinâmicas está em fase de homologação de guerra.
                        </p>
                      </div>
                      
                      <div className="w-48 h-1.5 rounded-full overflow-hidden mt-4 bg-zinc-800">
                        <div className="bg-gaming-gold h-full rounded-full animate-pulse" style={{ width: '60%' }} />
                      </div>
                      <span className="text-[7.5px] font-mono uppercase text-[#949ba4] tracking-widest mt-1">
                        Próxima Atualização do Clã • Alfa v2.4
                      </span>
                    </div>
                  )}

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
