/**
 * Auth Singleton - Prevents duplicate Firebase Auth listeners
 * Provides a single, reliable auth state management across the app
 */

import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

class AuthSingleton {
  constructor() {
    this.currentUser = null;
    this.listeners = new Set();
    this.unsubscribeAuth = null;
    this.initialized = false;
    this.initializing = false;
  }

  /**
   * Initialize the auth singleton - only called once
   */
  async initialize() {
    if (this.initialized || this.initializing) {
      return this.currentUser;
    }

    this.initializing = true;
    
    return new Promise((resolve) => {
      console.log('🔧 AuthSingleton: Setting up single auth listener');
      
      this.unsubscribeAuth = onAuthStateChanged(auth, (user) => {
        const prevUser = this.currentUser;
        this.currentUser = user;
        
        if (!this.initialized) {
          this.initialized = true;
          this.initializing = false;
          console.log('✅ AuthSingleton: Initial auth state resolved', user ? user.uid : 'no user');
          resolve(user);
        }
        
        // Notify all listeners of auth state change
        this.listeners.forEach(callback => {
          try {
            callback(user, prevUser);
          } catch (error) {
            console.error('❌ AuthSingleton: Listener error:', error);
          }
        });
      });
    });
  }

  /**
   * Add a listener for auth state changes
   * @param {Function} callback - Called with (user, prevUser)
   * @returns {Function} unsubscribe function
   */
  addListener(callback) {
    if (!this.initialized && !this.initializing) {
      this.initialize();
    }
    
    this.listeners.add(callback);
    
    // Immediately call with current state if available
    if (this.initialized) {
      callback(this.currentUser, null);
    }
    
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Get current user (null if not authenticated)
   */
  getCurrentUser() {
    return this.currentUser;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.currentUser;
  }

  /**
   * Get user ID safely
   */
  getUserId() {
    return this.currentUser?.uid || null;
  }

  /**
   * Clean up all listeners (call on app shutdown)
   */
  destroy() {
    if (this.unsubscribeAuth) {
      this.unsubscribeAuth();
      this.unsubscribeAuth = null;
    }
    
    this.listeners.clear();
    this.currentUser = null;
    this.initialized = false;
    this.initializing = false;
    
    // console.log('🗑️ AuthSingleton: Cleaned up');
  }
}

// Export singleton instance
export const authSingleton = new AuthSingleton();

// Convenience hooks for React
export const useAuthSingleton = () => {
  const [user, setUser] = React.useState(authSingleton.getCurrentUser());
  const [loading, setLoading] = React.useState(!authSingleton.initialized);

  React.useEffect(() => {
    const unsubscribe = authSingleton.addListener((newUser) => {
      setUser(newUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { user, loading, isAuthenticated: !!user };
};

export default authSingleton;