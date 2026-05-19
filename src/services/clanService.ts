export const createInitialClan = async (userId: string, userEmail: string | null) => {
  // Our server already initializes the default clan, but we can hit an endpoint if needed
  // For now, we'll just return as the default clan is created on server start
  return;
};

export const joinClan = async (userId: string, userName: string, userEmail: string | null) => {
  // Our new Login endpoint also handles registration/joining
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, name: userName })
  });
  
  if (!res.ok) throw new Error('Failed to join clan');
};

export const updateMemberAvatar = async (clanId: string, memberId: string, avatarUrl: string) => {
  await fetch(`/api/members/${memberId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ avatarUrl })
  });
};

export const updateMemberStatus = async (clanId: string, memberId: string, status: 'online' | 'offline') => {
  await fetch(`/api/members/${memberId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
};

export const postAnnouncement = async (clanId: string, authorId: string, title: string, content: string) => {
  // announcements not yet implemented in backend, ignoring for now
};
