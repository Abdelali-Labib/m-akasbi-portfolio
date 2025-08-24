"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/Providers/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import ModernAdminLayout from '@/components/admin/ModernAdminLayout';
import EnhancedDashboard from '@/components/admin/EnhancedDashboard';
import ManageMessages from '@/components/admin/ManageMessages';
import ManageExperiences from '@/components/admin/ManageExperiences';
import ManageFormations from '@/components/admin/ManageFormations';
import ManageProjects from '@/components/admin/ManageProjects';
import ManageSkills from '@/components/admin/ManageSkills';
import ManageContactInfo from '@/components/admin/ManageContactInfo';
import ManageSiteContent from '@/components/admin/ManageSiteContent';
import ManageCloudinary from '@/components/admin/ManageCloudinary';

const AdminClient = () => {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeSection, setActiveSection] = useState('overview');

  // Initialize section from URL params on mount
  useEffect(() => {
    const section = searchParams.get('section');
    if (section) {
      setActiveSection(section);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return <EnhancedDashboard />;
      case 'messages':
        return <ManageMessages />;
      case 'experiences':
        return <ManageExperiences />;
      case 'formations':
        return <ManageFormations />;
      case 'projects':
        return <ManageProjects />;
      case 'skills':
        return <ManageSkills />;
      case 'contactInfo':
        return <ManageContactInfo />;
      case 'siteContent':
        return <ManageSiteContent />;
      case 'cloudinary':
        return <ManageCloudinary />;
      default:
        return <EnhancedDashboard />;
    }
  };

  if (loading || !user || !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-primary dark:text-light">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <ModernAdminLayout 
      activeSection={activeSection} 
      onSectionChange={setActiveSection}
    >
      {renderContent()}
    </ModernAdminLayout>
  );
};

export default AdminClient;