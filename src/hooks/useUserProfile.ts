import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { createAuthenticatedApi } from '@/services/api';
import { useApiAuth } from './useApiAuth';
import type { ProfileUser, UserProfileResponse } from '@/types/api';

export function useUserProfile() {
  const { isSignedIn } = useAuth();
  const { getAuthHeaders } = useApiAuth();
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previousRole, setPreviousRole] = useState<string | null>(null);

  const api = createAuthenticatedApi(getAuthHeaders);

  // Fetch user profile
  const fetchProfile = useCallback(async () => {
    if (!isSignedIn) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.getProfile();
      
      if (previousRole && previousRole !== response.user.role) {
        console.log('Role changed from', previousRole, 'to', response.user.role);
        window.dispatchEvent(new CustomEvent('roleChanged', { 
          detail: { 
            from: previousRole, 
            to: response.user.role 
          } 
        }));
      }
      
      setPreviousRole(response.user.role);
      setUser(response.user);
      console.log('User profile loaded:', response.user);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load profile';
      setError(errorMessage);
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  }, [isSignedIn, api, previousRole]);

  // Update user profile
  const updateProfile = async (userData: { email?: string }) => {
    if (!isSignedIn) throw new Error('Not authenticated');
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.updateProfile(userData);
      setUser(response.user);
      console.log('User profile updated:', response.user);
      return response.user;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
      setError(errorMessage);
      console.error('Error updating profile:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSignedIn && !user && !loading) {
      fetchProfile();
    }
  }, [isSignedIn, user, loading, fetchProfile]);

  useEffect(() => {
    const handleRoleUpdate = () => {
      console.log('User role updated event received, refreshing profile...');
      if (isSignedIn) {
        fetchProfile();
      }
    };

    window.addEventListener('userRoleUpdated', handleRoleUpdate);
    return () => {
      window.removeEventListener('userRoleUpdated', handleRoleUpdate);
    };
  }, [isSignedIn, fetchProfile]);

  return {
    user,
    loading,
    error,
    fetchProfile,
    updateProfile,
    isAdmin: user?.role === 'admin',
    isAssistant: user?.role === 'assistant' || user?.role === 'admin',
    isUser: !!user
  };
}