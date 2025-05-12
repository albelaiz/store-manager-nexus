
import React, { useEffect, useState } from "react";
import { Package, ShoppingCart, TrendingUp } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import RecentOrders from "@/components/dashboard/RecentOrders";
import SalesChart from "@/components/dashboard/SalesChart";
import PopularProducts from "@/components/dashboard/PopularProducts";
import DateFilter from "@/components/dashboard/DateFilter";
import { startOfMonth, subMonths } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { getAllOrders, getAllProducts } from "@/utils/fileStorage";

// Updated Order interface to match with fileStorage.ts
interface Order {
  id: string;
  orderNumber?: string;
  customerName?: string;
  customer?: string;
  date: string;
  status: "pending" | "processing" | "completed" | "cancelled" | "shipped" | "delivered";
  total: string | number;
  products?: string[];
  items?: any[];
  userId?: string;
  hasWinEligibleProducts?: boolean;
}

// Updated Product interface to match with fileStorage.ts
interface Product {
  id: string;
  name: string;
  category: string;
  price: string | number;
  stock: number;
  winEligible?: boolean;
  sales?: number;
  description?: string;
  userId?: string;
}

const Dashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
  });
  const [currencySymbol, setCurrencySymbol] = useState("DH");
  
  const { user, isAdmin } = useAuth();

  // Date filters
  const [startDate, setStartDate] = useState<Date | undefined>(
    startOfMonth(subMonths(new Date(), 6))
  );
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());

  // Load settings including currency
  useEffect(() => {
    try {
      const storedSettings = localStorage.getItem("userSettings");
      if (storedSettings) {
        const settings = JSON.parse(storedSettings);
        setCurrencySymbol(settings.currency === "USD" ? "$" : "DH");
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  }, []);

  // Function to load data from IndexedDB
  const loadData = async () => {
    try {
      setLoading(true);
      
      // Get orders and products using our utility functions
      // These functions now handle user permissions
      const ordersData = await getAllOrders();
      const productsData = await getAllProducts();
      
      // Set the data
      setOrders(ordersData as Order[]);
      setProducts(productsData as Product[]);
      
      // Apply date filters
      applyFilters(ordersData as Order[]);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (ordersData: Order[]) => {
    let filtered = [...ordersData];
    
    if (startDate || endDate) {
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.date);
        const isAfterStart = startDate ? orderDate >= startDate : true;
        const isBeforeEnd = endDate ? orderDate <= endDate : true;
        return isAfterStart && isBeforeEnd;
      });
    }
    
    setFilteredOrders(filtered);
    
    // Calculate dashboard stats based on filtered orders
    const totalOrders = filtered.length;
    
    // Calculate revenue from orders
    let totalRevenue = 0;
    filtered.forEach((order: Order) => {
      let orderTotal = 0;
    
      if (typeof order.total === "string") {
        orderTotal = parseFloat(order.total.replace(/[^0-9.-]+/g, ""));
      } else if (typeof order.total === "number") {
        orderTotal = order.total;
      }
    
      if (!isNaN(orderTotal)) {
        totalRevenue += orderTotal;
      }
    });
    
    // Set the stats
    setStats({
      totalOrders,
      totalRevenue,
      totalProducts: products.length,
    });
  };

  useEffect(() => {
    loadData();

    // Set up event listener for storage changes
    window.addEventListener('storage', () => loadData());
    
    // Clean up
    return () => {
      window.removeEventListener('storage', () => loadData());
    };
  }, []);

  // Apply filters when date filter changes
  useEffect(() => {
    if (orders.length > 0) {
      applyFilters(orders);
    }
  }, [startDate, endDate, orders]);

  const handleResetFilters = () => {
    setStartDate(startOfMonth(subMonths(new Date(), 6)));
    setEndDate(new Date());
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-gray-500">
          {isAdmin 
            ? "Welcome back Admin! Here's an overview of all store data." 
            : `Welcome back ${user?.name}! Here's an overview of your store data.`}
        </p>
      </div>
      
      {loading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-store-DEFAULT"></div>
        </div>
      ) : (
        <>
          <DateFilter
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            onReset={handleResetFilters}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Total Orders"
              value={stats.totalOrders.toString()}
              trend="up"
              trendValue={`${orders.length > 0 ? Math.round((orders.filter(o => 
                new Date(o.date) > new Date(new Date().setMonth(new Date().getMonth() - 1))
              ).length / orders.length) * 100) : 0}% from last month`}
              icon={<ShoppingCart className="h-5 w-5" />}
            />
            <StatCard
              title="Revenue"
              value={`${stats.totalRevenue.toFixed(2)} ${currencySymbol}`}
              trend="up"
              trendValue="Based on completed orders"
              icon={<TrendingUp className="h-5 w-5" />}
            />
            <StatCard
              title="Products"
              value={stats.totalProducts.toString()}
              trend="neutral"
              trendValue={`${products.filter(p => p.winEligible).length} win eligible`}
              icon={<Package className="h-5 w-5" />}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SalesChart orders={filteredOrders} startDate={startDate} endDate={endDate} />
            <div className="space-y-6">
              <RecentOrders orders={filteredOrders.slice(0, 5)} />
            </div>
          </div>

          <div>
            <PopularProducts products={products as any} />
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
