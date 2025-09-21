"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  FiHome, 
  FiMail, 
  FiBriefcase, 
  FiBookOpen, 
  FiFolder, 
  FiSettings, 
  FiBarChart, 
  FiUser,
  FiMenu,
  FiX,
  FiLogOut,
  FiChevronLeft,
  FiChevronRight,
  FiSun,
  FiMoon,
  FiGlobe,
  FiCloud
} from 'react-icons/fi';
import { useAuth } from '@/Providers/AuthContext';
import { useTheme } from 'next-themes';
import useUnreadMessages from '@/hooks/useUnreadMessages';
import ThemeToggle from '../ui/ThemeToggle';

const ModernAdminLayout = ({ children, activeSection, onSectionChange }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const unreadCount = useUnreadMessages();

  // Handle section persistence with URL params
  useEffect(() => {
    const section = searchParams.get('section');
    if (section && section !== activeSection) {
      onSectionChange(section);
    }
  }, [searchParams]);


  const handleSectionChange = (section) => {
    onSectionChange(section);
    router.push(`/admin?section=${section}`, { shallow: true });
    setSidebarOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const menuItems = [
    { id: 'dashboard', label: 'Tableau de Bord', icon: FiHome },
    { id: 'messages', label: 'Messages', icon: FiMail },
    { id: 'generalContent', label: 'Géneral', icon: FiGlobe },
    { id: 'formations', label: 'Formations', icon: FiBookOpen },
    { id: 'skills', label: 'Compétences', icon: FiSettings },
    { id: 'experiences', label: 'Expériences', icon: FiBriefcase },
    { id: 'projects', label: 'Projets', icon: FiFolder },
    { id: 'contactInfo', label: 'Coordonnées', icon: FiUser },
    { id: 'cloudinary', label: 'Fichiers', icon: FiCloud },
  ];

  const MenuItem = ({ item, isActive, onClick }) => (
    <button
      onClick={onClick}
      aria-current={isActive ? 'page' : undefined}
      aria-label={item.label}
      className={`w-full flex items-center gap-3 py-3 px-4 text-left transition-colors rounded-lg ${
        isActive
          ? 'bg-accent text-white'
          : 'text-primary/70 dark:text-light/70 hover:bg-primary/10 dark:hover:bg-light/10'
      }`}
    >
      <item.icon className="w-5 h-5" />
      <span className="font-medium">{item.label}</span>
    </button>
  );

  return (
  <div className="min-h-screen">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-primary border-r border-primary/20 dark:border-light/20 transform transition-transform duration-300 ease-in-out flex flex-col ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        {/* Sidebar Header */}
        <div className="px-5 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-accent to-accent/80 rounded-xl flex items-center justify-center shadow-lg">
                <FiBarChart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-primary dark:text-light">Administration</h2>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-primary/10 dark:hover:bg-light/10 transition-colors"
            >
              <FiX className="w-5 h-5 text-primary/60 dark:text-light/60" />
            </button>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-1">
            {menuItems.map((item) => (
              <MenuItem
                key={item.id}
                item={item}
                isActive={activeSection === item.id}
                onClick={() => handleSectionChange(item.id)}
              />
            ))}
          </div>
        </nav>

        {/* Logout Button */}
        <div className="p-3 border-t border-primary/20 dark:border-light/20">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 py-2 px-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
          >
            <FiLogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Top Header */}
        <header className="bg-white dark:bg-primary border-b border-primary/20 dark:border-light/20 sticky top-0 z-30">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-primary/10 dark:hover:bg-light/10 transition-colors"
              >
                <FiMenu className="w-5 h-5 text-primary/70 dark:text-light/70" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
                  {React.createElement(menuItems.find(item => item.id === activeSection)?.icon || FiHome, {
                    className: "w-5 h-5 text-white"
                  })}
                </div>
                <h1 className="text-xl font-semibold text-primary dark:text-light">
                  {menuItems.find(item => item.id === activeSection)?.label || activeSection}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleSectionChange('messages')}
                className="relative p-2 rounded-lg hover:bg-primary/10 dark:hover:bg-light/10 transition-colors"
                aria-label={`Voir les messages. ${unreadCount} non lus`}
              >
                <FiMail className="w-5 h-5 text-primary/70 dark:text-light/70" />
                {unreadCount > 0 && (
                                    <span className="absolute top-0 right-0 h-5 min-w-[1.25rem] px-1 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* User Info */}
              <div className="hidden sm:flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-primary dark:text-light">{user?.displayName || 'Admin'}</p>
                  <p className="text-xs text-primary/60 dark:text-light/60">{user?.email}</p>
                </div>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <div className="admin-container">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ModernAdminLayout;
