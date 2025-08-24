"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaGoogle } from 'react-icons/fa';
import { useAuth } from '@/Providers/AuthContext';

const LoginClient = () => {
  const { user, signInWithGoogle, authError, setAuthError } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/admin');
    }
  }, [user, router]);

  const handleLogin = async () => {
    if (setAuthError) setAuthError(null); // Clear previous errors
    try {
      await signInWithGoogle();
    } catch (error) {
    }
  };

  return (
    <div className="page-container flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-8 space-y-8 bg-light dark:bg-primary rounded-3xl shadow-2xl border border-accent/20">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary dark:text-light">Connexion Admin</h1>
          <p className="mt-2 text-primary/80 dark:text-light/80">Veuillez vous connecter pour gérer votre portfolio.</p>
        </div>
        {authError && (
          <div className="text-center p-3 bg-red-100 dark:bg-red-900/30 border border-red-400/50 rounded-lg">
            <p className="text-red-600 dark:text-red-400 font-medium">{authError}</p>
          </div>
        )}
        <button
          onClick={handleLogin}
          className="w-full flex items-center justify-center gap-4 px-8 py-4 font-bold text-light bg-gradient-to-r from-accent to-accent/90 rounded-2xl shadow-xl hover:scale-105 transition-all duration-300"
        >
          <FaGoogle className="h-6 w-6" />
          <span>Se connecter avec Google</span>
        </button>
      </div>
    </div>
  );
};

export default LoginClient; 