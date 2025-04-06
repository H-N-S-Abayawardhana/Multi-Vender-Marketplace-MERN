import React, { useState, useEffect } from 'react';
import { fetchUserOrders } from '../services/orderService';
import '../css/MyOrderItems.css';
import NavBar from '../components/NavBar'
import Footer from '../components/Footer'

const MyOrderItems = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const userEmail = localStorage.getItem('email');
        if (!userEmail) {
          setError('User not logged in');
          setLoading(false);
          return;
        }

        const response = await fetchUserOrders(userEmail);
        if (response.success) {
          setOrders(response.orders);
        } else {
          setError(response.message || 'Failed to fetch orders');
        }
      } catch (error) {
        setError('Error fetching orders. Please try again later.');
        console.error('Error in fetchOrders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusClass = (status) => {
    switch (status) {
      case 'Pending': return 'my-ordered-items-status-pending';
      case 'Processing': return 'my-ordered-items-status-processing';
      case 'Shipped': return 'my-ordered-items-status-shipped';
      case 'Delivered': return 'my-ordered-items-status-delivered';
      case 'Cancelled': return 'my-ordered-items-status-cancelled';
      default: return '';
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="my-ordered-items-container">
        <div className="my-ordered-items-loading">
          <p>Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-ordered-items-container">
        <div className="my-ordered-items-error">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="my-ordered-items-container">
        <div className="my-ordered-items-empty">
          <h2>My Orders</h2>
          <p>You haven't placed any orders yet.</p>
        </div>
      </div>
    );
  }

  return (
    <>
    <NavBar />
    <div className="my-ordered-items-container">
      <h2 className="my-ordered-items-title">My Orders</h2>
      
      <div className="my-ordered-items-list">
        {orders.map((order) => (
          <div key={order._id} className="my-ordered-items-card">
            <div className="my-ordered-items-header">
              <div className="my-ordered-items-order-info">
                <p className="my-ordered-items-order-id">Order #{order._id.substring(order._id.length - 8)}</p>
                <p className="my-ordered-items-order-date">Placed on {formatDate(order.orderDate)}</p>
              </div>
              <div className={`my-ordered-items-status ${getStatusClass(order.orderStatus)}`}>
                {order.orderStatus}
              </div>
            </div>
            
            <div className="my-ordered-items-product">
              <div className="my-ordered-items-product-image">
                {order.itemDetails.image && (
                  <img src={`http://localhost:9000${order.itemDetails.image}`} alt={order.itemDetails.title} />
                )}
              </div>
              
              <div className="my-ordered-items-product-details">
                <h3 className="my-ordered-items-product-title">{order.itemDetails.title}</h3>
                <p className="my-ordered-items-product-price">
                  ${order.itemDetails.price} × {order.itemDetails.quantity}
                </p>
                <p className="my-ordered-items-seller">Seller: {order.sellerEmail}</p>
              </div>
            </div>
            
            <div className="my-ordered-items-details-row">
              <div className="my-ordered-items-shipping">
                <h4>Shipping Details</h4>
                <p>{order.shippingDetails.fullName}</p>
                <p>{order.shippingDetails.address}</p>
                <p>{order.shippingDetails.city}, {order.shippingDetails.zipCode}</p>
                <p>{order.shippingDetails.phone}</p>
                <p>{order.shippingDetails.email}</p>
              </div>
              
              <div className="my-ordered-items-payment">
                <h4>Payment Details</h4>
                <p>Card ending in: {order.paymentDetails.cardNumber}</p>
                <p>Expires: {order.paymentDetails.cardExpiry}</p>
                <h4>Total Amount</h4>
                <p className="my-ordered-items-total">${order.totalAmount.toFixed(2)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
    <Footer />
    </>
  );
};

export default MyOrderItems;