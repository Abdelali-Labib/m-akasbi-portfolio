"use client";

import React, { useState, useEffect } from 'react';
import { 
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import { 
  FiUsers, 
  FiDownload,
  FiGlobe,
  FiSmartphone,
  FiMonitor,
  FiTablet,
  FiRefreshCw,
  FiTrendingUp,
  FiCalendar,
  FiExternalLink
} from 'react-icons/fi';
import LoadingSpinner from '../ui/LoadingSpinner';

const EnhancedAnalyticsDashboard = ({ analyticsData }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  const [filteredData, setFilteredData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  const [sourceModal, setSourceModal] = useState({ isOpen: false, source: '', url: '' });
  const [initialLoading, setInitialLoading] = useState(true);
  const [liveData, setLiveData] = useState(null);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // Simulate initial loading and kick off analytics fetch loop
  useEffect(() => {
    let isCancelled = false;
    const controller = new AbortController();

    const fetchAnalytics = async () => {
      try {
        const res = await fetch('/api/analytics', { cache: 'no-store', signal: controller.signal });
        const json = await res.json();
        if (!isCancelled && res.ok) setLiveData(json);
      } catch (_) {}
    };

    // initial fetch and loading state
    (async () => {
      await fetchAnalytics();
      if (!isCancelled) setInitialLoading(false);
    })();

    // lightweight polling for immediate updates
    const intervalId = setInterval(fetchAnalytics, 10000);

    return () => {
      isCancelled = true;
      controller.abort();
      clearInterval(intervalId);
    };
  }, []);

  // Date range options
  const dateRanges = [
    { key: '24h', label: "Aujourd'hui", days: 1 },
    { key: '7d', label: '7 derniers jours', days: 7 },
    { key: '30d', label: '30 derniers jours', days: 30 },
    { key: 'year', label: 'Cette année', days: 365 },
    { key: 'prev_year', label: 'Année précédente', days: 365, isPrevYear: true },
    { key: 'all', label: 'Toutes les données', days: null }
  ];

  // Filter data based on selected date range
  const filterDataByDateRange = (data, range) => {
    if (!data || range === 'all') return data;
    
    const now = new Date();
    let startDate, endDate;
    
    if (range === '24h') {
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      endDate = now;
    } else if (range === '7d') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      endDate = now;
    } else if (range === '30d') {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      endDate = now;
    } else if (range === 'year') {
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = now;
    } else if (range === 'prev_year') {
      startDate = new Date(now.getFullYear() - 1, 0, 1);
      endDate = new Date(now.getFullYear() - 1, 11, 31);
    }
    
    // Filter visitors by day
    const filteredVisitorsByDay = data.visitorsByDay.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= startDate && itemDate <= endDate;
    });
    
    // Filter CV downloads by day
    const filteredCvDownloadsByDay = (data.cvDownloadsByDay || []).filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= startDate && itemDate <= endDate;
    });

    // For period filtering, we'll proportionally scale the data based on the period
    // This is a simplified approach since we don't have date-based tracking for these metrics yet
    const periodRatio = range === 'all' ? 1 : Math.min(1, filteredVisitorsByDay.length / (data.visitorsByDay.length || 1));
    
    // Filter and scale countries based on the period ratio
    const filteredCountries = data.topCountries.map(country => ({
      ...country,
      count: Math.round(country.count * periodRatio)
    })).filter(country => country.count > 0);

    // Filter and scale devices based on the period ratio
    const filteredDevices = data.devices.map(device => ({
      ...device,
      count: Math.round(device.count * periodRatio)
    })).filter(device => device.count > 0);

    // Filter and scale referrers based on the period ratio
    const filteredReferrers = data.topReferrers.map(referrer => ({
      ...referrer,
      count: Math.round(referrer.count * periodRatio)
    })).filter(referrer => referrer.count > 0);

    // Remove browser tracking - no longer needed
    
    // Calculate totals for the filtered period
    const totalVisitors = filteredVisitorsByDay.reduce((sum, day) => sum + day.visitors, 0);
    const cvDownloads = filteredCvDownloadsByDay.reduce((sum, day) => sum + day.downloads, 0);
    
    return {
      ...data,
      totalVisitors,
      cvDownloads,
      visitorsByDay: filteredVisitorsByDay,
      cvDownloadsByDay: filteredCvDownloadsByDay,
      topCountries: filteredCountries,
      devices: filteredDevices,
      topReferrers: filteredReferrers
    };
  };

  // Get current data (filtered or original)
  const currentData = filteredData || liveData || analyticsData || {
    totalVisitors: 0,
    cvDownloads: 0,
    visitorsByDay: [],
    cvDownloadsByDay: [],
    topCountries: [],
    devices: [],
    topReferrers: []
  };

  // Apply date range filtering
  const data = filterDataByDateRange(currentData, selectedDateRange);

  // Calculate comparison metrics
  const getComparisonData = (currentData, range) => {
    if (!currentData.visitorsByDay.length) return null;
    
    const currentTotal = currentData.totalVisitors;
    const currentPeriodDays = currentData.visitorsByDay.length;
    
    // Calculate Moyenne Quotidienne daily visitors
    const avgDaily = currentPeriodDays > 0 ? (currentTotal / currentPeriodDays).toFixed(1) : 0;
    
    // Get trend (last 7 days vs previous 7 days if enough data)
    const recentDays = currentData.visitorsByDay.slice(-7);
    const previousDays = currentData.visitorsByDay.slice(-14, -7);
    
    let trend = 0;
    if (recentDays.length >= 3 && previousDays.length >= 3) {
      const recentAvg = recentDays.reduce((sum, day) => sum + day.visitors, 0) / recentDays.length;
      const previousAvg = previousDays.reduce((sum, day) => sum + day.visitors, 0) / previousDays.length;
      trend = previousAvg > 0 ? ((recentAvg - previousAvg) / previousAvg * 100).toFixed(1) : 0;
    }
    
    return { avgDaily, trend };
  };

  // Handle date range change
  const handleDateRangeChange = async (range) => {
    setSelectedDateRange(range);
    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate loading
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  // Refresh data function
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await fetch('/api/analytics', { cache: 'no-store' });
      const json = await res.json();
      if (res.ok) setLiveData(json);
    } catch (_) {
    } finally {
      setRefreshing(false);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num?.toLocaleString() || '0';
  };

  const translateCountry = (countryCode) => {
    const translations = {
      'US': 'États-Unis',
      'FR': 'France',
      'CA': 'Canada',
      'GB': 'Royaume-Uni',
      'DE': 'Allemagne',
      'ES': 'Espagne',
      'IT': 'Italie',
      'NL': 'Pays-Bas',
      'BE': 'Belgique',
      'CH': 'Suisse',
      'MA': 'Maroc',
      'DZ': 'Algérie',
      'TN': 'Tunisie',
      'Unknown': 'Inconnu'
    };
    return translations[countryCode] || countryCode;
  };

  const translateDevice = (device) => {
    const translations = {
      'desktop': 'Ordinateur',
      'mobile': 'Mobile',
      'tablet': 'Tablette'
    };
    return translations[device] || device;
  };

  const getDeviceIcon = (device) => {
    switch (device) {
      case 'mobile': return FiSmartphone;
      case 'tablet': return FiTablet;
      case 'desktop': 
      default: return FiMonitor;
    }
  };

  // UI Components
  const MetricCard = ({ title, value, icon: Icon, color, subtitle, trend }) => (
    <div className="bg-light/50 dark:bg-primary/50 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-primary/10 dark:border-light/10 hover:border-primary/20 dark:hover:border-light/20 transition-all duration-300 hover:shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-primary/70 dark:text-light/70 mb-2">{title}</p>
          <div className="flex items-center gap-3 mb-2">
            <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary dark:text-light">{value}</p>
            {trend && trend !== '0' && !isNaN(parseFloat(trend)) && parseFloat(trend) !== 0 && (
              <span className={`text-xs px-2 py-1 rounded-full font-medium border ${
                parseFloat(trend) > 0 
                  ? 'bg-accent/10 text-accent border-accent/20' 
                  : 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
              }`}>
                {parseFloat(trend) > 0 ? '↗' : '↘'} {Math.abs(parseFloat(trend))}%
              </span>
            )}
          </div>
          <p className="text-xs text-primary/60 dark:text-light/60 leading-relaxed">{subtitle}</p>
        </div>
        <div className={`w-14 h-14 sm:w-16 sm:h-16 ${color} rounded-2xl flex items-center justify-center shadow-lg`}>
          <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
        </div>
      </div>
    </div>
  );

  const ChartCard = ({ title, children, className = "" }) => (
    <div className={`bg-light/50 dark:bg-primary/50 backdrop-blur-sm rounded-2xl p-4 sm:p-6 lg:p-8 border border-primary/10 dark:border-light/10 hover:border-primary/20 dark:hover:border-light/20 transition-all duration-300 overflow-hidden ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg sm:text-xl font-bold text-primary dark:text-light">{title}</h3>
      </div>
      <div className="w-full overflow-hidden">
        {children}
      </div>
    </div>
  );

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316', '#84CC16'];

  // Helper function to format dates
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short'
    });
  };

  // Get comparison metrics
  const comparisonData = getComparisonData(data, selectedDateRange);
  
  // Filter out zero trends
  const filteredTrend = comparisonData?.trend && parseFloat(comparisonData.trend) !== 0 ? comparisonData.trend : null;

  // Prepare chart data
  const chartData = data.visitorsByDay.map(item => ({
    date: item.date,
    visitors: item.visitors
  })).reverse(); // Show oldest to newest

  if (initialLoading) {
    return <LoadingSpinner message="Chargement du tableau de bord..." size="lg" variant="dots" />;
  }

  return (
    <div className="admin-container space-y-6 lg:space-y-8">
      {/* Header */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-2">
              <h1 className="admin-title">
                Tableau de Bord Analytique
              </h1>
              <p className="admin-subtitle">
                Aperçu complet des performances de votre portfolio
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing || loading}
              className="self-start sm:self-center p-3 sm:p-4 bg-light/80 dark:bg-primary/80 backdrop-blur-sm text-primary dark:text-light rounded-2xl border border-primary/20 dark:border-light/20 hover:border-accent/50 hover:bg-accent/10 transition-all duration-300 disabled:opacity-50 shadow-lg"
              title="Actualiser"
            >
              <FiRefreshCw className={`w-5 h-5 sm:w-6 sm:h-6 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
          
          {/* Date Range Filter */}
          <div className="bg-light/60 dark:bg-primary/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-primary/10 dark:border-light/10">
            <h3 className="text-sm font-semibold text-primary/70 dark:text-light/70 mb-4">Période d'analyse</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
              {dateRanges.map((range) => (
                <button
                  key={range.key}
                  onClick={() => handleDateRangeChange(range.key)}
                  disabled={loading}
                  className={`px-3 py-3 sm:px-4 sm:py-3 rounded-xl text-sm font-medium transition-all duration-300 disabled:opacity-50 border ${
                    selectedDateRange === range.key
                      ? 'bg-accent text-white border-accent shadow-lg transform scale-105'
                      : 'bg-light/50 dark:bg-primary/50 text-primary dark:text-light border-primary/20 dark:border-light/20 hover:border-accent/50 hover:bg-accent/10 hover:scale-102'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
            
            {loading && (
              <div className="flex items-center justify-center gap-3 mt-4 p-3 bg-accent/10 rounded-xl border border-accent/20">
                <FiRefreshCw className="w-4 h-4 animate-spin text-accent" />
                <span className="text-sm font-medium text-accent">Filtrage des données...</span>
              </div>
            )}
          </div>
        </div>

      {/* Period-Dependent Analytics Section */}
      <div className="bg-light/30 dark:bg-primary/30 backdrop-blur-sm rounded-3xl p-6 lg:p-8 border-2 border-accent/20 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-accent rounded-full animate-pulse"></div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-primary dark:text-light">
              Données par Période
            </h2>
          </div>
          <div className="hidden sm:block flex-1 h-px bg-accent/20"></div>
          <span className="text-xs sm:text-sm font-medium text-accent bg-accent/10 px-2 sm:px-3 py-1 rounded-full border border-accent/20 self-start sm:self-center">
            {dateRanges.find(r => r.key === selectedDateRange)?.label}
          </span>
        </div>

        {/* Period-Dependent Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
          <MetricCard
            title="Visiteurs"
            value={formatNumber(data.totalVisitors)}
            icon={FiUsers}
            color="bg-blue-500"
            trend={filteredTrend}
          />
          <MetricCard
            title="Téléchargements CV"
            value={formatNumber(data.cvDownloads)}
            icon={FiDownload}
            color="bg-green-500"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 gap-6 lg:gap-8">
          {/* Visitors Chart */}
          <ChartCard title="Évolution des Visiteurs">
            <div className="h-64 sm:h-80 lg:h-96 w-full">
              <ResponsiveContainer width="100%" height="100%" maxHeight={384}>
                <LineChart 
                  data={chartData} 
                  margin={{ 
                    top: 10, 
                    right: windowWidth < 640 ? 5 : 15, 
                    left: windowWidth < 640 ? 5 : 15, 
                    bottom: windowWidth < 640 ? 5 : 15 
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-20" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: windowWidth < 640 ? 8 : 12 }}
                    tickFormatter={formatDate}
                    stroke="currentColor"
                    className="text-primary/60 dark:text-light/60"
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    tick={{ fontSize: windowWidth < 640 ? 8 : 12 }}
                    stroke="currentColor"
                    className="text-primary/60 dark:text-light/60"
                    width={windowWidth < 640 ? 30 : 60}
                  />
                  <Tooltip 
                    labelFormatter={(value) => `Date : ${formatDate(value)}`}
                    formatter={(value) => [value, 'Visiteurs']}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid rgba(0, 0, 0, 0.1)',
                      borderRadius: '12px',
                      backdropFilter: 'blur(10px)',
                      fontSize: '12px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="visitors" 
                    stroke="#3B82F6" 
                    strokeWidth={windowWidth < 640 ? 1.5 : 2}
                    dot={{ fill: '#3B82F6', strokeWidth: 1, r: windowWidth < 640 ? 2 : 3 }}
                    activeDot={{ r: windowWidth < 640 ? 4 : 6, stroke: '#3B82F6', strokeWidth: 2, fill: '#FFFFFF' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          {/* CV Downloads Chart */}
          <ChartCard title="Évolution des Téléchargements CV">
            <div className="h-64 sm:h-80 lg:h-96 w-full">
              <ResponsiveContainer width="100%" height="100%" maxHeight={384}>
                <LineChart 
                  data={data.cvDownloadsByDay.map(item => ({
                    date: item.date,
                    downloads: item.downloads
                  })).reverse()} 
                  margin={{ 
                    top: 10, 
                    right: windowWidth < 640 ? 5 : 15, 
                    left: windowWidth < 640 ? 5 : 15, 
                    bottom: windowWidth < 640 ? 5 : 15 
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-20" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: windowWidth < 640 ? 8 : 12 }}
                    tickFormatter={formatDate}
                    stroke="currentColor"
                    className="text-primary/60 dark:text-light/60"
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    tick={{ fontSize: windowWidth < 640 ? 8 : 12 }}
                    stroke="currentColor"
                    className="text-primary/60 dark:text-light/60"
                    width={windowWidth < 640 ? 30 : 60}
                  />
                  <Tooltip 
                    labelFormatter={(value) => `Date : ${formatDate(value)}`}
                    formatter={(value) => [value, 'Téléchargements']}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid rgba(0, 0, 0, 0.1)',
                      borderRadius: '12px',
                      backdropFilter: 'blur(10px)',
                      fontSize: '12px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="downloads" 
                    stroke="#10B981" 
                    strokeWidth={windowWidth < 640 ? 1.5 : 2}
                    dot={{ fill: '#10B981', strokeWidth: 1, r: windowWidth < 640 ? 2 : 3 }}
                    activeDot={{ r: windowWidth < 640 ? 4 : 6, stroke: '#10B981', strokeWidth: 2, fill: '#FFFFFF' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* Period-Dependent Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8 mt-8">
          {/* Device Usage - Enhanced Pie Chart */}
          <ChartCard title="Appareils Utilisés" className="lg:col-span-1">
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.devices}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="count"
                  >
                    {data.devices.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name) => [value, 'Visiteurs']}
                    labelFormatter={(label) => translateDevice(label)}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid rgba(0, 0, 0, 0.1)',
                      borderRadius: '12px',
                      backdropFilter: 'blur(10px)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-3 mt-4">
              {data.devices.map((item, index) => {
                const DeviceIcon = getDeviceIcon(item.device);
                const percentage = data.totalVisitors > 0 ? ((item.count / data.totalVisitors) * 100).toFixed(1) : 0;
                return (
                  <div key={index} className="flex items-center gap-2 bg-primary/5 dark:bg-light/5 px-3 py-2 rounded-xl border border-primary/10 dark:border-light/10">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                    <DeviceIcon className="w-4 h-4 text-primary/60 dark:text-light/60" />
                    <span className="text-sm font-medium text-primary/70 dark:text-light/70">
                      {translateDevice(item.device)} ({percentage}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </ChartCard>

          {/* Countries - Enhanced List */}
          <ChartCard title="Top Pays" className="lg:col-span-1">
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {data.topCountries.slice(0, 12).map((country, index) => {
                const percentage = data.totalVisitors > 0 ? ((country.count / data.totalVisitors) * 100).toFixed(1) : 0;
                return (
                  <div key={index} className="flex items-center justify-between p-3 bg-primary/5 dark:bg-light/5 rounded-xl border border-primary/10 dark:border-light/10 hover:bg-primary/10 dark:hover:bg-light/10 hover:border-accent/20 transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-6 bg-gradient-to-r from-accent to-accent/70 rounded-lg flex items-center justify-center shadow-sm">
                        <span className="text-xs text-white font-bold">{index + 1}</span>
                      </div>
                      <FiGlobe className="w-4 h-4 text-primary/60 dark:text-light/60" />
                      <span className="font-semibold text-sm text-primary dark:text-light">
                        {translateCountry(country.country)}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-primary/80 dark:text-light/80">
                        {country.count}
                      </div>
                      <div className="text-xs text-accent font-medium">
                        {percentage}%
                      </div>
                    </div>
                  </div>
                );
              })}
              {data.topCountries.length === 0 && (
                <div className="text-center py-12 text-primary/50 dark:text-light/50">
                  <FiGlobe className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Aucune donnée disponible</p>
                </div>
              )}
            </div>
          </ChartCard>

          {/* Traffic Sources */}
          <ChartCard title="Sources de Trafic">
            <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
              {data.topReferrers.slice(0, 10).map((referrer, index) => {
                const truncateSource = (source) => {
                  // Remove protocol from display
                  let displaySource = source.replace(/^https?:\/\//, '');
                  const maxLength = 30;
                  if (displaySource.length <= maxLength) return displaySource;
                  return displaySource.substring(0, maxLength - 3) + '...';
                };
                
                const handleSourceClick = (source) => {
                  if (source.toLowerCase() === 'direct' || source.toLowerCase() === 'direct traffic') {
                    return; // Don't show popup for direct traffic
                  }
                  
                  let url = source;
                  if (!source.startsWith('http://') && !source.startsWith('https://')) {
                    url = `https://${source}`;
                  }
                  
                  setSourceModal({ isOpen: true, source, url });
                };
                
                return (
                  <div 
                    key={index} 
                    className={`flex items-center justify-between p-3 bg-primary/5 dark:bg-light/5 rounded-xl border border-primary/10 dark:border-light/10 hover:bg-primary/10 dark:hover:bg-light/10 transition-all duration-300 ${
                      referrer.referrer.toLowerCase() !== 'direct' && referrer.referrer.toLowerCase() !== 'direct traffic' 
                        ? 'cursor-pointer hover:border-accent/30' 
                        : ''
                    }`}
                    onClick={() => handleSourceClick(referrer.referrer)}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <FiExternalLink className="w-4 h-4 text-primary/60 dark:text-light/60 flex-shrink-0" />
                      <span 
                        className="font-medium text-sm text-primary dark:text-light" 
                        title={referrer.referrer}
                      >
                        {truncateSource(referrer.referrer)}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-accent ml-2 flex-shrink-0">
                      {referrer.count}
                    </span>
                  </div>
                );
              })}
              {data.topReferrers.length === 0 && (
                <div className="text-center py-8 text-primary/50 dark:text-light/50">
                  <FiExternalLink className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Aucune donnée disponible</p>
                </div>
              )}
            </div>
          </ChartCard>
        </div>
      </div>
      {/* Global Statistics Section */}
      <div className="bg-light/30 dark:bg-primary/30 backdrop-blur-sm rounded-3xl p-6 lg:p-8 border-2 border-purple-500/20 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-primary dark:text-light">
              Statistiques Globales
            </h2>
          </div>
          <div className="hidden sm:block flex-1 h-px bg-purple-500/20"></div>
          <span className="text-xs sm:text-sm font-medium text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2 sm:px-3 py-1 rounded-full border border-purple-500/20 self-start sm:self-center">
            Toutes les données
          </span>
        </div>

        {/* Global Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <MetricCard
            title="Moyenne Quotidienne"
            value={analyticsData.visitorsByDay.length > 0 ? (analyticsData.totalVisitors / analyticsData.visitorsByDay.length).toFixed(1) : '0'}
            icon={FiTrendingUp}
            color="bg-indigo-500"
            subtitle="Visiteurs par jour (global)"
          />
          <MetricCard
            title="Pays Différents"
            value={formatNumber(analyticsData.topCountries?.length || 0)}
            icon={FiGlobe}
            color="bg-purple-500"
            subtitle="Diversité géographique (global)"
          />
        </div>
      </div>

      {/* Source Modal */}
      {sourceModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-primary rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-primary dark:text-light mb-4">
                Source de Trafic
              </h3>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-primary/70 dark:text-light/70 mb-2">
                  URL Complète
                </label>
                <div className="p-3 bg-light/50 dark:bg-primary/50 rounded-lg border border-primary/20 dark:border-light/20">
                  <p className="text-sm text-primary dark:text-light break-all">
                    {sourceModal.source}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setSourceModal({ isOpen: false, source: '', url: '' })}
                  className="px-4 py-2 text-primary/70 dark:text-light/70 hover:text-primary dark:hover:text-light transition-colors"
                >
                  Fermer
                </button>
                <a
                  href={sourceModal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors flex items-center gap-2"
                >
                  <FiExternalLink className="w-4 h-4" />
                  Visiter le Site
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedAnalyticsDashboard;