import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { User } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [users, setUsers] = useState<{ id: string; name: string }[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(false);

  useEffect(() => {
    const init = async () => {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      if (currentUser) {
        setUser(currentUser);
        await loadProfileAndUsers(currentUser.id);
      }
    };
    init();
  }, []);

  const loadProfileAndUsers = async (userId: string) => {
    setLoadingProfile(true);
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, family_id')
      .eq('user_id', userId)
      .maybeSingle();
    if (profile) {
      setFamilyId(profile.family_id);
      setProfileId(profile.id);
    }
    const { data: usersData } = await supabase.from('profiles').select('id, name');
    setUsers(usersData ?? []);
    setLoadingProfile(false);
  };

  const handleLoginSuccess = async (user: any) => {
    setUser(user);
    await loadProfileAndUsers(user.id);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setFamilyId(null);
    setProfileId(null);
    setUsers([]);
  };

  return { user, familyId, profileId, users, loadingProfile, handleLoginSuccess, handleLogout };
}
