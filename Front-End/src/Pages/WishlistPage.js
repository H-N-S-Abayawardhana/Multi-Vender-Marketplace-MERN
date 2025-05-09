// Pages/WishlistPage.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Heart, Trash2, ShoppingCart, CreditCard, ArrowLeft } from 'lucide-react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../css/Wishlist.css'; // You'll need to create this CSS file

const WishlistPage = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        setLoading(true);
        const email = localStorage.getItem('email');
        
        if (!email) {
          setError('Please sign in to view your wishlist');
          setLoading(false);
          return;
        }
        
        const response = await axios.get('http://localhost:9000/api/wishlist/detailed', {
          params: { email }
        });
        
        // Map the response to get the actual items
        const items = response.data.map(wishlistEntry => wishlistEntry.itemId);
        setWishlistItems(items);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching wishlist:', err);
        setError('Failed to load your wishlist. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchWishlist();
  }, []);

  const handleRemoveFromWishlist = async (itemId) => {
    try {
      const email = localStorage.getItem('email');
      
      if (!email) {
        toast.error('Please sign in to use wishlist feature');
        return;
      }
      
      await axios.delete(`http://localhost:9000/api/wishlist/${itemId}?email=${encodeURIComponent(email)}`);
      
      // Remove item from state
      setWishlistItems(prev => prev.filter(item => item._id !== itemId));
      toast.info('Item removed from wishlist');
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('Failed to remove item from wishlist');
    }
  };

  const handleAddToCart = (item) => {
    // Get existing cart
    const existingCart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
    
    // Check if item already exists in cart
    const existingItemIndex = existingCart.findIndex(cartItem => cartItem._id === item._id);
    
    if (existingItemIndex >= 0) {
      // Update quantity if item already exists
      existingCart[existingItemIndex].selectedQuantity += 1;
      // Ensure we don't exceed available quantity
      if (existingCart[existingItemIndex].selectedQuantity > item.quantity) {
        existingCart[existingItemIndex].selectedQuantity = item.quantity;
      }
    } else {
      // Add new item to cart
      existingCart.push({
        _id: item._id,
        title: item.title,
        price: item.price,
        images: item.images,
        selectedQuantity: 1,
        maxQuantity: item.quantity,
        shippingDetails: item.shippingDetails
      });
    }
    
    // Save updated cart to localStorage
    localStorage.setItem('shoppingCart', JSON.stringify(existingCart));
    
    // Dispatch event to notify other components of cart update
    window.dispatchEvent(new Event('cartUpdated'));
    
    toast.success('Added to cart');
  };

  // Format price to display in LKR
  const formatPrice = (price) => {
    return `LKR ${price.toFixed(2)}`;
  };

  if (loading) {
    return (
      <>
        <NavBar />
        <div className="wishlist-loading">
          <div className="wishlist-loading-spinner"></div>
          <p>Loading your wishlist...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <NavBar />
        <div className="wishlist-error">
          <div className="wishlist-error-icon">⚠️</div>
          <p>{error}</p>
          <Link to="/login" className="wishlist-signin-btn">Sign In</Link>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <NavBar />
      <div className="wishlist-container">
        <div className="wishlist-header">
          <h1>
            <Heart size={24} className="wishlist-icon" />
            My Wishlist
          </h1>
          <Link to="/" className="wishlist-back-link">
            <ArrowLeft size={16} />
            Continue Shopping
          </Link>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="wishlist-empty">
            <div className="wishlist-empty-icon">♡</div>
            <h2>Your wishlist is empty</h2>
            <p>Add items you love to your wishlist. Review them anytime and easily move them to your cart.</p>
            <Link to="/" className="wishlist-shop-btn">Start Shopping</Link>
          </div>
        ) : (
          <div className="wishlist-items-grid">
            {wishlistItems.map(item => (
              <div key={item._id} className="wishlist-item-card">
                <Link to={`/item/${item._id}`} className="wishlist-item-link">
                  <div className="wishlist-item-image">
                    {item.images && item.images[0] ? (
                      <img src={`http://localhost:9000${item.images[0]}`} alt={item.title} />
                    ) : (
                      <div className="wishlist-no-image">No Image Available</div>
                    )}
                  </div>
                  
                  <div className="wishlist-item-details">
                    <h3 className="wishlist-item-title">{item.title}</h3>
                    
                    <div className="wishlist-item-price">
                      <span className="wishlist-current-price">{formatPrice(item.price)}</span>
                      {item.originalPrice && item.originalPrice > item.price && (
                        <span className="wishlist-original-price">
                          {formatPrice(item.originalPrice)}
                        </span>
                      )}
                    </div>
                    
                    <p className="wishlist-item-description">
                      {item.description ? (
                        <>
                          {item.description.slice(0, 60)}
                          {item.description.length > 60 ? '...' : ''}
                        </>
                      ) : (
                        'No description available'
                      )}
                    </p>
                  </div>
                </Link>
                
                <div className="wishlist-item-actions">
                  <button 
                    className="wishlist-remove-btn"
                    onClick={() => handleRemoveFromWishlist(item._id)}
                    aria-label="Remove from wishlist"
                  >
                    <Trash2 size={16} />
                    <span>Remove</span>
                  </button>
                  
                  {item.quantity > 0 ? (
                    <div className="wishlist-action-buttons">
                      <button 
                        className="wishlist-cart-btn"
                        onClick={() => handleAddToCart(item)}
                        aria-label="Add to cart"
                      >
                        <ShoppingCart size={16} />
                        <span>Add to Cart</span>
                      </button>
                      <Link 
                        to={`/item/${item._id}`} 
                        className="wishlist-view-btn"
                        aria-label="View item"
                      >
                        <CreditCard size={16} />
                        <span>View Item</span>
                      </Link>
                    </div>
                  ) : (
                    <div className="wishlist-out-of-stock">
                      Out of Stock
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
      
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
    </>
  );
};

export default WishlistPage;