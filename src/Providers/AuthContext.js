"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
  setAuthError(null); // Reset error state on new authentication
        try {
          const response = await fetch('/api/auth/check-admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: user.email }),
            cache: 'no-store'
          });
          const data = await response.json();
          if (data.isAdmin) {
            setUser(user);
            setIsAdmin(true);
          } else {
            setAuthError('Accès refusé. Seuls les administrateurs peuvent se connecter.');
            await signOut(auth);
            setUser(null);
            setIsAdmin(false);
          }
        } catch (error) {
          
          await signOut(auth);
          setUser(null);
          setIsAdmin(false);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      
    }
  };

  const value = {
    user,
    loading,
    isAdmin,
    authError,
    setAuthError,
    signInWithGoogle,
    logout,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};
