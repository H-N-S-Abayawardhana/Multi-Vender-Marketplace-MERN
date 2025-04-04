import React, { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown, ShoppingCart, Trash2, CreditCard } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import Swal from 'sweetalert2';
import 'react-toastify/dist/ReactToastify.css';
import '../css/cart.css';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [totalShipping, setTotalShipping] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Toast configuration
  const toastConfig = {
    position: "top-center",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  };

  // Load cart data from localStorage
  useEffect(() => {
    const loadCart = () => {
      setIsLoading(true);
      const savedCart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
      setCartItems(savedCart);
      calculateTotals(savedCart);
      setIsLoading(false);
    };

    // Initial load
    loadCart();

    // Listen for cart updates from other components
    window.addEventListener('cartUpdated', loadCart);

    // Cleanup
    return () => {
      window.removeEventListener('cartUpdated', loadCart);
    };
  }, []);

  // Calculate subtotal and shipping
  const calculateTotals = (items) => {
    const itemSubtotal = items.reduce((sum, item) => sum + (item.price * item.selectedQuantity), 0);
    const shippingTotal = items.reduce((sum, item) => sum + Number(item.shippingCost || item.shippingDetails?.cost || 0), 0);
    
    setSubtotal(itemSubtotal);
    setTotalShipping(shippingTotal);
  };

  // Update quantity with validation
  const updateQuantity = (itemId, newQuantity) => {
    const updatedCart = cartItems.map(item => {
      if (item._id === itemId) {
        // Ensure quantity is within valid range
        const validQuantity = Math.max(1, Math.min(newQuantity, item.maxQuantity));
        return { ...item, selectedQuantity: validQuantity };
      }
      return item;
    });

    setCartItems(updatedCart);
    localStorage.setItem('shoppingCart', JSON.stringify(updatedCart));
    calculateTotals(updatedCart);
    
    // Dispatch event to update cart count in navbar
    window.dispatchEvent(new Event('cartUpdated'));
  };

  // Remove item from cart
  const removeFromCart = (itemId) => {
    const updatedCart = cartItems.filter(item => item._id !== itemId);
    setCartItems(updatedCart);
    localStorage.setItem('shoppingCart', JSON.stringify(updatedCart));
    calculateTotals(updatedCart);
    
    // Show toast notification
    toast.success('Item removed from cart', toastConfig);
    
    // Dispatch event to update cart count in navbar
    window.dispatchEvent(new Event('cartUpdated'));
  };

  // Clear entire cart
  const clearCart = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Are you sure you want to clear your cart?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, clear it!'
    }).then((result) => {
      if (result.isConfirmed) {
        setCartItems([]);
        localStorage.removeItem('shoppingCart');
        setSubtotal(0);
        setTotalShipping(0);
        
        // Show toast notification
        toast.info('Your cart has been cleared', toastConfig);
        
        // Dispatch event to update cart count in navbar
        window.dispatchEvent(new Event('cartUpdated'));
      }
    });
  };

  // Proceed to checkout
  const proceedToCheckout = () => {
    // Check if cart is not empty
    if (cartItems.length === 0) {
      toast.error('Your cart is empty!', toastConfig);
      return;
    }
    
    // Navigate to checkout page
    navigate('/cartcheckout');
  };

  if (isLoading) {
    return (
      <div className="cart-page-container">
        <div className="cart-loading">
          <div className="cart-loading-spinner"></div>
          <p>Loading your cart...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <NavBar/>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <div className="cart-page-container">
        <div className="cart-page-header">
          <h1>Shopping Cart</h1>
          <p>{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart</p>
        </div>

        {cartItems.length === 0 ? (
          <div className="cart-empty">
            <ShoppingCart size={64} />
            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added any items to your cart yet.</p>
            <Link to="/" className="cart-continue-shopping">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="cart-page-content">
            <div className="cart-items-container">
              <div className="cart-items-header">
                <div className="cart-header-product">Product</div>
                <div className="cart-header-price">Price</div>
                <div className="cart-header-quantity">Quantity</div>
                <div className="cart-header-total">Total</div>
                <div className="cart-header-actions"></div>
              </div>
              
              <div className="cart-items-list">
                {cartItems.map((item) => (
                  <div key={item._id} className="cart-item">
                    <div className="cart-item-product">
                      <div className="cart-item-image">
                        {item.image ? (
                          <img src={item.image} alt={item.title} />
                        ) : (
                          item.images && item.images[0] ? (
                            <img src={`http://localhost:9000${item.images[0]}`} alt={item.title} />
                          ) : (
                            <div className="cart-no-image">No Image</div>
                          )
                        )}
                      </div>
                      <div className="cart-item-details">
                        <h4 className="cart-item-title">{item.title}</h4>
                        <div className="cart-item-shipping">
                          Shipping: LKR {(item.shippingCost || item.shippingDetails?.cost || 0).toFixed(2)}
                        </div>
                      </div>
                    </div>

                    <div className="cart-item-price">
                      LKR {item.price.toFixed(2)}
                    </div>

                    <div className="cart-quantity-control">
                      <button 
                        className="cart-quantity-btn" 
                        onClick={() => updateQuantity(item._id, item.selectedQuantity - 1)}
                        disabled={item.selectedQuantity <= 1}
                        aria-label="Decrease quantity"
                      >
                        <ChevronDown size={16} />
                      </button>
                      <span className="cart-quantity">{item.selectedQuantity}</span>
                      <button 
                        className="cart-quantity-btn"
                        onClick={() => updateQuantity(item._id, item.selectedQuantity + 1)}
                        disabled={item.selectedQuantity >= item.maxQuantity}
                        aria-label="Increase quantity"
                      >
                        <ChevronUp size={16} />
                      </button>
                    </div>

                    <div className="cart-item-total">
                      LKR {(item.price * item.selectedQuantity).toFixed(2)}
                    </div>

                    <div className="cart-item-actions">
                      <button 
                        className="cart-remove-btn" 
                        onClick={() => removeFromCart(item._id)}
                        aria-label="Remove item"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="cart-summary-container">
              <div className="cart-summary">
                <h3>Order Summary</h3>
                <div className="cart-summary-row">
                  <span>Subtotal:</span>
                  <span>LKR {subtotal.toFixed(2)}</span>
                </div>
                <div className="cart-summary-row">
                  <span>Shipping:</span>
                  <span>LKR {totalShipping.toFixed(2)}</span>
                </div>
                <div className="cart-summary-row cart-total">
                  <span>Total:</span>
                  <span>LKR {(subtotal + totalShipping).toFixed(2)}</span>
                </div>
                
                <div className="cart-actions">
                  <button className="cart-clear-btn" onClick={clearCart}>
                    Clear Cart
                  </button>
                  <button className="cart-checkout-btn" onClick={proceedToCheckout}>
                    <CreditCard size={16} />
                    <span>Checkout</span>
                  </button>
                </div>
                
                <div className="cart-continue">
                  <Link to="/" className="cart-continue-shopping">
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer/>
    </>
  );
};

export default Cart;