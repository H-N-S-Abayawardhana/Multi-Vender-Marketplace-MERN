import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { CreditCard, Truck, ArrowLeft, X, ShoppingBag } from 'lucide-react';
import axios from 'axios';
import '../../src/css/checkout.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CheckoutPage = ({ item, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    cardNumber: '',
    cardExpiry: '',
    cvv: '',
  });
  
  const [errors, setErrors] = useState({});
  const [activeStep, setActiveStep] = useState('shipping');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if this is a direct purchase or from cart
  const isDirectPurchase = !!item;
  
  // Initialize order data
  useEffect(() => {
    // If not direct purchase, load cart items
    if (!isDirectPurchase) {
      const savedCart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
      setCartItems(savedCart);
    }
    
    // Pre-fill email if user is logged in
    const userEmail = localStorage.getItem('email');
    if (userEmail) {
      setFormData(prev => ({
        ...prev,
        email: userEmail
      }));
    }
  }, [isDirectPurchase]);
  
  // Calculate totals
  const calculateTotals = () => {
    if (isDirectPurchase) {
      const quantity = item.selectedQuantity || 1;
      const shippingCost = item.shippingDetails?.cost || 0;
      const itemPrice = item.price || 0;
      const subtotal = itemPrice * quantity;
      const total = subtotal + shippingCost;
      
      return {
        subtotal,
        shippingCost,
        total,
        itemCount: 1
      };
    } else {
      const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.selectedQuantity), 0);
      const shippingCost = cartItems.reduce((sum, item) => sum + Number(item.shippingCost || item.shippingDetails?.cost || 0), 0);
      const total = subtotal + shippingCost;
      const itemCount = cartItems.length;
      
      return {
        subtotal,
        shippingCost,
        total,
        itemCount
      };
    }
  };
  
  const { subtotal, shippingCost, total, itemCount } = calculateTotals();

  const validateShipping = () => {
    const newErrors = {};
    if (!formData.fullName) newErrors.fullName = 'Full name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is not valid';
    if (!formData.phone) newErrors.phone = 'Phone number is required';
    if (!formData.address) newErrors.address = 'Address is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.zipCode) newErrors.zipCode = 'ZIP code is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePayment = () => {
    const newErrors = {};
    if (!formData.cardNumber) newErrors.cardNumber = 'Card number is required';
    else if (!/^\d{16}$/.test(formData.cardNumber.replace(/\s/g, ''))) 
      newErrors.cardNumber = 'Card number must be 16 digits';
    
    if (!formData.cardExpiry) newErrors.cardExpiry = 'Expiry date is required';
    else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(formData.cardExpiry)) 
      newErrors.cardExpiry = 'Expiry must be in MM/YY format';
    
    if (!formData.cvv) newErrors.cvv = 'CVV is required';
    else if (!/^\d{3,4}$/.test(formData.cvv)) 
      newErrors.cvv = 'CVV must be 3 or 4 digits';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for card number (add spaces)
    if (name === 'cardNumber') {
      // Remove non-digits
      const digits = value.replace(/\D/g, '');
      // Limit to 16 digits
      const truncated = digits.slice(0, 16);
      // Format with spaces
      const formatted = truncated.replace(/(\d{4})/g, '$1 ').trim();
      
      setFormData(prev => ({
        ...prev,
        [name]: formatted
      }));
    }
    // Special handling for expiry date (auto add slash)
    else if (name === 'cardExpiry') {
      const digits = value.replace(/\D/g, '');
      let formatted = '';
      
      if (digits.length <= 2) {
        formatted = digits;
      } else {
        formatted = digits.slice(0, 2) + '/' + digits.slice(2, 4);
      }
      
      setFormData(prev => ({
        ...prev,
        [name]: formatted
      }));
    }
    // Regular handling for other fields
    else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (activeStep === 'shipping') {
      if (validateShipping()) {
        setActiveStep('payment');
      }
    } else {
      if (validatePayment()) {
        try {
          setIsSubmitting(true);
          
<<<<<<< HEAD
          const userEmail = localStorage.getItem('email');
          if (!userEmail) {
            toast.error('You must be logged in to place an order');
            navigate('/login');
            return;
          }
=======
          // Remove login requirement
          const userEmail = formData.email;
>>>>>>> a35cfc7eb39f42823969bf6ff40681faf31bea65
          
          // Handle different checkout paths
          if (isDirectPurchase) {
            // Single item purchase
            const orderData = {
              userEmail,
              itemId: item._id,
              itemDetails: {
                title: item.title,
                price: item.price,
                image: item.images[0],
                quantity: item.selectedQuantity || 1
              },
              shippingDetails: {
                fullName: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                address: formData.address,
                city: formData.city,
                zipCode: formData.zipCode,
                cost: item.shippingDetails?.cost || 0,
                method: item.shippingDetails?.method || 'Standard'
              },
              paymentDetails: {
                cardNumber: formData.cardNumber.slice(-4),
                cardExpiry: formData.cardExpiry
              },
              orderStatus: 'Pending',
              orderDate: new Date(),
              totalAmount: total
            };
            
            const response = await axios.post('http://localhost:9000/api/orders/create', orderData);
            console.log('Order created:', response.data);
            
            // Call the onSubmit callback if it exists (for direct purchase)
            if (onSubmit) {
              onSubmit(orderData);
            } else {
              // Navigate to order confirmation if no callback
              navigate('/order-confirmation', { state: { orderId: response.data._id } });
            }
          } else {
            // Cart purchase - multiple items
            // Create an order with all cart items
            const orderItems = cartItems.map(item => ({
              itemId: item._id,
              title: item.title,
              price: item.price,
              image: item.image || (item.images && item.images[0]),
              quantity: item.selectedQuantity
            }));
            
            const orderData = {
              userEmail,
              orderItems: orderItems,
              shippingDetails: {
                fullName: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                address: formData.address,
                city: formData.city,
                zipCode: formData.zipCode,
                cost: shippingCost,
                method: 'Standard'
              },
              paymentDetails: {
                cardNumber: formData.cardNumber.slice(-4),
                cardExpiry: formData.cardExpiry
              },
              orderStatus: 'Pending',
              orderDate: new Date(),
              totalAmount: total
            };
            
            const response = await axios.post('http://localhost:9000/api/orders/create-bulk', orderData);
            console.log('Order created:', response.data);
            
            // Clear cart after successful purchase
            localStorage.removeItem('shoppingCart');
            // Dispatch event to update cart count in navbar
            window.dispatchEvent(new Event('cartUpdated'));
            
            // Navigate to order confirmation
            navigate('/order-confirmation', { state: { orderId: response.data._id } });
          }
          
          toast.success('Order placed successfully!');
        } catch (error) {
          console.error('Error placing order:', error);
          toast.error(error.response?.data?.message || 'Failed to place order. Please try again.');
        } finally {
          setIsSubmitting(false);
        }
      }
    }
  };

  const handleBack = () => {
    if (activeStep === 'payment') {
      // Go back to shipping step
      setActiveStep('shipping');
    } else {
      // Close modal or navigate back depending on context
      if (onClose) {
        onClose();
      } else {
        navigate(-1);
      }
    }
  };

  return (
    <div className={onClose ? "checkout-overlay" : "checkout-page"}>
      <div className="checkout-container">
<<<<<<< HEAD
        <div className="checkout-navigation">
          <button className="checkout-back" onClick={handleBack}>
            <ArrowLeft size={24} />
            {activeStep === 'payment' ? 'Back to Shipping' : 'Back'}
          </button>
          {onClose && (
            <button 
              className="checkout-close-icon" 
              onClick={onClose}
              aria-label="Close checkout"
            >
              <X size={24} />
            </button>
          )}
        </div>
=======
      <div className="checkout-navigation">
            <button className="checkout-back" onClick={onClose}>
              <ArrowLeft size={24} />
              Back
            </button>
          </div>
>>>>>>> a35cfc7eb39f42823969bf6ff40681faf31bea65

        <div className="checkout-header">
          <h2>Checkout</h2>
          <div className="checkout-steps">
            <div className={`checkout-step ${activeStep === 'shipping' ? 'active' : ''}`}>
              <Truck size={20} />
              <span>Shipping</span>
            </div>
            <div className={`checkout-step ${activeStep === 'payment' ? 'active' : ''}`}>
              <CreditCard size={20} />
              <span>Payment</span>
            </div>
          </div>
        </div>

        <div className="checkout-content">
          <div className="checkout-item-summary">
<<<<<<< HEAD
            {isDirectPurchase ? (
              // Single item purchase
              <>
                <div className="checkout-image-container">
                  <img 
                    src={`http://localhost:9000${item.images[0]}`} 
                    alt={item.title} 
                    className="checkout-item-image"
                    style={{
                      width: '100px',
                      height: '100px',
                      objectFit: 'cover',
                      borderRadius: '8px'
                    }}
                  />
=======
            <div className="checkout-image-container">
              <img 
                src={`http://localhost:9000${item.images[0]}`} 
                alt={item.title} 
                className="checkout-item-image"
                style={{
                  width: '100px',
                  height: '100px',
                  objectFit: 'cover',
                  borderRadius: '8px'
                }}
              />
            </div>
            <div className="checkout-item-details">
              <h3>{item.title}</h3>
              <p className="checkout-item-price">LKR {item.price.toFixed(2)} × {quantity}</p>
              
              <div className="checkout-price-breakdown">
                <div className="checkout-price-row">
                  <span>Item Subtotal:</span>
                  <span>LKR {subtotal.toFixed(2)}</span>
>>>>>>> a35cfc7eb39f42823969bf6ff40681faf31bea65
                </div>
                <div className="checkout-item-details">
                  <h3>{item.title}</h3>
                  <p className="checkout-item-price">LKR {item.price.toFixed(2)} × {item.selectedQuantity || 1}</p>
                </div>
              </>
            ) : (
              // Cart purchase
              <div className="checkout-cart-summary">
                <h3>Order Summary ({itemCount} items)</h3>
                <div className="checkout-cart-items">
                  {cartItems.map(item => (
                    <div key={item._id} className="checkout-cart-item">
                      <div className="checkout-cart-item-image">
                        <img 
                          src={item.image || (item.images && `http://localhost:9000${item.images[0]}`)} 
                          alt={item.title}
                          style={{
                            width: '60px',
                            height: '60px',
                            objectFit: 'cover',
                            borderRadius: '4px'
                          }}
                        />
                      </div>
                      <div className="checkout-cart-item-details">
                        <h4>{item.title}</h4>
                        <p>LKR {item.price.toFixed(2)} × {item.selectedQuantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="checkout-price-breakdown">
              <div className="checkout-price-row">
                <span>Subtotal:</span>
                <span>LKR {subtotal.toFixed(2)}</span>
              </div>
              <div className="checkout-price-row">
                <span>Shipping:</span>
                <span>LKR {shippingCost.toFixed(2)}</span>
              </div>
              <div className="checkout-price-row checkout-price-total">
                <span>Total:</span>
                <span>LKR {total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="checkout-form">
            {activeStep === 'shipping' ? (
              <div className="checkout-shipping">
                <div className="checkout-form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className={errors.fullName ? 'error' : ''}
                  />
                  {errors.fullName && <span className="checkout-error">{errors.fullName}</span>}
                </div>

                <div className="checkout-form-row">
                  <div className="checkout-form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={errors.email ? 'error' : ''}
                    />
                    {errors.email && <span className="checkout-error">{errors.email}</span>}
                  </div>

                  <div className="checkout-form-group">
                    <label>Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={errors.phone ? 'error' : ''}
                    />
                    {errors.phone && <span className="checkout-error">{errors.phone}</span>}
                  </div>
                </div>

                <div className="checkout-form-group">
                  <label>Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className={errors.address ? 'error' : ''}
                  />
                  {errors.address && <span className="checkout-error">{errors.address}</span>}
                </div>

                <div className="checkout-form-row">
                  <div className="checkout-form-group">
                    <label>City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className={errors.city ? 'error' : ''}
                    />
                    {errors.city && <span className="checkout-error">{errors.city}</span>}
                  </div>

                  <div className="checkout-form-group">
                    <label>ZIP Code</label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      className={errors.zipCode ? 'error' : ''}
                    />
                    {errors.zipCode && <span className="checkout-error">{errors.zipCode}</span>}
                  </div>
                </div>
              </div>
            ) : (
              <div className="checkout-payment">
                <div className="checkout-form-group">
                  <label>Card Number</label>
                  <input
                    type="text"
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                    placeholder="1234 5678 9012 3456"
                    className={errors.cardNumber ? 'error' : ''}
                    maxLength={19} // 16 digits + 3 spaces
                  />
                  {errors.cardNumber && <span className="checkout-error">{errors.cardNumber}</span>}
                </div>

                <div className="checkout-form-row">
                  <div className="checkout-form-group">
                    <label>Expiry Date</label>
                    <input
                      type="text"
                      name="cardExpiry"
                      value={formData.cardExpiry}
                      onChange={handleInputChange}
                      placeholder="MM/YY"
                      className={errors.cardExpiry ? 'error' : ''}
                      maxLength={5} // MM/YY format
                    />
                    {errors.cardExpiry && <span className="checkout-error">{errors.cardExpiry}</span>}
                  </div>

                  <div className="checkout-form-group">
                    <label>CVV</label>
                    <input
                      type="password"
                      name="cvv"
                      value={formData.cvv}
                      onChange={handleInputChange}
                      placeholder="123"
                      className={errors.cvv ? 'error' : ''}
                      maxLength={4}
                    />
                    {errors.cvv && <span className="checkout-error">{errors.cvv}</span>}
                  </div>
                </div>
              </div>
            )}

            <button 
              type="submit" 
              className="checkout-submit"
              disabled={isSubmitting}
            >
              {isSubmitting 
                ? 'Processing...' 
                : (activeStep === 'shipping' ? 'Continue to Payment' : 'Place Order')}
            </button>
          </form>
        </div>
        
        <ToastContainer 
          position="top-center"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </div>
  );
};

export default CheckoutPage;