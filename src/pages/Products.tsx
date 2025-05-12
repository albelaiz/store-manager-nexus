
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Search, Edit, Trash, MoreVertical, Gift } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import ImageUpload from "@/components/products/ImageUpload";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  stock: number;
  status: "in-stock" | "low-stock" | "out-of-stock";
  createdAt: string;
  winEligible: boolean;
}

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [winFilter, setWinFilter] = useState("all");
  
  // Form state for add/edit product
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    description: "",
    price: 0,
    imageUrl: "",
    category: "clothing", // Changed default to clothing
    stock: 0,
    winEligible: true,
  });
  
  const { toast } = useToast();
  
  // Updated categories list
  const categories = [
    "clothing",
    "other"
  ];

  useEffect(() => {
    // Load products from localStorage
    const storedProducts = localStorage.getItem("products");
    if (storedProducts) {
      try {
        const parsedProducts = JSON.parse(storedProducts);
        
        // Update any products with old categories to use the new ones
        const updatedProducts = parsedProducts.map((product: any) => {
          const updatedProduct = { ...product };
          
          // If category is not in our new list, set it to "other"
          if (!categories.includes(product.category)) {
            updatedProduct.category = "other";
          }
          
          return updatedProduct;
        });
        
        setProducts(updatedProducts);
        setFilteredProducts(updatedProducts);
        
        // Update localStorage with the updated products
        localStorage.setItem("products", JSON.stringify(updatedProducts));
      } catch (error) {
        console.error("Error parsing products:", error);
        initializeWithSampleData();
      }
    } else {
      initializeWithSampleData();
    }
  }, []);

  useEffect(() => {
    // Apply filters whenever products, searchTerm, categoryFilter, statusFilter, or winFilter changes
    let result = [...products];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        product =>
          product.name.toLowerCase().includes(term) ||
          product.description.toLowerCase().includes(term) ||
          product.category.toLowerCase().includes(term)
      );
    }
    
    if (categoryFilter !== "all") {
      result = result.filter(product => product.category === categoryFilter);
    }
    
    if (statusFilter !== "all") {
      result = result.filter(product => product.status === statusFilter);
    }
    
    // Apply win filter
    if (winFilter !== "all") {
      result = result.filter(product => 
        winFilter === "eligible" ? product.winEligible : !product.winEligible
      );
    }
    
    setFilteredProducts(result);
  }, [products, searchTerm, categoryFilter, statusFilter, winFilter]);
  
  const initializeWithSampleData = () => {
    const sampleProducts: Product[] = [
      {
        id: "1",
        name: "T-Shirt",
        description: "Cotton t-shirt with logo",
        price: 29.99,
        imageUrl: "https://placehold.co/200x200?text=T-Shirt",
        category: "clothing",
        stock: 42,
        status: "in-stock",
        createdAt: "2025-03-15",
        winEligible: true
      },
      {
        id: "2",
        name: "Notebook",
        description: "Lined notebook with hardcover",
        price: 14.99,
        imageUrl: "https://placehold.co/200x200?text=Notebook",
        category: "other",
        stock: 8,
        status: "low-stock",
        createdAt: "2025-03-20",
        winEligible: true
      }
    ];
    
    setProducts(sampleProducts);
    setFilteredProducts(sampleProducts);
    localStorage.setItem("products", JSON.stringify(sampleProducts));
  };
  
  const getStatusBadge = (status: Product["status"]) => {
    switch (status) {
      case "in-stock":
        return <Badge className="bg-green-500">In Stock</Badge>;
      case "low-stock":
        return <Badge className="bg-yellow-500">Low Stock</Badge>;
      case "out-of-stock":
        return <Badge className="bg-red-500">Out of Stock</Badge>;
      default:
        return <Badge className="bg-gray-500">Unknown</Badge>;
    }
  };
  
  const resetForm = () => {
    setFormData({
      id: "",
      name: "",
      description: "",
      price: 0,
      imageUrl: "",
      category: "clothing",
      stock: 0,
      winEligible: true
    });
    setIsEditing(false);
    setCurrentProduct(null);
  };
  
  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };
  
  const openEditDialog = (product: Product) => {
    setIsEditing(true);
    setCurrentProduct(product);
    setFormData({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      imageUrl: product.imageUrl,
      category: product.category,
      stock: product.stock,
      winEligible: product.winEligible !== undefined ? product.winEligible : true
    });
    setIsDialogOpen(true);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: id === "price" || id === "stock" ? Number(value) : value
    }));
  };
  
  const handleSelectChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      category: value
    }));
  };

  const handleWinEligibleChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      winEligible: checked
    }));
  };
  
  const handleImageChange = (imageData: string) => {
    setFormData(prev => ({
      ...prev,
      imageUrl: imageData
    }));
  };
  
  const getProductStatus = (stock: number): Product["status"] => {
    if (stock <= 0) return "out-of-stock";
    if (stock <= 10) return "low-stock";
    return "in-stock";
  };
  
  const handleSaveProduct = () => {
    // Form validation
    if (!formData.name || !formData.description || formData.price <= 0) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    if (isEditing && currentProduct) {
      // Update existing product
      const updatedProducts = products.map(product => 
        product.id === currentProduct.id
          ? {
              ...product,
              name: formData.name,
              description: formData.description,
              price: formData.price,
              imageUrl: formData.imageUrl || product.imageUrl,
              category: formData.category,
              stock: formData.stock,
              status: getProductStatus(formData.stock),
              winEligible: formData.winEligible
            }
          : product
      );
      
      setProducts(updatedProducts);
      localStorage.setItem("products", JSON.stringify(updatedProducts));
      
      toast({
        title: "Success",
        description: "Product updated successfully!"
      });
    } else {
      // Add new product
      const newProduct: Product = {
        id: Date.now().toString(),
        name: formData.name,
        description: formData.description,
        price: formData.price,
        imageUrl: formData.imageUrl || "https://placehold.co/200x200?text=Product",
        category: formData.category,
        stock: formData.stock,
        status: getProductStatus(formData.stock),
        createdAt: new Date().toISOString().split('T')[0],
        winEligible: formData.winEligible
      };
      
      const updatedProducts = [...products, newProduct];
      setProducts(updatedProducts);
      localStorage.setItem("products", JSON.stringify(updatedProducts));
      
      toast({
        title: "Success",
        description: "Product added successfully!"
      });
    }
    
    setIsDialogOpen(false);
    resetForm();
  };
  
  const handleDeleteProduct = (id: string) => {
    const updatedProducts = products.filter(product => product.id !== id);
    setProducts(updatedProducts);
    localStorage.setItem("products", JSON.stringify(updatedProducts));
    
    toast({
      title: "Success",
      description: "Product deleted successfully!"
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products</h1>
          <p className="text-gray-500">
            Manage your product inventory and win promotions
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={openAddDialog}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{isEditing ? "Edit Product" : "Add New Product"}</DialogTitle>
              <DialogDescription>
                {isEditing 
                  ? "Update the details of your existing product." 
                  : "Fill in the details of your new product."}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="T-Shirt"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="99.99"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Product description..."
                  className="h-20"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={handleSelectChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock Quantity</Label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={handleInputChange}
                    placeholder="50"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Product Image</Label>
                <ImageUpload 
                  initialImage={formData.imageUrl} 
                  onImageChange={handleImageChange} 
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="win-eligible"
                  checked={formData.winEligible}
                  onCheckedChange={handleWinEligibleChange}
                />
                <Label htmlFor="win-eligible" className="flex items-center">
                  <Gift className="mr-2 h-4 w-4 text-yellow-500" />
                  Include in Win Promotion
                </Label>
              </div>
            </div>
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={handleSaveProduct}
              >
                {isEditing ? "Update Product" : "Add Product"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Product Inventory</CardTitle>
          <CardDescription>
            Manage your products, track inventory, and view win promotion eligibility
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search products..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="in-stock">In Stock</SelectItem>
                  <SelectItem value="low-stock">Low Stock</SelectItem>
                  <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>

              <Select value={winFilter} onValueChange={setWinFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by win eligibility" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">All Products</SelectItem>
                  <SelectItem value="eligible">Win Eligible</SelectItem>
                  <SelectItem value="not-eligible">Not Win Eligible</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Win Eligible</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium flex items-center gap-3">
                        <img 
                          src={product.imageUrl} 
                          alt={product.name} 
                          className="w-10 h-10 rounded-md object-cover"
                        />
                        {product.name}
                      </TableCell>
                      <TableCell className="capitalize">
                        {product.category}
                      </TableCell>
                      <TableCell>
                        ${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}
                      </TableCell>
                      <TableCell>
                        {product.stock}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(product.status)}
                      </TableCell>
                      <TableCell>
                        {product.winEligible ? (
                          <Badge className="bg-yellow-500"><Gift className="h-3 w-3 mr-1" /> Eligible</Badge>
                        ) : (
                          <Badge variant="outline">Not Eligible</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-white">
                            <DropdownMenuItem onClick={() => openEditDialog(product)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                  <Trash className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="bg-white">
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the
                                    product "{product.name}" from your inventory.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    className="bg-red-500 hover:bg-red-600"
                                    onClick={() => handleDeleteProduct(product.id)}
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No products found.
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

export default Products;
