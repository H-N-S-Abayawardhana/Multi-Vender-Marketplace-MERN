import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Star, 
  ShoppingCart, 
  CreditCard, 
  Minus, 
  Plus, 
  Heart, 
  Truck,
  ChevronLeft,
  ChevronRight,
  Share2,
  Clock
} from 'lucide-react';
import '../css/ItemDetail.css';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CheckoutPage from '../Pages/CheckoutPage';

const ItemDetail = () => {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showCheckout, setShowCheckout] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [userReview, setUserReview] = useState({
    rating: 0,
    comment: ''
  });
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchItemDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:9000/api/items/${itemId}`);
        setItem(response.data);
        
        // Check if item is in wishlist
        const savedWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        setIsWishlisted(savedWishlist.includes(itemId));
        
        // Fetch reviews for this item
        const reviewsResponse = await axios.get(`http://localhost:9000/api/reviews/${itemId}`);
        setReviews(reviewsResponse.data);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching item details:', err);
        setError('Failed to load item details. Please try again later.');
        setLoading(false);
      }
    };

    fetchItemDetails();
  }, [itemId]);

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= (item?.quantity || 1)) {
      setQuantity(newQuantity);
    }
  };

  const toggleWishlist = () => {
    const savedWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    let newWishlist;
    
    if (isWishlisted) {
      newWishlist = savedWishlist.filter(id => id !== itemId);
      toast.info('Removed from wishlist');
    } else {
      newWishlist = [...savedWishlist, itemId];
      toast.success('Added to wishlist');
    }
    
    localStorage.setItem('wishlist', JSON.stringify(newWishlist));
    setIsWishlisted(!isWishlisted);
  };

  const handleImageNavigation = (direction) => {
    if (!item || !item.images || item.images.length <= 1) return;
    
    const imagesCount = item.images.length;
    if (direction === 'next') {
      setCurrentImageIndex((prev) => (prev + 1) % imagesCount);
    } else {
      setCurrentImageIndex((prev) => (prev - 1 + imagesCount) % imagesCount);
    }
  };

  const handleAddToCart = () => {
    if (!item) return;
    
    // Format item for cart
    const cartItem = {
      _id: item._id,
      title: item.title,
      price: item.price,
      images: item.images,
      selectedQuantity: quantity,
      maxQuantity: item.quantity,
      shippingDetails: item.shippingDetails
    };
    
    // Get existing cart
    const existingCart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
    
    // Check if item already exists in cart
    const existingItemIndex = existingCart.findIndex(cartItem => cartItem._id === item._id);
    
    if (existingItemIndex >= 0) {
      // Update quantity if item already exists
      existingCart[existingItemIndex].selectedQuantity += quantity;
      // Ensure we don't exceed available quantity
      if (existingCart[existingItemIndex].selectedQuantity > item.quantity) {
        existingCart[existingItemIndex].selectedQuantity = item.quantity;
      }
    } else {
      // Add new item to cart
      existingCart.push(cartItem);
    }
    
    // Save updated cart to localStorage
    localStorage.setItem('shoppingCart', JSON.stringify(existingCart));
    
    // Dispatch event to notify other components of cart update
    window.dispatchEvent(new Event('cartUpdated'));
    
    toast.success(`Added ${quantity} ${quantity > 1 ? 'items' : 'item'} to cart`);
  };

  const handleBuyNow = () => {
    if (!item) return;
    
    const itemWithQuantity = {
      ...item,
      selectedQuantity: quantity,
      totalPrice: item.price * quantity
    };
    
    setShowCheckout(true);
  };

  const handleCheckoutClose = () => {
    setShowCheckout(false);
  };

  const handleOrderSubmit = async (orderData) => {
    try {
      setLoading(true);
      
      // Close checkout
      setShowCheckout(false);

      // Show success message
      toast.success(`Order placed successfully! You ordered ${quantity} item(s).`);
      
      // Redirect to orders page after short delay
      setTimeout(() => {
        navigate('/orders');
      }, 2000);
    } catch (error) {
      console.error('Error submitting order:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Rating handlers
  const handleRatingHover = (rating) => {
    setHoveredRating(rating);
  };

  const handleRatingClick = (rating) => {
    setUserReview(prev => ({ ...prev, rating }));
  };

  const handleCommentChange = (e) => {
    setUserReview(prev => ({ ...prev, comment: e.target.value }));
  };

  const handleSubmitReview = async () => {
    // Ensure a rating is selected
    if (userReview.rating === 0) {
      toast.warning('Please select a rating');
      return;
    }

    try {
      setIsSubmittingReview(true);
      
      const token = localStorage.getItem('token');
      const email = localStorage.getItem('email');
      
      // For anonymous reviews if not logged in
      const reviewData = {
        itemId,
        rating: userReview.rating,
        comment: userReview.comment,
        user: email || 'Anonymous'
      };
      
      // Submit the review
      const response = await axios.post('http://localhost:9000/api/reviews', reviewData, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      // Update the reviews list
      setReviews(prev => [response.data, ...prev]);
      
      // Reset the form
      setUserReview({ rating: 0, comment: '' });
      
      toast.success('Your review has been submitted!');
    } catch (err) {
      console.error('Error submitting review:', err);
      toast.error('Failed to submit review. Please try again.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const calculateAverageRating = () => {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((total, review) => total + review.rating, 0);
    return sum / reviews.length;
  };

  const formatPrice = (price) => {
    return `LKR ${price.toFixed(2)}`;
  };

  const calculateDiscount = (originalPrice, price) => {
    if (!originalPrice || originalPrice <= price) return null;
    const discount = Math.round(((originalPrice - price) / originalPrice) * 100);
    return discount > 0 ? discount : null;
  };

  if (loading) {
    return (
      <>
        <NavBar />
        <div className="item-detail-loading">
          <div className="item-detail-loading-spinner"></div>
          <p>Loading item details...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !item) {
    return (
      <>
        <NavBar />
        <div className="item-detail-error">
          <div className="item-detail-error-icon">⚠️</div>
          <p>{error || 'Item not found'}</p>
          <button className="item-detail-back-btn" onClick={() => navigate('/')}>Back to Home</button>
        </div>
        <Footer />
      </>
    );
  }

  const discount = calculateDiscount(item.originalPrice, item.price);
  const averageRating = calculateAverageRating();

  return (
    <>
      <NavBar />
      <div className="item-detail-container">
        <div className="item-detail-breadcrumb">
          <span onClick={() => navigate('/')}>Home</span> / 
          <span onClick={() => navigate(`/category/${item.category.toLowerCase()}`)}>{item.category}</span> / 
          <span className="item-detail-breadcrumb-current">{item.title}</span>
        </div>
        
        <div className="item-detail-content">
          {/* Image Gallery */}
          <div className="item-detail-gallery">
            <div className="item-detail-image-container">
              {item.images && item.images.length > 0 ? (
                <>
                  <img 
                    src={`http://localhost:9000${item.images[currentImageIndex]}`} 
                    alt={`${item.title} - Image ${currentImageIndex + 1}`} 
                    className="item-detail-main-image"
                  />
                  
                  {/* Image navigation buttons */}
                  {item.images.length > 1 && (
                    <>
                      <button 
                        className="item-detail-image-nav prev"
                        onClick={() => handleImageNavigation('prev')}
                        aria-label="Previous image"
                      >
                        <ChevronLeft size={24} />
                      </button>
                      <button 
                        className="item-detail-image-nav next"
                        onClick={() => handleImageNavigation('next')}
                        aria-label="Next image"
                      >
                        <ChevronRight size={24} />
                      </button>
                    </>
                  )}
                  
                  {/* Badges */}
                  <div className="item-detail-badges">
                    {item.listingType === 'Auction' && (
                      <div className="item-detail-badge auction">Auction</div>
                    )}
                    {item.condition !== 'New' && (
                      <div className="item-detail-badge condition">{item.condition}</div>
                    )}
                    {discount && (
                      <div className="item-detail-badge discount">-{discount}%</div>
                    )}
                  </div>
                </>
              ) : (
                <div className="item-detail-no-image">No Image Available</div>
              )}
            </div>
            
            {/* Thumbnails */}
            {item.images && item.images.length > 1 && (
              <div className="item-detail-thumbnails">
                {item.images.map((image, index) => (
                  <div 
                    key={index}
                    className={`item-detail-thumbnail ${currentImageIndex === index ? 'active' : ''}`}
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    <img 
                      src={`http://localhost:9000${image}`} 
                      alt={`${item.title} thumbnail ${index + 1}`} 
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Item Information */}
          <div className="item-detail-info">
            <h1 className="item-detail-title">{item.title}</h1>
            
            <div className="item-detail-rating-overview">
              {averageRating > 0 ? (
                <>
                  <div className="item-detail-stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star}
                        size={20}
                        fill={star <= Math.round(averageRating) ? '#FFD700' : 'none'}
                        color={star <= Math.round(averageRating) ? '#FFD700' : '#ccc'}
                      />
                    ))}
                  </div>
                  <span className="item-detail-rating-value">{averageRating.toFixed(1)}</span>
                  <span className="item-detail-review-count">({reviews.length} reviews)</span>
                </>
              ) : (
                <span className="item-detail-no-reviews">No reviews yet</span>
              )}
            </div>
            
            <div className="item-detail-price-container">
              {item.listingType === 'Fixed' ? (
                <>
                  <span className="item-detail-current-price">{formatPrice(item.price)}</span>
                  {item.originalPrice && item.originalPrice > item.price && (
                    <>
                      <span className="item-detail-original-price">
                        {formatPrice(item.originalPrice)}
                      </span>
                      {discount && (
                        <span className="item-detail-discount-label">
                          {discount}% OFF
                        </span>
                      )}
                    </>
                  )}
                </>
              ) : (
                <div className="item-detail-auction-info">
                  <span className="item-detail-current-price">Starting bid: {formatPrice(item.startingBid)}</span>
                  <div className="item-detail-auction-time">
                    <Clock size={16} />
                    <span>Ends in: {item.auctionEndTime ? new Date(item.auctionEndTime).toLocaleString() : 'Not specified'}</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="item-detail-availability">
              <span className={`item-detail-stock ${item.quantity > 0 ? 'in-stock' : 'out-of-stock'}`}>
                {item.quantity > 0 ? `In Stock (${item.quantity} available)` : 'Out of Stock'}
              </span>
            </div>
            
            <div className="item-detail-shipping">
              <Truck size={16} />
              <span>
                {item.shippingDetails.cost === 0 
                  ? 'Free Shipping' 
                  : `Shipping: ${formatPrice(item.shippingDetails.cost)}`}
                {item.shippingDetails.estimatedDelivery && (
                  <span className="item-detail-delivery-estimate">
                    Estimated delivery: {item.shippingDetails.estimatedDelivery}
                  </span>
                )}
              </span>
            </div>
            
            <div className="item-detail-description">
              <h3>Description</h3>
              <p>{item.description || 'No description available.'}</p>
            </div>
            
            {item.specifications && Object.keys(item.specifications).length > 0 && (
              <div className="item-detail-specifications">
                <h3>Specifications</h3>
                <table>
                  <tbody>
                    {Object.entries(item.specifications).map(([key, value]) => (
                      <tr key={key}>
                        <td>{key}</td>
                        <td>{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {item.quantity > 0 && (
              <div className="item-detail-actions">
                <div className="item-detail-quantity">
                  <button 
                    className="item-detail-quantity-btn"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                  >
                    <Minus size={16} />
                  </button>
                  <span>{quantity}</span>
                  <button 
                    className="item-detail-quantity-btn"
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= item.quantity}
                  >
                    <Plus size={16} />
                  </button>
                </div>
                
                <div className="item-detail-buttons">
                  <button 
                    className="item-detail-wishlist-btn"
                    onClick={toggleWishlist}
                  >
                    <Heart size={20} fill={isWishlisted ? "#ff4d4d" : "none"} color={isWishlisted ? "#ff4d4d" : "#666"} />
                    <span>{isWishlisted ? 'Saved' : 'Save'}</span>
                  </button>
                  
                  <button 
                    className="item-detail-cart-btn"
                    onClick={handleAddToCart}
                  >
                    <ShoppingCart size={20} />
                    <span>Add to Cart</span>
                  </button>
                  
                  <button 
                    className="item-detail-buy-btn"
                    onClick={handleBuyNow}
                  >
                    <CreditCard size={20} />
                    <span>Buy Now</span>
                  </button>
                </div>
              </div>
            )}
            
            <div className="item-detail-share">
              <Share2 size={16} />
              <span>Share this product</span>
              <div className="item-detail-share-icons">
                {/* Replace with actual social sharing icons/functionality */}
                <button className="share-btn facebook">FB</button>
                <button className="share-btn twitter">TW</button>
                <button className="share-btn whatsapp">WA</button>
                <button className="share-btn email">@</button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Review Section */}
        <div className="item-detail-reviews-section">
          <h2>Ratings & Reviews</h2>
          
          {/* Add Review Form */}
          <div className="item-detail-add-review">
            <h3>Write a Review</h3>
            <div className="item-detail-rating-input">
              <p>Your Rating: </p>
              <div className="item-detail-stars-input">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star}
                    size={24}
                    fill={(hoveredRating || userReview.rating) >= star ? '#FFD700' : 'none'}
                    color={(hoveredRating || userReview.rating) >= star ? '#FFD700' : '#ccc'}
                    onMouseEnter={() => handleRatingHover(star)}
                    onMouseLeave={() => handleRatingHover(0)}
                    onClick={() => handleRatingClick(star)}
                    style={{ cursor: 'pointer' }}
                  />
                ))}
              </div>
            </div>
            
            <div className="item-detail-review-comment">
              <textarea 
                placeholder="Share your experience with this product (optional)"
                value={userReview.comment}
                onChange={handleCommentChange}
              />
            </div>
            
            <button 
              className="item-detail-submit-review" 
              onClick={handleSubmitReview}
              disabled={isSubmittingReview || userReview.rating === 0}
            >
              {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
          
          {/* Review List */}
          <div className="item-detail-reviews-list">
            <h3>Customer Reviews ({reviews.length})</h3>
            
            {reviews.length === 0 ? (
              <div className="item-detail-no-reviews-yet">
                <p>Be the first to review this product!</p>
              </div>
            ) : (
              reviews.map((review, index) => (
                <div key={index} className="item-detail-review-item">
                  <div className="item-detail-review-header">
                    <div className="item-detail-review-stars">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star}
                          size={16}
                          fill={star <= review.rating ? '#FFD700' : 'none'}
                          color={star <= review.rating ? '#FFD700' : '#ccc'}
                        />
                      ))}
                    </div>
                    <div className="item-detail-review-author">
                      <span>{review.user}</span>
                      <span className="item-detail-review-date">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  {review.comment && (
                    <div className="item-detail-review-content">
                      <p>{review.comment}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Checkout Modal */}
        {showCheckout && (
          <CheckoutPage
            item={{...item, selectedQuantity: quantity}}
            onClose={handleCheckoutClose}
            onSubmit={handleOrderSubmit}
          />
        )}
        
        {/* Toast notifications container */}
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
      <Footer />
    </>
  );
};

export default ItemDetail;