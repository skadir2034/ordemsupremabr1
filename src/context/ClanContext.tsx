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
  updatePresenceStatus: (status: 'online' | 'away' | 'offline') => Promise<void>;
  isEcoMode: boolean;
  toggleEcoMode: () => Promise<void>;
  isOptimizing: boolean;
  reportTheft: () => Promise<void>;
  claimUpdateReward: () => Promise<void>;
  theftReports: TheftReport[];
  clearTheftReport: (reportId: string) => Promise<void>;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  dbError: string | null;
  retryConnection: () => void;
}

const ClanContext = createContext<ClanContextType | undefined>(undefined);

export const ClanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [clan, setClan] = useState<Clan | null>(null);
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

  useEffect(() => {
    // Handle redirect result
    getRedirectResult(auth).catch((error) => {
      console.error('Error during redirect login:', error);
      if (error.code === 'auth/unauthorized-domain') {
        alert('Este domínio não está autorizado no Firebase. Por favor, adicione os domínios .run.app nas configurações do Firebase Authentication.');
      }
    });

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setClan(null);
        setMembers([]);
        setLoading(false);
      } else {
        // When user is found, we keep loading as true until snapshots return or fail
        setLoading(true);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Update specific user name and role to Skadir/Leader if needed
  useEffect(() => {
    if ((user?.email === 'ryankevyn3000@gmail.com' || user?.email === 'ryankevyn2020@gmail.com') && members.length > 0) {
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
        setClan({ id: snapshot.id, ...snapshot.data() } as Clan);
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
      await signOut(auth);
    } catch (err) {
      console.error('Failed to logout', err);
    }
  };

  const updateMemberData = async (data: Partial<Member>) => {
    if (!user || !myMember) return;
    
    const memberRef = doc(db, 'clans', DEFAULT_CLAN_ID, 'members', user.uid);
    // Sanitize data to remove 'id' if present, and any other internal fields
    const { id, ...dataToUpdate } = data as any;
    let finalData = { ...dataToUpdate };

    // Handle XP and Level if XP changes
    if (data.xp !== undefined) {
      const newXp = data.xp;
      
      // Calculate new level based on provided thresholds
      // Level 1: 50, Level 2: 100, Level 3: 200, Level 4: 500, Level 5: 1000...
      const thresholds = [0, 50, 100, 200, 500, 1000, 2000, 3000, 4000, 5000, 6000];
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
    const clanRef = doc(db, 'clans', DEFAULT_CLAN_ID);
    try {
      await updateDoc(clanRef, { guideImagePost1: imageUrl });
    } catch (err) {
      console.error('Failed to update guide image', err);
    }
  };

  const updatePresenceStatus = async (status: 'online' | 'away' | 'offline') => {
    if (!user) return;
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

  const clearTheftReport = async (reportId: string) => {
    const reportRef = doc(db, 'clans', DEFAULT_CLAN_ID, 'theft_reports', reportId);
    await deleteDoc(reportRef);
  };

  return (
    <ClanContext.Provider value={{ 
      user, clan, members, myMember, loading, isAdmin, logout, 
      updateMemberData, claimDailyBonus, redeemPromoCode, 
      completeMission, markVisitedMissions, deleteMember, banMember, updateMemberRole,
      updateClanGuideImage, updatePresenceStatus,
      isEcoMode, toggleEcoMode, isOptimizing,
      reportTheft, theftReports, clearTheftReport,
      claimUpdateReward,
      activeTab, setActiveTab,
      dbError,
      retryConnection
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
