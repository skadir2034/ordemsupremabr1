import React, { createContext, useContext, useEffect, useState } from 'react';

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
}

interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
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
  logoUrl?: string;
  guideImagePost1?: string;
}

interface ClanContextType {
  user: User | null;
  login: (nickname: string, password?: string) => Promise<void>;
  register: (nickname: string, email: string, password?: string) => Promise<void>;
  checkNick: (nickname: string) => Promise<boolean>;
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
  updateClanLogo: (imageUrl: string) => Promise<void>;
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
  activeSubTab: string;
  setActiveSubTab: (subTab: string) => void;
}

const ClanContext = createContext<ClanContextType | undefined>(undefined);

export const ClanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('app_user');
    return saved ? JSON.parse(saved) : null;
  });
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
  const [activeSubTab, setActiveSubTab] = useState('guias');
  
  const DEFAULT_CLAN_ID = 'main-clan';
  const myMember = user ? members.find(m => m.userId === user.uid) || null : null;

  const fetchData = async () => {
    try {
      // 1. Fetch Clan
      const clanRes = await fetch(`/api/clan/${DEFAULT_CLAN_ID}`);
      if (clanRes.ok) {
        const clanData = await clanRes.json();
        setClan(clanData);
      }

      // 2. Fetch Members
      const membersRes = await fetch(`/api/clan/${DEFAULT_CLAN_ID}/members`);
      if (membersRes.ok) {
        const membersData = await membersRes.json();
        setMembers(membersData);
      }

      // 3. Fetch Reports if admin
      const isAdminUser = user?.email === 'ryankevyn3000@gmail.com' || user?.email === 'ryankevyn2020@gmail.com' || myMember?.role === 'leader';
      if (isAdminUser) {
        const reportsRes = await fetch(`/api/clan/${DEFAULT_CLAN_ID}/reports`);
        if (reportsRes.ok) {
          const reportsData = await reportsRes.json();
          setTheftReports(reportsData);
        }
      }
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Poll for updates every 10 seconds to mimic real-time
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [user?.uid, myMember?.role]);

  const login = async (nickname: string, password?: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname, password })
      });
      if (res.ok) {
        const userData = await res.json();
        const fullUser = { uid: userData.userId, email: userData.email, displayName: userData.name };
        setUser(fullUser);
        localStorage.setItem('app_user', JSON.stringify(fullUser));
        await fetchData();
      } else {
        const error = await res.json();
        throw new Error(error.error || 'Login failed');
      }
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (nickname: string, email: string, password?: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname, email, password })
      });
      if (res.ok) {
        const userData = await res.json();
        const fullUser = { uid: userData.userId, email: userData.email, displayName: userData.name };
        setUser(fullUser);
        localStorage.setItem('app_user', JSON.stringify(fullUser));
        await fetchData();
      } else {
        const error = await res.json();
        throw new Error(error.error || 'Registration failed');
      }
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const checkNick = async (nickname: string) => {
    try {
      const res = await fetch(`/api/auth/check-nick/${nickname}`);
      if (res.ok) {
        const data = await res.json();
        return data.exists;
      }
      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const logout = async () => {
    setUser(null);
    setClan(null);
    setMembers([]);
    localStorage.removeItem('app_user');
  };

  const updateMemberData = async (data: Partial<Member>) => {
    if (!user || !myMember) return;

    const { id, ...dataToUpdate } = data as any;
    let finalData = { ...dataToUpdate };

    if (data.xp !== undefined) {
      const newXp = data.xp;
      const thresholds = [0, 100, 250, 500, 1000, 2000, 3500, 5000, 7500, 10000, 15000];
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
      const res = await fetch(`/api/members/${user.uid}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalData)
      });
      if (res.ok) {
        // Optimistic update
        setMembers(prev => prev.map(m => m.userId === user.uid ? { ...m, ...finalData } : m));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const completeMission = async (missionId: string, xpReward: number) => {
    if (!myMember || myMember.completedMissions?.includes(missionId)) return;
    const newCompleted = [...(myMember.completedMissions || []), missionId];
    const newXp = (myMember.xp || 0) + xpReward;
    await updateMemberData({ completedMissions: newCompleted, xp: newXp });
  };

  const markVisitedMissions = async () => {
    if (!myMember || myMember.visitedMissionsBoard) return;
    await updateMemberData({ visitedMissionsBoard: true });
  };

  const deleteMember = async (memberId: string) => {
    if (!user || !myMember) return;
    if (myMember.role !== 'leader' && myMember.userId !== memberId) return;

    try {
      const res = await fetch(`/api/members/${memberId}`, { method: 'DELETE' });
      if (res.ok) {
        if (myMember.userId === memberId) await logout();
        else await fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const banMember = async (memberId: string) => {
    if (!user || !myMember || myMember.role !== 'leader') return;
    try {
      // In this simple version, ban is just delete
      await deleteMember(memberId);
    } catch (err) {
      console.error(err);
    }
  };

  const updateMemberRole = async (memberId: string, role: string) => {
    if (!user || !myMember || myMember.role !== 'leader') return;
    try {
      const res = await fetch(`/api/members/${memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      });
      if (res.ok) await fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const updateClanGuideImage = async (imageUrl: string) => {
    if (!user || !myMember) return;
    try {
      const res = await fetch(`/api/clan/${DEFAULT_CLAN_ID}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guideImagePost1: imageUrl })
      });
      if (res.ok) await fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const updateClanLogo = async (imageUrl: string) => {
    if (!user || !myMember) return;
    try {
      const res = await fetch(`/api/clan/${DEFAULT_CLAN_ID}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logoUrl: imageUrl })
      });
      if (res.ok) await fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const updatePresenceStatus = async (status: 'online' | 'away' | 'offline') => {
    if (!user) return;
    await updateMemberData({ status: status === 'away' ? 'offline' : status });
  };

  const getBrasiliaDate = () => {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const date = new Date(utc + (3600000 * -3));
    return date.toISOString().split('T')[0];
  };

  const claimDailyBonus = async () => {
    if (!user || !myMember) return false;
    const today = getBrasiliaDate();
    if (myMember.lastDailyBonus === today) return false;
    await updateMemberData({ coins: (myMember.coins || 0) + 2, lastDailyBonus: today });
    return true;
  };

  const redeemPromoCode = async (code: string) => {
    if (!user || !myMember) return { success: false, message: 'Usuário não encontrado' };
    const upperCode = code.toUpperCase();
    if (upperCode === 'ORDEMBÔNUS') {
      await updateMemberData({ diamonds: (myMember.diamonds || 0) + 10, coins: (myMember.coins || 0) + 500 });
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
    try {
      await fetch(`/api/clan/${DEFAULT_CLAN_ID}/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reporterId: user.uid, reporterName: myMember.name || 'Guerreiro anônimo' })
      });
      await fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const claimUpdateReward = async () => {
    if (!user || !myMember || myMember.updateRewardClaimed) return;
    await updateMemberData({ coins: (myMember.coins || 0) + 50, updateRewardClaimed: true });
  };

  const clearTheftReport = async (reportId: string) => {
    try {
      const res = await fetch(`/api/reports/${reportId}`, { method: 'DELETE' });
      if (res.ok) await fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleEcoMode = async () => {
    setIsOptimizing(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    const newValue = !isEcoMode;
    setIsEcoMode(newValue);
    localStorage.setItem('isEcoMode', String(newValue));
    setIsOptimizing(false);
  };

  const isAdmin = user?.email === 'ryankevyn3000@gmail.com' || user?.email === 'ryankevyn2020@gmail.com' || myMember?.role === 'leader';

  return (
    <ClanContext.Provider value={{ 
      user, login, clan, members, myMember, loading, isAdmin, logout, 
      updateMemberData, claimDailyBonus, redeemPromoCode, 
      completeMission, markVisitedMissions, deleteMember, banMember, updateMemberRole,
      updateClanGuideImage, updateClanLogo, updatePresenceStatus,
      isEcoMode, toggleEcoMode, isOptimizing,
      reportTheft, theftReports, clearTheftReport,
      claimUpdateReward,
      activeTab, setActiveTab,
      activeSubTab, setActiveSubTab
    }}>
      {children}
    </ClanContext.Provider>
  );
};

export const useClan = () => {
  const context = useContext(ClanContext);
  if (context === undefined) throw new Error('useClan must be used within a ClanProvider');
  return context;
};
