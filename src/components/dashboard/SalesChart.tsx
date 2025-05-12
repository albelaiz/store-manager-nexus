
import React, { useEffect, useState } from "react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer
} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { getAllOrders } from "@/utils/fileStorage";
import { toast } from "sonner";

// Updated Order interface to match with fileStorage.ts
interface Order {
  id: string;
  orderNumber?: string;
  customerName?: string;
  customer?: string;
  date: string;
  status: "pending" | "processing" | "completed" | "cancelled" | "shipped" | "delivered";
  total: string | number;
  items?: any[];
  products?: string[];
  hasWinEligibleProducts?: boolean;
  userId?: string;
}

interface SalesData {
  name: string;
  sales: number;
}

interface SalesChartProps {
  orders?: Order[];
  startDate?: Date;
  endDate?: Date;
}

const SalesChart: React.FC<SalesChartProps> = ({ 
  orders: propOrders,
  startDate,
  endDate
}) => {
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currencySymbol, setCurrencySymbol] = useState("DH");

  useEffect(() => {
    // Get currency from settings
    try {
      const storedSettings = localStorage.getItem("userSettings");
      if (storedSettings) {
        const settings = JSON.parse(storedSettings);
        setCurrencySymbol(settings.currency === "USD" ? "$" : "DH");
      }
    } catch (error) {
      console.error("Error loading currency settings:", error);
    }
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      if (propOrders && propOrders.length > 0) {
        setOrders(propOrders);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const ordersData = await getAllOrders();
        setOrders(ordersData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching orders for chart:", error);
        toast.error("Failed to load sales data");
        setOrders([]);
        setLoading(false);
      }
    };

    fetchOrders();
  }, [propOrders]);

  useEffect(() => {
    try {
      if (loading) return;

      // Get the months for the chart (current month and 6 months before)
      const months = [];
      const currentDate = new Date();
      for (let i = 6; i >= 0; i--) {
        const month = new Date(currentDate);
        month.setMonth(currentDate.getMonth() - i);
        months.push(month);
      }

      // If date filters are provided, only process orders within that range
      let filteredOrders = orders;
      if (startDate && endDate) {
        filteredOrders = orders.filter(order => {
          if (!order.date) return false;
          const orderDate = new Date(order.date);
          return orderDate >= startDate && orderDate <= endDate;
        });
      }

      // Format the data for the chart
      const formattedData = months.map(month => {
        const monthName = format(month, 'MMM');
        const monthStart = startOfMonth(month);
        const monthEnd = endOfMonth(month);
        
        // Filter orders for the current month
        const monthOrders = filteredOrders.filter(order => {
          if (!order.date) return false;
          const orderDate = new Date(order.date);
          return orderDate >= monthStart && orderDate <= monthEnd;
        });
        
        // Calculate total sales for the month
        let monthlySales = 0;
        monthOrders.forEach(order => {
          if (typeof order.total === 'string') {
            const orderTotal = parseFloat(order.total.replace(/[^0-9.-]+/g, ''));
            if (!isNaN(orderTotal)) {
              monthlySales += orderTotal;
            }
          } else if (typeof order.total === 'number') {
            monthlySales += order.total;
          }
        });
        
        return {
          name: monthName,
          sales: Number(monthlySales.toFixed(2))
        };
      });
      
      setSalesData(formattedData);
    } catch (error) {
      console.error("Error processing sales data:", error);
      // Fallback to empty data
      setSalesData([
        { name: "Jan", sales: 0 },
        { name: "Feb", sales: 0 },
        { name: "Mar", sales: 0 },
        { name: "Apr", sales: 0 },
        { name: "May", sales: 0 },
        { name: "Jun", sales: 0 },
        { name: "Jul", sales: 0 },
      ]);
    }
  }, [orders, startDate, endDate, loading]);

  // Format the tooltip value using this function
  const formatTooltipValue = (value: number) => {
    return `${value} ${currencySymbol}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold mb-4 text-black-800">
        Sales Overview
        
      </h2>
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="h-80">
          <ChartContainer
            config={{
              sales: {
                label: "Sales",
                color: "#2563eb",
              },
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={salesData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis 
                  tickFormatter={(value) => `${value} ${currencySymbol}`} 
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      labelFormatter={(label) => `Month: ${label}`}
                      formatter={(value) => {
                        if (typeof value === 'number') {
                          return [`${value} ${currencySymbol}`, 'Sales'];
                        }
                        return [value, ''];
                      }}
                    />
                  }
                />
                <Legend formatter={(value) => `${value} (${currencySymbol})`} />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="#2563eb"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      )}
    </div>
  );
};

export default SalesChart;
