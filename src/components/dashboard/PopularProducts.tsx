
import React, { useEffect, useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

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

interface PopularProductsProps {
  products?: Product[];
}

const PopularProducts: React.FC<PopularProductsProps> = ({ products = [] }) => {
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
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
    
    // Sort products by sales (if available) or just take the first few
    const sortedProducts = [...products];
    
    // If sales property exists, sort by sales
    if (products.length > 0 && products[0].sales !== undefined) {
      sortedProducts.sort((a, b) => {
        const salesA = a.sales || 0;
        const salesB = b.sales || 0;
        return salesB - salesA;
      });
    }
    
    // Take top 5 products only
    setPopularProducts(sortedProducts.slice(0, 4));
  }, [products]);

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b">
        <h2 className="text-lg font-semibold text-gray-800">
          Popular Products
        </h2>
      </div>
      <div className="overflow-x-auto">
        {popularProducts.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No products found</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Sales</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-center">Win Eligible</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {popularProducts.map((product) => (
                <TableRow key={product.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell className="text-right">{product.sales || '-'}</TableCell>
                  <TableCell className="text-right">{product.stock}</TableCell>
                  <TableCell className="text-right">
                    {typeof product.price === 'number' 
                      ? `${product.price.toFixed(2)} ${currencySymbol}`
                      : `${product.price} ${currencySymbol}`}
                  </TableCell>
                  <TableCell className="text-center">
                    {product.winEligible !== undefined && (
                      <Badge variant={product.winEligible ? "promotion" : "outline"}>
                        {product.winEligible ? "Yes" : "No"}
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
      <div className="p-4 border-t text-center">
        <Link
          to="/dashboard/popular"
          className="text-sm text-store-DEFAULT hover:text-store-DEFAULT/80"
        >
          View all popular products
        </Link>
      </div>
    </div>
  );
};

export default PopularProducts;
