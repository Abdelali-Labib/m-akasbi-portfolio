"use client";

import React, { useState, useEffect } from 'react';
import { analytics } from '@/lib/firebase';
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
  FiActivity
} from 'react-icons/fi';

const ModernAnalytics = () => {
  const [analyticsStatus, setAnalyticsStatus] = useState('checking');

  useEffect(() => {
    const checkAnalytics = () => {
      if (typeof window !== 'undefined') {
        if (analytics) {
          setAnalyticsStatus('active');
        } else {
          setTimeout(() => {
            setAnalyticsStatus(analytics ? 'active' : 'inactive');
          }, 1000);
        }
      }
    };
    checkAnalytics();
  }, []);

  // Mock data for demonstration
  const pageViewsData = [
    { name: 'Mon', views: 2400, users: 1400 },
    { name: 'Tue', views: 1398, users: 2210 },
    { name: 'Wed', views: 9800, users: 2290 },
    { name: 'Thu', views: 3908, users: 2000 },
    { name: 'Fri', views: 4800, users: 2181 },
    { name: 'Sat', views: 3800, users: 2500 },
    { name: 'Sun', views: 4300, users: 2100 },
  ];

  const topPagesData = [
    { page: '/accueil', views: 4500, percentage: 35 },
    { page: '/projects', views: 3200, percentage: 25 },
    { page: '/experiences', views: 2800, percentage: 22 },
    { page: '/formations', views: 1500, percentage: 12 },
    { page: '/contact', views: 800, percentage: 6 },
  ];

  const deviceData = [
    { name: 'Desktop', value: 65, color: '#8884d8' },
    { name: 'Mobile', value: 30, color: '#82ca9d' },
    { name: 'Tablet', value: 5, color: '#ffc658' },
  ];

  const countryData = [
    { country: 'France', sessions: 1200, percentage: 45 },
    { country: 'Canada', sessions: 800, percentage: 30 },
    { country: 'USA', sessions: 400, percentage: 15 },
    { country: 'Morocco', sessions: 200, percentage: 7 },
    { country: 'Others', sessions: 100, percentage: 3 },
  ];

  const MetricCard = ({ title, value, change, icon: Icon, color }) => (
    <div className="bg-white dark:bg-primary rounded-2xl p-6 shadow-sm border border-primary/5 dark:border-light/5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-primary/60 dark:text-light/60">{title}</p>
          <p className="text-3xl font-bold text-primary dark:text-light mt-1">{value}</p>
          <div className="flex items-center mt-2">
            <span className={`text-sm font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? '+' : ''}{change}%
            </span>
            <span className="text-xs text-primary/50 dark:text-light/50 ml-1">vs last week</span>
          </div>
        </div>
        <div className={`p-4 rounded-xl ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  const ChartCard = ({ title, children, className = "" }) => (
    <div className={`bg-white dark:bg-primary rounded-2xl p-6 shadow-sm border border-primary/5 dark:border-light/5 ${className}`}>
      <h3 className="text-lg font-semibold text-primary dark:text-light mb-6">{title}</h3>
      {children}
    </div>
  );

  if (analyticsStatus === 'checking') {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-primary rounded-2xl p-6 animate-pulse">
              <div className="h-4 bg-primary/10 dark:bg-light/10 rounded mb-2"></div>
              <div className="h-8 bg-primary/10 dark:bg-light/10 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Status Banner */}
      <div className={`rounded-2xl p-6 ${analyticsStatus === 'active' ? 'bg-green-50 dark:bg-green-900/20' : 'bg-yellow-50 dark:bg-yellow-900/20'}`}>
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${analyticsStatus === 'active' ? 'bg-green-500' : 'bg-yellow-500'}`}>
            <FiActivity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className={`text-lg font-semibold ${analyticsStatus === 'active' ? 'text-green-800 dark:text-green-200' : 'text-yellow-800 dark:text-yellow-200'}`}>
              Analytics {analyticsStatus === 'active' ? 'Active' : 'Initializing'}
            </h3>
            <p className={`text-sm ${analyticsStatus === 'active' ? 'text-green-600 dark:text-green-300' : 'text-yellow-600 dark:text-yellow-300'}`}>
              {analyticsStatus === 'active' 
                ? 'Firebase Analytics is tracking your portfolio visitors' 
                : 'Setting up analytics tracking...'}
            </p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Visitors"
          value="12,847"
          change={12.5}
          icon={FiUsers}
          color="bg-blue-500"
        />
        <MetricCard
          title="Page Views"
          value="28,431"
          change={8.2}
          icon={FiEye}
          color="bg-green-500"
        />
        <MetricCard
          title="Avg. Session"
          value="3:42"
          change={-2.1}
          icon={FiClock}
          color="bg-purple-500"
        />
        <MetricCard
          title="Bounce Rate"
          value="34.2%"
          change={-5.4}
          icon={FiTrendingUp}
          color="bg-orange-500"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ChartCard title="Visitors & Page Views (Last 7 Days)">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={pageViewsData}>
              <defs>
                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#82ca9d" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="views" stroke="#8884d8" fillOpacity={1} fill="url(#colorViews)" />
              <Area type="monotone" dataKey="users" stroke="#82ca9d" fillOpacity={1} fill="url(#colorUsers)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Device Usage">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={deviceData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {deviceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value}%`, 'Usage']} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6 mt-4">
            {deviceData.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-sm text-primary/70 dark:text-light/70">{item.name}</span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ChartCard title="Top Pages">
          <div className="space-y-4">
            {topPagesData.map((page, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-primary dark:text-light">{page.page}</span>
                    <span className="text-sm text-primary/60 dark:text-light/60">{page.views.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-primary/10 dark:bg-light/10 rounded-full h-2">
                    <div 
                      className="bg-accent h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${page.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Top Countries">
          <div className="space-y-4">
            {countryData.map((country, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-primary dark:text-light">{country.country}</span>
                    <span className="text-sm text-primary/60 dark:text-light/60">{country.sessions}</span>
                  </div>
                  <div className="w-full bg-primary/10 dark:bg-light/10 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${country.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Implementation Status */}
      <ChartCard title="Analytics Implementation">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-semibold text-primary dark:text-light">Active Features</h4>
            <div className="space-y-3">
              {[
                'Firebase Analytics SDK',
                'Page View Tracking',
                'Route Change Detection',
                'Client-side Events'
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-primary/70 dark:text-light/70">{feature}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="font-semibold text-primary dark:text-light">Data Collection</h4>
            <div className="text-sm text-primary/60 dark:text-light/60 space-y-2">
              <p>• Real-time visitor tracking</p>
              <p>• Automatic page view events</p>
              <p>• User engagement metrics</p>
              <p>• Device and location data</p>
            </div>
          </div>
        </div>
      </ChartCard>
    </div>
  );
};

export default ModernAnalytics;
