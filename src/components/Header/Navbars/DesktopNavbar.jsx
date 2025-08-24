"use client";

import { links } from "./links";
import DarkModeToggle from "../DarkModeToggle";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeProvider from "@/Providers/ThemeProvider";
import { useNavbarVisibility } from "@/Providers/NavbarVisibilityContext";

const DesktopNavbar = () => {
  const pathname = usePathname();
  const { isNavbarVisible, isScrolled, hasAnimatedIn } = useNavbarVisibility();

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-700 ease-out ${
        isNavbarVisible
          ? "translate-y-0"
          : "-translate-y-full"
      } ${
        isScrolled
          ? "bg-light/95 dark:bg-primary/95 backdrop-blur-xl shadow-lg"
          : "bg-light/80 dark:bg-primary/80 backdrop-blur-md shadow-sm"
      } ${
        hasAnimatedIn ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="container mx-auto flex items-center justify-between px-6 py-4 lg:px-8 lg:py-5">
        {/* Enhanced Logo Section */}
        <Link href="/accueil" aria-label="Go to Accueil" className="group">
          <h1 className="text-xl lg:text-2xl font-bold text-primary dark:text-light group-hover:scale-105 transition-all duration-300">
            M<span className="text-accent transition-all duration-500 group-hover:text-accent/80 group-hover:scale-110">.</span>AKASBI
          </h1>
        </Link>

        {/* Enhanced Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
          {links.map((link) => (
            <Link
              key={link.name}
              href={link.path}
              className={`group relative font-semibold transition-all duration-300 hover:text-accent text-sm xl:text-base px-3 py-2 rounded-lg ${
                link.path === pathname
                  ? "text-accent font-bold"
                  : "text-primary/80 dark:text-light/80 hover:text-accent"
              }`}
              aria-current={link.path === pathname ? "page" : undefined}
            >
              {link.name}
              
              {/* Active Indicator */}
              {link.path === pathname && (
                <span className="absolute -bottom-1 left-0 h-0.5 w-full bg-gradient-to-r from-accent to-accent/80 rounded-full transition-all duration-300"></span>
              )}
              
              {/* Hover Indicator */}
              <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-gradient-to-r from-accent to-accent/80 rounded-full transition-all duration-300 group-hover:w-full"></span>
              
              {/* Background Glow on Hover */}
              <div className="absolute inset-0 bg-accent/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
            </Link>
          ))}
        </nav>

        {/* Enhanced Actions Section */}
        <div className="flex items-center gap-4 lg:gap-6">
          <ThemeProvider>
            <DarkModeToggle />
          </ThemeProvider>
          
          <Link href="/contact" className={`group relative ${pathname === '/contact' ? 'active-contact' : ''}`}>
            <button className={`relative overflow-hidden rounded-full border-2 transition-all duration-500 font-bold text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-accent/50 focus:ring-offset-2 focus:ring-offset-light dark:focus:ring-offset-primary ${ 
              pathname === '/contact' 
                ? 'border-accent/50 bg-light dark:bg-primary text-accent dark:text-accent cursor-default'
                : 'border-accent bg-gradient-to-r from-accent via-accent/95 to-accent/90 text-light shadow-lg hover:shadow-xl hover:shadow-accent/25 hover:scale-105 hover:-translate-y-0.5'
            } px-4 py-2 lg:px-6 lg:py-3`}>
              <span className="relative z-10 flex items-center gap-2">
                Contactez moi
               
              </span>
              
              {/* Animated background layers */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-accent/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-light/20 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
              
              {/* Shimmer effect */}
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-light/30 to-transparent transition-transform duration-1000 group-hover:translate-x-full rounded-full" />
              
              {/* Pulse ring on hover */}
              <div className="absolute inset-0 rounded-full border-2 border-accent/30 opacity-0 scale-100 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" />
            </button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default DesktopNavbar;
