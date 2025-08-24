"use client";

import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, where } from 'firebase/firestore';
import { db, analytics } from '@/lib/firebase';
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
  FiMail,
  FiBriefcase,
  FiFolder,
  FiSettings,
  FiActivity,
  FiCalendar
} from 'react-icons/fi';
import LoadingSpinner from './LoadingSpinner';

const RealDataAnalytics = () => {
  const [analyticsStatus, setAnalyticsStatus] = useState('checking');
  const [realData, setRealData] = useState({
    messages: [],
    experiences: [],
    formations: [],
    projects: [],
    skills: [],
    messagesByMonth: [],
    messagesByDay: [],
    skillsByCategory: [],
    projectsByType: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check analytics status
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

    // Fetch real data from Firebase
    const unsubscribes = [];

    // Messages
    const messagesQuery = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
    unsubscribes.push(onSnapshot(messagesQuery, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRealData(prev => ({ ...prev, messages }));
      processMessagesData(messages);
    }));

    // Experiences
    unsubscribes.push(onSnapshot(collection(db, 'experiences'), (snapshot) => {
      const experiences = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRealData(prev => ({ ...prev, experiences }));
    }));

    // Formations
    unsubscribes.push(onSnapshot(collection(db, 'formations'), (snapshot) => {
      const formations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRealData(prev => ({ ...prev, formations }));
    }));

    // Projects
    unsubscribes.push(onSnapshot(collection(db, 'projects'), (snapshot) => {
      const projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRealData(prev => ({ ...prev, projects }));
      processProjectsData(projects);
    }));

    // Skills
    unsubscribes.push(onSnapshot(collection(db, 'skills'), (snapshot) => {
      const skills = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRealData(prev => ({ ...prev, skills }));
      processSkillsData(skills);
      setLoading(false);
    }));

    return () => unsubscribes.forEach(unsub => unsub());
  }, []);

  const processMessagesData = (messages) => {
    // Group messages by month
    const messagesByMonth = {};
    const messagesByDay = {};
    
    messages.forEach(message => {
      if (message.createdAt) {
        const date = message.createdAt.toDate();
        const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        const dayKey = date.toLocaleDateString('en-US', { weekday: 'short' });
        
        messagesByMonth[monthKey] = (messagesByMonth[monthKey] || 0) + 1;
        messagesByDay[dayKey] = (messagesByDay[dayKey] || 0) + 1;
      }
    });

    const monthData = Object.entries(messagesByMonth).map(([month, count]) => ({
      month,
      messages: count
    })).slice(-6);

    const dayData = Object.entries(messagesByDay).map(([day, count]) => ({
      day,
      messages: count
    }));

    setRealData(prev => ({ 
      ...prev, 
      messagesByMonth: monthData,
      messagesByDay: dayData
    }));
  };

  const processSkillsData = (skills) => {
    const skillsByCategory = {};
    skills.forEach(skill => {
      const category = skill.category || 'Other';
      if (!skillsByCategory[category]) {
        skillsByCategory[category] = { category, count: 0, avgLevel: 0, totalLevel: 0 };
      }
      skillsByCategory[category].count += 1;
      skillsByCategory[category].totalLevel += skill.level || 0;
    });

    const categoryData = Object.values(skillsByCategory).map(cat => ({
      ...cat,
      avgLevel: Math.round(cat.totalLevel / cat.count)
    }));

    setRealData(prev => ({ ...prev, skillsByCategory: categoryData }));
  };

  const processProjectsData = (projects) => {
    const projectsByType = {};
    projects.forEach(project => {
      const type = project.type || 'Other';
      projectsByType[type] = (projectsByType[type] || 0) + 1;
    });

    const typeData = Object.entries(projectsByType).map(([type, count]) => ({
      type,
      count,
      percentage: Math.round((count / projects.length) * 100)
    }));

    setRealData(prev => ({ ...prev, projectsByType: typeData }));
  };

  const MetricCard = ({ title, value, change, icon: Icon, color, subtitle }) => (
    <div className="bg-white dark:bg-primary rounded-2xl p-4 sm:p-6 shadow-sm border border-primary/5 dark:border-light/5">
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm font-medium text-primary/60 dark:text-light/60 truncate">{title}</p>
          <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary dark:text-light mt-1">{value}</p>
          {subtitle && <p className="text-xs text-primary/50 dark:text-light/50 mt-1 truncate">{subtitle}</p>}
          {change !== undefined && (
            <div className="flex items-center mt-2">
              <span className={`text-xs sm:text-sm font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {change >= 0 ? '+' : ''}{change}%
              </span>
              <span className="text-xs text-primary/50 dark:text-light/50 ml-1">vs last period</span>
            </div>
          )}
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

  if (loading) {
    return <LoadingSpinner message="Chargement des données analytiques..." size="lg" variant="dots" />;
  }

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'];

  const unreadMessages = realData.messages.filter(msg => !msg.read).length;
  const totalProjects = realData.projects.length;
  const avgSkillLevel = realData.skills.length > 0 
    ? Math.round(realData.skills.reduce((sum, skill) => sum + (skill.level || 0), 0) / realData.skills.length)
    : 0;

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Status Banner */}
      <div className={`rounded-2xl p-4 sm:p-6 ${analyticsStatus === 'active' ? 'bg-green-50 dark:bg-green-900/20' : 'bg-yellow-50 dark:bg-yellow-900/20'}`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className={`p-3 rounded-xl flex-shrink-0 ${analyticsStatus === 'active' ? 'bg-green-500' : 'bg-yellow-500'}`}>
            <FiActivity className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className={`text-base sm:text-lg font-semibold ${analyticsStatus === 'active' ? 'text-green-800 dark:text-green-200' : 'text-yellow-800 dark:text-yellow-200'}`}>
              Analytics {analyticsStatus === 'active' ? 'Active' : 'Initializing'}
            </h3>
            <p className={`text-sm ${analyticsStatus === 'active' ? 'text-green-600 dark:text-green-300' : 'text-yellow-600 dark:text-yellow-300'}`}>
              {analyticsStatus === 'active' 
                ? 'Real-time data from your portfolio Firebase collections' 
                : 'Setting up analytics tracking...'}
            </p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <MetricCard
          title="Total Messages"
          value={realData.messages.length}
          subtitle={`${unreadMessages} unread`}
          icon={FiMail}
          color="bg-blue-500"
        />
        <MetricCard
          title="Projects"
          value={totalProjects}
          icon={FiFolder}
          color="bg-green-500"
        />
        <MetricCard
          title="Skills"
          value={realData.skills.length}
          subtitle={`${avgSkillLevel}% avg level`}
          icon={FiSettings}
          color="bg-purple-500"
        />
        <MetricCard
          title="Experiences"
          value={realData.experiences.length}
          icon={FiBriefcase}
          color="bg-orange-500"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
        <ChartCard title="Messages Over Time (Last 6 Months)">
          <div className="h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={realData.messagesByMonth}>
                <defs>
                  <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="messages" stroke="#8884d8" fillOpacity={1} fill="url(#colorMessages)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Skills by Category">
          <div className="h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={realData.skillsByCategory} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="category" width={80} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value, name) => [value, name === 'count' ? 'Skills' : 'Avg Level']} />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
        <ChartCard title="Projects by Type">
          <div className="h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={realData.projectsByType}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {realData.projectsByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, 'Projects']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {realData.projectsByType.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                <span className="text-xs sm:text-sm text-primary/70 dark:text-light/70">{item.type}</span>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Content Summary">
          <div className="space-y-4 sm:space-y-6">
            {[
              { label: 'Total Messages', value: realData.messages.length, color: 'bg-blue-500' },
              { label: 'Unread Messages', value: unreadMessages, color: 'bg-red-500' },
              { label: 'Professional Experiences', value: realData.experiences.filter(exp => exp.type === 'Professional').length, color: 'bg-green-500' },
              { label: 'Academic Formations', value: realData.formations.filter(form => form.type === 'Academic').length, color: 'bg-purple-500' },
              { label: 'Active Projects', value: totalProjects, color: 'bg-orange-500' }
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                  <span className="text-sm font-medium text-primary dark:text-light">{item.label}</span>
                </div>
                <span className="text-sm font-bold text-primary dark:text-light">{item.value}</span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Implementation Status */}
      <ChartCard title="Data Sources">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-semibold text-primary dark:text-light">Firebase Collections</h4>
            <div className="space-y-3">
              {[
                { name: 'Messages', count: realData.messages.length },
                { name: 'Experiences', count: realData.experiences.length },
                { name: 'Formations', count: realData.formations.length },
                { name: 'Projects', count: realData.projects.length },
                { name: 'Skills', count: realData.skills.length }
              ].map((collection, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-primary/70 dark:text-light/70">{collection.name}</span>
                  </div>
                  <span className="text-sm font-medium text-primary dark:text-light">{collection.count} items</span>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="font-semibold text-primary dark:text-light">Real-time Updates</h4>
            <div className="text-sm text-primary/60 dark:text-light/60 space-y-2">
              <p>• Live data synchronization</p>
              <p>• Automatic chart updates</p>
              <p>• Real-time statistics</p>
              <p>• Firebase Analytics integration</p>
            </div>
          </div>
        </div>
      </ChartCard>
    </div>
  );
};

export default RealDataAnalytics;
