import { useSelector } from 'react-redux';

/**
 * Custom hook to check user roles and permissions
 * @returns {Object} Object with role and permission checking functions
 */
const useUserRoles = () => {
  const { user } = useSelector((state) => state.user);

  /**
   * Check if the current user has any of the specified roles
   * @param {string|string[]} roles - Single role or array of roles to check
   * @returns {boolean} True if user has any of the specified roles
   */
  const hasRole = (roles) => {
    if (!user || !user.role) return false;
    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    }
    return user.role === roles;
  };

  /**
   * Check if the current user has all of the specified permissions
   * @param {string[]} requiredPermissions - Array of permission strings to check
   * @returns {boolean} True if user has all required permissions
   */
  const hasPermissions = (requiredPermissions) => {
    if (!user || !user.permissions) return false;
    return requiredPermissions.every(perm => 
      user.permissions.includes(perm)
    );
  };

  /**
   * Check if the current user has any of the specified permissions
   * @param {string[]} requiredPermissions - Array of permission strings to check
   * @returns {boolean} True if user has any of the specified permissions
   */
  const hasAnyPermission = (requiredPermissions) => {
    if (!user || !user.permissions) return false;
    return requiredPermissions.some(perm => 
      user.permissions.includes(perm)
    );
  };

  return {
    hasRole,
    hasPermissions,
    hasAnyPermission,
    isAdmin: hasRole('admin'),
    isFreelancer: hasRole('freelancer'),
    isClient: hasRole('client'),
    userRole: user?.role || null
  };
};

export default useUserRoles;
