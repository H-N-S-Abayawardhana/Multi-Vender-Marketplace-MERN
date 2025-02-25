import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowRight, Sparkles, Star, ChevronLeft, ChevronRight, TrendingUp, Package, ShoppingCart, CreditCard, Minus, Plus } from 'lucide-react';
import '../../src/css/Home.css';
import summerSaleBanner from '../assets/images/summer-sale-banner.jpg';
import newarrivals from '../assets/images/new-arrivals-banner.jpg';
import freeShipping from '../assets/images/free-shipping-banner.jpg';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import CheckoutPage from '../Pages/CheckoutPage';

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
    description: "On orders over $100",
    image: freeShipping,
    buttonText: "Learn More",
    link: "/shipping"
  }
];

const Home = () => {
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

  const featuredCategories = [
    { name: 'Electronics', icon: '🔌' },
    { name: 'Clothing', icon: '👕' },
    { name: 'Home', icon: '🏠' },
    { name: 'Books', icon: '📚' },
    { name: 'Sports', icon: '⚽' },
    { name: 'Beauty', icon: '💄' },
    { name: 'Automotive', icon: '🚗' },
    { name: 'Garden', icon: '🌱' }
  ];

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const [
          featuredResponse,
          trendingResponse,
          newArrivalsResponse,
          categoryResponse
        ] = await Promise.all([
          axios.get('http://localhost:9000/api/items/featured'),
          axios.get('http://localhost:9000/api/items/trending'),
          axios.get('http://localhost:9000/api/items/new-arrivals'),
          axios.get('http://localhost:9000/api/items/by-categories', {
            params: {
              categories: ['Electronics', 'Clothing', 'Home', 'Beauty', 'Sports'],
              limit: 4
            }
          })
        ]);

        const featured = featuredResponse.data;
        const trending = trendingResponse.data;
        const newArrivalsData = newArrivalsResponse.data;
        const categoryData = categoryResponse.data;

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
        setLoading(false);
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
  const increaseQuantity = (itemId, maxQuantity) => {
    if (itemQuantities[itemId] < maxQuantity) {
      setItemQuantities(prev => ({
        ...prev,
        [itemId]: prev[itemId] + 1
      }));
    } else {
      alert(`Sorry, only ${maxQuantity} items are available in stock.`);
    }
  };

  const decreaseQuantity = (itemId) => {
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
    
    // TODO: Implement cart functionality with selected quantity
    const quantity = itemQuantities[item._id] || 1;
    console.log('Added to cart:', item, 'Quantity:', quantity);
  };

  const handleBuyNow = (item, event) => {
    // Prevent the click from navigating to item detail page
    event.preventDefault();
    event.stopPropagation();
    
    // Set the selected item with its current selected quantity
    const quantity = itemQuantities[item._id] || 1;
    const itemWithQuantity = {
      ...item,
      selectedQuantity: quantity,
      // Calculate total price based on selected quantity
      totalPrice: item.price * quantity
    };
    setSelectedItem(itemWithQuantity);
    setShowCheckout(true);
  };

  const handleCheckoutClose = () => {
    setShowCheckout(false);
    setSelectedItem(null);
  };

  const handleOrderSubmit = async (orderData) => {
    try {
      // Show loading state or disable buttons if needed
      setLoading(true);

      const orderedQuantity = selectedItem.selectedQuantity || 1;

      // Update item quantity in the UI
      // This is a simplified approach - in a real app you'd want to update this
      // across all lists that might contain this item
      
      // Close checkout and clear selection
      setShowCheckout(false);
      setSelectedItem(null);

      // Show success message
      alert(`Order placed successfully! You ordered ${orderedQuantity} item(s).`);
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="homepage-loading">
        <div className="homepage-loading-spinner"></div>
        <p>Loading amazing products for you...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="homepage-error">
        <p>{error}</p>
        <button className="homepage-retry-btn" onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  const renderItemCard = (item) => (
    <div key={item._id} className="homepage-item-card">
      <Link to={`/item/${item._id}`} className="homepage-item-link">
        <div className="homepage-item-image">
          {item.images && item.images[0] ? (
            <img src={`http://localhost:9000${item.images[0]}`} alt={item.title} />
            
          ) : (
            <div className="homepage-no-image">No Image</div>
          )}
          {item.listingType === 'Auction' && (
            <div className="homepage-badge auction">Auction</div>
          )}
          {item.condition !== 'New' && (
            <div className="homepage-badge condition">{item.condition}</div>
          )}
          {item.quantity < 5 && item.quantity > 0 && (
            <span className="homepage-low-stock">
              {item.quantity} left
            </span>
          )}
          {item.quantity === 0 && (
            <span className="homepage-out-of-stock">
              Out of Stock
            </span>
          )}
        </div>
        <div className="homepage-item-details">
          <h3>{item.title}</h3>
          {/* <div className="homepage-item-category">{item.category}</div> */}
          <div className="homepage-item-price">
            {item.listingType === 'Fixed' ? (
              <>
                <span className="homepage-current-price">${item.price.toFixed(2)}</span>
                {item.originalPrice && item.originalPrice > item.price && (
                  <span className="homepage-original-price">
                    ${item.originalPrice.toFixed(2)}
                  </span>
                )}
              </>
            ) : (
              <span className="homepage-current-price">Starting bid: ${item.startingBid.toFixed(2)}</span>
            )}
          </div>
          {item.rating && (
            <div className="homepage-item-rating">
              <Star className="homepage-star-icon" size={16} />
              <span>{item.rating.toFixed(1)} ({item.reviews || 0} reviews)</span>
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
          <p className="homepage-item-shippingcost">

             Shipping cost: ${item.shippingDetails.cost}

          </p>
        </div>
      </Link>
      
      {/* Add quantity control and action buttons (outside the Link) */}
      <div className="homepage-item-actions">
        {item.quantity > 0 ? (
          <>
            <div className="homepage-quantity-control">
              <span>Quantity:</span>
              <div className="quantity-adjust">
                <button 
                  className="quantity-btn"
                  onClick={() => decreaseQuantity(item._id)}
                  disabled={itemQuantities[item._id] <= 1}
                >
                  <Minus size={14} />
                </button>
                <span className="quantity-value">{itemQuantities[item._id] || 1}</span>
                <button 
                  className="quantity-btn"
                  onClick={() => increaseQuantity(item._id, item.quantity)}
                  disabled={itemQuantities[item._id] >= item.quantity}
                >
                  <Plus size={14} />
                </button>
              </div>
              <span className="available-stock">
                (Max: {item.quantity})
              </span>
            </div>
            
            <div className="homepage-item-buttons">
              <button 
                className="homepage-cart-btn"
                onClick={(e) => handleAddToCart(item, e)}
              >
                <ShoppingCart size={16} />
                <span>Add</span>
              </button>
              <button 
                className="homepage-buy-btn"
                onClick={(e) => handleBuyNow(item, e)}
              >
                <CreditCard size={16} />
                <span>Buy</span>
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

  return (
    <>
    <NavBar/>
    <div className="homepage-container">
      {/* Hero Carousel */}
      <section className="homepage-hero">
        <div className="homepage-carousel">
          <button className="homepage-carousel-btn homepage-carousel-btn-left" onClick={prevSlide}>
            <ChevronLeft size={20} />
          </button>
          <div className="homepage-carousel-slides">
            {banners.map((banner, index) => (
              <div
                key={index}
                className={`homepage-carousel-slide ${
                  index === currentSlide ? 'active' : ''
                }`}
                style={{ transform: `translateX(${(index - currentSlide) * 100}%)` }}
              >
                <img 
                  src={banner.image} 
                  alt={banner.title} 
                  className="homepage-banner-image"
                />
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
          <button className="homepage-carousel-btn homepage-carousel-btn-right" onClick={nextSlide}>
            <ChevronRight size={20} />
          </button>
          <div className="homepage-carousel-indicators">
            {banners.map((_, index) => (
              <button
                key={index}
                className={`homepage-carousel-indicator ${index === currentSlide ? 'active' : ''}`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="homepage-categories">
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
            >
              <span className="homepage-category-icon">{category.icon}</span>
              <h3>{category.name}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Trending Now */}
      <section className="homepage-trending">
        <div className="homepage-section-header">
          <h2>
            <TrendingUp className="homepage-section-icon" />
            Trending Now
          </h2>
          <Link to="/trending" className="homepage-view-all">
            View All <ArrowRight size={16} />
          </Link>
        </div>
        <div className="homepage-items-grid">
          {trendingItems.map(renderItemCard)}
        </div>
      </section>

      {/* New Arrivals */}
      <section className="homepage-new-arrivals">
        <div className="homepage-section-header">
          <h2>
            <Sparkles className="homepage-section-icon" />
            Just Arrived
          </h2>
          <Link to="/new-arrivals" className="homepage-view-all">
            View All <ArrowRight size={16} />
          </Link>
        </div>
        <div className="homepage-items-grid">
          {newArrivals.map(renderItemCard)}
        </div>
      </section>

      {/* Category Sections */}
      {Object.entries(categoryItems).map(([category, items]) => (
        <section key={category} className="homepage-category-section">
          <div className="homepage-section-header">
            <h2>
              <Package className="homepage-section-icon" />
              {category}
            </h2>
            <Link
              to={`/category/${category.toLowerCase()}`}
              className="homepage-view-all"
            >
              View All <ArrowRight size={16} />
            </Link>
          </div>
          <div className="homepage-items-grid">
            {items.map(renderItemCard)}
          </div>
        </section>
      ))}

      {/* Checkout component */}
      {showCheckout && selectedItem && (
        <CheckoutPage
          item={selectedItem}
          onClose={handleCheckoutClose}
          onSubmit={handleOrderSubmit}
        />
      )}
    </div>
    <Footer/>
    </>
  );
};

export default Home;