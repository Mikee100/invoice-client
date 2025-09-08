import React from 'react';
import PropTypes from 'prop-types';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';

const StatCard = ({ title, value, change, isPositive, icon, color, loading = false, description = '' }) => {
  if (loading) {
    return (
      <div className="overflow-hidden bg-white rounded-lg shadow">
        <div className="p-5">
          <div className="animate-pulse">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-gray-200"></div>
              </div>
              <div className="flex-1 space-y-4 py-1">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200">
      <div className="p-5">
        <div className="flex items-start">
          <div className={`flex-shrink-0 p-3 rounded-lg ${color} bg-opacity-10`}>
            <div className={`w-10 h-10 ${color.replace('bg-', 'text-')} flex items-center justify-center`}>
              {icon}
            </div>
          </div>
          <div className="flex-1 min-w-0 ml-4">
            <p className="text-sm font-medium text-gray-500 truncate">
              {title}
            </p>
            <div className="flex items-baseline mt-1">
              <div>
                <p className="text-2xl font-semibold text-gray-900">
                  {value}
                </p>
                {description && (
                  <p className="text-xs text-gray-500 mt-1">
                    {description}
                  </p>
                )}
              </div>
              {change !== undefined && change !== null && (
                <span 
                  className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    isPositive === null 
                      ? 'bg-gray-100 text-gray-800' 
                      : isPositive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                  }`}
                >
                  {isPositive ? (
                    <FaArrowUp className="-ml-0.5 mr-1 h-3 w-3 text-green-500" />
                  ) : isPositive === false ? (
                    <FaArrowDown className="-ml-0.5 mr-1 h-3 w-3 text-red-500" />
                  ) : null}
                  {change}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

StatCard.propTypes = {
  title: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  change: PropTypes.string,
  isPositive: PropTypes.bool,
  icon: PropTypes.node,
  color: PropTypes.string,
  loading: PropTypes.bool,
};

export default StatCard;
