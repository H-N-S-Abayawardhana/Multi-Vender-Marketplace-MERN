const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD
  }
});

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
  sendOrderStatusUpdateEmail
};