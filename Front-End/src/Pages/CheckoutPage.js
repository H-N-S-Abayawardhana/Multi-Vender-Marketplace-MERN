import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CreditCard, Truck, ArrowLeft, X } from 'lucide-react';
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
  const navigate = useNavigate();
  const quantity = item.selectedQuantity || 1;

  const shippingCost = item.shippingDetails?.cost || 0;
  const itemPrice = item.price || 0;
  const subtotal = itemPrice * quantity;
  const totalPrice = subtotal + shippingCost;

  const validateShipping = () => {
    const newErrors = {};
    if (!formData.fullName) newErrors.fullName = 'Full name is required';
    if (!formData.email) newErrors.email = 'Email is required';
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
    if (!formData.cardExpiry) newErrors.cardExpiry = 'Expiry date is required';
    if (!formData.cvv) newErrors.cvv = 'CVV is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
          
          const userEmail = localStorage.getItem('email');
          if (!userEmail) {
            toast.error('You must be logged in to place an order');
            navigate('/login')
            return;
          }
          
          const orderData = {
            userEmail,
            itemId: item._id,
            itemDetails: {
              title: item.title,
              price: item.price,
              image: item.images[0],
              quantity: quantity
            },
            shippingDetails: {
              fullName: formData.fullName,
              email: formData.email,
              phone: formData.phone,
              address: formData.address,
              city: formData.city,
              zipCode: formData.zipCode,
              cost: shippingCost,
              method: item.shippingDetails?.method || 'Standard'
            },
            paymentDetails: {
              cardNumber: formData.cardNumber.slice(-4),
              cardExpiry: formData.cardExpiry
            },
            orderStatus: 'Pending',
            orderDate: new Date(),
            totalAmount: totalPrice
          };
          
          const response = await axios.post('http://localhost:9000/api/orders/create', orderData);
          console.log('Order created:', response.data);
          onSubmit(formData);
          
        } catch (error) {
          console.error('Error placing order:', error);
          toast.error(error.response?.data?.message || 'Failed to place order. Please try again.');
        } finally {
          setIsSubmitting(false);
        }
      }
    }
  };

  return (
    <div className="checkout-overlay">
      <div className="checkout-container">
      <div className="checkout-navigation">
            <button className="checkout-back" onClick={onClose}>
              <ArrowLeft size={24} />
              Back
            </button>
            {/* <button 
              className="checkout-close-icon" 
              onClick={onClose}
              aria-label="Close checkout"
            >
              <X size={24} />
            </button> */}
          </div>

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
              <p className="checkout-item-price">${item.price.toFixed(2)} × {quantity}</p>
              
              <div className="checkout-price-breakdown">
                <div className="checkout-price-row">
                  <span>Item Subtotal:</span>
                  <span>LKR {subtotal.toFixed(2)}</span>
                </div>
                <div className="checkout-price-row">
                  <span>Shipping ({item.shippingDetails?.method || 'Standard'}):</span>
                  <span>LKR {shippingCost.toFixed(2)}</span>
                </div>
                <div className="checkout-price-row checkout-price-total">
                  <span>Total:</span>
                  <span>LKR {totalPrice.toFixed(2)}</span>
                </div>
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
                    />
                    {errors.cardExpiry && <span className="checkout-error">{errors.cardExpiry}</span>}
                  </div>

                  <div className="checkout-form-group">
                    <label>CVV</label>
                    <input
                      type="text"
                      name="cvv"
                      value={formData.cvv}
                      onChange={handleInputChange}
                      placeholder="123"
                      className={errors.cvv ? 'error' : ''}
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
      </div>
    </div>
  );
};

export default CheckoutPage;