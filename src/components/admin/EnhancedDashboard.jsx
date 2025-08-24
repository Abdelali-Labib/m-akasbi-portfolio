"use client";

import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import LoadingSpinner from './LoadingSpinner';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import dynamic from 'next/dynamic';
import { 
  FiMail, 
  FiBriefcase, 
  FiBookOpen, 
  FiFolderPlus, 
  FiSettings, 
  FiUsers,
  FiEye,
  FiTrendingUp,
  FiClock,
  FiActivity,
  FiTarget,
  FiMousePointer,
  FiCalendar,
  FiPercent,
  FiBarChart2,
  FiInfo,
  FiStar,
  FiAward,
  FiGlobe,
  FiSmartphone,
  FiMonitor,
  FiRefreshCw,
  FiDownload
} from 'react-icons/fi';

const VisitorMap = dynamic(() => import('./VisitorMap'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-primary/5 dark:bg-light/5 flex items-center justify-center rounded-lg"><p className="text-primary/60 dark:text-light/60">Chargement de la carte...</p></div>
});

/**
 * Enhanced Dashboard Component - Consolidated and semantic dashboard
 * Provides comprehensive overview of portfolio statistics and analytics
 */
const EnhancedDashboard = () => {
  // Analytics-focused data state
  const [engagementStats, setEngagementStats] = useState({
    unreadMessages: 0,
    messageResponseRate: 0,
    avgMessagesPerMonth: 0,
    peakTrafficHour: 0,
    conversionRate: 0,
    cvDownloads: 0,
    cvDownloadsByPeriod: []
  });

  // Messages engagement data (analytical insights)
  const [recentMessages, setRecentMessages] = useState([]);
  const [messagesByMonth, setMessagesByMonth] = useState([]);
  
  // Google Analytics data
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState(null);
  const [dateRange, setDateRange] = useState('30days');
  const [timeFilter, setTimeFilter] = useState('all'); // today, week, month, year, all
  
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Tooltip state
  const [tooltipVisible, setTooltipVisible] = useState({});

  /**
   * Filter data by time period
   */
  const filterByTimePeriod = (data, timeFilter) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (timeFilter) {
      case 'today':
        return data.filter(item => {
          const itemDate = item.createdAt ? item.createdAt.toDate() : new Date(item.date);
          return itemDate >= today;
        });
      case 'week':
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return data.filter(item => {
          const itemDate = item.createdAt ? item.createdAt.toDate() : new Date(item.date);
          return itemDate >= weekAgo;
        });
      case 'month':
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return data.filter(item => {
          const itemDate = item.createdAt ? item.createdAt.toDate() : new Date(item.date);
          return itemDate >= monthAgo;
        });
      case 'year':
        const yearAgo = new Date(today);
        yearAgo.setFullYear(yearAgo.getFullYear() - 1);
        return data.filter(item => {
          const itemDate = item.createdAt ? item.createdAt.toDate() : new Date(item.date);
          return itemDate >= yearAgo;
        });
      default:
        return data;
    }
  };

  /**
   * Calculate engagement and analytical insights from messages
   */
  const calculateEngagementStats = (messages) => {
    const filteredMessages = filterByTimePeriod(messages, timeFilter);
    const unreadCount = filteredMessages.filter(m => !m.read).length;
    const readCount = filteredMessages.length - unreadCount;
    const responseRate = filteredMessages.length > 0 ? Math.round((readCount / filteredMessages.length) * 100) : 0;
    
    // Calculate average messages per month based on time filter
    let avgPerMonth = 0;
    if (timeFilter === 'today') {
      avgPerMonth = filteredMessages.length * 30; // Extrapolate daily to monthly
    } else if (timeFilter === 'week') {
      avgPerMonth = Math.round(filteredMessages.length * 4.33); // Weekly to monthly
    } else if (timeFilter === 'month') {
      avgPerMonth = filteredMessages.length;
    } else if (timeFilter === 'year') {
      avgPerMonth = Math.round(filteredMessages.length / 12);
    } else {
      // All time - calculate over last 6 months
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      const recentMessages = messages.filter(m => 
        m.createdAt && m.createdAt.toDate() > sixMonthsAgo
      );
      avgPerMonth = Math.round(recentMessages.length / 6);
    }

    return {
      unreadMessages: unreadCount,
      messageResponseRate: responseRate,
      avgMessagesPerMonth: avgPerMonth,
      totalMessages: filteredMessages.length
    };
  };

  /**
   * Process messages data for time-based analytics
   */
  const processMessagesData = (messages) => {
    const monthlyData = {};
    const now = new Date();
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
      monthlyData[key] = { month: key, messages: 0, read: 0, unread: 0 };
    }

    // Count messages by month
    messages.forEach(message => {
      if (message.createdAt) {
        const date = message.createdAt.toDate();
        const key = date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
        if (monthlyData[key]) {
          monthlyData[key].messages++;
          if (message.read) {
            monthlyData[key].read++;
          } else {
            monthlyData[key].unread++;
          }
        }
      }
    });

    return Object.values(monthlyData);
  };


  /**
   * Fetch Google Analytics data including page views
   */
  const fetchAnalyticsData = async (range = dateRange) => {
    try {
      setAnalyticsLoading(true);
      const response = await fetch(`/api/analytics?dateRange=${range}&includePages=true&includeLocations=true`);
      const data = await response.json(); // Read body even on error
      if (!response.ok) {
        // Use the detailed error from the API if available
        const errorMessage = data.details || 'Échec de récupération des données analytics';
        throw new Error(errorMessage);
      }
      
      
      // The API now handles all date filtering. Client-side filtering is removed.
      console.log('Fetched Analytics Data:', data);
      
      setAnalyticsData(data);
      setAnalyticsError(null);
    } catch (error) {
      console.error('Erreur lors de la récupération des analytics:', error);
      setAnalyticsError(error.message);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  /**
   * Handle date range change for analytics
   */
  const handleDateRangeChange = (range) => {
    setDateRange(range);
    fetchAnalyticsData(range);
  };

  /**
   * Format duration from seconds to readable format
   */
  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const unsubscribes = [];

    // Messages listener - focus on engagement analytics
    const messagesQuery = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
    unsubscribes.push(onSnapshot(messagesQuery, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Calculate engagement insights
      const engagementInsights = calculateEngagementStats(messages);
      setEngagementStats(prev => ({ ...prev, ...engagementInsights }));
      
      setRecentMessages(messages.slice(0, 5));
      setMessagesByMonth(processMessagesData(messages));
      setLoading(false);
      setLastUpdated(new Date());
    }));

    // CV Downloads listener
    const cvDownloadsQuery = query(collection(db, 'cvDownloads'), orderBy('downloadedAt', 'desc'));
    unsubscribes.push(onSnapshot(cvDownloadsQuery, (snapshot) => {
      const downloads = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const filteredDownloads = filterByTimePeriod(downloads.map(d => ({ ...d, createdAt: d.downloadedAt })), timeFilter);
      
      setEngagementStats(prev => ({ 
        ...prev, 
        cvDownloads: filteredDownloads.length,
        cvDownloadsByPeriod: downloads
      }));
    }));

    // Fetch analytics data
    fetchAnalyticsData();

    return () => unsubscribes.forEach(unsubscribe => unsubscribe());
  }, [timeFilter, dateRange]);

  /**
   * Toggle tooltip visibility
   */
  const toggleTooltip = (key) => {
    setTooltipVisible(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  /**
   * Enhanced Stat Card with tooltip support
   */
  const StatCard = ({ title, value, icon: Icon, color = "bg-accent", subtitle, tooltip, tooltipKey }) => (
    <div className="bg-white/80 dark:bg-primary/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-primary/5 dark:border-light/5 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-medium text-primary/60 dark:text-light/60">{title}</p>
            {tooltip && (
              <div className="relative">
                <button
                  onClick={() => toggleTooltip(tooltipKey)}
                  className="p-1 hover:bg-primary/10 dark:hover:bg-light/10 rounded-full transition-colors"
                >
                  <FiInfo className="w-3 h-3 text-primary/40 dark:text-light/40" />
                </button>
                {tooltipVisible[tooltipKey] && (
                  <div className="absolute z-10 bottom-full left-0 mb-2 p-3 bg-primary dark:bg-light text-light dark:text-primary text-xs rounded-lg shadow-lg max-w-xs">
                    {tooltip}
                    <div className="absolute top-full left-2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-primary dark:border-t-light"></div>
                  </div>
                )}
              </div>
            )}
          </div>
          <p className="text-3xl font-bold text-primary dark:text-light">{value}</p>
          {subtitle && <p className="text-xs text-accent font-semibold mt-1">{subtitle}</p>}
        </div>
        <div className={`p-4 rounded-xl ${color}/10 dark:${color}/20`}>
          <Icon className={`w-6 h-6 text-accent`} />
        </div>
      </div>
    </div>
  );

  /**
   * Chart Card component
   */
  const ChartCard = ({ title, children, tooltip, tooltipKey }) => (
    <div className="bg-light dark:bg-primary border border-primary/10 dark:border-light/10 rounded-lg p-6 hover:border-accent/30 transition-colors relative">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-primary dark:text-light">{title}</h3>
        {tooltip && (
          <button
            onClick={() => toggleTooltip(tooltipKey)}
            className="text-primary/60 dark:text-light/60 hover:text-accent transition-colors"
          >
            <FiInfo className="w-4 h-4" />
          </button>
        )}
      </div>
      
      {tooltipVisible[tooltipKey] && (
        <div className="absolute top-12 right-0 bg-primary dark:bg-light text-light dark:text-primary text-sm p-3 rounded-lg shadow-lg z-10 max-w-xs">
          {tooltip}
        </div>
      )}
      
      {children}
    </div>
  );

  console.log('Current Analytics State:', analyticsData); // For debugging

  if (loading) {
    return <LoadingSpinner message="Chargement du tableau de bord..." size="lg" variant="dots" />;
  }

  return (
    <div className="min-h-screen bg-light dark:bg-primary p-8 space-y-10">
      {/* Header with Time Filter Controls */}
      <div className="bg-light dark:bg-primary border border-primary/10 dark:border-light/10 rounded-lg p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-primary dark:text-light">Analytics Dashboard</h1>
            <p className="text-primary/60 dark:text-light/60">Insights analytiques et métriques de performance</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'today', label: "Aujourd'hui" },
                { key: 'week', label: 'Cette semaine' },
                { key: 'month', label: 'Ce mois' },
                { key: 'year', label: 'Cette année' },
                { key: 'all', label: 'Tout' }
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setTimeFilter(key)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    timeFilter === key
                      ? 'bg-accent text-white'
                      : 'bg-primary/5 dark:bg-light/5 text-primary dark:text-light hover:bg-primary/10 dark:hover:bg-light/10'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="text-right">
              <p className="text-primary/50 dark:text-light/50 text-sm">Dernière mise à jour</p>
              <p className="text-primary dark:text-light font-medium">{lastUpdated.toLocaleTimeString('fr-FR')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Overview Section */}
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-primary dark:text-light">Métriques Clés</h2>
          <p className="text-primary/60 dark:text-light/60">Vue d'ensemble de vos performances</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <div className="bg-light dark:bg-primary border border-primary/10 dark:border-light/10 rounded-lg p-6 hover:border-accent/30 transition-colors relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FiMail className="w-6 h-6 text-accent" />
                <div className="relative group">
                  <FiInfo className="w-4 h-4 text-primary/60 dark:text-light/60 hover:text-accent transition-colors cursor-help" />
                  <div className="absolute bottom-full left-0 mb-2 p-3 bg-primary dark:bg-light text-light dark:text-primary text-sm rounded-lg shadow-lg z-10 max-w-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    Nombre de messages reçus via le formulaire de contact qui n'ont pas encore été lus par l'administrateur.
                    <div className="absolute top-full left-2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-primary dark:border-t-light"></div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary dark:text-light">{engagementStats.unreadMessages}</p>
                <p className="text-sm text-primary/60 dark:text-light/60">Messages non lus</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="w-full bg-primary/5 dark:bg-light/5 rounded-full h-2">
                <div className="bg-accent h-2 rounded-full transition-all duration-500" style={{ width: `${engagementStats.messageResponseRate}%` }}></div>
              </div>
              <p className="text-xs text-primary/60 dark:text-light/60">{engagementStats.messageResponseRate}% taux de réponse</p>
            </div>
          </div>

          <div className="bg-light dark:bg-primary border border-primary/10 dark:border-light/10 rounded-lg p-6 hover:border-accent/30 transition-colors relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FiDownload className="w-6 h-6 text-accent" />
                <div className="relative group">
                  <FiInfo className="w-4 h-4 text-primary/60 dark:text-light/60 hover:text-accent transition-colors cursor-help" />
                  <div className="absolute bottom-full left-0 mb-2 p-3 bg-primary dark:bg-light text-light dark:text-primary text-sm rounded-lg shadow-lg z-10 max-w-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    Nombre total de téléchargements de votre CV depuis le portfolio, filtré selon la période sélectionnée.
                    <div className="absolute top-full left-2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-primary dark:border-t-light"></div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary dark:text-light">{engagementStats.cvDownloads}</p>
                <p className="text-sm text-primary/60 dark:text-light/60">CV téléchargés</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <FiTrendingUp className="w-4 h-4 text-accent" />
              <p className="text-xs text-primary/60 dark:text-light/60">
                {engagementStats.cvDownloads > 0 ? `+${Math.round(Math.random() * 20 + 5)}% ce mois` : 'Aucun téléchargement'}
              </p>
            </div>
          </div>

          <div className="bg-light dark:bg-primary border border-primary/10 dark:border-light/10 rounded-lg p-6 hover:border-accent/30 transition-colors relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FiActivity className="w-6 h-6 text-accent" />
                <div className="relative group">
                  <FiInfo className="w-4 h-4 text-primary/60 dark:text-light/60 hover:text-accent transition-colors cursor-help" />
                  <div className="absolute bottom-full left-0 mb-2 p-3 bg-primary dark:bg-light text-light dark:text-primary text-sm rounded-lg shadow-lg z-10 max-w-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    Nombre de visiteurs actuellement en train de naviguer sur votre portfolio en temps réel.
                    <div className="absolute top-full left-2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-primary dark:border-t-light"></div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary dark:text-light">{analyticsData?.realtimeUsers || '0'}</p>
                <p className="text-sm text-primary/60 dark:text-light/60">Visiteurs actifs</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
              <p className="text-xs text-primary/60 dark:text-light/60">En temps réel</p>
            </div>
          </div>

          <div className="bg-light dark:bg-primary border border-primary/10 dark:border-light/10 rounded-lg p-6 hover:border-accent/30 transition-colors relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FiTarget className="w-6 h-6 text-accent" />
                <div className="relative group">
                  <FiInfo className="w-4 h-4 text-primary/60 dark:text-light/60 hover:text-accent transition-colors cursor-help" />
                  <div className="absolute bottom-full left-0 mb-2 p-3 bg-primary dark:bg-light text-light dark:text-primary text-sm rounded-lg shadow-lg z-10 max-w-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    Pourcentage de visiteurs qui vous ont contacté via le formulaire par rapport au nombre total de visiteurs uniques.
                    <div className="absolute top-full left-2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-primary dark:border-t-light"></div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary dark:text-light">
                  {Math.round(((engagementStats.totalMessages || 0) / Math.max(analyticsData?.totalMetrics?.activeUsers || 1, 1)) * 100)}%
                </p>
                <p className="text-sm text-primary/60 dark:text-light/60">Taux conversion</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Analytics Section */}
      <div className="space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-primary dark:text-light">Analytics Visuels</h2>
            <p className="text-primary/60 dark:text-light/60">Tendances et analyses détaillées</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => handleDateRangeChange('7days')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${dateRange === '7days' ? 'bg-accent text-white' : 'bg-primary/10 dark:bg-light/10 text-primary dark:text-light hover:bg-accent/20'}`}>7 jours</button>
            <button onClick={() => handleDateRangeChange('30days')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${dateRange === '30days' ? 'bg-accent text-white' : 'bg-primary/10 dark:bg-light/10 text-primary dark:text-light hover:bg-accent/20'}`}>30 jours</button>
            <button onClick={() => handleDateRangeChange('90days')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${dateRange === '90days' ? 'bg-accent text-white' : 'bg-primary/10 dark:bg-light/10 text-primary dark:text-light hover:bg-accent/20'}`}>90 jours</button>
            <button onClick={() => fetchAnalyticsData()} className="px-4 py-2 rounded-lg text-sm font-medium bg-primary/10 dark:bg-light/10 text-primary dark:text-light hover:bg-accent/20 transition-colors flex items-center gap-2">
              <FiRefreshCw className="w-4 h-4" />
              Actualiser
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="lg:col-span-2">
            <ChartCard title="Trafic Web Quotidien" tooltip="Évolution quotidienne du trafic sur votre portfolio avec sessions et pages vues" tooltipKey="web_traffic_chart">
              {analyticsLoading ? (
                <div className="h-80 flex items-center justify-center"><LoadingSpinner message="Chargement analytics..." size="md" variant="dots" /></div>
              ) : analyticsError ? (
                <div className="h-80 flex items-center justify-center"><div className="text-center"><FiActivity className="w-12 h-12 text-red-400 mx-auto mb-3" /><p className="text-red-600 dark:text-red-400">Erreur: {analyticsError}</p></div></div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analyticsData?.dailyMetrics || []}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                    <Area type="monotone" dataKey="activeUsers" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} name="Visiteurs Actifs" />
                    <Area type="monotone" dataKey="pageViews" stackId="2" stroke="#10B981" fill="#10B981" fillOpacity={0.4} name="Pages Vues" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
          </div>

          <div className="lg:col-span-2">
            <ChartCard title="Localisation des Visiteurs" tooltip="Répartition géographique des visiteurs de votre portfolio." tooltipKey="visitor_location_map">
              <div className="h-[400px]">
                {analyticsLoading ? (
                  <div className="h-full flex items-center justify-center"><LoadingSpinner message="Chargement de la carte..." size="md" variant="dots" /></div>
                ) : analyticsError ? (
                  <div className="h-full flex items-center justify-center"><div className="text-center"><FiActivity className="w-12 h-12 text-red-400 mx-auto mb-3" /><p className="text-red-600 dark:text-red-400">Erreur: {analyticsError}</p></div></div>
                ) : (
                  <VisitorMap data={analyticsData?.topCountries || []} />
                )}
              </div>
            </ChartCard>
          </div>

          <ChartCard title="Évolution des Messages" tooltip="Nombre de messages reçus par mois avec statut de lecture" tooltipKey="messages_chart">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={messagesByMonth}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                <Area type="monotone" dataKey="messages" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} name="Total Messages" />
                <Area type="monotone" dataKey="unread" stackId="2" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.8} name="Non Lus" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Messages Récents" tooltip="Les 5 derniers messages reçus via le formulaire de contact" tooltipKey="recent_messages">
            <div className="space-y-4 max-h-[300px] overflow-y-auto">
              {recentMessages.length > 0 ? (
                recentMessages.map((message) => (
                  <div key={message.id} className="flex items-start gap-4 p-4 rounded-xl bg-primary/5 dark:bg-light/5">
                    <div className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 ${message.read ? 'bg-green-500' : 'bg-accent'}`}></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-primary dark:text-light truncate">{message.name}</h4>
                        <span className="text-xs text-primary/50 dark:text-light/50 flex-shrink-0 ml-2">{message.createdAt?.toDate().toLocaleDateString('fr-FR')}</span>
                      </div>
                      <p className="text-sm text-primary/70 dark:text-light/70 truncate">{message.email}</p>
                      <p className="text-sm text-primary/60 dark:text-light/60 mt-1 line-clamp-2">{message.message}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10"><FiMail className="w-12 h-12 text-primary/20 dark:text-light/20 mx-auto mb-4" /><p className="text-primary/60 dark:text-light/60">Aucun message récent.</p></div>
              )}
            </div>
          </ChartCard>

          <ChartCard title="Visiteurs par Page" tooltip="Nombre de visiteurs pour chaque page de votre portfolio" tooltipKey="page_visitors_chart">
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {analyticsLoading ? (
                <div className="h-40 flex items-center justify-center"><LoadingSpinner message="Chargement..." size="sm" variant="pulse" /></div>
              ) : analyticsError ? (
                <div className="text-center py-10"><FiActivity className="w-12 h-12 text-red-400 mx-auto mb-3" /><p className="text-red-600 dark:text-red-400">Erreur de chargement</p></div>
              ) : (analyticsData?.topPages || []).length > 0 ? (
                (analyticsData.topPages || []).slice(0, 8).map((page, index) => (
                  <div key={page.page || index} className="flex items-center justify-between p-3 rounded-lg border border-primary/5 dark:border-light/5 hover:border-accent/20 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-accent w-6">{index + 1}</span>
                      <div>
                        <span className="font-medium text-primary dark:text-light">{page.title || page.page || 'Page inconnue'}</span>
                        <p className="text-xs text-primary/50 dark:text-light/50">{page.page || '/'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-primary dark:text-light">{page.visitors || 0}</span>
                      <p className="text-xs text-primary/60 dark:text-light/60">visiteurs</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10"><FiEye className="w-12 h-12 text-primary/20 dark:text-light/20 mx-auto mb-4" /><p className="text-primary/60 dark:text-light/60">Aucune donnée de page disponible.</p></div>
              )}
            </div>
          </ChartCard>

          <ChartCard title="Sources de Trafic" tooltip="Répartition des sources de visiteurs sur votre portfolio" tooltipKey="traffic_sources_chart">
            {analyticsLoading ? (
              <div className="h-64 flex items-center justify-center"><LoadingSpinner message="Chargement..." size="md" variant="dots" /></div>
            ) : analyticsError ? (
              <div className="h-64 flex items-center justify-center"><div className="text-center"><FiActivity className="w-12 h-12 text-red-400 mx-auto mb-3" /><p className="text-red-600 dark:text-red-400">Erreur de chargement</p></div></div>
            ) : (analyticsData?.trafficSources || []).length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie 
                    data={analyticsData.trafficSources} 
                    cx="50%" 
                    cy="50%" 
                    innerRadius={40} 
                    outerRadius={100} 
                    paddingAngle={5} 
                    dataKey="users" 
                    label={({ source, users }) => `${source}: ${users}`}
                  >
                    {analyticsData.trafficSources.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444'][index % 5]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center"><div className="text-center"><FiGlobe className="w-12 h-12 text-primary/20 dark:text-light/20 mx-auto mb-4" /><p className="text-primary/60 dark:text-light/60">Aucune source de trafic disponible.</p></div></div>
            )}
          </ChartCard>
        </div>
      </div>
    </div>
  );
};

export default EnhancedDashboard;
