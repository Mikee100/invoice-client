import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { 
  FaFileInvoice, 
  FaUsers, 
  FaChartLine, 
  FaClock, 
  FaRegClock,
  FaRegUser,
  FaRegFileAlt,
  FaRegBell,
  FaSync,
  FaExclamationTriangle,
  FaPlusCircle,
  FaProjectDiagram
} from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import api from '../../services/api';
import StatCard from '../../components/dashboard/StatCard';
import ActivityItemSkeleton from '../../components/dashboard/ActivityItemSkeleton';

const AdminDashboard = () => {
  const { user } = useSelector((state) => state.user);
  const [stats, setStats] = useState({
    invoices: { total: 0, paid: 0, unpaid: 0, amount: 0 },
    clients: { total: 0 },
    projects: { total: 0 },
    payments: { total: 0, amount: 0 }
  });
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Fetch dashboard data is now handled by the useEffect hook and handleRefresh function
// ...existing code...

const fetchDashboardData = async () => {
  // Example: Replace with your actual API call
  try {
    const response = await fetch('/api/admin/dashboard');
    if (!response.ok) throw new Error('Failed to fetch dashboard data');
    const data = await response.json();
    return data;
  } catch (err) {
    throw err;
  }
};

// ...existing code...
  
  useEffect(() => {
    fetchDashboardData().catch(err => {
      console.error('Failed to fetch dashboard data:', err);
      setError('Failed to load dashboard data. Please try again later.');
      setLoading(false);
    });
  }, [fetchDashboardData]);


  // Stats configuration
  const statsConfig = React.useMemo(() => [
    { 
      id: 'invoices',
      title: 'Invoices', 
      value: stats?.invoices?.total?.toString() || '0', 
      change: '+0%', 
      isPositive: true,
      icon: <FaFileInvoice className="text-2xl" />, 
      color: 'bg-blue-500',
      loading: loading,
      description: `${stats?.invoices?.paid || 0} paid, ${stats?.invoices?.unpaid || 0} pending`
    },
    { 
      id: 'revenue',
      title: 'Total Revenue', 
      value: stats?.invoices?.amount ? `$${Number(stats.invoices.amount).toLocaleString()}` : '$0', 
      change: '+0%', 
      isPositive: true,
      icon: <FaChartLine className="text-2xl" />, 
      color: 'bg-green-500',
      loading: loading,
      description: 'Total amount collected'
    },
    { 
      id: 'clients',
      title: 'Clients', 
      value: stats?.clients?.total?.toString() || '0',
      change: '+0%', 
      isPositive: true,
      icon: <FaUsers className="text-2xl" />, 
      color: 'bg-yellow-500',
      loading: loading,
      description: 'Active clients'
    },
    { 
      id: 'projects',
      title: 'Projects', 
      value: stats?.projects?.total?.toString() || '0',
      change: '+0%', 
      isPositive: true,
      icon: <FaProjectDiagram className="text-2xl" />, 
      color: 'bg-purple-500',
      loading: loading,
      description: 'Active projects'
    },
  ], [stats, loading]);

  const mockActivities = [
    { 
      id: 1, 
      type: 'template',
      action: 'New template added', 
      user: 'John Doe', 
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      read: false
    },
    { 
      id: 2, 
      type: 'user',
      action: 'New user registration', 
      user: 'Jane Smith', 
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      read: false
    },
    { 
      id: 3, 
      type: 'template',
      action: 'Template updated', 
      user: 'Admin', 
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      read: true
    },
    { 
      id: 4, 
      type: 'system',
      action: 'System update completed', 
      user: 'System', 
      timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000), // 2 days ago
      read: true
    },
  ];
  
  // Use real data if available, otherwise use mock data
  const displayActivities = activities.length > 0 ? activities : mockActivities;

  // Get icon based on activity type
  const getActivityIcon = (type) => {
    switch(type) {
      case 'user':
        return <FaRegUser className="h-4 w-4" />;
      case 'template':
        return <FaRegFileAlt className="h-4 w-4" />;
      case 'system':
        return <FaRegBell className="h-4 w-4" />;
      default:
        return <FaRegClock className="h-4 w-4" />;
    }
  };

  // Get color based on activity type
  const getActivityColor = (type) => {
    switch(type) {
      case 'user':
        return 'bg-green-500';
      case 'template':
        return 'bg-blue-500';
      case 'system':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/admin/dashboard/stats');
      if (response.data) {
        const { stats: statsData, recentActivities = [] } = response.data;
        setStats(prev => ({
          ...prev,
          invoices: {
            total: statsData?.invoices?.total || 0,
            paid: statsData?.invoices?.paid || 0,
            unpaid: statsData?.invoices?.unpaid || 0,
            amount: statsData?.invoices?.amount || 0
          },
          clients: { total: statsData?.clients?.total || 0 },
          projects: { total: statsData?.projects?.total || 0 },
          payments: {
            total: statsData?.payments?.total || 0,
            amount: statsData?.payments?.amount || 0
          }
        }));
        setActivities(Array.isArray(recentActivities) ? recentActivities : []);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error('Error refreshing dashboard data:', err);
      setError('Failed to refresh dashboard data');
      toast.error('Failed to refresh dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!user || !['admin', 'freelancer'].includes(user.role)) {
          const errorMessage = 'You do not have permission to view this dashboard';
          setError(errorMessage);
          toast.error(errorMessage);
          return;
        }
        
        const response = await api.get('/admin/dashboard/stats');
        if (response.data) {
          const { stats: statsData, recentActivities = [] } = response.data;
          setStats({
            invoices: {
              total: statsData?.invoices?.total || 0,
              paid: statsData?.invoices?.paid || 0,
              unpaid: statsData?.invoices?.unpaid || 0,
              amount: statsData?.invoices?.amount || 0
            },
            clients: { total: statsData?.clients?.total || 0 },
            projects: { total: statsData?.projects?.total || 0 },
            payments: {
              total: statsData?.payments?.total || 0,
              amount: statsData?.payments?.amount || 0
            }
          });
          setActivities(Array.isArray(recentActivities) ? recentActivities : []);
          setLastUpdated(new Date());
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        let errorMessage = 'Failed to load dashboard data';
        
        if (err.response) {
          if (err.response.status === 403) {
            errorMessage = 'You do not have permission to view this dashboard';
          } else if (err.response.status === 401) {
            errorMessage = 'Your session has expired. Please log in again.';
          } else if (err.response.status >= 500) {
            errorMessage = 'Server error. Please try again later.';
          } else if (err.response.data?.message) {
            errorMessage = err.response.data.message;
          }
        } else if (err.request) {
          errorMessage = 'Unable to connect to the server. Please check your internet connection.';
        } else if (err.message) {
          errorMessage = err.message;
        }
        
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Render loading state
  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
            <p className="text-sm text-gray-500 mt-1">
              Loading dashboard data...
            </p>
          </div>
          <div className="animate-pulse h-8 w-8 bg-gray-200 rounded-full"></div>
        </div>
        
        <div className="grid grid-cols-1 gap-5 mt-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-100 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mt-6">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Activity</h3>
            <div className="h-4 bg-gray-200 rounded w-48 mt-1"></div>
          </div>
          <div className="p-6">
            <ActivityItemSkeleton count={3} />
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
            <p className="text-sm text-gray-500 mt-1">
              Welcome back, {user?.name || 'Admin'}! {error}
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className={`p-2 rounded-full ${loading ? 'text-gray-400' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'} transition-colors`}
            title="Refresh data"
          >
            <FaSync className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        
        <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6 text-center">
          <div className="text-yellow-500 mx-auto w-12 h-12 flex items-center justify-center">
            <FaExclamationTriangle className="text-4xl" />
          </div>
          <h3 className="mt-2 text-lg font-medium text-gray-900">Unable to load dashboard</h3>
          <p className="mt-1 text-sm text-gray-500">
            {error}
          </p>
          <div className="mt-6">
            <button
              onClick={handleRefresh}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              disabled={loading}
            >
              <FaSync className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Refreshing...' : 'Try Again'}
            </button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-sm text-gray-500 mt-1">
            Welcome back, {user?.name || 'Admin'}! Here's what's happening with your account today.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="text-sm text-gray-500 text-right">
            <div>Last updated: {format(lastUpdated, 'MMM d, yyyy h:mm a')}</div>
            {error && (
              <div className="flex items-center text-yellow-600 text-xs mt-1">
                <FaExclamationTriangle className="mr-1" />
                Some data may not be up to date
              </div>
            )}
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className={`p-2 rounded-full ${loading ? 'text-gray-400' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'} transition-colors`}
            title="Refresh data"
          >
            <FaSync className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 mt-6 sm:grid-cols-2 lg:grid-cols-4">
        {statsConfig.map((stat) => (
          <StatCard
            key={stat.id || stat.title}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            isPositive={stat.isPositive}
            icon={stat.icon}
            color={stat.color}
            loading={stat.loading}
            description={stat.description}
          />
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Activity</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              {loading 
                ? 'Loading activities...' 
                : activities.length > 0 
                  ? 'Latest system and user activities' 
                  : 'No recent activities found'}
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => fetchDashboardData()}
              disabled={loading}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <FaSync className={`mr-2 h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
            <button
              onClick={() => {}}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FaPlusCircle className="mr-2 h-3 w-3" />
              New Activity
            </button>
          </div>
        </div>
        <div className="bg-white shadow overflow-hidden sm:rounded-b-lg min-h-[300px]">
          {loading ? (
            <ActivityItemSkeleton count={4} />
          ) : activities.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {displayActivities.map((activity) => {
                const activityDate = new Date(activity.timestamp);
                const isToday = new Date().toDateString() === activityDate.toDateString();
                
                return (
                  <li 
                    key={activity.id} 
                    className={`px-6 py-4 hover:bg-gray-50 transition-colors duration-150 ${!activity.read ? 'bg-blue-50' : ''}`}
                  >
                    <div className="flex items-start">
                      <div 
                        className={`flex-shrink-0 h-10 w-10 rounded-full ${getActivityColor(activity.type)} bg-opacity-10 flex items-center justify-center`}
                      >
                        <div className={`h-6 w-6 ${getActivityColor(activity.type)} rounded-full flex items-center justify-center`}>
                          {getActivityIcon(activity.type)}
                        </div>
                      </div>
                      <div className="ml-4 flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">
                            {activity.action}
                          </p>
                          <div className="ml-2 flex-shrink-0">
                            <p 
                              className="text-xs text-gray-500"
                              title={format(activityDate, 'PPpp')}
                            >
                              {isToday 
                                ? format(activityDate, 'h:mm a') 
                                : format(activityDate, 'MMM d, yyyy')}
                            </p>
                          </div>
                        </div>
                        <div className="mt-1 flex justify-between items-center">
                          <p className="text-sm text-gray-500">
                            By <span className="font-medium">{activity.user}</span>
                          </p>
                          {!activity.read && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              New
                            </span>
                          )}
                        </div>
                        {activity.details && (
                          <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded-md">
                            {activity.details}
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="py-12 text-center">
              <FaRegClock className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No activity found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new invoice or user.
              </p>
              <div className="mt-6 space-x-3">
                <button
                  onClick={handleRefresh}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <FaSync className="-ml-1 mr-2 h-4 w-4" />
                  Refresh
                </button>
                <button
                  onClick={() => {}}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <FaPlusCircle className="-ml-1 mr-2 h-4 w-4" />
                  Create Activity
                </button>
              </div>
            </div>
          )}
          {activities.length > 0 && (
            <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Showing {Math.min(activities.length, 5)} of {activities.length} activities
              </p>
              <a
                href="/admin/activity"
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                View all activity <span aria-hidden="true">&rarr;</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
