
import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Trash2, User } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { deleteOrder } from "@/utils/fileStorage";

interface Order {
  id: string;
  customer?: string;
  customerName?: string;
  date: string;
  status: "pending" | "processing" | "completed" | "cancelled" | "shipped" | "delivered";
  total: string | number;
  products?: string[];
  items?: any[];
  userId?: string;
  orderNumber?: string;
  hasWinEligibleProducts?: boolean;
}

interface RecentOrdersProps {
  orders: Order[];
}

const RecentOrders: React.FC<RecentOrdersProps> = ({ orders = [] }) => {
  const { toast } = useToast();
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
  
  const getStatusBadgeColor = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      case "processing":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case "completed":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "cancelled":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      case "shipped":
        return "bg-purple-100 text-purple-800 hover:bg-purple-100";
      case "delivered":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  // Format date to readable format with Casablanca time
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      // Format date with Casablanca timezone (if browser supports it)
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Africa/Casablanca'
      }).format(date);
    } catch (error) {
      return dateString;
    }
  };

  // Get username from userId if available
  const getUserName = (order: Order) => {
    // If customer or customerName is provided, use it
    if (order.customer || order.customerName) {
      return order.customer || order.customerName;
    }
    
    // If userId is provided, try to get the username from localStorage
    if (order.userId) {
      try {
        const users = JSON.parse(localStorage.getItem("users") || "[]");
        const user = users.find((u: any) => u.id === order.userId);
        if (user) {
          return user.name || user.username;
        }
      } catch (error) {
        console.error("Error getting username:", error);
      }
    }
    
    // Default fallback
    return "Guest";
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      // Delete the order using our utility function
      await deleteOrder(orderId);
      
      // Show success toast
      toast({
        title: "Order Deleted",
        description: "The order has been successfully removed.",
      });
      
      // Reload the page to reflect changes
      window.location.reload();
    } catch (error) {
      console.error("Error deleting order:", error);
      toast({
        title: "Error",
        description: "Failed to delete order. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b">
        <h2 className="text-lg font-semibold text-gray-800">Recent Orders</h2>
      </div>
      <div className="overflow-x-auto">
        {orders.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No recent orders found</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4 text-gray-500" />
                      <span>{getUserName(order)}</span>
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(order.date)}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "font-normal",
                        getStatusBadgeColor(order.status)
                      )}
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {typeof order.total === 'number' 
                      ? `${order.total.toFixed(2)} ${currencySymbol}` 
                      : `${order.total} ${currencySymbol}`}
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDeleteOrder(order.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
      <div className="p-4 border-t text-center">
        <Link
          to="/dashboard/orders"
          className="text-sm text-store-DEFAULT hover:text-store-DEFAULT/80"
        >
          View all orders
        </Link>
      </div>
    </div>
  );
};

export default RecentOrders;
