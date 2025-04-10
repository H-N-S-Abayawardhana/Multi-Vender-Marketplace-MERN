import React, { useState, useEffect } from 'react';
import { ArrowLeft, CreditCard, ShoppingBag, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../css/cartcheckout.css';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import axios from 'axios'; // Make sure axios is imported

const CartCheckout = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [totalShipping, setTotalShipping] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  });

  // Form validation state
  const [errors, setErrors] = useState({});

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

    // Check if cart is empty and redirect if it is
    if (JSON.parse(localStorage.getItem('shoppingCart'))?.length === 0) {
      toast.error('Your cart is empty!', toastConfig);
      navigate('/cart');
    }
  }, [navigate]);

  // Calculate subtotal and shipping
  const calculateTotals = (items) => {
    const itemSubtotal = items.reduce((sum, item) => sum + (item.price * item.selectedQuantity), 0);
    const shippingTotal = items.reduce((sum, item) => sum + Number(item.shippingCost || item.shippingDetails?.cost || 0), 0);
    
    setSubtotal(itemSubtotal);
    setTotalShipping(shippingTotal);
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for card number (format with spaces)
    if (name === 'cardNumber') {
      const digits = value.replace(/\D/g, '');
      const truncated = digits.slice(0, 16);
      const formatted = truncated.replace(/(\d{4})/g, '$1 ').trim();
      
      setFormData({ ...formData, [name]: formatted });
    }
    // Special handling for expiry date (auto add slash)
    else if (name === 'expiryDate') {
      const digits = value.replace(/\D/g, '');
      let formatted = '';
      
      if (digits.length <= 2) {
        formatted = digits;
      } else {
        formatted = digits.slice(0, 2) + '/' + digits.slice(2, 4);
      }
      
      setFormData({ ...formData, [name]: formatted });
    }
    // Regular handling for other fields
    else {
      setFormData({ ...formData, [name]: value });
    }
    
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    // Required fields
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.postalCode.trim()) newErrors.postalCode = 'Postal code is required';
    
    // Payment validation
    if (!formData.cardNumber.trim()) newErrors.cardNumber = 'Card number is required';
    else if (!/^\d{16}$/.test(formData.cardNumber.replace(/\s/g, ''))) newErrors.cardNumber = 'Card number must be 16 digits';
    
    if (!formData.cardName.trim()) newErrors.cardName = 'Name on card is required';
    
    if (!formData.expiryDate.trim()) newErrors.expiryDate = 'Expiry date is required';
    else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(formData.expiryDate)) newErrors.expiryDate = 'Format must be MM/YY';
    
    if (!formData.cvv.trim()) newErrors.cvv = 'CVV is required';
    else if (!/^\d{3,4}$/.test(formData.cvv)) newErrors.cvv = 'CVV must be 3 or 4 digits';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Process payment
  const processPayment = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form', toastConfig);
      return;
    }
    
    
    if (isProcessing) {
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Process each item in the cart as a separate order - using axios instead of fetch
      const orderPromises = cartItems.map(async (item) => {
        // Match the format used in CheckoutPage.js
        const orderData = {
          userEmail: formData.email,
          itemId: item._id,
          itemDetails: {
            title: item.title,
            price: item.price,
            image: item.images ? item.images[0] : item.image,
            quantity: item.selectedQuantity
          },
          shippingDetails: {
            fullName: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            zipCode: formData.postalCode,
            cost: item.shippingCost || item.shippingDetails?.cost || 0,
            method: item.shippingDetails?.method || 'Standard'
          },
          paymentDetails: {
            cardNumber: formData.cardNumber.slice(-4),
            cardExpiry: formData.expiryDate
          },
          orderStatus: 'Pending',
          orderDate: new Date(),
          totalAmount: (item.price * item.selectedQuantity) + 
                       (item.shippingCost || item.shippingDetails?.cost || 0)
        };
        
        // Using axios instead of fetch for better error handling
        const response = await axios.post('http://localhost:9000/api/orders/create', orderData);
        
        // Send confirmation email for each order
        try {
          await axios.post('http://localhost:9000/api/orders/send-confirmation', {
            ...orderData,
            orderId: response.data.orderId || response.data._id
          });
          console.log('Order confirmation email sent for item:', item.title);
        } catch (emailError) {
          console.error('Failed to send confirmation email:', emailError);
          // Continue with checkout even if email fails
        }
        
        return response;
      });
      
      // Wait for all orders to be processed
      await Promise.all(orderPromises);
      
      // Clear the cart
      localStorage.removeItem('shoppingCart');
      
      // Show success message
      toast.success('Payment successful! Your order has been placed. Check your email for confirmation.', toastConfig);
      
      // Dispatch event to update cart count in navbar
      window.dispatchEvent(new Event('cartUpdated'));
      
      // Redirect to success page or orders page after a delay
      setTimeout(() => {
        navigate('/');
      }, 2000);
      
    } catch (error) {
      console.error('Payment processing error:', error);
      toast.error(`Payment failed: ${error.response?.data?.message || error.message}`, toastConfig);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="cart-checkoutpage-container">
        <div className="cart-checkoutpage-loading">
          <div className="cart-checkoutpage-loading-spinner"></div>
          <p>Loading checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <NavBar />
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
      <div className="cart-checkoutpage-container">
        <div className="cart-checkoutpage-header">
          <h1>Checkout</h1>
          <Link to="/cart" className="cart-checkoutpage-back-btn">
            <ArrowLeft size={16} />
            <span>Back to Cart</span>
          </Link>
        </div>

        <div className="cart-checkoutpage-content">
          <div className="cart-checkoutpage-form-container">
            <form onSubmit={processPayment}>
              <div className="cart-checkoutpage-section">
                <h2>Shipping Information</h2>
                <div className="cart-checkoutpage-form-group">
                  <label htmlFor="fullName">Full Name</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className={errors.fullName ? 'cart-checkoutpage-input-error' : ''}
                  />
                  {errors.fullName && <div className="cart-checkoutpage-error">{errors.fullName}</div>}
                </div>
                
                <div className="cart-checkoutpage-form-row">
                  <div className="cart-checkoutpage-form-group">
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={errors.email ? 'cart-checkoutpage-input-error' : ''}
                    />
                    {errors.email && <div className="cart-checkoutpage-error">{errors.email}</div>}
                  </div>
                  
                  <div className="cart-checkoutpage-form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={errors.phone ? 'cart-checkoutpage-input-error' : ''}
                    />
                    {errors.phone && <div className="cart-checkoutpage-error">{errors.phone}</div>}
                  </div>
                </div>
                
                <div className="cart-checkoutpage-form-group">
                  <label htmlFor="address">Address</label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className={errors.address ? 'cart-checkoutpage-input-error' : ''}
                  />
                  {errors.address && <div className="cart-checkoutpage-error">{errors.address}</div>}
                </div>
                
                <div className="cart-checkoutpage-form-row">
                  <div className="cart-checkoutpage-form-group">
                    <label htmlFor="city">City</label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className={errors.city ? 'cart-checkoutpage-input-error' : ''}
                    />
                    {errors.city && <div className="cart-checkoutpage-error">{errors.city}</div>}
                  </div>
                  
                  <div className="cart-checkoutpage-form-group">
                    <label htmlFor="postalCode">Postal Code</label>
                    <input
                      type="text"
                      id="postalCode"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      className={errors.postalCode ? 'cart-checkoutpage-input-error' : ''}
                    />
                    {errors.postalCode && <div className="cart-checkoutpage-error">{errors.postalCode}</div>}
                  </div>
                </div>
              </div>
              
              <div className="cart-checkoutpage-section">
                <h2>Payment Information</h2>
                <div className="cart-checkoutpage-form-group">
                  <label htmlFor="cardNumber">Card Number</label>
                  <input
                    type="text"
                    id="cardNumber"
                    name="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    maxLength="19"
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                    className={errors.cardNumber ? 'cart-checkoutpage-input-error' : ''}
                  />
                  {errors.cardNumber && <div className="cart-checkoutpage-error">{errors.cardNumber}</div>}
                </div>
                
                <div className="cart-checkoutpage-form-group">
                  <label htmlFor="cardName">Name on Card</label>
                  <input
                    type="text"
                    id="cardName"
                    name="cardName"
                    value={formData.cardName}
                    onChange={handleInputChange}
                    className={errors.cardName ? 'cart-checkoutpage-input-error' : ''}
                  />
                  {errors.cardName && <div className="cart-checkoutpage-error">{errors.cardName}</div>}
                </div>
                
                <div className="cart-checkoutpage-form-row">
                  <div className="cart-checkoutpage-form-group">
                    <label htmlFor="expiryDate">Expiry Date</label>
                    <input
                      type="text"
                      id="expiryDate"
                      name="expiryDate"
                      placeholder="MM/YY"
                      maxLength="5"
                      value={formData.expiryDate}
                      onChange={handleInputChange}
                      className={errors.expiryDate ? 'cart-checkoutpage-input-error' : ''}
                    />
                    {errors.expiryDate && <div className="cart-checkoutpage-error">{errors.expiryDate}</div>}
                  </div>
                  
                  <div className="cart-checkoutpage-form-group">
                    <label htmlFor="cvv">CVV</label>
                    <input
                      type="password"
                      id="cvv"
                      name="cvv"
                      placeholder="123"
                      maxLength="4"
                      value={formData.cvv}
                      onChange={handleInputChange}
                      className={errors.cvv ? 'cart-checkoutpage-input-error' : ''}
                    />
                    {errors.cvv && <div className="cart-checkoutpage-error">{errors.cvv}</div>}
                  </div>
                </div>
              </div>
              
              <div className="cart-checkoutpage-section">
                <h2>Order Summary</h2>
                <div className="cart-checkoutpage-order-summary">
                  <div className="cart-checkoutpage-order-items">
                    {cartItems.map((item) => (
                      <div key={item._id} className="cart-checkoutpage-order-item">
                        <div className="cart-checkoutpage-item-info">
                          <div className="cart-checkoutpage-item-image">
                            {item.image ? (
                              <img src={item.image} alt={item.title} />
                            ) : (
                              item.images && item.images[0] ? (
                                <img src={`http://localhost:9000${item.images[0]}`} alt={item.title} />
                              ) : (
                                <div className="cart-checkoutpage-no-image">No Image</div>
                              )
                            )}
                          </div>
                          <div className="cart-checkoutpage-item-details">
                            <h4>{item.title}</h4>
                            <p>Quantity: {item.selectedQuantity}</p>
                          </div>
                        </div>
                        <div className="cart-checkoutpage-item-price">
                          LKR {(item.price * item.selectedQuantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="cart-checkoutpage-order-totals">
                    <div className="cart-checkoutpage-total-row">
                      <span>Subtotal:</span>
                      <span>LKR {subtotal.toFixed(2)}</span>
                    </div>
                    <div className="cart-checkoutpage-total-row">
                      <span>Shipping:</span>
                      <span>LKR {totalShipping.toFixed(2)}</span>
                    </div>
                    <div className="cart-checkoutpage-total-row cart-checkoutpage-grand-total">
                      <span>Total:</span>
                      <span>LKR {(subtotal + totalShipping).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="cart-checkoutpage-payment-btn-container">
                <button 
                  type="submit" 
                  className="cart-checkoutpage-payment-btn"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <div className="cart-checkoutpage-btn-spinner"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard size={18} />
                      Pay LKR {(subtotal + totalShipping).toFixed(2)}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
          
          <div className="cart-checkoutpage-info-container">
            <div className="cart-checkoutpage-info-box">
              <div className="cart-checkoutpage-info-header">
                <ShoppingBag size={20} />
                <h3>Order Details</h3>
              </div>
              <p>{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}</p>
              <div className="cart-checkoutpage-info-items">
                {cartItems.map((item) => (
                  <div key={item._id} className="cart-checkoutpage-info-item">
                    <span>{item.title} × {item.selectedQuantity}</span>
                    <span>LKR {(item.price * item.selectedQuantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="cart-checkoutpage-info-box">
              <div className="cart-checkoutpage-info-header">
                <AlertCircle size={20} />
                <h3>Important Information</h3>
              </div>
              <ul className="cart-checkoutpage-info-list">
                <li>Orders typically ship within 1-2 business days</li>
                <li>Payment is processed securely</li>
                <li>Your email will be used for order updates</li>
                <li>Need help? Contact our customer support</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CartCheckout;