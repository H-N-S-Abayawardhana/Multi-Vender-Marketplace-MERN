const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD
  }
});

const sendOrderConfirmationEmail = async (orderData) => {
  const {
    userEmail,
    itemDetails,
    shippingDetails,
    paymentDetails,
    orderStatus,
    orderDate,
    totalAmount,
    orderId
  } = orderData;

  const mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to: userEmail,
    subject: `Order Confirmation: Your purchase has been confirmed!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
        <h2 style="color: #333;">Order Confirmation</h2>
        <p>Hello ${shippingDetails.fullName},</p>
        <p>Thank you for your order! We're pleased to confirm that your order has been received and is being processed.</p>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #333;">Order Summary</h3>
          <p><strong>Order ID:</strong> ${orderId || 'N/A'}</p>
          <p><strong>Order Date:</strong> ${new Date(orderDate).toLocaleString()}</p>
          <p><strong>Order Status:</strong> ${orderStatus}</p>
          
          <h4 style="margin-bottom: 5px;">Item(s):</h4>
          <div style="border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 10px;">
            <p><strong>${itemDetails.title}</strong> x ${itemDetails.quantity}</p>
            <p>Price: LKR ${itemDetails.price.toFixed(2)}</p>
          </div>
          
          <p><strong>Shipping:</strong> LKR ${shippingDetails.cost.toFixed(2)}</p>
          <p><strong>Total Amount:</strong> LKR ${totalAmount.toFixed(2)}</p>
        </div>
        
        <div style="margin: 20px 0;">
          <h3 style="color: #333;">Shipping Details</h3>
          <p>${shippingDetails.fullName}</p>
          <p>${shippingDetails.address}</p>
          <p>${shippingDetails.city}, ${shippingDetails.zipCode}</p>
          <p>Phone: ${shippingDetails.phone}</p>
          <p>Shipping Method: ${shippingDetails.method}</p>
        </div>
        
        <p>If you have any questions about your order, please contact our customer support team.</p>
        <p style="margin-top: 30px;">Thank you for shopping with us!</p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Order confirmation email sent: ' + info.response);
    return true;
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    return false;
  }
};

const sendOrderStatusUpdateEmail = async (buyerEmail, orderId, newStatus, itemTitle, sellerEmail) => {
  
  let subject = `Your Order Status Update: ${itemTitle}`;
  let statusMessage = '';
  
  switch(newStatus) {
    case 'Processing':
      statusMessage = 'Your order is now being processed and prepared for shipping.';
      break;
    case 'Shipped':
      statusMessage = 'Great news! Your order has been shipped and is on its way to you.';
      break;
    case 'Delivered':
      statusMessage = 'Your order has been marked as delivered. We hope you enjoy your purchase!';
      break;
    case 'Cancelled':
      statusMessage = 'Your order has been cancelled. Please contact the seller if you have any questions.';
      break;
    default:
      statusMessage = `Your order status has been updated to: ${newStatus}`;
  }

  const mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to: buyerEmail,
    subject: subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
        <h2 style="color: #333;">Order Status Update</h2>
        <p>Hello,</p>
        <p>The status of your order (ID: ${orderId}) for <strong>${itemTitle}</strong> has been updated.</p>
        <p><strong>New Status: ${newStatus}</strong></p>
        <p>${statusMessage}</p>
        <p>If you have any questions about your order, please contact the seller at ${sellerEmail}.</p>
        <p>Thank you for shopping with us!</p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

module.exports = {
  sendOrderStatusUpdateEmail,
  sendOrderConfirmationEmail
};