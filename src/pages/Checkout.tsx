import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { paymentAPI } from '../lib/api';
import { CreditCard, Wallet, ShoppingBag, CheckCircle, AlertCircle } from 'lucide-react';

interface CheckoutProps {
  onNavigate: (page: string) => void;
}

export const Checkout: React.FC<CheckoutProps> = ({ onNavigate }) => {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal'>('stripe');
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  const handlePayment = async () => {
    if (!user) {
      onNavigate('login');
      return;
    }

    if (items.length === 0) {
      setError('Your cart is empty');
      return;
    }

    setLoading(true);
    setError('');
    setPaymentStatus('processing');

    try {
      const description = `Purchase of ${items.length} items from Sanekey Store`;
      
      let response;
      if (paymentMethod === 'stripe') {
        response = await paymentAPI.createStripePayment(total, description);
      } else {
        response = await paymentAPI.createPayPalPayment(total, description);
      }

      if (response.payment) {
        // Simulate payment confirmation (in real app, this would be handled by payment provider)
        setTimeout(async () => {
          try {
            if (paymentMethod === 'stripe' && response.payment.stripePaymentIntentId) {
              await paymentAPI.confirmStripePayment(response.payment.stripePaymentIntentId);
            } else if (paymentMethod === 'paypal' && response.payment.paypalOrderId) {
              await paymentAPI.confirmPayPalPayment(response.payment.paypalOrderId);
            }
            
            setPaymentStatus('success');
            clearCart();
            
            // Redirect to success page after 3 seconds
            setTimeout(() => {
              onNavigate('home');
            }, 3000);
            
          } catch (confirmError: any) {
            setError('Payment confirmation failed: ' + confirmError.message);
            setPaymentStatus('error');
          }
        }, 2000);
      }
    } catch (error: any) {
      setError('Payment failed: ' + error.message);
      setPaymentStatus('error');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="mx-auto h-24 w-24 text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Please Sign In</h2>
          <p className="text-gray-600 mb-6">You need to be signed in to checkout</p>
          <button
            onClick={() => onNavigate('login')}
            className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="mx-auto h-24 w-24 text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some items to your cart before checkout</p>
          <button
            onClick={() => onNavigate('products')}
            className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <CheckCircle className="mx-auto h-24 w-24 text-green-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
          <p className="text-gray-600 mb-6">Thank you for your purchase. You will be redirected shortly.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              {items.map((item) => (
                <div key={item.id} className="flex items-center space-x-4">
                  <img
                    src={item.item.image}
                    alt={item.item.name}
                    className="w-16 h-16 object-cover rounded-md"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.item.name}</h3>
                    <p className="text-gray-600">Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      ₹{(item.item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t pt-4">
              <div className="flex justify-between items-center text-xl font-bold text-gray-900">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Method</h2>
            
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <span className="text-red-700">{error}</span>
              </div>
            )}
            
            <div className="space-y-4 mb-6">
              <div className="flex items-center space-x-3">
                <input
                  type="radio"
                  id="stripe"
                  name="payment"
                  value="stripe"
                  checked={paymentMethod === 'stripe'}
                  onChange={(e) => setPaymentMethod(e.target.value as 'stripe')}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                />
                <label htmlFor="stripe" className="flex items-center space-x-2 cursor-pointer">
                  <CreditCard className="h-5 w-5 text-gray-600" />
                  <span className="text-gray-900">Credit/Debit Card (Stripe)</span>
                </label>
              </div>
              
              <div className="flex items-center space-x-3">
                <input
                  type="radio"
                  id="paypal"
                  name="payment"
                  value="paypal"
                  checked={paymentMethod === 'paypal'}
                  onChange={(e) => setPaymentMethod(e.target.value as 'paypal')}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                />
                <label htmlFor="paypal" className="flex items-center space-x-2 cursor-pointer">
                  <Wallet className="h-5 w-5 text-gray-600" />
                  <span className="text-gray-900">PayPal</span>
                </label>
              </div>
            </div>
            
            <button
              onClick={handlePayment}
              disabled={loading || paymentStatus === 'processing'}
              className="w-full flex items-center justify-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading || paymentStatus === 'processing' ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing Payment...
                </>
              ) : (
                <>
                  <CreditCard className="h-5 w-5 mr-2" />
                  Pay ₹{total.toFixed(2)}
                </>
              )}
            </button>
            
            <p className="text-sm text-gray-500 mt-4 text-center">
              Your payment information is secure and encrypted
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};