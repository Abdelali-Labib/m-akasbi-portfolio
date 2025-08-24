"use client";

import React, { useState, useEffect } from 'react';
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
import { 
  FiTrendingUp, 
  FiUsers, 
  FiEye, 
  FiClock,
  FiGlobe,
  FiSmartphone,
  FiMonitor,
  FiActivity,
  FiRefreshCw
} from 'react-icons/fi';
import LoadingSpinner from './LoadingSpinner';

const GoogleAnalyticsDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState('30days');
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalyticsData = async (range = dateRange) => {
    try {
      setRefreshing(true);
      const response = await fetch(`/api/analytics?dateRange=${range}`);
      if (!response.ok) {
        throw new Error('Échec de récupération des données');
      }
      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const handleDateRangeChange = (range) => {
    setDateRange(range);
    setLoading(true);
    fetchAnalyticsData(range);
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // French translations for countries and channels
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

  if (loading && !data) {
    return <LoadingSpinner message="Chargement des analytics..." size="lg" variant="dots" />;
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-6 text-center">
          <div className="text-red-600 dark:text-red-400 mb-4">
            <FiActivity className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">Erreur de Chargement</h3>
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={() => fetchAnalyticsData()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'];

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header with Date Range Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary dark:text-light">Tableau de Bord Analytics</h1>
          <p className="text-sm text-primary/60 dark:text-light/60 mt-1">
            Données Google Analytics en temps réel
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <DateRangeButton
            range="7days"
            label="7 jours"
            active={dateRange === '7days'}
            onClick={handleDateRangeChange}
          />
          <DateRangeButton
            range="30days"
            label="30 jours"
            active={dateRange === '30days'}
            onClick={handleDateRangeChange}
          />
          <DateRangeButton
            range="90days"
            label="90 jours"
            active={dateRange === '90days'}
            onClick={handleDateRangeChange}
          />
          <button
            onClick={() => fetchAnalyticsData()}
            disabled={refreshing}
            className="p-2 bg-primary/10 dark:bg-light/10 text-primary dark:text-light rounded-lg hover:bg-primary/20 dark:hover:bg-light/20 transition-colors disabled:opacity-50"
            title="Actualiser"
          >
            <FiRefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Real-time Users Card */}
      {data?.realtimeUsers !== undefined && (
        <div className="bg-gradient-to-r from-accent to-accent/80 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1">Utilisateurs Actifs Maintenant</h3>
              <p className="text-3xl font-bold">{data.realtimeUsers.toLocaleString()}</p>
              <p className="text-white/80 text-sm">En temps réel</p>
            </div>
            <div className="p-4 bg-white/20 rounded-xl">
              <FiActivity className="w-8 h-8" />
            </div>
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <MetricCard
          title="Utilisateurs Actifs"
          value={data?.totalMetrics?.activeUsers?.toLocaleString() || '0'}
          icon={FiUsers}
          color="bg-blue-500"
        />
        <MetricCard
          title="Sessions"
          value={data?.totalMetrics?.sessions?.toLocaleString() || '0'}
          icon={FiEye}
          color="bg-green-500"
        />
        <MetricCard
          title="Pages Vues"
          value={data?.totalMetrics?.pageViews?.toLocaleString() || '0'}
          icon={FiTrendingUp}
          color="bg-purple-500"
        />
        <MetricCard
          title="Durée Moyenne"
          value={formatDuration(data?.totalMetrics?.avgSessionDuration || 0)}
          subtitle={`${(data?.totalMetrics?.engagementRate * 100 || 0).toFixed(1)}% engagement`}
          icon={FiClock}
          color="bg-orange-500"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
        <ChartCard title="Évolution des Utilisateurs">
          <div className="h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.dailyMetrics || []}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString('fr-FR')}
                  formatter={(value, name) => [value.toLocaleString(), name === 'activeUsers' ? 'Utilisateurs' : 'Sessions']}
                />
                <Area type="monotone" dataKey="activeUsers" stroke="#8884d8" fillOpacity={1} fill="url(#colorUsers)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Appareils Utilisés">
          <div className="h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.deviceCategories || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="users"
                >
                  {(data?.deviceCategories || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value.toLocaleString(), 'Utilisateurs']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {(data?.deviceCategories || []).map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                <span className="text-xs sm:text-sm text-primary/70 dark:text-light/70">{translateDevice(item.device)}</span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
        <ChartCard title="Pages les Plus Visitées">
          <div className="h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.topPages || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis 
                  type="category" 
                  dataKey="pagePath" 
                  width={100} 
                  tick={{ fontSize: 10 }}
                  tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 15)}...` : value}
                />
                <Tooltip formatter={(value) => [value.toLocaleString(), 'Vues']} />
                <Bar dataKey="views" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Pays des Visiteurs">
          <div className="space-y-3">
            {(data?.topCountries || []).slice(0, 8).map((country, index) => {
              const maxUsers = Math.max(...(data?.topCountries || []).map(c => c.users));
              const percentage = (country.users / maxUsers) * 100;
              
              return (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1 mr-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-primary dark:text-light">{translateCountry(country.country)}</span>
                      <span className="text-sm text-primary/60 dark:text-light/60">{country.users.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-primary/10 dark:bg-light/10 rounded-full h-2">
                      <div 
                        className="bg-accent h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ChartCard>
      </div>

      {/* Traffic Sources */}
      <ChartCard title="Sources de Trafic">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(data?.trafficSources || []).map((source, index) => (
            <div key={index} className="bg-primary/5 dark:bg-light/5 rounded-xl p-4 text-center">
              <div className={`w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center ${
                index === 0 ? 'bg-blue-100 text-blue-600' :
                index === 1 ? 'bg-green-100 text-green-600' :
                index === 2 ? 'bg-purple-100 text-purple-600' :
                'bg-orange-100 text-orange-600'
              }`}>
                <FiGlobe className="w-6 h-6" />
              </div>
              <h4 className="font-semibold text-primary dark:text-light mb-1">{translateChannel(source.source)}</h4>
              <p className="text-2xl font-bold text-accent">{source.sessions.toLocaleString()}</p>
              <p className="text-xs text-primary/60 dark:text-light/60">sessions</p>
            </div>
          ))}
        </div>
      </ChartCard>

      {/* Browser Stats */}
      {data?.topBrowsers?.length > 0 && (
        <ChartCard title="Navigateurs Utilisés">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {data.topBrowsers.slice(0, 5).map((browser, index) => (
              <div key={index} className="text-center">
                <div className="bg-primary/5 dark:bg-light/5 rounded-xl p-4 mb-2">
                  <FiMonitor className="w-8 h-8 text-accent mx-auto" />
                </div>
                <h4 className="font-medium text-primary dark:text-light text-sm">{browser.browser}</h4>
                <p className="text-lg font-bold text-accent">{browser.users.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </ChartCard>
      )}
    </div>
  );
};

export default GoogleAnalyticsDashboard;
