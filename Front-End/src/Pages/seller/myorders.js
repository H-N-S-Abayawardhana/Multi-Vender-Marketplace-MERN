import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Badge, Button, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import NavBar from '../../components/seller/sellerNavBar';
import Footer from '../../components/Footer';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
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

  // Function to update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      // Implement order status update functionality here
      // This would be a PUT request to update the order status
      await axios.put(`http://localhost:9000/api/orders/${orderId}/status`, { status: newStatus });

      const response = await axios.get(`http://localhost:9000/api/orders/seller?email=${sellerEmail}`);
      setOrders(response.data);
      
      // For now, we'll just update the UI optimistically
      setOrders(orders.map(order => 
        order._id === orderId ? {...order, orderStatus: newStatus} : order
      ));
      
      // Show a success message (you can implement toast notifications here)
      alert(`Order ${orderId} status updated to ${newStatus}`);
    } catch (err) {
      console.error('Error updating order status:', err);
      alert('Failed to update order status');
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
      <Container className="text-center my-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="text-center my-5">
        <div className="alert alert-danger">{error}</div>
      </Container>
    );
  }

  return (
  <>
  <NavBar/>
    <Container className="my-5">
      <h2 className="mb-4">My Received Orders</h2>
      
      {orders.length === 0 ? (
        <div className="alert alert-info">You don't have any orders yet.</div>
      ) : (
        <>
          <p>Showing {orders.length} orders for {sellerEmail}</p>
          
          {orders.map(order => (
            <Card key={order._id} className="mb-4 shadow-sm">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <div>
                  <strong>Order ID:</strong> {order._id}
                </div>
                <Badge bg={getStatusBadgeVariant(order.orderStatus)}>
                  {order.orderStatus}
                </Badge>
              </Card.Header>
              
              <Card.Body>
                <Row>
                  <Col md={3}>
                    {order.itemDetails.image && (
                      <img 
                        src={`http://localhost:9000${order.itemDetails.image}`}
                        alt={order.itemDetails.title}
                        className="img-fluid rounded" 
                        style={{ maxHeight: '120px', objectFit: 'contain' }}
                      />
                    )}
                  </Col>
                  
                  <Col md={5}>
                    <h5>{order.itemDetails.title}</h5>
                    <p className="mb-1">
                      <strong>Price:</strong> ${order.itemDetails.price.toFixed(2)}
                    </p>
                    <p className="mb-1">
                      <strong>Quantity:</strong> {order.itemDetails.quantity}
                    </p>
                    <p className="mb-1">
                      <strong>Total:</strong> ${order.totalAmount.toFixed(2)}
                    </p>
                    <p className="mb-1">
                      <strong>Ordered On:</strong> {formatDate(order.orderDate)}
                    </p>
                  </Col>
                  
                  <Col md={4}>
                    <h6>Buyer Information</h6>
                    <p className="mb-1">
                      <strong>Name:</strong> {order.shippingDetails.fullName}
                    </p>
                    <p className="mb-1">
                      <strong>Email:</strong> {order.userEmail}
                    </p>
                    <p className="mb-1">
                      <strong>Phone:</strong> {order.shippingDetails.phone}
                    </p>
                    <p className="mb-1">
                      <strong>Address:</strong> {order.shippingDetails.address}, {order.shippingDetails.city}, {order.shippingDetails.zipCode}
                    </p>
                  </Col>
                </Row>
                
                <div className="mt-3">
                  <h6>Update Order Status</h6>
                  <div className="d-flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline-info"
                      onClick={() => updateOrderStatus(order._id, 'Processing')}
                      disabled={order.orderStatus !== 'Pending'}
                    >
                      Mark Processing
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline-primary"
                      onClick={() => updateOrderStatus(order._id, 'Shipped')}
                      disabled={order.orderStatus !== 'Processing'}
                    >
                      Mark Shipped
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline-success"
                      onClick={() => updateOrderStatus(order._id, 'Delivered')}
                      disabled={order.orderStatus !== 'Shipped'}
                    >
                      Mark Delivered
                    </Button>
                    <Button 
                      size="sm" 
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
        </>
      )}
    </Container>
    <Footer/>
    </>
  );
};

export default MyOrders;