"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
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
  Area,
  ComposedChart,
  RadialBarChart,
  RadialBar,
  Legend
} from 'recharts';
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
  FiGlobe,
  FiSmartphone,
  FiMonitor,
  FiActivity,
  FiRefreshCw,
  FiTarget,
  FiMousePointer,
  FiShare2,
  FiSearch,
  FiCalendar,
  FiPercent,
  FiBarChart2
} from 'react-icons/fi';

const WorldMapChart = dynamic(() => import('./WorldMapChart'), {
  ssr: false,
  loading: () => <div style={{ width: '100%', height: '400px' }} className="animate-pulse bg-primary/10 dark:bg-light/10 rounded-lg"></div>
});

const DashboardOverview = () => {
  const [stats, setStats] = useState({
    messages: 0,
    experiences: 0,
    formations: 0,
    projects: 0,
    skills: 0,
    unreadMessages: 0
  });
  const [recentMessages, setRecentMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Analytics state
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState(null);
  const [dateRange, setDateRange] = useState('30days');
  const [refreshing, setRefreshing] = useState(false);

  // Analytics functions
  const fetchAnalyticsData = async (range = dateRange) => {
    try {
      setRefreshing(true);
      const response = await fetch(`/api/analytics?dateRange=${range}`);
      if (!response.ok) {
        throw new Error('Échec de récupération des données');
      }
      const result = await response.json();
      setAnalyticsData(result);
      setAnalyticsError(null);
    } catch (err) {
      setAnalyticsError(err.message);
    } finally {
      setAnalyticsLoading(false);
      setRefreshing(false);
    }
  };

  const handleDateRangeChange = (range) => {
    setDateRange(range);
    setAnalyticsLoading(true);
    fetchAnalyticsData(range);
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Translation functions
  const translateCountry = (country) => {
    const translations = {
      'United States': 'États-Unis',
      'France': 'France',
      'Canada': 'Canada',
      'United Kingdom': 'Royaume-Uni',
      'Germany': 'Allemagne',
      'Spain': 'Espagne',
      'Italy': 'Italie',
      'Netherlands': 'Pays-Bas',
      'Belgium': 'Belgique',
      'Switzerland': 'Suisse',
      'Morocco': 'Maroc',
      'Algeria': 'Algérie',
      'Tunisia': 'Tunisie'
    };
    return translations[country] || country;
  };

  const translateChannel = (channel) => {
    const translations = {
      'Organic Search': 'Recherche Organique',
      'Direct': 'Direct',
      'Social': 'Réseaux Sociaux',
      'Referral': 'Référencement',
      'Email': 'Email',
      'Paid Search': 'Recherche Payante',
      'Display': 'Affichage',
      'Video': 'Vidéo',
      'Organic Social': 'Social Organique',
      'Organic Video': 'Vidéo Organique'
    };
    return translations[channel] || channel;
  };

  const translateDevice = (device) => {
    const translations = {
      'desktop': 'Ordinateur',
      'mobile': 'Mobile',
      'tablet': 'Tablette'
    };
    return translations[device] || device;
  };


  useEffect(() => {
    const unsubscribes = [];
    
    // Fetch analytics data
    fetchAnalyticsData();

    // Messages
    const messagesQuery = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
    unsubscribes.push(onSnapshot(messagesQuery, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStats(prev => ({ 
        ...prev, 
        messages: messages.length,
        unreadMessages: messages.filter(m => !m.read).length
      }));
      setRecentMessages(messages.slice(0, 5));
    }));

    // Experiences
    unsubscribes.push(onSnapshot(collection(db, 'experiences'), (snapshot) => {
      setStats(prev => ({ ...prev, experiences: snapshot.size }));
    }));

    // Formations
    unsubscribes.push(onSnapshot(collection(db, 'formations'), (snapshot) => {
      setStats(prev => ({ ...prev, formations: snapshot.size }));
    }));

    // Projects
    unsubscribes.push(onSnapshot(collection(db, 'projects'), (snapshot) => {
      setStats(prev => ({ ...prev, projects: snapshot.size }));
    }));

    // Skills
    unsubscribes.push(onSnapshot(collection(db, 'skills'), (snapshot) => {
      setStats(prev => ({ ...prev, skills: snapshot.size }));
      setLoading(false); // Set loading to false after all data is loaded
    }));

    return () => unsubscribes.forEach(unsubscribe => unsubscribe());
  }, []);

  // Component definitions
  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className="bg-white/80 dark:bg-primary/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-primary/5 dark:border-light/5 hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-primary/60 dark:text-light/60">{title}</p>
          <p className="text-3xl font-bold text-primary dark:text-light mt-1">{value}</p>
          {subtitle && <p className="text-xs text-accent font-semibold mt-1">{subtitle}</p>}
        </div>
        <div className="p-4 rounded-xl bg-accent/10 dark:bg-accent/20">
          <Icon className="w-6 h-6 text-accent" />
        </div>
      </div>
    </div>
  );

  const MetricCard = ({ title, value, change, icon: Icon, color, subtitle }) => (
    <div className="bg-white dark:bg-primary rounded-2xl p-4 sm:p-6 shadow-sm border border-primary/5 dark:border-light/5">
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm font-medium text-primary/60 dark:text-light/60 truncate">{title}</p>
          <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary dark:text-light mt-1">{value}</p>
          {subtitle && <p className="text-xs text-primary/50 dark:text-light/50 mt-1 truncate">{subtitle}</p>}
        </div>
        <div className={`p-3 sm:p-4 rounded-xl flex-shrink-0 ${color}`}>
          <Icon className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
        </div>
      </div>
    </div>
  );

  const ChartCard = ({ title, children, className = "" }) => (
    <div className={`bg-white dark:bg-primary rounded-2xl p-4 sm:p-6 shadow-sm border border-primary/5 dark:border-light/5 ${className}`}>
      <h3 className="text-base sm:text-lg font-semibold text-primary dark:text-light mb-4 sm:mb-6">{title}</h3>
      {children}
    </div>
  );

  const DateRangeButton = ({ range, label, active, onClick }) => (
    <button
      onClick={() => onClick(range)}
      className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        active
          ? 'bg-accent text-white'
          : 'bg-primary/10 dark:bg-light/10 text-primary dark:text-light hover:bg-accent/20'
      }`}
    >
      {label}
    </button>
  );

  const QuickActionCard = ({ title, description, icon: Icon, onClick }) => (
    <button
      onClick={onClick}
      className="bg-white/80 dark:bg-primary/80 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-primary/5 dark:border-light/5 hover:shadow-xl transition-all duration-300 hover:bg-accent/10 dark:hover:bg-accent/20 group text-left w-full transform hover:-translate-y-1"
    >
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-xl bg-accent/10 dark:bg-accent/20 group-hover:bg-accent transition-colors duration-300">
          <Icon className="w-5 h-5 text-accent group-hover:text-white transition-colors duration-300" />
        </div>
        <div>
          <h3 className="font-semibold text-primary dark:text-light">{title}</h3>
          <p className="text-sm text-primary/60 dark:text-light/60">{description}</p>
        </div>
      </div>
    </button>
  );

  if (loading) {
    return <LoadingSpinner message="Chargement du tableau de bord..." size="lg" variant="dots" />;
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-accent to-accent/80 rounded-2xl p-8 text-white">
        <h2 className="text-3xl font-bold mb-2">Bon retour! 👋</h2>
        <p className="text-white/90">Voici ce qui se passe avec votre portfolio aujourd'hui.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Messages"
          value={stats.messages}
          subtitle={`${stats.unreadMessages} non lus`}
          icon={FiMail}
        />
        <StatCard
          title="Expériences"
          value={stats.experiences}
          icon={FiBriefcase}
        />
        <StatCard
          title="Projets"
          value={stats.projects}
          icon={FiFolderPlus}
        />
        <StatCard
          title="Compétences"
          value={stats.skills}
          icon={FiSettings}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Messages */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-primary rounded-2xl p-6 shadow-sm border border-primary/5 dark:border-light/5">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-primary dark:text-light">Messages Récents</h3>
              <span className="text-sm text-primary/60 dark:text-light/60">5 derniers messages</span>
            </div>
            <div className="space-y-4">
              {recentMessages.length > 0 ? (
                recentMessages.map((message) => (
                  <div key={message.id} className="flex items-start gap-4 p-4 rounded-xl bg-primary/5 dark:bg-light/5">
                    <div className={`w-3 h-3 rounded-full mt-2 ${message.read ? 'bg-green-500' : 'bg-accent'}`}></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-primary dark:text-light">{message.name}</h4>
                        <span className="text-xs text-primary/50 dark:text-light/50">
                          {message.createdAt?.toDate().toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-primary/70 dark:text-light/70">{message.email}</p>
                      <p className="text-sm text-primary/60 dark:text-light/60 mt-1 line-clamp-2">
                        {message.message}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <FiMail className="w-12 h-12 text-primary/30 dark:text-light/30 mx-auto mb-3" />
                  <p className="text-primary/60 dark:text-light/60">No messages yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Additional Analytics Metrics */}
        <div className="space-y-6">
          {/* Engagement Metrics */}
          <div className="bg-white dark:bg-primary rounded-2xl p-6 shadow-sm border border-primary/5 dark:border-light/5">
            <h3 className="text-xl font-bold text-primary dark:text-light mb-6">Métriques d'Engagement</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 rounded-lg bg-primary/5 dark:bg-light/5">
                <FiTarget className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-primary dark:text-light">{analyticsData?.conversionRate || '0'}%</p>
                <p className="text-sm text-primary/60 dark:text-light/60">Taux de Conversion</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-primary/5 dark:bg-light/5">
                <FiMousePointer className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-primary dark:text-light">{analyticsData?.clickThroughRate || '0'}%</p>
                <p className="text-sm text-primary/60 dark:text-light/60">Taux de Clic</p>
              </div>
            </div>
          </div>
          
          {/* Traffic Sources */}
          <div className="bg-white dark:bg-primary rounded-2xl p-6 shadow-sm border border-primary/5 dark:border-light/5">
            <h3 className="text-xl font-bold text-primary dark:text-light mb-6">Sources de Trafic</h3>
            <div className="space-y-3">
              {(analyticsData?.trafficSources || []).slice(0, 5).map((source, index) => (
                <div key={source.source} className="flex items-center justify-between p-3 rounded-lg bg-primary/5 dark:bg-light/5">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      index === 0 ? 'bg-blue-500' : 
                      index === 1 ? 'bg-green-500' :
                      index === 2 ? 'bg-yellow-500' :
                      index === 3 ? 'bg-purple-500' : 'bg-red-500'
                    }`}></div>
                    <span className="font-medium text-primary dark:text-light">{translateChannel(source.source)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-accent">{source.users}</span>
                    <span className="text-xs text-primary/60 dark:text-light/60 ml-2">({source.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="mt-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h2 className="text-2xl font-bold text-primary dark:text-light mb-4 sm:mb-0">Analytiques Web</h2>
          <div className="flex flex-wrap gap-2">
            <DateRangeButton range="7days" label="7 jours" active={dateRange === '7days'} onClick={handleDateRangeChange} />
            <DateRangeButton range="30days" label="30 jours" active={dateRange === '30days'} onClick={handleDateRangeChange} />
            <DateRangeButton range="90days" label="90 jours" active={dateRange === '90days'} onClick={handleDateRangeChange} />
            <button
              onClick={() => fetchAnalyticsData()}
              disabled={refreshing}
              className="px-3 sm:px-4 py-2 rounded-lg text-sm font-medium bg-primary/10 dark:bg-light/10 text-primary dark:text-light hover:bg-accent/20 transition-colors disabled:opacity-50"
            >
              <FiRefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {analyticsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-primary rounded-2xl p-6 shadow-sm border border-primary/5 dark:border-light/5 animate-pulse">
                <div className="h-4 bg-primary/10 dark:bg-light/10 rounded mb-2"></div>
                <div className="h-8 bg-primary/10 dark:bg-light/10 rounded mb-1"></div>
                <div className="h-3 bg-primary/10 dark:bg-light/10 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : analyticsError ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 mb-8">
            <p className="text-red-600 dark:text-red-400">Erreur: {analyticsError}</p>
          </div>
        ) : analyticsData ? (
          <>
            {/* Enhanced Analytics Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
              <MetricCard
                title="Visiteurs Totaux"
                value={analyticsData.totalUsers?.toLocaleString() || '0'}
                icon={FiUsers}
                color="bg-blue-500"
                subtitle={`+${analyticsData.userGrowth || 0}% ce mois`}
              />
              <MetricCard
                title="Pages Vues"
                value={analyticsData.pageViews?.toLocaleString() || '0'}
                icon={FiEye}
                color="bg-green-500"
                subtitle={`${analyticsData.avgPageViews || 0} par session`}
              />
              <MetricCard
                title="Durée Moyenne"
                value={formatDuration(analyticsData.avgSessionDuration || 0)}
                icon={FiClock}
                color="bg-purple-500"
                subtitle="par session"
              />
              <MetricCard
                title="Taux de Rebond"
                value={`${analyticsData.bounceRate || 0}%`}
                icon={FiActivity}
                color="bg-orange-500"
                subtitle="visiteurs uniques"
              />
              <MetricCard
                title="Nouveaux Visiteurs"
                value={`${analyticsData.newUsersPercentage || 0}%`}
                icon={FiTarget}
                color="bg-indigo-500"
                subtitle="du trafic total"
              />
              <MetricCard
                title="Taux de Conversion"
                value={`${analyticsData.conversionRate || 0}%`}
                icon={FiPercent}
                color="bg-pink-500"
                subtitle="objectifs atteints"
              />
            </div>

            {/* Enhanced Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Traffic Over Time */}
              <ChartCard title="Trafic dans le Temps" className="lg:col-span-3">
                <ResponsiveContainer width="100%" height={350}>
                  <ComposedChart data={analyticsData.dailyTraffic || []}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis yAxisId="left" className="text-xs" />
                    <YAxis yAxisId="right" orientation="right" className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: 'none',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Legend />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="users"
                      fill="#3B82F6"
                      fillOpacity={0.3}
                      stroke="#3B82F6"
                      strokeWidth={2}
                      name="Utilisateurs"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="pageViews"
                      stroke="#10B981"
                      strokeWidth={2}
                      name="Pages Vues"
                    />
                    <Bar
                      yAxisId="left"
                      dataKey="sessions"
                      fill="#F59E0B"
                      fillOpacity={0.7}
                      name="Sessions"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* World Map */}
              <ChartCard title="Visiteurs par Pays" className="lg:col-span-2">
                <WorldMapChart data={analyticsData.topCountries} />
              </ChartCard>

              {/* Top Pages */}
              <ChartCard title="Pages Populaires">
                <div className="space-y-3">
                  {(analyticsData.topPages || []).slice(0, 6).map((page, index) => (
                    <div key={page.page} className="flex items-center justify-between p-3 rounded-lg bg-primary/5 dark:bg-light/5">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span className="text-sm font-semibold text-accent w-6">{index + 1}</span>
                        <span className="font-medium text-primary dark:text-light truncate">{page.page}</span>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-sm font-semibold text-accent">{page.views}</span>
                        <p className="text-xs text-primary/60 dark:text-light/60">{page.uniqueViews} uniques</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ChartCard>

              {/* Acquisition Channels */}
              <ChartCard title="Canaux d'Acquisition" className="lg:col-span-2">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.acquisitionChannels || []} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis type="number" className="text-xs" />
                    <YAxis dataKey="channel" type="category" className="text-xs" width={100} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: 'none',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Bar dataKey="users" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* Device & Browser Stats */}
              <ChartCard title="Appareils & Navigateurs">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-primary dark:text-light mb-3">Types d'Appareils</h4>
                    <ResponsiveContainer width="100%" height={150}>
                      <PieChart>
                        <Pie
                          data={analyticsData.deviceTypes || []}
                          cx="50%"
                          cy="50%"
                          innerRadius={30}
                          outerRadius={60}
                          paddingAngle={5}
                          dataKey="users"
                        >
                          {(analyticsData.deviceTypes || []).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={['#3B82F6', '#10B981', '#F59E0B'][index % 3]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-primary dark:text-light mb-3">Navigateurs</h4>
                    <div className="space-y-2">
                      {(analyticsData.topBrowsers || []).slice(0, 4).map((browser, index) => (
                        <div key={browser.browser} className="flex items-center justify-between">
                          <span className="text-sm text-primary dark:text-light">{browser.browser}</span>
                          <span className="text-sm font-semibold text-accent">{browser.percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ChartCard>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default DashboardOverview;
