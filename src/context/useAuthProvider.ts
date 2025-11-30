import { useContext } from 'react';
import { AuthContext } from './AuthContext';
import { SupabaseAuthContext } from './SupabaseAuthContext';

export const useAuthProvider = () => {
  const authContext = useContext(AuthContext as any);
  const supabaseContext = useContext(SupabaseAuthContext as any);

  return supabaseContext || authContext;
};
