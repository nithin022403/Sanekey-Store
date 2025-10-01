import React from 'react';
import { Users, UserCheck, Briefcase, Tag, Gift } from 'lucide-react';

interface CategoryGridProps {
  onCategorySelect: (category: string) => void;
}

const categories = [
  { 
    id: 'women', 
    name: 'Women', 
    icon: Users, 
    color: 'bg-pink-500',
    description: 'Scarves, coats, outerwear, dresses, etc.'
  },
  { 
    id: 'men', 
    name: 'Men', 
    icon: UserCheck, 
    color: 'bg-blue-500',
    description: "Men's outerwear, shirts, accessories for men"
  },
  { 
    id: 'accessories', 
    name: 'Accessories', 
    icon: Briefcase, 
    color: 'bg-green-500',
    description: 'Hats, wallets, laptop cases, caps, etc.'
  },
  { 
    id: 'sale', 
    name: 'Sale / Discounts', 
    icon: Tag, 
    color: 'bg-red-500',
    description: 'Products from Women / Men / Accessories offered at reduced prices'
  },
  { 
    id: 'gift-card', 
    name: 'Gift Card', 
    icon: Gift, 
    color: 'bg-purple-500',
    description: 'Digital or physical gift vouchers / cards'
  },
];

export const CategoryGrid: React.FC<CategoryGridProps> = ({ onCategorySelect }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
      {categories.map((category) => {
        const IconComponent = category.icon;
        return (
          <button
            key={category.id}
            onClick={() => onCategorySelect(category.id)}
            className="group flex flex-col items-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          >
            <div className={`${category.color} p-4 rounded-full mb-4 group-hover:scale-110 transition-transform`}>
              <IconComponent className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
              {category.name}
            </h3>
            <p className="text-sm text-gray-600 text-center leading-relaxed">
              {category.description}
            </p>
          </button>
        );
      })}
    </div>
  );
};