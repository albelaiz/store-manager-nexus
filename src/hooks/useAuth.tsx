
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  username: string;
  role: 'admin' | 'user'; // Restricting the role to these two specific values
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  createUser: (name: string, username: string, password: string, role: 'admin' | 'user') => Promise<boolean>;
  changePassword: (userId: string, newPassword: string) => Promise<boolean>;
  deleteUser: (userId: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast: uiToast } = useToast();

  useEffect(() => {
    // Check if user is logged in from localStorage
    const loginStatus = localStorage.getItem('isLoggedIn') === 'true';
    if (loginStatus) {
      const userData = localStorage.getItem('currentUser');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        // Ensure the role is either 'admin' or 'user'
        const validRole: 'admin' | 'user' = parsedUser.role === 'admin' ? 'admin' : 'user';
        const typedUser: User = {
          ...parsedUser,
          role: validRole
        };
        setUser(typedUser);
        setIsLoggedIn(true);
        setIsAdmin(validRole === 'admin');
        console.log("Auth initialized, user role:", validRole, "isAdmin:", validRole === 'admin');
      }
    }
    
    // Initialize the admin user if no users exist yet
    const initializeAdmin = () => {
      // Initialize users array if it doesn't exist
      if (!localStorage.getItem('users')) {
        localStorage.setItem('users', JSON.stringify([]));
      }
      
      // Get users from localStorage
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      
      // Check if admin user already exists
      const adminExists = users.some((user: any) => user.username === 'admin');
      
      if (!adminExists) {
        console.log("Creating admin user");
        const adminUser = {
          id: "admin-id",
          name: "Admin User",
          username: "admin",
          password: "password", // In a real app, this should be hashed
          role: "admin"
        };
        users.push(adminUser);
        localStorage.setItem('users', JSON.stringify(users));
        console.log("Admin user initialized");
      } else {
        console.log("Admin user already exists");
      }
    };
    
    initializeAdmin();
  }, []);

  const hasPermission = (permission: string): boolean => {
    if (!isLoggedIn || !user) return false;
    
    // Admin has access to everything
    if (user.role === 'admin') return true;
    
    // Define permissions for regular users
    if (user.role === 'user') {
      const userPermissions = [
        'view_products',
        'add_order',
        'view_own_orders',
        'delete_own_orders',
        'edit_own_products',
        'view_profile',
        'view_settings'
      ];
      
      return userPermissions.includes(permission);
    }
    
    return false;
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      console.log("Attempting login with username:", username);
      
      // Get users from localStorage
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      
      console.log("Available users:", users.length);
      
      // Find user by username
      const foundUser = users.find((u: any) => u.username === username);
      
      if (!foundUser) {
        console.log("User not found with username:", username);
        uiToast({
          title: 'Login Failed',
          description: 'User not found. Please check your username.',
          variant: 'destructive',
        });
        return false;
      }
      
      // Check if password is correct
      if (foundUser.password !== password) {
        uiToast({
          title: 'Login Failed',
          description: 'Incorrect password. Please try again.',
          variant: 'destructive',
        });
        return false;
      }
      
      // Store user info and login status in localStorage
      const role: 'admin' | 'user' = foundUser.role === 'admin' ? 'admin' : 'user';
      const userData: User = {
        id: foundUser.id,
        name: foundUser.name,
        username: foundUser.username,
        role: role
      };
      
      localStorage.setItem('currentUser', JSON.stringify(userData));
      localStorage.setItem('isLoggedIn', 'true');
      
      // Update state
      setUser(userData);
      setIsLoggedIn(true);
      setIsAdmin(role === 'admin');
      
      console.log("User login successful, role:", role, "isAdmin:", role === 'admin');
      
      uiToast({
        title: 'Login Successful',
        description: `Welcome back, ${foundUser.name}!`,
      });
      
      // Dispatch a storage event to notify other components about the login
      window.dispatchEvent(new Event('storage'));
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      uiToast({
        title: 'Login Error',
        description: 'An error occurred during login. Please try again.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const createUser = async (name: string, username: string, password: string, role: 'admin' | 'user'): Promise<boolean> => {
    try {
      // Only admins can create new users
      if (!isAdmin) {
        uiToast({
          title: 'Permission Denied',
          description: 'Only administrators can create new users.',
          variant: 'destructive',
        });
        return false;
      }
      
      // Get all users from localStorage
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      
      // Check if username already exists
      if (users.some((user: any) => user.username === username)) {
        uiToast({
          title: 'User Creation Failed',
          description: 'This username is already taken. Please choose another one.',
          variant: 'destructive',
        });
        return false;
      }
      
      // Create unique user ID
      const userId = `user_${Date.now()}`;
      
      // Create new user object
      const newUser = {
        id: userId,
        name,
        username,
        password, // In a real app, this should be hashed
        role
      };
      
      // Add user to the array and save back to localStorage
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      
      uiToast({
        title: 'User Created',
        description: `New ${role} account has been created successfully.`,
      });
      
      return true;
    } catch (error) {
      console.error('Error creating user:', error);
      uiToast({
        title: 'Error',
        description: 'Failed to create user. Please try again.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const changePassword = async (userId: string, newPassword: string): Promise<boolean> => {
    try {
      // Only admins can change passwords
      if (!isAdmin) {
        uiToast({
          title: 'Permission Denied',
          description: 'Only administrators can change user passwords.',
          variant: 'destructive',
        });
        return false;
      }
      
      // Get all users from localStorage
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      
      // Find the user to update
      const userIndex = users.findIndex((user: any) => user.id === userId);
      
      if (userIndex === -1) {
        uiToast({
          title: 'User Not Found',
          description: 'Could not find the user to update.',
          variant: 'destructive',
        });
        return false;
      }
      
      // Update the password
      users[userIndex].password = newPassword;
      
      // Save back to localStorage
      localStorage.setItem('users', JSON.stringify(users));
      
      uiToast({
        title: 'Password Updated',
        description: `Password for ${users[userIndex].username} has been updated successfully.`,
      });
      
      return true;
    } catch (error) {
      console.error('Error updating password:', error);
      uiToast({
        title: 'Error',
        description: 'Failed to update password. Please try again.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const deleteUser = async (userId: string): Promise<boolean> => {
    try {
      // Only admins can delete users
      if (!isAdmin) {
        uiToast({
          title: 'Permission Denied',
          description: 'Only administrators can delete users.',
          variant: 'destructive',
        });
        return false;
      }
      
      // Get all users from localStorage
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      
      // Find the user to delete
      const userToDelete = users.find((user: any) => user.id === userId);
      
      if (!userToDelete) {
        uiToast({
          title: 'User Not Found',
          description: 'Could not find the user to delete.',
          variant: 'destructive',
        });
        return false;
      }
      
      // Prevent deleting admin user
      if (userToDelete.username === 'admin') {
        uiToast({
          title: 'Cannot Delete Admin',
          description: 'The admin user cannot be deleted.',
          variant: 'destructive',
        });
        return false;
      }
      
      // Remove the user
      const updatedUsers = users.filter((user: any) => user.id !== userId);
      
      // Save back to localStorage
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      
      uiToast({
        title: 'User Deleted',
        description: `User ${userToDelete.username} has been deleted successfully.`,
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      uiToast({
        title: 'Error',
        description: 'Failed to delete user. Please try again.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const logout = () => {
    // Clear user info and login status from localStorage
    localStorage.removeItem('currentUser');
    localStorage.setItem('isLoggedIn', 'false');
    
    // Clear any history state that might be used for returns
    window.history.replaceState(null, '', '/login');
    
    // Update state
    setUser(null);
    setIsLoggedIn(false);
    setIsAdmin(false);
    
    // Force navigation to login
    navigate('/login', { replace: true });
    
    // Use Sonner toast for logout notification
    toast.success('Logged Out', {
      description: 'You have been successfully logged out.',
    });
    
    // Dispatch a storage event to notify other components about the logout
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoggedIn, 
      isAdmin, 
      login, 
      logout, 
      hasPermission, 
      createUser,
      changePassword,
      deleteUser 
    }}>
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
