import { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser } from '../services/api';
import { subscribeUser } from '../utils/pushNotification';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('neuro_token'));
  const [loading, setLoading] = useState(false);

  const safeDecodeJWT = (t) => {
    try {
      const base64Url = t.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error('JWT Decode Error:', e);
      return null;
    }
  };

  useEffect(() => {
    if (token) {
      const payload = safeDecodeJWT(token);
      if (payload) {
        const userObj = { _id: payload.id, name: payload.name, email: payload.email };
        setUser(userObj);
        if (payload.name) {
          localStorage.setItem('nn-displayName', payload.name);
        }

        // 🔔 AUTO-SUBSCRIBE: Silently request push permission & register subscription
        // Only run once per user session (tracked via localStorage flag)
        const alreadySubscribed = localStorage.getItem(`push_subscribed_${payload.id}`);
        if (!alreadySubscribed) {
          subscribeUser(payload.id).then((success) => {
            if (success) {
              localStorage.setItem(`push_subscribed_${payload.id}`, 'true');
              console.log('[AUTH] 🔔 Push subscription registered automatically.');
            }
          }).catch(() => {});
        }
      } else {
        logout();
      }
    }
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await loginUser({ email, password });
      const t = res.data.token;
      localStorage.setItem('neuro_token', t);
      setToken(t);
      return { success: true };
    } catch (err) {
      let msg = 'Login failed';
      if (!err.response) {
        msg = 'Connection Error: Please check your internet or API URL.';
      } else if (err.response.data && err.response.data.message) {
        msg = err.response.data.message;
      }
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      await registerUser({ name, email, password });
      return { success: true };
    } catch (err) {
      let msg = 'Registration failed';
      if (!err.response) {
        msg = 'Connection Error: Please check your internet or API URL.';
      } else if (err.response.data && err.response.data.message) {
        msg = err.response.data.message;
      }
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('neuro_token');
    localStorage.removeItem('nn-displayName');
    // Clear push subscription flag so it re-subscribes on next login
    if (user?._id) localStorage.removeItem(`push_subscribed_${user._id}`);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}
