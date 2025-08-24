"use client";

import { useInView } from 'react-intersection-observer';

/**
 * Reusable animated wrapper component that triggers fade-in animation when scrolled into view
 * @param {React.ReactNode} children - Content to animate
 * @param {number} delay - Animation delay in milliseconds
 * @param {string} className - Additional CSS classes
 */
const AnimatedItem = ({ children, delay = 0, className = "" }) => {
  // Trigger animation when element comes into viewport
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export default AnimatedItem;
