"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/Providers/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import ModernAdminLayout from '@/components/admin/ModernAdminLayout';
import EnhancedAnalyticsDashboard from '@/components/admin/analytics/EnhancedAnalyticsDashboard';
import ManageMessages from '@/components/admin/management/ManageMessages';
import ManageExperiences from '@/components/admin/management/ManageExperiences';
import ManageFormations from '@/components/admin/management/ManageFormations';
import ManageProjects from '@/components/admin/management/ManageProjects';
import ManageSkills from '@/components/admin/management/ManageSkills';
import ManageContactInfo from '@/components/admin/management/ManageContactInfo';
import ManageSiteContent from '@/components/admin/management/ManageSiteContent';
import ManageCloudinary from '@/components/admin/management/ManageCloudinary';

const AdminClient = ({ analyticsData }) => {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeSection, setActiveSection] = useState('dashboard');

  // Initialize section from URL params on mount
  useEffect(() => {
    const section = searchParams.get('section');
    if (section) {
      setActiveSection(section);
    } else {
      // Redirect to dashboard if no section is specified
      router.push('/admin?section=dashboard');
    }
  }, [searchParams, router]);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <EnhancedAnalyticsDashboard analyticsData={analyticsData} />;
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
      case 'generalContent':
        return <ManageSiteContent />;
      case 'cloudinary':
        return <ManageCloudinary />;
      default:
        return <EnhancedAnalyticsDashboard analyticsData={analyticsData} />;
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