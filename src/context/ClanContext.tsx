import React, { createContext, useContext, useEffect, useState } from 'react';
import { onSnapshot, doc, collection, query, orderBy, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged, User, signOut, getRedirectResult } from 'firebase/auth';
import { db, auth } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

interface Member {
  id: string;
  userId: string;
  name: string;
  role: 'leader' | 'diplomat' | 'military_leader' | 'recruiter' | 'muse' | 'warrior';
  reportedAt?: string; 
  reportedBy?: string;
  trophies: number;
  donations: number;
  heroPower: number;
  diamonds: number;
  boxes: number;
  coins: number;
  xp: number;
  level: number;
  completedMissions: string[];
  visitedMissionsBoard: boolean;
  lastDailyBonus?: string;
  opacityLevel?: number;
  status: 'online' | 'offline';
  avatarUrl?: string;
  joinedAt?: string;
  premiumPass?: boolean;
  appTheme?: 'dark' | 'neon' | 'gold' | 'classic';
  chatTheme?: 'dark' | 'neon' | 'gold' | 'classic';
  lastCelebratedLevel?: number;
  updateRewardClaimed?: boolean;
  profileBg?: string;
  profileBorder?: string;
  title?: string;
  unlockedTitles?: string[];
  nicknameColor?: string;
  unlockedColors?: string[];
  customStatus?: string;
  customBio?: string;
  avatarAnimation?: string;
  bannerEffect?: string;
  combatGroup?: string;
  combatGroupClaimed?: boolean;
  isGuest?: boolean;
  guestCreatedAt?: number;
}

interface TheftReport {
  id: string;
  reporterId: string;
  reporterName: string;
  timestamp: string;
}

interface Clan {
  id: string;
  name: string;
  tag: string;
  displayId: string;
  level: number;
  description: string;
  capacity: number;
  ownerId: string;
  trophyCount: number;
  guideImagePost1?: string;
  guideImageGuerraDia1?: string;
  loginLogoImage?: string;
}

interface ClanContextType {
  user: User | null;
  clan: Clan | null;
  members: Member[];
  myMember: Member | null;
  loading: boolean;
  isAdmin: boolean;
  logout: () => Promise<void>;
  claimDailyBonus: () => Promise<boolean>;
  redeemPromoCode: (code: string) => Promise<{ success: boolean; message: string }>;
  updateMemberData: (data: Partial<Member>) => Promise<void>;
  completeMission: (missionId: string, xpReward: number) => Promise<void>;
  markVisitedMissions: () => Promise<void>;
  deleteMember: (memberId: string) => Promise<void>;
  banMember: (memberId: string) => Promise<void>;
  updateMemberRole: (memberId: string, role: string) => Promise<void>;
  updateClanGuideImage: (imageUrl: string) => Promise<void>;
  updateClanGuerraDia1Image: (imageUrl: string) => Promise<void>;
  updateClanLoginLogoImage: (imageUrl: string) => Promise<void>;
  updatePresenceStatus: (status: 'online' | 'away' | 'offline') => Promise<void>;
  isEcoMode: boolean;
  toggleEcoMode: () => Promise<void>;
  isOptimizing: boolean;
  reportTheft: () => Promise<void>;
  claimUpdateReward: () => Promise<void>;
  distributeElixirXP: () => Promise<number>;
  theftReports: TheftReport[];
  clearTheftReport: (reportId: string) => Promise<void>;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  dbError: string | null;
  retryConnection: () => void;
  loginAsGuest: (nickname: string) => Promise<void>;
  isGuest: boolean;
  guestTimeLeft: string;
}

const ClanContext = createContext<ClanContextType | undefined>(undefined);

export const ClanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [clan, setClan] = useState<Clan | null>(() => {
    const saved = localStorage.getItem('cached_clan');
    return saved ? JSON.parse(saved) : null;
  });
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEcoMode, setIsEcoMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('isEcoMode');
    return saved === 'true';
  });
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [theftReports, setTheftReports] = useState<TheftReport[]>([]);
  const [activeTab, setActiveTab] = useState('inicio');
  const [dbError, setDbError] = useState<string | null>(null);
  const [retryTrigger, setRetryTrigger] = useState(0);
  const [guestTimeLeft, setGuestTimeLeft] = useState<string>('');

  // Load Local Data (simulating Firestore collections for guests / offline fallback)
  const getLocalMembers = (): Member[] => {
    const saved = localStorage.getItem('local_members');
    if (saved) {
      try {
        const loaded: Member[] = JSON.parse(saved);
        // Force donations to be 0 for all existing members in storage as requested ("Zere as doações")
        if (loaded.some(m => m.donations !== 0)) {
          const updated = loaded.map(m => ({ ...m, donations: 0 }));
          localStorage.setItem('local_members', JSON.stringify(updated));
          return updated;
        }
        return loaded;
      } catch (e) {
        console.error('Failed to parse local members, resetting...', e);
      }
    }
    
    // Initialize with nice default members so the clan is populated
    const defaultMembers: Member[] = [
      {
        id: 'skadir_leader',
        userId: 'skadir_leader',
        name: 'Skadir',
        role: 'leader',
        trophies: 4500,
        donations: 0,
        heroPower: 9200,
        diamonds: 1500,
        boxes: 12,
        coins: 8500,
        xp: 1500,
        level: 5,
        completedMissions: ['first_login', 'complete_profile'],
        visitedMissionsBoard: true,
        status: 'online',
        joinedAt: '20/05/2026'
      },
      {
        id: 'miyake_warrior',
        userId: 'miyake_warrior',
        name: 'Miyake',
        role: 'warrior',
        trophies: 2800,
        donations: 0,
        heroPower: 5400,
        diamonds: 200,
        boxes: 2,
        coins: 1400,
        xp: 650,
        level: 3,
        completedMissions: ['first_login'],
        visitedMissionsBoard: true,
        status: 'online',
        joinedAt: '20/05/2026'
      },
      {
        id: 'riccardo_diplomat',
        userId: 'riccardo_diplomat',
        name: 'Riccardo',
        role: 'diplomat',
        trophies: 3400,
        donations: 0,
        heroPower: 7200,
        diamonds: 800,
        boxes: 5,
        coins: 4300,
        xp: 1100,
        level: 4,
        completedMissions: ['first_login', 'visit_guilda'],
        visitedMissionsBoard: true,
        status: 'offline',
        joinedAt: '18/05/2026'
      },
      {
        id: 'lobo_warrior',
        userId: 'lobo_warrior',
        name: 'guerreiro lobo',
        role: 'warrior',
        trophies: 1500,
        donations: 0,
        heroPower: 3100,
        diamonds: 50,
        boxes: 1,
        coins: 500,
        xp: 120,
        level: 1,
        completedMissions: [],
        visitedMissionsBoard: false,
        status: 'online',
        joinedAt: '20/05/2026'
      },
      {
        id: 'riccelli_diplomat',
        userId: 'riccelli_diplomat',
        name: 'Riccelli',
        role: 'diplomat',
        trophies: 2100,
        donations: 0,
        heroPower: 4500,
        diamonds: 150,
        boxes: 3,
        coins: 1200,
        xp: 400,
        level: 2,
        completedMissions: ['first_login'],
        visitedMissionsBoard: true,
        status: 'offline',
        joinedAt: '19/05/2026'
      }
    ];
    localStorage.setItem('local_members', JSON.stringify(defaultMembers));
    return defaultMembers;
  };

  const getLocalClan = (): Clan => {
    const saved = localStorage.getItem('local_clan');
    if (saved) return JSON.parse(saved);
    const defaultClan: Clan = {
      id: 'main-clan',
      name: 'Aliança Suprema Ordem',
      tag: 'ORDM',
      displayId: 'GO ORDM',
      level: 1,
      description: 'A aliança suprema para dominadores do reino.',
      capacity: 100,
      ownerId: 'skadir_leader',
      trophyCount: 14300
    };
    localStorage.setItem('local_clan', JSON.stringify(defaultClan));
    return defaultClan;
  };

  const initializeClientGuestMember = (userId: string, name: string) => {
    const currentMembers = getLocalMembers();
    const exists = currentMembers.find(m => m.userId === userId);
    if (!exists) {
      const newMember: Member = {
        id: userId,
        userId: userId,
        name: name,
        role: 'warrior',
        trophies: 0,
        donations: 0,
        xp: 0,
        level: 1,
        heroPower: 0,
        diamonds: 0,
        boxes: 0,
        coins: 0,
        completedMissions: [],
        visitedMissionsBoard: false,
        premiumPass: false,
        appTheme: 'dark',
        chatTheme: 'dark',
        profileBg: 'https://cdnb.artstation.com/p/assets/images/images/017/680/475/small/andrej-otepka-square-04-tmp04web.jpg?1556922748',
        lastCelebratedLevel: 0,
        status: 'online',
        joinedAt: new Date().toLocaleDateString(),
        isGuest: true,
        guestCreatedAt: Date.now()
      };
      const updated = [...currentMembers, newMember];
      localStorage.setItem('local_members', JSON.stringify(updated));
      setMembers(updated);
    } else {
      setMembers(currentMembers);
    }
  };

  const loginAsGuest = async (nickname: string) => {
    setLoading(true);
    setDbError(null);
    try {
      const { signInAnonymously: fSignInAnonymously } = await import('firebase/auth');
      const result = await fSignInAnonymously(auth);
      // Success! Sign-in anonymously worked. Let's save a flag to set character nickname
      localStorage.setItem('pending_guest_nickname', nickname);
      localStorage.setItem(`guest_created_${result.user.uid}`, String(Date.now()));
    } catch (authErr: any) {
      console.warn("Could not sign in anonymously via Firebase. Falling back to local guest mode.", authErr);
      // Local fallback
      const guestUid = 'guest_' + nickname.toLowerCase().replace(/\s+/g, '_') + '_' + Math.floor(Math.random() * 100000);
      const guestUser = {
        uid: guestUid,
        email: 'convidado@supremaordem.com',
        displayName: nickname,
        isGuest: true
      };
      localStorage.setItem('guest_user', JSON.stringify(guestUser));
      localStorage.setItem(`guest_created_${guestUid}`, String(Date.now()));
      setUser(guestUser as any);
      setLoading(true); // triggers useEffect to populate guest state
    }
  };

  const retryConnection = () => {
    setDbError(null);
    setLoading(true);
    setRetryTrigger(prev => prev + 1);
  };
  
  const toggleEcoMode = async () => {
    setIsOptimizing(true);
    // Artificial delay for optimization process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newValue = !isEcoMode;
    setIsEcoMode(newValue);
    localStorage.setItem('isEcoMode', String(newValue));
    setIsOptimizing(null as any); // Reset state
    setIsOptimizing(false);
  };
  
  // Default Clan ID for development
  const DEFAULT_CLAN_ID = 'main-clan';

  const myMember = user ? members.find(m => m.userId === user.uid) || null : null;

  const isGuest = user ? ((user as any).isGuest === true || user.isAnonymous === true || user.email === 'convidado@supremaordem.com' || myMember?.isGuest === true) : false;

  useEffect(() => {
    if (!user || !isGuest) {
      setGuestTimeLeft('');
      return;
    }

    const creationKey = `guest_created_${user.uid}`;
    let storedTimeStr = localStorage.getItem(creationKey);
    if (!storedTimeStr) {
      storedTimeStr = String(myMember?.guestCreatedAt || Date.now());
      localStorage.setItem(creationKey, storedTimeStr);
    }
    const creationTime = Number(storedTimeStr);

    const updateTimer = async () => {
      const now = Date.now();
      const elapsed = now - creationTime;
      const twentyFourHours = 24 * 60 * 60 * 1000;
      const remaining = twentyFourHours - elapsed;

      if (remaining <= 0) {
        clearInterval(timer);
        console.log(`Guest session for ${user.uid} expired (24 hours reached). Terminating account...`);
        try {
          if (!(user as any).isGuest) {
            // Firestore guest
            const { doc, deleteDoc } = await import('firebase/firestore');
            const memberRef = doc(db, 'clans', 'main-clan', 'members', user.uid);
            await deleteDoc(memberRef).catch(() => {});
          } else {
            // Local fallback guest, remove from local members list
            const currentMembers = getLocalMembers();
            const updated = currentMembers.filter(m => m.userId !== user.uid);
            localStorage.setItem('local_members', JSON.stringify(updated));
            setMembers(updated);
          }
          localStorage.removeItem('guest_user');
          localStorage.removeItem(creationKey);
          await logout();
          alert("Sua conta de convidado de 24 horas expirou e foi encerrada permanentemente!");
        } catch (err) {
          console.error("Failed to terminate expired guest account:", err);
          localStorage.removeItem('guest_user');
          localStorage.removeItem(creationKey);
          logout();
        }
        return;
      }

      const hours = Math.floor(remaining / (1000 * 60 * 60));
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

      setGuestTimeLeft(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);

    return () => clearInterval(timer);
  }, [user, isGuest, myMember?.guestCreatedAt]);

  useEffect(() => {
    // Handle redirect result
    getRedirectResult(auth).catch((error) => {
      console.error('Error during redirect login:', error);
      if (error.code === 'auth/unauthorized-domain') {
        alert('Este domínio não está autorizado no Firebase. Por favor, adicione os domínios .run.app nas configurações do Firebase Authentication.');
      }
    });

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        localStorage.removeItem('guest_user');
        setLoading(true);
      } else {
        const savedGuest = localStorage.getItem('guest_user');
        if (savedGuest) {
          try {
            setUser(JSON.parse(savedGuest));
          } catch {
            setUser(null);
            setClan(null);
            setMembers([]);
            setLoading(false);
          }
        } else {
          setUser(null);
          setClan(null);
          setMembers([]);
          setLoading(false);
        }
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Update specific user name and role to Skadir/Leader if needed
  useEffect(() => {
    if (user && (user as any).isGuest) return;
    if ((user?.email === 'ryankevyn3000@gmail.com' || user?.email === 'ryankevyn2025@gmail.com') && members.length > 0) {
      const myMember = members.find(m => m.userId === user.uid);
      if (myMember && (myMember.name !== 'Skadir' || myMember.role !== 'leader')) {
        const memberRef = doc(db, 'clans', DEFAULT_CLAN_ID, 'members', user.uid);
        updateDoc(memberRef, { 
          name: 'Skadir',
          role: 'leader'
        }).catch(err => console.error('Failed to update Skadir status', err));
      }
    }
  }, [user, members]);

  // Handle First Login Mission
  useEffect(() => {
    if (myMember && !myMember.completedMissions?.includes('first_login')) {
      completeMission('first_login', 15);
    }
  }, [myMember?.userId]);

  // One-time data reset requested by user "reset for me and for everyone"
  useEffect(() => {
    if (user && (user as any).isGuest) return;
    if (myMember && (myMember.diamonds !== 0 || myMember.trophies !== 0)) {
       const memberRef = doc(db, 'clans', DEFAULT_CLAN_ID, 'members', user!.uid);
       updateDoc(memberRef, { 
         diamonds: 0, 
         trophies: 0 
       }).catch(err => console.error('Failed to reset data', err));
    }
    
    // Also reset clan trophies if user is leader
    if (myMember?.role === 'leader' && clan && clan.trophyCount !== 0) {
       const clanRef = doc(db, 'clans', DEFAULT_CLAN_ID);
       updateDoc(clanRef, { trophyCount: 0 }).catch(() => {});
    }
  }, [myMember?.userId, clan?.id]);

  // Update specific user roles as requested: Miyake, guerreiro lobo, Riccelli
  useEffect(() => {
    if (members.length > 0) {
      members.forEach(m => {
        // Miyake and Guerreiro Lobo -> warrior
        if ((m.name === 'Miyake' || m.name === 'guerreiro lobo') && m.role !== 'warrior') {
          updateMemberRole(m.id, 'warrior');
        }
        // Riccelli -> diplomat
        if (m.name === 'Riccelli' && m.role !== 'diplomat') {
          updateMemberRole(m.id, 'diplomat');
        }
      });
    }
  }, [members.length]);

  useEffect(() => {
    if (!user) return;

    if ((user as any).isGuest) {
      // Local Mode Setup
      const localClan = getLocalClan();
      setClan(localClan);
      initializeClientGuestMember(user.uid, user.displayName || 'Guerreiro');
      
      const savedReports = localStorage.getItem('local_theft_reports');
      setTheftReports(savedReports ? JSON.parse(savedReports) : []);
      
      setLoading(false);
      return;
    }

    // Auto-join if pending guest nickname exists (Anonymous Auth)
    const pendingNick = localStorage.getItem('pending_guest_nickname');
    if (pendingNick) {
      localStorage.removeItem('pending_guest_nickname');
      const createdTimestamp = Number(localStorage.getItem(`guest_created_${user.uid}`)) || Date.now();
      // Create member in Firestore as Guest
      import('../services/clanService').then(({ joinClan }) => {
        joinClan(user.uid, pendingNick, user.email || null, true, createdTimestamp)
          .then(() => console.log('Successfully completed guest registration in Firestore!'))
          .catch(err => {
            console.error('Failed to complete guest registration in Firestore:', err);
            // Fallback: Convert to Local Guest
            const guestUser = {
              uid: 'guest_' + user.uid,
              email: 'convidado@supremaordem.com',
              displayName: pendingNick,
              isGuest: true
            };
            localStorage.setItem('guest_user', JSON.stringify(guestUser));
            setUser(guestUser as any);
          });
      });
    }

    setLoading(true);
    setDbError(null);

    let active = true;

    // Fast check using getDocFromServer to detect offline state, permission errors, or missing databases immediately
    import('firebase/firestore').then(({ getDocFromServer, doc }) => {
      if (!active) return;
      getDocFromServer(doc(db, 'clans', DEFAULT_CLAN_ID))
        .then(() => {
          console.log("Direct connection to Firestore succeeded!");
        })
        .catch((err: any) => {
          if (!active) return;
          console.error("Firestore direct connection test failed:", err);
          
          let friendlyMessage = err?.message || String(err);
          if (friendlyMessage.includes('permission') || friendlyMessage.toLowerCase().includes('denied')) {
            friendlyMessage = "Permissão Negada (Permission Denied). Verifique se as regras do banco de dados (Firestore Security Rules) permitem leitura e gravação ou se o banco de dados foi iniciado em Modo de Produção/Bloqueado.";
          } else if (friendlyMessage.toLowerCase().includes('not-found') || friendlyMessage.toLowerCase().includes('not found')) {
            friendlyMessage = "O banco de dados ou o documento da guilda não coincide. Isso significa que o banco de dados principal no console do Firebase precisa ser ativado.";
          } else if (friendlyMessage.toLowerCase().includes('failed-precondition')) {
            friendlyMessage = "Pré-condição falhou (Failed Precondition). Pode ser necessário criar um índice no Firestore Console para consultas ordenadas.";
          } else if (friendlyMessage.toLowerCase().includes('failed to get document') || friendlyMessage.toLowerCase().includes('network') || friendlyMessage.toLowerCase().includes('unavailable')) {
            friendlyMessage = "Não foi possível conectar ao servidor do Firebase. Isso geralmente acontece quando o banco de dados do Firestore ainda NÃO foi criado ou ativado sob o projeto no Console do seu Firebase, ou a chave/configuração está inválida.";
          }
          
          setDbError(friendlyMessage);
          setLoading(false);
        });
    });

    // 1. Listen to Clan Data
    const clanDocRef = doc(db, 'clans', DEFAULT_CLAN_ID);
    const unsubscribeClan = onSnapshot(clanDocRef, (snapshot) => {
      if (snapshot.exists()) {
        const clanData = { id: snapshot.id, ...snapshot.data() } as Clan;
        setClan(clanData);
        localStorage.setItem('cached_clan', JSON.stringify(clanData));
      } else {
        // Fallback for demo: if clan doesn't exist, we don't set it
        setClan(null);
      }
    }, (error) => {
      console.error('Clan Snapshot Error:', error);
      let friendlyMessage = error?.message || String(error);
      if (friendlyMessage.includes('permission') || friendlyMessage.toLowerCase().includes('denied')) {
        friendlyMessage = "Permissão Negada (Permission Denied) para ler Dados da Aliança. Ative o banco de dados no Console e garanta regras abertas de leitura.";
      }
      setDbError(friendlyMessage);
      try {
        handleFirestoreError(error, OperationType.GET, `clans/${DEFAULT_CLAN_ID}`);
      } catch (e) {
        // Log is already done
      }
      setLoading(false);
    });

    // 2. Listen to Members
    const membersRef = collection(db, 'clans', DEFAULT_CLAN_ID, 'members');
    const membersQuery = query(membersRef);
    
    const unsubscribeMembers = onSnapshot(membersQuery, (snapshot) => {
      const membersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Member[];
      
      // Sort members client-side to avoid needing a Firestore composite index
      const sortedMembers = [...membersData].sort((a, b) => {
        const roleOrder: Record<string, number> = {
          leader: 1,
          diplomat: 2,
          military_leader: 3,
          recruiter: 4,
          muse: 5,
          warrior: 6
        };
        const orderA = roleOrder[a.role] || 99;
        const orderB = roleOrder[b.role] || 99;
        if (orderA !== orderB) return orderA - orderB;
        return (b.trophies || 0) - (a.trophies || 0);
      });
      
      setMembers(sortedMembers);
      setLoading(false);
    }, (error) => {
      console.error('Members Snapshot Error:', error);
      let friendlyMessage = error?.message || String(error);
      if (friendlyMessage.includes('permission') || friendlyMessage.toLowerCase().includes('denied')) {
        friendlyMessage = "Permissão Negada (Permission Denied) para ler Membros da Aliança. Ative o banco de dados no Console e garanta regras abertas de leitura.";
      }
      setDbError(friendlyMessage);
      setLoading(false);
      // Don't throw here to avoid crashing the whole context
      try {
        handleFirestoreError(error, OperationType.LIST, `clans/${DEFAULT_CLAN_ID}/members`);
      } catch (e) {
        // Log is already done in handleFirestoreError
      }
    });

    // 3. Listen to Theft Reports (Leaders only)
    let unsubscribeReports = () => {};
    if (myMember?.role === 'leader') {
      const reportsRef = collection(db, 'clans', DEFAULT_CLAN_ID, 'theft_reports');
      const reportsQuery = query(reportsRef, orderBy('timestamp', 'desc'));
      unsubscribeReports = onSnapshot(reportsQuery, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as TheftReport[];
        setTheftReports(data);
      });
    }

    return () => {
      active = false;
      unsubscribeClan();
      unsubscribeMembers();
      unsubscribeReports();
    };
  }, [user, myMember?.role, retryTrigger]);

  const isAdmin = members.find(m => m.userId === user?.uid)?.role === 'leader';

  const logout = async () => {
    try {
      localStorage.removeItem('guest_user');
      setUser(null);
      setClan(null);
      setMembers([]);
      setLoading(false);
      await signOut(auth);
    } catch (err) {
      console.error('Failed to logout', err);
    }
  };

  const updateMemberData = async (data: Partial<Member>) => {
    if (!user || !myMember) return;
    
    if ((user as any).isGuest) {
      const currentMembers = getLocalMembers();
      const { id, ...dataToUpdate } = data as any;
      let finalData = { ...dataToUpdate };

      if (data.xp !== undefined) {
        const newXp = data.xp;
        const thresholds = [0, 0, 100, 200, 400, 700, 1100, 1600, 2200, 2900, 3700];
        let calculatedLevel = 0;
        for (let i = 0; i < thresholds.length; i++) {
          if (newXp >= thresholds[i]) calculatedLevel = i;
          else break;
        }
        calculatedLevel = Math.min(calculatedLevel, 10);
        if (calculatedLevel > (myMember.level || 0)) {
          finalData.level = calculatedLevel;
        }
      }

      const updated = currentMembers.map(m => {
        if (m.userId === user.uid) {
          return { ...m, ...finalData };
        }
        return m;
      });
      localStorage.setItem('local_members', JSON.stringify(updated));
      setMembers(updated);
      return;
    }
    
    const memberRef = doc(db, 'clans', DEFAULT_CLAN_ID, 'members', user.uid);
    // Sanitize data to remove 'id' if present, and any other internal fields
    const { id, ...dataToUpdate } = data as any;
    let finalData = { ...dataToUpdate };

    // Handle XP and Level if XP changes
    if (data.xp !== undefined) {
      const newXp = data.xp;
      
      // Calculate new level based on provided thresholds
      // Level 1: 0, Level 2: 100, Level 3: 200, Level 4: 400, up to Level 10
      const thresholds = [0, 0, 100, 200, 400, 700, 1100, 1600, 2200, 2900, 3700];
      let calculatedLevel = 0;
      for (let i = 0; i < thresholds.length; i++) {
        if (newXp >= thresholds[i]) calculatedLevel = i;
        else break;
      }
      calculatedLevel = Math.min(calculatedLevel, 10);
      
      if (calculatedLevel > (myMember.level || 0)) {
        finalData.level = calculatedLevel;
      }
    }

    try {
      await updateDoc(memberRef, finalData);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `clans/${DEFAULT_CLAN_ID}/members/${user.uid}`);
    }
  };

  const completeMission = async (missionId: string, xpReward: number) => {
    if (!myMember || myMember.completedMissions?.includes(missionId)) return;
    
    const newCompleted = [...(myMember.completedMissions || []), missionId];
    const newXp = (myMember.xp || 0) + xpReward;
    
    await updateMemberData({
      completedMissions: newCompleted,
      xp: newXp
    });
  };

  const markVisitedMissions = async () => {
    if (!myMember || myMember.visitedMissionsBoard) return;
    await updateMemberData({ visitedMissionsBoard: true });
  };
  
  const deleteMember = async (memberId: string) => {
    if (!user || !myMember) return;
    
    if ((user as any).isGuest) {
      const currentMembers = getLocalMembers();
      const updated = currentMembers.filter(m => m.userId !== memberId);
      localStorage.setItem('local_members', JSON.stringify(updated));
      setMembers(updated);
      if (myMember.userId === memberId || user.uid === memberId) {
        await logout();
      }
      return;
    }

    // Permission: Only leader can delete others, but anyone can delete themselves
    if (myMember.role !== 'leader' && myMember.userId !== memberId) {
      console.warn('Unauthorized: You can only delete your own account unless you are a leader.');
      return;
    }

    const memberRef = doc(db, 'clans', DEFAULT_CLAN_ID, 'members', memberId);
    try {
      await deleteDoc(memberRef);
      
      // If deleting own account, log out immediately
      if (myMember.userId === memberId || user.uid === memberId) {
        await logout();
      }
    } catch (err) {
      console.error('Failed to delete member', err);
      throw err;
    }
  };

  const banMember = async (memberId: string) => {
    if (!user || !myMember || myMember.role !== 'leader') return;
    
    if ((user as any).isGuest) {
      const currentMembers = getLocalMembers();
      const updated = currentMembers.filter(m => m.userId !== memberId);
      localStorage.setItem('local_members', JSON.stringify(updated));
      setMembers(updated);
      return;
    }

    const banRef = doc(db, 'bans', memberId);
    const memberRef = doc(db, 'clans', DEFAULT_CLAN_ID, 'members', memberId);
    
    try {
      // 1. Add to blacklist
      await setDoc(banRef, {
        userId: memberId,
        bannedAt: new Date().toISOString(),
        bannedBy: user.uid,
        reason: 'Expulsão Definitiva (Ban)'
      });
      // 2. Remove from clan
      await deleteDoc(memberRef);
    } catch (err) {
      console.error('Failed to ban member', err);
      throw err;
    }
  };

  const updateMemberRole = async (memberId: string, role: string) => {
    if (!user || !myMember) {
      console.warn('UpdateMemberRole aborted: No user or member data');
      return;
    }

    if ((user as any).isGuest) {
      const currentMembers = getLocalMembers();
      const updated = currentMembers.map(m => {
        if (m.userId === memberId) return { ...m, role: role as any };
        return m;
      });
      localStorage.setItem('local_members', JSON.stringify(updated));
      setMembers(updated);
      return;
    }

    if (myMember.role !== 'leader') {
      console.warn(`UpdateMemberRole aborted: User is not leader (Role: ${myMember.role})`);
      return;
    }
    const memberRef = doc(db, 'clans', DEFAULT_CLAN_ID, 'members', memberId);
    try {
      await updateDoc(memberRef, { role });
      console.log(`Successfully updated role of ${memberId} to ${role}`);
    } catch (err) {
      console.error('Failed to update member role', err);
    }
  };

  const updateClanGuideImage = async (imageUrl: string) => {
    if (!user || !myMember || myMember.role !== 'leader') return;

    if ((user as any).isGuest) {
      const localClan = getLocalClan();
      const updated = { ...localClan, guideImagePost1: imageUrl };
      localStorage.setItem('local_clan', JSON.stringify(updated));
      setClan(updated as any);
      return;
    }

    const clanRef = doc(db, 'clans', DEFAULT_CLAN_ID);
    try {
      await updateDoc(clanRef, { guideImagePost1: imageUrl });
    } catch (err) {
      console.error('Failed to update guide image', err);
    }
  };

  const updateClanGuerraDia1Image = async (imageUrl: string) => {
    if (!user || !myMember || myMember.role !== 'leader') return;

    if ((user as any).isGuest) {
      const localClan = getLocalClan();
      const updated = { ...localClan, guideImageGuerraDia1: imageUrl };
      localStorage.setItem('local_clan', JSON.stringify(updated));
      setClan(updated as any);
      return;
    }

    const clanRef = doc(db, 'clans', DEFAULT_CLAN_ID);
    try {
      await updateDoc(clanRef, { guideImageGuerraDia1: imageUrl });
    } catch (err) {
      console.error('Failed to update guerra dia 1 image', err);
    }
  };

  const updateClanLoginLogoImage = async (imageUrl: string) => {
    if (!user || !myMember || myMember.role !== 'leader') return;

    if ((user as any).isGuest) {
      const localClan = getLocalClan();
      const updated = { ...localClan, loginLogoImage: imageUrl };
      localStorage.setItem('local_clan', JSON.stringify(updated));
      setClan(updated as any);
      return;
    }

    const clanRef = doc(db, 'clans', DEFAULT_CLAN_ID);
    try {
      await updateDoc(clanRef, { loginLogoImage: imageUrl });
    } catch (err) {
      console.error('Failed to update login logo image', err);
    }
  };

  const updatePresenceStatus = async (status: 'online' | 'away' | 'offline') => {
    if (!user) return;

    if ((user as any).isGuest) {
      const currentMembers = getLocalMembers();
      const updated = currentMembers.map(m => {
        if (m.userId === user.uid) return { ...m, status: status as any };
        return m;
      });
      localStorage.setItem('local_members', JSON.stringify(updated));
      setMembers(updated);
      return;
    }

    const memberRef = doc(db, 'clans', DEFAULT_CLAN_ID, 'members', user.uid);
    try {
      await updateDoc(memberRef, { status });
    } catch (err) {
      // Fail silently
    }
  };

  const getBrasiliaDate = () => {
    const now = new Date();
    // UTC-3
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const date = new Date(utc + (3600000 * -3));
    return date.toISOString().split('T')[0];
  };

  const claimDailyBonus = async () => {
    if (!user || !myMember) return false;
    
    const today = getBrasiliaDate();
    if (myMember.lastDailyBonus === today) {
      return false;
    }

    await updateMemberData({
      coins: (myMember.coins || 0) + 2,
      lastDailyBonus: today
    });
    return true;
  };

  const redeemPromoCode = async (code: string) => {
    if (!user || !myMember) return { success: false, message: 'Usuário não encontrado' };
    
    const upperCode = code.toUpperCase();
    if (upperCode === 'ORDEMBÔNUS') {
      await updateMemberData({ 
        diamonds: (myMember.diamonds || 0) + 10,
        coins: (myMember.coins || 0) + 500
      });
      return { success: true, message: 'Código resgatado! +10 Diamantes e +500 Moedas' };
    }
    
    if (upperCode === 'BETA2026') {
      await updateMemberData({ boxes: (myMember.boxes || 0) + 1 });
      return { success: true, message: 'Código resgatado! +1 Caixa' };
    }

    return { success: false, message: 'Código inválido' };
  };

  const reportTheft = async () => {
    if (!user || !myMember) return;

    if ((user as any).isGuest) {
      const savedReports = localStorage.getItem('local_theft_reports');
      const reports: TheftReport[] = savedReports ? JSON.parse(savedReports) : [];
      const newReport: TheftReport = {
        id: 'report_' + Date.now(),
        reporterId: user.uid,
        reporterName: myMember.name || 'Guerreiro anônimo',
        timestamp: new Date().toISOString()
      };
      const updated = [newReport, ...reports];
      localStorage.setItem('local_theft_reports', JSON.stringify(updated));
      setTheftReports(updated);
      return;
    }

    const reportRef = doc(collection(db, 'clans', DEFAULT_CLAN_ID, 'theft_reports'));
    await setDoc(reportRef, {
      reporterId: user.uid,
      reporterName: myMember.name || 'Guerreiro anônimo',
      timestamp: new Date().toISOString()
    });
  };

  const claimUpdateReward = async () => {
    if (!user || !myMember || myMember.updateRewardClaimed) return;
    
    await updateMemberData({
      coins: (myMember.coins || 0) + 50,
      updateRewardClaimed: true
    });
  };

  const distributeElixirXP = async () => {
    if (!user || !myMember) return 0;

    let count = 0;
    const thresholds = [0, 0, 100, 200, 400, 700, 1100, 1600, 2200, 2900, 3700];

    if ((user as any).isGuest) {
      const currentMembers = getLocalMembers();
      const updated = currentMembers.map(m => {
        if (m.combatGroup && !m.combatGroupClaimed) {
          count++;
          const newXp = (m.xp || 0) + 50;
          let calculatedLevel = 1;
          for (let i = 0; i < thresholds.length; i++) {
            if (newXp >= thresholds[i]) calculatedLevel = i;
            else break;
          }
          calculatedLevel = Math.min(calculatedLevel, 10);
          return {
            ...m,
            xp: newXp,
            level: Math.max(m.level || 1, calculatedLevel),
            combatGroupClaimed: true
          };
        }
        return m;
      });
      localStorage.setItem('local_members', JSON.stringify(updated));
      setMembers(updated);
      return count;
    }

    // In production Firestore
    const eligibleMembers = members.filter(m => m.combatGroup && !m.combatGroupClaimed);
    for (const m of eligibleMembers) {
      count++;
      const newXp = (m.xp || 0) + 50;
      let calculatedLevel = 1;
      for (let i = 0; i < thresholds.length; i++) {
        if (newXp >= thresholds[i]) calculatedLevel = i;
        else break;
      }
      calculatedLevel = Math.min(calculatedLevel, 10);

      const memberRef = doc(db, 'clans', DEFAULT_CLAN_ID, 'members', m.userId);
      await updateDoc(memberRef, {
        xp: newXp,
        level: Math.max(m.level || 1, calculatedLevel),
        combatGroupClaimed: true
      });
    }

    return count;
  };

  const clearTheftReport = async (reportId: string) => {
    if ((user as any).isGuest) {
      const savedReports = localStorage.getItem('local_theft_reports');
      const reports: TheftReport[] = savedReports ? JSON.parse(savedReports) : [];
      const updated = reports.filter(r => r.id !== reportId);
      localStorage.setItem('local_theft_reports', JSON.stringify(updated));
      setTheftReports(updated);
      return;
    }

    const reportRef = doc(db, 'clans', DEFAULT_CLAN_ID, 'theft_reports', reportId);
    await deleteDoc(reportRef);
  };

  return (
    <ClanContext.Provider value={{ 
      user, clan, members, myMember, loading, isAdmin, logout, 
      updateMemberData, claimDailyBonus, redeemPromoCode, 
      completeMission, markVisitedMissions, deleteMember, banMember, updateMemberRole,
      updateClanGuideImage, updateClanGuerraDia1Image, updateClanLoginLogoImage, updatePresenceStatus,
      isEcoMode, toggleEcoMode, isOptimizing,
      reportTheft, theftReports, clearTheftReport,
      claimUpdateReward, distributeElixirXP,
      activeTab, setActiveTab,
      dbError,
      retryConnection,
      loginAsGuest,
      isGuest,
      guestTimeLeft
    }}>
      {children}
    </ClanContext.Provider>
  );
};

export const useClan = () => {
  const context = useContext(ClanContext);
  if (context === undefined) {
    throw new Error('useClan must be used within a ClanProvider');
  }
  return context;
};
