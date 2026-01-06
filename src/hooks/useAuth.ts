import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { User } from '@supabase/supabase-js';

// Custom hook: manages authentication state and related profile/family data.
// - exposes the current Supabase user, selected profile id, family id, and available users
// - provides handlers to react to login success and to log out
export function useAuth() {
  // Authenticated Supabase user (null when signed out)
  const [user, setUser] = useState<User | null>(null);
  // The currently selected family id derived from the user's profile
  const [familyId, setFamilyId] = useState<string | null>(null);
  // The id of the user's active profile (may be used as an actor id)
  const [profileId, setProfileId] = useState<string | null>(null);
  // Cached list of users/profiles for the current family (id + name)
  const [users, setUsers] = useState<{ id: string; name: string }[]>([]);
  // Loading flag while profile and users are being fetched
  const [loadingProfile, setLoadingProfile] = useState(false);

  // On mount: check Supabase auth state and load profile/users if a user is signed in
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

  // Loads the user's profile (to discover family and profile ids) and the list of profiles/users
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
      
      // Load users for this specific family
      const { data: usersData } = await supabase
        .from('profiles')
        .select('id, name')
        .eq('family_id', profile.family_id);
      setUsers(usersData ?? []);
    }
    setLoadingProfile(false);
  };

  // Called after a successful login (e.g., from the Login component): sets the user and loads profile data
  const handleLoginSuccess = async (user: any) => {
    setUser(user);
    await loadProfileAndUsers(user.id);
  };

  // Sign out the current user and reset all related local state
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setFamilyId(null);
    setProfileId(null);
    setUsers([]);
  };

  return { user, familyId, profileId, users, loadingProfile, handleLoginSuccess, handleLogout };
}
