
import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username:string, password:string) => Promise<void>;
  register: (username:string, email:string, password:string, role:'receiver' | 'donor') => Promise<void>;
  logout: () => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Used to show a spinner while we check for a token
  const navigate = useNavigate();

  useEffect(() => {
    const checkLoggedInStatus = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const { data } = await axiosInstance.get<User>('/me/');
          setUser(data);
        } catch (error) {
          console.error('Token is invalid or expired', error);
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
      }
      setLoading(false); 
    };

    checkLoggedInStatus();
  }, []); 

  const login = async (username:string, password:string) => {
    const response = await axiosInstance.post('/token/', { username, password });
    localStorage.setItem('access_token', response.data.access);
    localStorage.setItem('refresh_token', response.data.refresh);
    const { data } = await axiosInstance.get<User>('/me/');
    setUser(data);
    navigate('/'); 
  };

  const register = async (username:string, email:string, password:string, role:'donor' | 
    'receiver'
  ) => {
    await axiosInstance.post('/register/', { username, email, password, role });
    await login(username, password);
  };

  const logout = () => {
    setUser(null); // Clear the user from state.
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login'); // Redirect to the login page.
  };

  const contextValue = { user, loading, login, register, logout };

  return (
    <AuthContext.Provider value={contextValue}>
      {/* We only render the children (the rest of the app) when we are not in the initial 
        loading state. This prevents a flicker of content before we know if the user is logged in.
      */}
      {!loading && children}
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