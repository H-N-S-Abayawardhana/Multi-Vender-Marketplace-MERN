import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowRight, 
  Sparkles, 
  Star, 
  ChevronLeft, 
  ChevronRight, 
  TrendingUp, 
  Package, 
  ShoppingCart, 
  CreditCard, 
  Minus, 
  Plus, 
  Heart, 
  Truck,
  X,
  User,
  Lock
} from 'lucide-react';
import '../css/Home.css';
import summerSaleBanner from '../assets/images/summer-sale-banner.jpg';
import newarrivals from '../assets/images/new-arrivals-banner.jpg';
import freeShipping from '../assets/images/free-shipping-banner.jpg';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import CheckoutPage from '../Pages/CheckoutPage';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const banners = [
  {
    title: "Summer Sale",
    description: "Up to 50% off on selected items",
    image: summerSaleBanner,
    buttonText: "Shop Now",
    link: "/sale"
  },
  {
    title: "New Arrivals",
    description: "Check out our latest collection",
    image: newarrivals,
    buttonText: "Explore",
    link: "/new-arrivals"
  },
  {
    title: "Free Shipping",
    description: "On orders over LKR 20,000",
    image: freeShipping,
    buttonText: "Learn More",
    link: "/shipping"
  }
];

const featuredCategories = [
  { name: 'Electronics', icon: '🔌', color: '#3b82f6' },
  { name: 'Clothing', icon: '👕', color: '#ec4899' },
  { name: 'Home', icon: '🏠', color: '#10b981' },
  { name: 'Books', icon: '📚', color: '#f59e0b' },
  { name: 'Sports', icon: '⚽', color: '#6366f1' },
  { name: 'Beauty', icon: '💄', color: '#d946ef' },
  { name: 'Automotive', icon: '🚗', color: '#ef4444' },
  { name: 'Garden', icon: '🌱', color: '#22c55e' },
  { name: 'Jewelry', icon: '💍', color: '#f97316' }
];

// Sign-in component
const SignInPopup = ({ onClose, onSignInSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await axios.post('http://localhost:9000/api/users/login', {
        email,
        password
      });

      // Store token and email in localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('email', email);
      
      // Call the success callback
      onSignInSuccess();
      
      toast.success('Signed in successfully!');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

};



const Home = () => {
  const navigate = useNavigate();
  const [featuredItems, setFeaturedItems] = useState([]);
  const [trendingItems, setTrendingItems] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [categoryItems, setCategoryItems] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [itemQuantities, setItemQuantities] = useState({});
  const [selectedItem, setSelectedItem] = useState(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const [showSignIn, setShowSignIn] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const email = localStorage.getItem('email');
    setIsLoggedIn(!!email);
  
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        
        // Create array of API calls
        const apiCalls = [
          axios.get('http://localhost:9000/api/items/featured'),
          axios.get('http://localhost:9000/api/items/trending'),
          axios.get('http://localhost:9000/api/items/new-arrivals'),
          axios.get('http://localhost:9000/api/items/by-categories', {
            params: {
              categories: ['Computers', 'Clothing', 'Beauty'],
              limit: 4
            }
          })
        ];
        
        // Add wishlist API call if user is logged in
        if (email) {
          apiCalls.push(
            axios.get('http://localhost:9000/api/wishlist', {
              params: { email }
            })
          );
        }
  
        const responses = await Promise.all(apiCalls);
        
        const featuredResponse = responses[0];
        const trendingResponse = responses[1];
        const newArrivalsResponse = responses[2];
        const categoryResponse = responses[3];
        
        const featured = featuredResponse.data;
        const trending = trendingResponse.data;
        const newArrivalsData = newArrivalsResponse.data;
        const categoryData = categoryResponse.data;
        
        // Extract wishlist item IDs if available
        let wishlistData = [];
        if (email && responses.length > 4) {
          const wishlistResponse = responses[4];
          wishlistData = wishlistResponse.data.map(item => item.itemId);
        }
  
        // Initialize quantities for all items
        const initialQuantities = {};
        [...featured, ...trending, ...newArrivalsData].forEach(item => {
          initialQuantities[item._id] = 1;
        });
        
        // Add quantities for category items
        Object.values(categoryData).flat().forEach(item => {
          initialQuantities[item._id] = 1;
        });
  
        setFeaturedItems(featured);
        setTrendingItems(trending);
        setNewArrivals(newArrivalsData);
        setCategoryItems(categoryData);
        setItemQuantities(initialQuantities);
        setWishlist(wishlistData);
        
        // Simulate network delay for smoother transitions
        setTimeout(() => {
          setLoading(false);
        }, 800);
      } catch (err) {
        console.error('Error fetching home data:', err);
        setError('Failed to load home page data. Please try again later.');
        setLoading(false);
      }
    };
  
    fetchHomeData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);


  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  // Quantity adjustment handlers
  const increaseQuantity = (itemId, maxQuantity, event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    if (itemQuantities[itemId] < maxQuantity) {
      setItemQuantities(prev => ({
        ...prev,
        [itemId]: prev[itemId] + 1
      }));
    } else {
      toast.warning(`Only ${maxQuantity} items available in stock.`);
    }
  };

  const decreaseQuantity = (itemId, event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    if (itemQuantities[itemId] > 1) {
      setItemQuantities(prev => ({
        ...prev,
        [itemId]: prev[itemId] - 1
      }));
    }
  };

  const handleAddToCart = (item, event) => {
    // Prevent the click from navigating to item detail page
    event.preventDefault();
    event.stopPropagation();
    
    const quantity = itemQuantities[item._id] || 1;
    
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

  const handleBuyNow = (item, event) => {
    // Prevent the click from navigating to item detail page
    event.preventDefault();
    event.stopPropagation();
    
    // Get the user's registered email from localStorage if available
    const userEmail = localStorage.getItem('email') || null;
    
    const quantity = itemQuantities[item._id] || 1;
    const itemWithQuantity = {
      ...item,
      selectedQuantity: quantity,
      // Calculate total price based on selected quantity
      totalPrice: item.price * quantity,
      // Include user's registered email if available
      userEmail: userEmail
    };
    setSelectedItem(itemWithQuantity);
    setShowCheckout(true);
  };

  const toggleWishlist = async (itemId, event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    // Check if user is logged in
    const userEmail = localStorage.getItem('email');
    
    if (!userEmail) {
      toast.error('Please sign in to use wishlist feature');
      setShowSignIn(true);
      return;
    }
    
    try {
      const isItemWishlisted = wishlist.includes(itemId);
      
      if (isItemWishlisted) {
        // Remove from wishlist
        await axios.delete(`http://localhost:9000/api/wishlist/${itemId}?email=${encodeURIComponent(userEmail)}`);
        
        setWishlist(prev => prev.filter(id => id !== itemId));
        toast.info('Removed from wishlist');
      } else {
        // Add to wishlist
        await axios.post('http://localhost:9000/api/wishlist', {
          itemId,
          email: userEmail
        });
        
        setWishlist(prev => [...prev, itemId]);
        toast.success('Added to wishlist');
      }
    } catch (error) {
      console.error('Wishlist operation failed:', error);
      toast.error('Failed to update wishlist. Please try again.');
    }
  };

  const handleCheckoutClose = () => {
    setShowCheckout(false);
    setSelectedItem(null);
  };

  const handleSignInClose = () => {
    setShowSignIn(false);
    setSelectedItem(null);
  };

  const handleOrderSubmit = async (orderData) => {
    try {
      setLoading(true);
      const orderedQuantity = selectedItem.selectedQuantity || 1;
      
      // Close checkout and clear selection
      setShowCheckout(false);
      setSelectedItem(null);

      // Show success message
      toast.success(`Order placed successfully! You ordered ${orderedQuantity} item(s).`);
    } catch (error) {
      console.error('Error submitting order:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateDiscount = (originalPrice, price) => {
    if (!originalPrice || originalPrice <= price) return null;
    const discount = Math.round(((originalPrice - price) / originalPrice) * 100);
    return discount > 0 ? discount : null;
  };

  // Format price to display in LKR
  const formatPrice = (price) => {
    return `LKR ${price.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="homepage-loading">
        <div className="homepage-loading-spinner"></div>
        <p>Discovering amazing products just for you...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="homepage-error">
        <div className="homepage-error-icon">⚠️</div>
        <p>{error}</p>
        <button className="homepage-retry-btn" onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  const renderItemCard = (item) => {
    const discount = calculateDiscount(item.originalPrice, item.price);
    const isWishlisted = wishlist.includes(item._id);
    
    return (
      <div key={item._id} className="homepage-item-card">
        <Link to={`/item/${item._id}`} className="homepage-item-link">
          <div className="homepage-item-image">
            {item.images && item.images[0] ? (
              <img src={`http://localhost:9000${item.images[0]}`} alt={item.title} />
            ) : (
              <div className="homepage-no-image">No Image Available</div>
            )}
            
            {/* Badge container */}
            <div className="homepage-badges">
              {item.listingType === 'Auction' && (
                <div className="homepage-badge auction">Auction</div>
              )}
              {item.condition !== 'New' && (
                <div className="homepage-badge condition">{item.condition}</div>
              )}
              {discount && (
                <div className="homepage-badge discount">-{discount}%</div>
              )}
            </div>
            
            {/* Stock indicator */}
            {item.quantity < 5 && item.quantity > 0 && (
              <span className="homepage-low-stock">
                Only {item.quantity} left
              </span>
            )}
            {item.quantity === 0 && (
              <span className="homepage-out-of-stock">
                Out of Stock
              </span>
            )}
            
            {/* Wishlist button */}
            <button 
              className={`homepage-wishlist-btn ${isWishlisted ? 'active' : ''}`}
              onClick={(e) => toggleWishlist(item._id, e)}
              aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart size={20} fill={isWishlisted ? "#ff4d4d" : "none"} color={isWishlisted ? "#ff4d4d" : "#666"} />
            </button>
          </div>
          
          <div className="homepage-item-details">
            <h3 className="homepage-item-title">{item.title}</h3>
            
            <div className="homepage-item-price">
              {item.listingType === 'Fixed' ? (
                <>
                  <span className="homepage-current-price">{formatPrice(item.price)}</span>
                  {item.originalPrice && item.originalPrice > item.price && (
                    <span className="homepage-original-price">
                      {formatPrice(item.originalPrice)}
                    </span>
                  )}
                </>
              ) : (
                <span className="homepage-current-price">Starting bid: {formatPrice(item.startingBid)}</span>
              )}
            </div>
            
            {item.rating && (
              <div className="homepage-item-rating">
                <Star className="homepage-star-icon" size={16} fill="#FFD700" color="#FFD700" />
                <span>{item.rating.toFixed(1)} <span className="homepage-review-count">({item.reviews || 0})</span></span>
              </div>
            )}
            
            <p className="homepage-item-description">
              {item.description ? (
                <>
                  {item.description.slice(0, 60)}
                  {item.description.length > 60 ? '...' : ''}
                </>
              ) : (
                'No description available'
              )}
            </p>
            
            <div className="homepage-shipping-info">
              <Truck size={14} />
              <span>
                {item.shippingDetails.cost === 0 
                  ? 'Free Shipping' 
                  : `Shipping: ${formatPrice(item.shippingDetails.cost)}`}
              </span>
            </div>
          </div>
        </Link>
        
        {/* Add quantity control and action buttons */}
        <div className="homepage-item-actions">
          {item.quantity > 0 ? (
            <>
              <div className="homepage-quantity-control">
                <button 
                  className="homepage-quantity-btn decrease"
                  onClick={(e) => decreaseQuantity(item._id, e)}
                  disabled={itemQuantities[item._id] <= 1}
                  aria-label="Decrease quantity"
                >
                  <Minus size={16} />
                </button>
                <span className="homepage-quantity-value">{itemQuantities[item._id] || 1}</span>
                <button 
                  className="homepage-quantity-btn increase"
                  onClick={(e) => increaseQuantity(item._id, item.quantity, e)}
                  disabled={itemQuantities[item._id] >= item.quantity}
                  aria-label="Increase quantity"
                >
                  <Plus size={16} />
                </button>
                <span className="homepage-max-quantity">
                  of {item.quantity}
                </span>
              </div>
              
              <div className="homepage-item-buttons">
                <button 
                  className="homepage-cart-btn"
                  onClick={(e) => handleAddToCart(item, e)}
                  aria-label="Add to cart"
                >
                  <ShoppingCart size={16} />
                  <span>Add to Cart</span>
                </button>
                <button 
                  className="homepage-buy-btn"
                  onClick={(e) => handleBuyNow(item, e)}
                  aria-label="Buy now"
                >
                  <CreditCard size={16} />
                  <span>Buy Now</span>
                </button>
              </div>
            </>
          ) : (
            <div className="homepage-out-of-stock-message">
              Out of Stock
            </div>
          )}
        </div>
      </div>
    );
  };

  // Section component for reusability
  const ProductSection = ({ title, icon, items, viewAllLink, sectionClass }) => (
    <section className={`homepage-section ${sectionClass || ''}`}>
      <div className="homepage-section-header">
        <h2>
          {icon && React.cloneElement(icon, { className: "homepage-section-icon" })}
          {title}
        </h2>
        <Link to={viewAllLink} className="homepage-view-all">
          View All <ArrowRight size={16} />
        </Link>
      </div>
      <div className="homepage-items-grid">
        {items.map(renderItemCard)}
      </div>
    </section>
  );

  return (
    <>
      <NavBar />
      <div className="homepage-container">
        {/* Hero Carousel */}
        <section className="homepage-hero">
          <div className="homepage-carousel">
            <button 
              className="homepage-carousel-btn homepage-carousel-btn-left" 
              onClick={prevSlide}
              aria-label="Previous slide"
            >
              <ChevronLeft size={24} />
            </button>
            
            <div className="homepage-carousel-slides">
              {banners.map((banner, index) => (
                <div
                  key={index}
                  className={`homepage-carousel-slide ${
                    index === currentSlide ? 'active' : ''
                  }`}
                  style={{ transform: `translateX(${(index - currentSlide) * 100}%)` }}
                  aria-hidden={index !== currentSlide}
                >
                  <div className="homepage-carousel-image-container">
                    <img 
                      src={banner.image} 
                      alt={banner.title} 
                      className="homepage-banner-image"
                    />
                  </div>
                  <div className="homepage-carousel-content">
                    <h2>{banner.title}</h2>
                    <p>{banner.description}</p>
                    <Link to={banner.link} className="homepage-carousel-button">
                      {banner.buttonText} <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            
            <button 
              className="homepage-carousel-btn homepage-carousel-btn-right" 
              onClick={nextSlide}
              aria-label="Next slide"
            >
              <ChevronRight size={24} />
            </button>
            
            <div className="homepage-carousel-indicators">
              {banners.map((_, index) => (
                <button
                  key={index}
                  className={`homepage-carousel-indicator ${index === currentSlide ? 'active' : ''}`}
                  onClick={() => setCurrentSlide(index)}
                  aria-label={`Go to slide ${index + 1}`}
                  aria-current={index === currentSlide}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Featured Categories */}
        <section className="homepage-categories-section">
          <div className="homepage-section-header">
            <h2>Shop by Category</h2>
            <Link to="/categories" className="homepage-view-all">
              View All Categories <ArrowRight size={16} />
            </Link>
          </div>
          <div className="homepage-categories-grid">
            {featuredCategories.map((category) => (
              <Link
                to={`/category/${category.name.toLowerCase()}`}
                key={category.name}
                className="homepage-category-card"
                style={{
                  "--category-color": category.color
                }}
              >
                <span className="homepage-category-icon">{category.icon}</span>
                <h3>{category.name}</h3>
              </Link>
            ))}
          </div>
        </section>

        {/* Trending Now Section */}
        <ProductSection 
          title="Trending Now" 
          icon={<TrendingUp />} 
          items={trendingItems} 
          viewAllLink="/trending"
          sectionClass="homepage-trending" 
        />

        {/* New Arrivals Section */}
        <ProductSection 
          title="Just Arrived" 
          icon={<Sparkles />} 
          items={newArrivals} 
          viewAllLink="/new-arrivals"
          sectionClass="homepage-new-arrivals" 
        />

        {/* Category Sections */}
        {Object.entries(categoryItems).map(([category, items]) => (
          <ProductSection 
            key={category}
            title={category} 
            icon={<Package />} 
            items={items} 
            viewAllLink={`/category/${category.toLowerCase()}`}
            sectionClass={`homepage-category-${category.toLowerCase()}`} 
          />
        ))}

        {/* Checkout component */}
        {showCheckout && selectedItem && (
          <CheckoutPage
            item={selectedItem}
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

export default Home;