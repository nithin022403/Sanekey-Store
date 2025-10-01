import React, { useState } from 'react';
import { ShoppingBag, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface AddToCartButtonProps {
  item: any;
  className?: string;
}

export const AddToCartButton: React.FC<AddToCartButtonProps> = ({ item, className = '' }) => {
  const { addItem } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = () => {
    addItem(item, 1);
    setIsAdded(true);
    
    // Reset the success state after 2 seconds
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };

  return (
    <button 
      onClick={handleAddToCart}
      disabled={isAdded}
      className={`w-full flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
        isAdded 
          ? 'bg-green-600 text-white cursor-not-allowed' 
          : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-105'
      } ${className}`}
    >
      {isAdded ? (
        <>
          <Check className="h-4 w-4 mr-2" />
          Added to Cart
        </>
      ) : (
        <>
          <ShoppingBag className="h-4 w-4 mr-2" />
          Add to Cart
        </>
      )}
    </button>
  );
};