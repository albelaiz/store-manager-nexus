import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Filter, Gift, Search, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { BarcodeScanner } from "@/components/scanner/BarcodeScanner";

interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  winEligible: boolean;
  imageUrl?: string;
  category?: string;
  barcode?: string; // New property for barcode
  stock?: number; // Include stock information
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  date: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  total: number;
  items: Product[];
  hasWinEligibleProducts: boolean; // Flag to track win-eligible products
  userId?: string; // Add the userId to the order
}

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterWinEligible, setFilterWinEligible] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Product selection for new order
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [filteredAvailableProducts, setFilteredAvailableProducts] = useState<Product[]>([]);

  // New order form state
  const [customerName, setCustomerName] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");

  // Scanner state
  const [isScannerEnabled, setIsScannerEnabled] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    // Load orders from localStorage or initialize with sample data
    const storedOrders = localStorage.getItem("orders");
    if (storedOrders) {
      try {
        const parsedOrders = JSON.parse(storedOrders);
        
        // Update existing orders to include the win eligibility flag
        const updatedOrders = parsedOrders.map((order: any) => {
          // Check if any items are win eligible
          const hasWinEligible = order.items && order.items.some((item: any) => 
            item.winEligible !== undefined ? item.winEligible : false
          );
          
          return {
            ...order,
            hasWinEligibleProducts: hasWinEligible
          };
        });
        
        setOrders(updatedOrders);
        setFilteredOrders(updatedOrders);
        
        // Update localStorage with the updated orders
        localStorage.setItem("orders", JSON.stringify(updatedOrders));
      } catch (error) {
        console.error("Error parsing orders:", error);
        initializeWithSampleData();
      }
    } else {
      initializeWithSampleData();
    }
    
    // Load products for the product selection
    loadAvailableProducts();
  }, []);

  useEffect(() => {
    // Apply filters whenever orders, filterStatus, filterWinEligible or searchTerm changes
    let result = [...orders];

    if (filterStatus !== "all") {
      result = result.filter(order => order.status === filterStatus);
    }
    
    if (filterWinEligible !== "all") {
      result = result.filter(order => 
        filterWinEligible === "eligible" ? order.hasWinEligibleProducts : !order.hasWinEligibleProducts
      );
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        order =>
          order.orderNumber.toLowerCase().includes(term) ||
          order.customerName.toLowerCase().includes(term)
      );
    }

    setFilteredOrders(result);
  }, [orders, filterStatus, filterWinEligible, searchTerm]);

  // Filter available products based on search term
  useEffect(() => {
    if (!productSearchTerm.trim()) {
      setFilteredAvailableProducts(availableProducts);
    } else {
      const term = productSearchTerm.toLowerCase().trim();
      const filtered = availableProducts.filter(product => 
        product.name.toLowerCase().includes(term) || 
        (product.category && product.category.toLowerCase().includes(term))
      );
      setFilteredAvailableProducts(filtered);
    }
  }, [productSearchTerm, availableProducts]);

  const loadAvailableProducts = () => {
    const storedProducts = localStorage.getItem("products");
    if (storedProducts) {
      try {
        const parsedProducts = JSON.parse(storedProducts);
        // Transform to the format we need for order items
        const productOptions = parsedProducts.map((product: any) => ({
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          winEligible: product.winEligible !== undefined ? product.winEligible : true,
          imageUrl: product.imageUrl,
          category: product.category,
          barcode: product.barcode, // Add barcode property
          stock: product.stock || 10 // Include stock information
        }));
        setAvailableProducts(productOptions);
        setFilteredAvailableProducts(productOptions);
      } catch (error) {
        console.error("Error parsing products:", error);
        setAvailableProducts([]);
        setFilteredAvailableProducts([]);
      }
    }
  };

  const initializeWithSampleData = () => {
    const sampleOrders: Order[] = [
      {
        id: "1",
        orderNumber: "ORD-001",
        customerName: "John Doe",
        date: "2025-04-28",
        status: "delivered",
        total: 129.99,
        items: [
          { id: "p1", name: "Wireless Headphones", quantity: 1, price: 129.99, winEligible: true }
        ],
        hasWinEligibleProducts: true
      },
      {
        id: "2",
        orderNumber: "ORD-002",
        customerName: "Jane Smith",
        date: "2025-04-27",
        status: "processing",
        total: 249.98,
        items: [
          { id: "p2", name: "Smartphone Case", quantity: 1, price: 24.99, winEligible: true },
          { id: "p3", name: "Bluetooth Speaker", quantity: 1, price: 224.99, winEligible: false }
        ],
        hasWinEligibleProducts: true
      },
      {
        id: "3",
        orderNumber: "ORD-003",
        customerName: "Robert Brown",
        date: "2025-04-25",
        status: "pending",
        total: 74.97,
        items: [
          { id: "p4", name: "USB-C Cable Pack", quantity: 3, price: 24.99, winEligible: false }
        ],
        hasWinEligibleProducts: false
      }
    ];

    setOrders(sampleOrders);
    setFilteredOrders(sampleOrders);
    localStorage.setItem("orders", JSON.stringify(sampleOrders));
  };

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleAddProduct = (productId: string) => {
    const product = availableProducts.find(p => p.id === productId);
    if (!product) return;
    
    // Check if product is out of stock
    if (product.stock !== undefined && product.stock <= 0) {
      toast({
        title: "Out of Stock",
        description: `${product.name} is currently out of stock.`,
        variant: "destructive"
      });
      return;
    }

    // Check if product is already selected
    const existingProduct = selectedProducts.find(p => p.id === productId);
    if (existingProduct) {
      // Update quantity if already selected
      setSelectedProducts(
        selectedProducts.map(p =>
          p.id === productId 
            ? { ...p, quantity: p.quantity + 1 } 
            : p
        )
      );
    } else {
      // Add new product
      setSelectedProducts([...selectedProducts, { ...product, quantity: 1 }]);
    }
  };

  const handleQuickAddProduct = (product: Product) => {
    // Check if product is out of stock
    if (product.stock !== undefined && product.stock <= 0) {
      toast({
        title: "Out of Stock",
        description: `${product.name} is currently out of stock.`,
        variant: "destructive"
      });
      return;
    }
    
    // Check if product is already selected
    const existingProduct = selectedProducts.find(p => p.id === product.id);
    if (existingProduct) {
      // Update quantity if already selected
      setSelectedProducts(
        selectedProducts.map(p =>
          p.id === product.id 
            ? { ...p, quantity: p.quantity + 1 } 
            : p
        )
      );
    } else {
      // Add new product
      setSelectedProducts([...selectedProducts, { ...product, quantity: 1 }]);
    }
  };

  const handleUpdateProductQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      // Remove product if quantity is 0 or negative
      setSelectedProducts(selectedProducts.filter(p => p.id !== productId));
    } else {
      // Update quantity
      setSelectedProducts(
        selectedProducts.map(p =>
          p.id === productId ? { ...p, quantity } : p
        )
      );
    }
  };

  const handleRemoveProduct = (productId: string) => {
    setSelectedProducts(selectedProducts.filter(p => p.id !== productId));
  };

  const calculateTotal = () => {
    return selectedProducts.reduce(
      (total, product) => total + product.price * product.quantity, 
      0
    );
  };

  const updateProductStock = (productId: string, quantityOrdered: number) => {
    try {
      // Get current products from localStorage
      const storedProducts = localStorage.getItem("products");
      if (!storedProducts) return;
      
      const products = JSON.parse(storedProducts);
      
      // Find the product to update
      const productIndex = products.findIndex((p: any) => p.id === productId);
      
      if (productIndex !== -1) {
        // Update the stock
        const currentStock = products[productIndex].stock || 10; // Default to 10 if not set
        products[productIndex].stock = Math.max(0, currentStock - quantityOrdered);
        
        // Save updated products back to localStorage
        localStorage.setItem("products", JSON.stringify(products));
        console.log(`Updated stock for product ${productId}: ${products[productIndex].stock}`);
      }
    } catch (error) {
      console.error("Error updating product stock:", error);
    }
  };

  const handleAddOrder = () => {
    if (selectedProducts.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one product",
        variant: "destructive"
      });
      return;
    }

    const total = calculateTotal();
    const hasWinEligible = selectedProducts.some(product => product.winEligible);
    const customerNameValue = customerName.trim() || "Guest"; // Use "Guest" if customer name is empty
    
    // Get current user ID from auth context
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
    const userId = currentUser.id || "";

    const newOrder: Order = {
      id: Date.now().toString(),
      orderNumber: `ORD-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      customerName: customerNameValue,
      date: new Date().toISOString(),
      status: "pending",
      total,
      items: selectedProducts,
      hasWinEligibleProducts: hasWinEligible,
      userId: userId // Add the userId to the order
    };

    const updatedOrders = [...orders, newOrder];
    setOrders(updatedOrders);
    localStorage.setItem("orders", JSON.stringify(updatedOrders));

    // Update product stock for each ordered product
    selectedProducts.forEach(product => {
      updateProductStock(product.id, product.quantity);
    });

    // Reset form
    setCustomerName("");
    setCustomerNotes("");
    setSelectedProducts([]);

    toast({
      title: "Success",
      description: `New order ${newOrder.orderNumber} has been added successfully!`,
    });

    setIsDialogOpen(false);
    
    // Reload available products to refresh stock counts
    loadAvailableProducts();
  };

  const handleDeleteOrder = (orderId: string) => {
    // Filter out the order to delete
    const updatedOrders = orders.filter(order => order.id !== orderId);
    
    // Update state and localStorage
    setOrders(updatedOrders);
    localStorage.setItem("orders", JSON.stringify(updatedOrders));
    
    // Apply filters to the updated orders
    let filtered = [...updatedOrders];
    
    if (filterStatus !== "all") {
      filtered = filtered.filter(order => order.status === filterStatus);
    }
    
    if (filterWinEligible !== "all") {
      filtered = filtered.filter(order => 
        filterWinEligible === "eligible" ? order.hasWinEligibleProducts : !order.hasWinEligibleProducts
      );
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        order =>
          order.orderNumber.toLowerCase().includes(term) ||
          order.customerName.toLowerCase().includes(term)
      );
    }
    
    setFilteredOrders(filtered);
    
    toast({
      title: "Success",
      description: "Order deleted successfully!",
    });
  };

  // Handle scanned product code
  const handleScannedCode = (code: string) => {
    console.log("Scanned code:", code);
    
    // Look for product with matching id or barcode property
    const product = availableProducts.find(
      (p) => p.id === code || p.barcode === code
    );
    
    if (product) {
      handleQuickAddProduct(product);
      toast({
        title: "Product Added",
        description: `${product.name} was added to the order`,
      });
    } else {
      toast({
        title: "Product Not Found",
        description: `No product found for code: ${code}`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
          <p className="text-gray-500">Manage and track customer orders</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          // Enable scanner when dialog is opened
          setIsScannerEnabled(open);
        }}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              New Order
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>Add New Order</DialogTitle>
              <DialogDescription>
                Enter the details of the new order or scan product barcodes.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Customer Name (Optional)</Label>
                  <Input
                    id="customerName"
                    placeholder="Enter customer name or leave blank for guest"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </div>
              </div>

              {/* Barcode Scanner Component */}
              <BarcodeScanner 
                onProductScanned={handleScannedCode}
                enabled={isScannerEnabled}
              />

              <div className="space-y-2">
                <Label>Products</Label>
                <div className="flex space-x-2 items-center">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Search products..."
                      className="pl-9"
                      value={productSearchTerm}
                      onChange={(e) => setProductSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select onValueChange={handleAddProduct}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Add product" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableProducts.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} - ${product.price.toFixed(2)}
                          {product.winEligible && <span className="ml-2">🏆</span>}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Product Grid for Quick Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
                  {filteredAvailableProducts.map((product) => (
                    <div 
                      key={product.id}
                      className="border rounded-md p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => handleQuickAddProduct(product)}
                    >
                      <div className="flex items-center space-x-3">
                        {product.imageUrl && (
                          <img 
                            src={product.imageUrl} 
                            alt={product.name}
                            className="w-10 h-10 object-cover rounded-md" 
                          />
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-sm">{product.name}</p>
                          <div className="flex justify-between items-center">
                            <p className="text-sm text-gray-600">${product.price.toFixed(2)}</p>
                            {product.winEligible && (
                              <Badge className="bg-yellow-500">
                                <Gift className="h-3 w-3 mr-1" /> Eligible
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedProducts.length > 0 && (
                  <div className="mt-4 border rounded-md overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Win Eligible</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedProducts.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell>{product.name}</TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min="1"
                                value={product.quantity}
                                onChange={(e) =>
                                  handleUpdateProductQuantity(
                                    product.id,
                                    parseInt(e.target.value) || 1
                                  )
                                }
                                className="w-16"
                              />
                            </TableCell>
                            <TableCell>${product.price.toFixed(2)}</TableCell>
                            <TableCell>
                              {product.winEligible ? (
                                <Badge className="bg-yellow-500">
                                  <Gift className="h-3 w-3 mr-1" /> Eligible
                                </Badge>
                              ) : (
                                <Badge variant="outline">Not Eligible</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveProduct(product.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                Remove
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerNotes">Notes</Label>
                <Textarea
                  id="customerNotes"
                  placeholder="Any special instructions or notes..."
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Total Amount</Label>
                <div className="p-2 border rounded-md bg-gray-50">
                  ${calculateTotal().toFixed(2)}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={handleAddOrder}
              >
                Add Order
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>
            A list of all customer orders and their current status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1">
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Gift className="h-4 w-4 text-yellow-500" />
                <Select value={filterWinEligible} onValueChange={setFilterWinEligible}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by win eligibility" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="all">All Orders</SelectItem>
                    <SelectItem value="eligible">With Win Eligible Products</SelectItem>
                    <SelectItem value="not-eligible">No Win Eligible Products</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Win Eligible</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        {order.orderNumber}
                      </TableCell>
                      <TableCell>{order.customerName}</TableCell>
                      <TableCell>{order.date}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {order.hasWinEligibleProducts ? (
                          <Badge className="bg-yellow-500">
                            <Gift className="h-3 w-3 mr-1" /> Eligible
                          </Badge>
                        ) : (
                          <Badge variant="outline">Not Eligible</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        ${order.total.toFixed(2)}
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
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No orders found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Orders;
