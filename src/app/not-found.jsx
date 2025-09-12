"use client";

import { FiAlertTriangle, FiHome } from 'react-icons/fi';
import Link from 'next/link';
import AnimatedItem from '@/components/ui/AnimatedItem';

/**
 * Custom 404 Not Found page - Modern design with visual elements
 */
export default function NotFound() {
  return (
    <section className="min-h-screen flex items-center justify-center bg-light dark:bg-primary relative overflow-hidden">
      <div className="relative z-10 text-center px-6">
        <AnimatedItem delay={0.1}>
          <div className="relative mb-8">
            <div className="absolute -top-4 right-6 md:-top-8 md:-right-8">
              <FiAlertTriangle className="w-8 h-8 md:w-16 md:h-16 text-accent/60" />
            </div>
            <h1 className="text-8xl md:text-9xl font-black bg-gradient-to-r from-accent via-accent/80 to-accent/60 bg-clip-text text-transparent leading-none">
              404
            </h1>
          </div>
        </AnimatedItem>

        <AnimatedItem delay={0.2}>
          <div className="mb-8 space-y-4">
            <h2 className="text-2xl md:text-3xl font-bold text-primary dark:text-light">
              Page introuvable
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
              La page que vous cherchez n'existe pas ou a été déplacée.
            </p>
          </div>
        </AnimatedItem>

        <AnimatedItem delay={0.3}>
          <Link 
            href="/accueil"
            className="inline-flex items-center gap-2 btn-primary-cta"
          >
            <FiHome className="w-4 h-4" />
            Retour à l'accueil
          </Link>
        </AnimatedItem>
      </div>
    </section>
  );
}
