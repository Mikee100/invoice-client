import React, { useEffect, useState, useCallback } from 'react';
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
import { useDispatch, useSelector } from 'react-redux';
import { getCurrentUser } from '../../redux/userSlice';
import api, { handleApiError } from '../../services/api';
import { formatDistanceToNow, format } from 'date-fns';
import { toast } from 'react-toastify';
import StatCard from '../../components/dashboard/StatCard';
import ActivityItemSkeleton from '../../components/dashboard/ActivityItemSkeleton';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch dashboard data
      const response = await api.get('/admin/dashboard/stats');
      
      if (response.data) {
        setStats(response.data.stats || null);
        setActivities(response.data.recentActivities || []);
        setLastUpdated(new Date());
      }
      
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      const errorMessage = err.response?.data?.message || 'Failed to load dashboard data. Please try again later.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData().catch(err => {
      console.error('Failed to fetch dashboard data:', err);
      setError('Failed to load dashboard data. Please try again later.');
      setLoading(false);
    });
  }, [fetchDashboardData]);
  
  const handleRefresh = () => {
    fetchDashboardData();
  };

  // Stats configuration
  const statsConfig = [
    { 
      id: 'invoices',
      title: 'Invoices', 
      value: stats?.invoices?.total || '0', 
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
      value: stats?.invoices?.amount ? `$${stats.invoices.amount.toLocaleString()}` : '$0', 
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
      value: stats?.clients?.total || '0',
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
      value: stats?.projects?.total || '0',
      change: '+0%', 
      isPositive: true,
      icon: <FaProjectDiagram className="text-2xl" />, 
      color: 'bg-purple-500',
      loading: loading,
      description: 'Active projects'
    },
  ];

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
  const displayStats = stats || statsConfig;
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

  if (loading && !stats && activities.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
            <div className="h-4 bg-gray-200 rounded w-64 mt-2"></div>
          </div>
          <div className="h-4 bg-gray-200 rounded w-48"></div>
        </div>
        
        <div className="grid grid-cols-1 gap-5 mt-6 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, index) => (
            <StatCard key={index} loading={true} />
          ))}
        </div>
        
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
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
        {displayStats.map((stat) => (
          <StatCard
            key={stat.id || stat.title}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            isPositive={stat.isPositive}
            icon={stat.icon}
            color={stat.color}
            loading={stat.loading}
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
