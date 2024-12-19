import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Validate token on mount
  useEffect(() => {
    const validateToken = async () => {
      if (token) {
        try {
          await axios.get('/api/tasks');
          setIsAuthenticated(true);
        } catch (error) {
          if (error.response?.status === 401) {
            saveToken(null, null);
          }
        }
      }
      setIsLoading(false);
    };

    validateToken();
  }, [token]);

  const saveToken = (newToken, userData) => {
    if (newToken) {
      localStorage.setItem('authToken', newToken);
      setToken(newToken);
      setUser(userData);
      setIsAuthenticated(true);
    } else {
      localStorage.removeItem('authToken');
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
    }
    setError(null);
  };

  const signup = async (email, password) => {
    try {
      setIsLoading(true);
      const response = await axios.post('/api/auth/signup', { email, password });
      saveToken(response.data.token, { _id: response.data._id, email: response.data.email });
      return true;
    } catch (error) {
      setError(error.response?.data?.message || 'Signup failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setIsLoading(true);
      const response = await axios.post('/api/auth/login', { email, password });
      saveToken(response.data.token, { _id: response.data._id, email: response.data.email });
      return true;
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    saveToken(null, null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated,
        isLoading,
        error,
        signup,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 