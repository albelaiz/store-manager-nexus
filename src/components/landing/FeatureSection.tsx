
import React from "react";
import { ShoppingCart, Package, ChartBar, Clock } from "lucide-react";

const features = [
  {
    name: "Order Management",
    description:
      "Track, process, and manage orders efficiently. Filter by status and get instant updates.",
    icon: ShoppingCart,
  },
  {
    name: "Product Catalog",
    description:
      "Easily add, edit, and organize your product catalog with detailed information and images.",
    icon: Package,
  },
  {
    name: "Analytics Dashboard",
    description:
      "Get valuable insights with visual analytics on sales, popular products, and customer trends.",
    icon: ChartBar,
  },
  {
    name: "Real-time Updates",
    description:
      "Stay informed with real-time notifications about orders, inventory levels, and more.",
    icon: Clock,
  },
];

const FeatureSection: React.FC = () => {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900">
            Powerful Features for Store Owners
          </h2>
          <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to manage your store efficiently in one place
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => (
            <div
              key={feature.name}
              className="bg-store-secondary rounded-lg p-8 text-center hover:shadow-md transition-shadow"
            >
              <div className="flex justify-center">
                <feature.icon className="h-12 w-12 text-store-DEFAULT" />
              </div>
              <h3 className="mt-6 text-xl font-medium text-gray-900">
                {feature.name}
              </h3>
              <p className="mt-4 text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
