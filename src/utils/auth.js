// Authentication utilities
import * as jwtDecode from 'jwt-decode';

// Check if token is expired
export const isTokenExpired = (token) => {
  if (!token) return true;

  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch (error) {
    console.error('Error decoding token:', error);
    return true;
  }
};

// Get token expiration time
export const getTokenExpiration = (token) => {
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    return decoded.exp * 1000; // Convert to milliseconds
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

// Check if token needs refresh (expires within 5 minutes)
export const shouldRefreshToken = (token) => {
  if (!token) return false;

  const expiration = getTokenExpiration(token);
  if (!expiration) return false;

  const fiveMinutesFromNow = Date.now() + (5 * 60 * 1000);
  return expiration < fiveMinutesFromNow;
};

// Request queue to handle concurrent auth requests
class RequestQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
  }

  async add(requestFn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ requestFn, resolve, reject });
      this.process();
    });
  }

  async process() {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;

    while (this.queue.length > 0) {
      const { requestFn, resolve, reject } = this.queue.shift();
      try {
        const result = await requestFn();
        resolve(result);
      } catch (error) {
        reject(error);
      }
    }

    this.processing = false;
  }
}

export const requestQueue = new RequestQueue();

// Session heartbeat - validates session periodically
export class SessionManager {
  constructor() {
    this.heartbeatInterval = null;
    this.heartbeatIntervalMs = 5 * 60 * 1000; // 5 minutes
  }

  startHeartbeat(checkAuthFn) {
    this.stopHeartbeat(); // Clear any existing heartbeat

    this.heartbeatInterval = setInterval(async () => {
      try {
        const token = localStorage.getItem('invoice_management_token');
        if (token && !isTokenExpired(token)) {
          await checkAuthFn();
        } else {
          this.stopHeartbeat();
        }
      } catch (error) {
        console.error('Session heartbeat failed:', error);
        this.stopHeartbeat();
      }
    }, this.heartbeatIntervalMs);
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }
}

export const sessionManager = new SessionManager();
