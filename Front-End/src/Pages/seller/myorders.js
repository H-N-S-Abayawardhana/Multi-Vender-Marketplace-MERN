import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Badge, Button, Spinner, Toast, ToastContainer } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import NavBar from '../../components/seller/sellerNavBar';
import Footer from '../../components/Footer';
import '../../css/seller/myorders.css';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({
    show: false,
    message: '',
    variant: 'success'
  });
  
  // Get seller email from localStorage
  const sellerEmail = localStorage.getItem('email');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        // Call the API endpoint to get orders for the seller
        const response = await axios.get(`http://localhost:9000/api/orders/seller?email=${sellerEmail}`);
        setOrders(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load orders. Please try again later.');
        setLoading(false);
      }
    };

    if (sellerEmail) {
      fetchOrders();
    } else {
      setError('You need to be logged in to view your orders');
      setLoading(false);
    }
  }, [sellerEmail]);

  // Function to show toast notification
  const showToast = (message, variant = 'success') => {
    setToast({
      show: true,
      message,
      variant
    });
  };

  // Function to update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      // API request to update the order status
      await axios.put(`http://localhost:9000/api/orders/${orderId}/status`, { status: newStatus });

      const response = await axios.get(`http://localhost:9000/api/orders/seller?email=${sellerEmail}`);
      setOrders(response.data);
      
      // For now, we'll just update the UI optimistically
      setOrders(orders.map(order => 
        order._id === orderId ? {...order, orderStatus: newStatus} : order
      ));
      
      // Show success toast notification
      showToast(`Order status updated to ${newStatus} successfully!`);
    } catch (err) {
      console.error('Error updating order status:', err);
      showToast('Failed to update order status. Please try again.', 'danger');
    }
  };

  // Function to get appropriate badge color based on order status
  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'Pending': return 'warning';
      case 'Processing': return 'info';
      case 'Shipped': return 'primary';
      case 'Delivered': return 'success';
      case 'Cancelled': return 'danger';
      default: return 'secondary';
    }
  };

  // Function to format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="seller-orders-loading-container">
        <Spinner animation="border" role="status" className="seller-orders-spinner">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return (
      <Container className="seller-orders-error-container">
        <div className="seller-orders-error-message">{error}</div>
      </Container>
    );
  }

  return (
    <>
      <NavBar />
      <div className="seller-orders-main-container">
        <ToastContainer position="top-end" className="p-3 seller-orders-toast-container">
          <Toast 
            onClose={() => setToast({ ...toast, show: false })} 
            show={toast.show} 
            delay={3000} 
            autohide
            bg={toast.variant}
            className="seller-orders-toast"
          >
            <Toast.Header>
              <strong className="me-auto">Order Update</strong>
            </Toast.Header>
            <Toast.Body className={toast.variant === 'danger' ? 'text-white' : ''}>
              {toast.message}
            </Toast.Body>
          </Toast>
        </ToastContainer>

        <Container className="seller-orders-container">
          <h2 className="seller-orders-title">My Received Orders</h2>
          
          {orders.length === 0 ? (
            <div className="seller-orders-empty-message">
              You don't have any orders yet.
            </div>
          ) : (
            <>
              <p className="seller-orders-count">Showing {orders.length} orders for {sellerEmail}</p>
              
              <div className="seller-orders-list">
                {orders.map(order => (
                  <Card key={order._id} className="seller-orders-card">
                    <Card.Header className="seller-orders-card-header">
                      <div className="seller-orders-id">
                        <strong>Order ID:</strong> {order._id}
                      </div>
                      <Badge bg={getStatusBadgeVariant(order.orderStatus)} className="seller-orders-status-badge">
                        {order.orderStatus}
                      </Badge>
                    </Card.Header>
                    
                    <Card.Body className="seller-orders-card-body">
                      <Row>
                        <Col md={3} className="seller-orders-image-container">
                          {order.itemDetails.image && (
                            <img 
                              src={`http://localhost:9000${order.itemDetails.image}`}
                              alt={order.itemDetails.title}
                              className="seller-orders-product-image" 
                            />
                          )}
                        </Col>
                        
                        <Col md={5} className="seller-orders-details">
                          <h5 className="seller-orders-product-title">{order.itemDetails.title}</h5>
                          <p className="seller-orders-detail-item">
                            <strong>Price:</strong> ${order.itemDetails.price.toFixed(2)}
                          </p>
                          <p className="seller-orders-detail-item">
                            <strong>Quantity:</strong> {order.itemDetails.quantity}
                          </p>
                          <p className="seller-orders-detail-item">
                            <strong>Total:</strong> ${order.totalAmount.toFixed(2)}
                          </p>
                          <p className="seller-orders-detail-item">
                            <strong>Ordered On:</strong> {formatDate(order.orderDate)}
                          </p>
                        </Col>
                        
                        <Col md={4} className="seller-orders-buyer-info">
                          <h6 className="seller-orders-section-title">Buyer Information</h6>
                          <p className="seller-orders-detail-item">
                            <strong>Name:</strong> {order.shippingDetails.fullName}
                          </p>
                          <p className="seller-orders-detail-item">
                            <strong>Email:</strong> {order.userEmail}
                          </p>
                          <p className="seller-orders-detail-item">
                            <strong>Phone:</strong> {order.shippingDetails.phone}
                          </p>
                          <p className="seller-orders-detail-item">
                            <strong>Address:</strong> {order.shippingDetails.address}, {order.shippingDetails.city}, {order.shippingDetails.zipCode}
                          </p>
                        </Col>
                      </Row>
                      
                      <div className="seller-orders-actions">
                        <h6 className="seller-orders-section-title">Update Order Status</h6>
                        <div className="seller-orders-button-group">
                          <Button 
                            className="seller-orders-action-btn"
                            variant="outline-info"
                            onClick={() => updateOrderStatus(order._id, 'Processing')}
                            disabled={order.orderStatus !== 'Pending'}
                          >
                            Mark Processing
                          </Button>
                          <Button 
                            className="seller-orders-action-btn"
                            variant="outline-primary"
                            onClick={() => updateOrderStatus(order._id, 'Shipped')}
                            disabled={order.orderStatus !== 'Processing'}
                          >
                            Mark Shipped
                          </Button>
                          <Button 
                            className="seller-orders-action-btn"
                            variant="outline-success"
                            onClick={() => updateOrderStatus(order._id, 'Delivered')}
                            disabled={order.orderStatus !== 'Shipped'}
                          >
                            Mark Delivered
                          </Button>
                          <Button 
                            className="seller-orders-action-btn"
                            variant="outline-danger"
                            onClick={() => updateOrderStatus(order._id, 'Cancelled')}
                            disabled={order.orderStatus === 'Delivered' || order.orderStatus === 'Cancelled'}
                          >
                            Cancel Order
                          </Button>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                ))}
              </div>
            </>
          )}
        </Container>
      </div>
      <Footer />
    </>
  );
};

export default MyOrders;