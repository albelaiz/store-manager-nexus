
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gift } from "lucide-react";
import { getAllProducts } from "@/utils/fileStorage";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  category: string;
  price: string | number;
  stock: number;
  winEligible?: boolean;
  sales?: number;
  imageUrl?: string;
}

const PopularItems: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currencySymbol, setCurrencySymbol] = useState("DH");

  useEffect(() => {
    loadProducts();
    
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

  const loadProducts = async () => {
    try {
      setLoading(true);
      const productsData = await getAllProducts();
      setProducts(productsData);
      setLoading(false);
    } catch (error) {
      console.error("Error loading products:", error);
      toast.error("Failed to load products");
      setProducts([]);
      setLoading(false);
    }
  };

  // Sort products by sales in descending order
  const sortedProducts = [...products].sort((a, b) => (b.sales || 0) - (a.sales || 0));

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Popular Items</h1>
          <p className="text-gray-500">Loading products...</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Popular Items</h1>
        <p className="text-gray-500">Top selling products in your store</p>
      </div>

      {sortedProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedProducts.map((product) => (
            <Card key={product.id}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  {product.imageUrl && (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                  )}
                  <div>
                    <h2 className="text-lg font-semibold">{product.name}</h2>
                    <p className="text-gray-500">{product.category}</p>
                    <p className="text-gray-700">{typeof product.price === 'string' ? parseFloat(product.price).toFixed(2) : product.price.toFixed(2)} {currencySymbol}</p>
                    {product.winEligible && (
                      <Badge className="bg-yellow-500 mt-2">
                        <Gift className="h-3 w-3 mr-1" /> Eligible
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">No popular products found</p>
        </div>
      )}
    </div>
  );
};

export default PopularItems;
