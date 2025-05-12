import { toast } from "sonner";

// Types
interface Product {
  id: string;
  name: string;
  category: string;
  price: string | number;
  stock: number;
  winEligible?: boolean;
  sales?: number;
  imageUrl?: string;
  userId?: string; // Add userId to associate products with users
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  date: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  total: number;
  items: any[];
  hasWinEligibleProducts: boolean;
  userId?: string; // Add userId to associate orders with users
}

interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  isAdmin?: boolean;
  role: 'admin' | 'user';
}

interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  read: boolean;
  userId?: string; // Add userId to associate notifications with users
}

// Helper functions to simulate file-based storage using IndexedDB
// This is much more scalable than localStorage and can handle large amounts of data

const DB_NAME = "najihkids_db";
const DB_VERSION = 1;
const STORES = {
  PRODUCTS: "products",
  ORDERS: "orders",
  USERS: "users",
  NOTIFICATIONS: "notifications",
  SETTINGS: "settings"
};

// Initialize the database
const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains(STORES.PRODUCTS)) {
        db.createObjectStore(STORES.PRODUCTS, { keyPath: "id" });
      }
      
      if (!db.objectStoreNames.contains(STORES.ORDERS)) {
        db.createObjectStore(STORES.ORDERS, { keyPath: "id" });
      }
      
      if (!db.objectStoreNames.contains(STORES.USERS)) {
        db.createObjectStore(STORES.USERS, { keyPath: "id" });
      }
      
      if (!db.objectStoreNames.contains(STORES.NOTIFICATIONS)) {
        db.createObjectStore(STORES.NOTIFICATIONS, { keyPath: "id" });
      }
      
      if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
        db.createObjectStore(STORES.SETTINGS, { keyPath: "id" });
      }
    };
    
    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };
    
    request.onerror = (event) => {
      console.error("Database error:", (event.target as IDBOpenDBRequest).error);
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
};

// Generic function to get all items from a store
const getAllItems = async <T>(storeName: string): Promise<T[]> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      
      request.onsuccess = () => {
        resolve(request.result);
      };
      
      request.onerror = () => {
        console.error(`Error getting all items from ${storeName}:`, request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error(`Error in getAllItems for ${storeName}:`, error);
    return [];
  }
};

// Generic function to save an item to a store
const saveItem = async <T>(storeName: string, item: T): Promise<T> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.put(item);
      
      request.onsuccess = () => {
        resolve(item);
      };
      
      request.onerror = () => {
        console.error(`Error saving item to ${storeName}:`, request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error(`Error in saveItem for ${storeName}:`, error);
    throw error;
  }
};

// Generic function to save multiple items to a store
const saveItems = async <T>(storeName: string, items: T[]): Promise<T[]> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      
      let completed = 0;
      
      items.forEach((item) => {
        const request = store.put(item);
        
        request.onsuccess = () => {
          completed++;
          if (completed === items.length) {
            resolve(items);
          }
        };
        
        request.onerror = () => {
          console.error(`Error saving items to ${storeName}:`, request.error);
          reject(request.error);
        };
      });
    });
  } catch (error) {
    console.error(`Error in saveItems for ${storeName}:`, error);
    throw error;
  }
};

// Generic function to delete an item from a store
const deleteItem = async (storeName: string, id: string): Promise<void> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);
      
      request.onsuccess = () => {
        resolve();
      };
      
      request.onerror = () => {
        console.error(`Error deleting item from ${storeName}:`, request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error(`Error in deleteItem for ${storeName}:`, error);
    throw error;
  }
};

// Get current user ID from localStorage
const getCurrentUserId = (): string | null => {
  const currentUser = localStorage.getItem("currentUser");
  if (currentUser) {
    return JSON.parse(currentUser).id;
  }
  return null;
};

// Check if current user is admin
const isCurrentUserAdmin = (): boolean => {
  const currentUser = localStorage.getItem("currentUser");
  if (currentUser) {
    return JSON.parse(currentUser).role === 'admin';
  }
  return false;
};

// Product specific functions
export const getAllProducts = async (): Promise<Product[]> => {
  try {
    console.log("Getting all products, is admin:", isCurrentUserAdmin());
    const products = await getAllItems<Product>(STORES.PRODUCTS);
    
    // If user is admin, return all products
    if (isCurrentUserAdmin()) {
      console.log("Admin user, returning all products:", products.length);
      return products;
    }
    
    // Otherwise, return only the user's products
    const userId = getCurrentUserId();
    console.log("Regular user, filtering products for userId:", userId);
    
    const filteredProducts = userId ? 
      products.filter(product => !product.userId || product.userId === userId) : 
      [];
      
    console.log("Filtered products count:", filteredProducts.length);
    return filteredProducts;
  } catch (error) {
    console.error("Error getting products:", error);
    return [];
  }
};

export const saveProduct = async (product: Product): Promise<Product> => {
  try {
    // Ensure product has userId
    const userId = getCurrentUserId();
    const productWithUserId = {
      ...product,
      userId: product.userId || userId
    };
    console.log("Saving product with userId:", productWithUserId.userId);
    return saveItem<Product>(STORES.PRODUCTS, productWithUserId);
  } catch (error) {
    console.error("Error saving product:", error);
    throw error;
  }
};

export const saveProducts = async (products: Product[]): Promise<Product[]> => {
  try {
    // Ensure all products have userId
    const userId = getCurrentUserId();
    const productsWithUserId = products.map(product => ({
      ...product,
      userId: product.userId || userId
    }));
    return saveItems<Product>(STORES.PRODUCTS, productsWithUserId);
  } catch (error) {
    console.error("Error saving products:", error);
    throw error;
  }
};

export const deleteProduct = async (id: string): Promise<void> => {
  return deleteItem(STORES.PRODUCTS, id);
};

// Order specific functions
export const getAllOrders = async (): Promise<Order[]> => {
  try {
    console.log("Getting all orders, is admin:", isCurrentUserAdmin());
    const orders = await getAllItems<Order>(STORES.ORDERS);
    
    // If user is admin, return all orders
    if (isCurrentUserAdmin()) {
      console.log("Admin user, returning all orders:", orders.length);
      return orders;
    }
    
    // Otherwise, return only the user's orders
    const userId = getCurrentUserId();
    console.log("Regular user, filtering orders for userId:", userId);
    
    const filteredOrders = userId ? 
      orders.filter(order => order.userId === userId) : 
      [];
      
    console.log("Filtered orders count:", filteredOrders.length);
    return filteredOrders;
  } catch (error) {
    console.error("Error getting orders:", error);
    return [];
  }
};

export const saveOrder = async (order: Order): Promise<Order> => {
  try {
    // Ensure order has userId
    const userId = getCurrentUserId();
    const orderWithUserId = {
      ...order,
      userId: order.userId || userId
    };
    console.log("Saving order with userId:", orderWithUserId.userId);
    return saveItem<Order>(STORES.ORDERS, orderWithUserId);
  } catch (error) {
    console.error("Error saving order:", error);
    throw error;
  }
};

export const saveOrders = async (orders: Order[]): Promise<Order[]> => {
  try {
    // Ensure all orders have userId
    const userId = getCurrentUserId();
    const ordersWithUserId = orders.map(order => ({
      ...order,
      userId: order.userId || userId
    }));
    return saveItems<Order>(STORES.ORDERS, ordersWithUserId);
  } catch (error) {
    console.error("Error saving orders:", error);
    throw error;
  }
};

export const deleteOrder = async (id: string): Promise<void> => {
  // Only allow deletion if admin or the order belongs to the current user
  const userId = getCurrentUserId();
  const isAdmin = isCurrentUserAdmin();
  
  try {
    if (!isAdmin) {
      // For non-admins, check if the order belongs to them
      const orders = await getAllItems<Order>(STORES.ORDERS);
      const order = orders.find(o => o.id === id);
      
      if (!order || order.userId !== userId) {
        throw new Error("You don't have permission to delete this order");
      }
    }
    
    return deleteItem(STORES.ORDERS, id);
  } catch (error) {
    console.error("Error deleting order:", error);
    throw error;
  }
};

// User specific functions
export const getAllUsers = async (): Promise<User[]> => {
  // Only admin should be able to see all users
  if (!isCurrentUserAdmin()) {
    console.warn("Non-admin trying to access all users");
    return [];
  }
  return getAllItems<User>(STORES.USERS);
};

export const saveUser = async (user: User): Promise<User> => {
  return saveItem<User>(STORES.USERS, user);
};

export const saveUsers = async (users: User[]): Promise<User[]> => {
  return saveItems<User>(STORES.USERS, users);
};

// Notification specific functions
export const getAllNotifications = async (): Promise<Notification[]> => {
  try {
    const notifications = await getAllItems<Notification>(STORES.NOTIFICATIONS);
    
    // If user is admin, return all notifications
    if (isCurrentUserAdmin()) {
      return notifications;
    }
    
    // Otherwise, return only the user's notifications
    const userId = getCurrentUserId();
    return userId ? 
      notifications.filter(notification => !notification.userId || notification.userId === userId) : 
      [];
  } catch (error) {
    console.error("Error getting notifications:", error);
    return [];
  }
};

export const saveNotification = async (notification: Notification): Promise<Notification> => {
  try {
    // Ensure notification has userId
    const userId = getCurrentUserId();
    const notificationWithUserId = {
      ...notification,
      userId: notification.userId || userId
    };
    return saveItem<Notification>(STORES.NOTIFICATIONS, notificationWithUserId);
  } catch (error) {
    console.error("Error saving notification:", error);
    throw error;
  }
};

export const saveNotifications = async (notifications: Notification[]): Promise<Notification[]> => {
  try {
    // Ensure all notifications have userId
    const userId = getCurrentUserId();
    const notificationsWithUserId = notifications.map(notification => ({
      ...notification,
      userId: notification.userId || userId
    }));
    return saveItems<Notification>(STORES.NOTIFICATIONS, notificationsWithUserId);
  } catch (error) {
    console.error("Error saving notifications:", error);
    throw error;
  }
};

// Migration functions to move data from localStorage to IndexedDB
export const migrateFromLocalStorage = async (): Promise<void> => {
  try {
    // Get current user ID
    const userId = getCurrentUserId();
    
    // Migrate products
    const localStorageProducts = localStorage.getItem("products");
    if (localStorageProducts) {
      const products = JSON.parse(localStorageProducts);
      // Add userId to each product
      const productsWithUserId = products.map((product: Product) => ({
        ...product,
        userId: product.userId || userId
      }));
      await saveProducts(productsWithUserId);
    }
    
    // Migrate orders
    const localStorageOrders = localStorage.getItem("orders");
    if (localStorageOrders) {
      const orders = JSON.parse(localStorageOrders);
      // Add userId to each order
      const ordersWithUserId = orders.map((order: Order) => ({
        ...order,
        userId: order.userId || userId
      }));
      await saveOrders(ordersWithUserId);
    }
    
    // Migrate users
    const localStorageUsers = localStorage.getItem("users");
    if (localStorageUsers) {
      const users = JSON.parse(localStorageUsers);
      await saveUsers(users);
    }
    
    // Migrate notifications
    const localStorageNotifications = localStorage.getItem("notifications");
    if (localStorageNotifications) {
      const notifications = JSON.parse(localStorageNotifications);
      // Add userId to each notification
      const notificationsWithUserId = notifications.map((notification: Notification) => ({
        ...notification,
        userId: notification.userId || userId
      }));
      await saveNotifications(notificationsWithUserId);
    }
    
    // Save a flag to indicate migration is complete
    localStorage.setItem("migrationComplete", "true");
    
    toast.success("Data migration complete", {
      description: "Your data has been migrated to the new storage system",
    });
    
    console.log("Migration from localStorage to IndexedDB complete");
  } catch (error) {
    console.error("Error during migration:", error);
    toast.error("Migration failed", {
      description: "Please try again or contact support",
    });
  }
};

// Check if we need to migrate
export const checkAndMigrate = async (): Promise<void> => {
  const migrationComplete = localStorage.getItem("migrationComplete") === "true";
  
  if (!migrationComplete) {
    await migrateFromLocalStorage();
  }
};
