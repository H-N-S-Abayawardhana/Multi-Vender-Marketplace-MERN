import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingCart, Heart, Search, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import UserItemList from '../components/UserItemList';
import '../../src/css/Home.css';

// Import banner images
import banner3 from '../assets/images/sale-1.jpg';
import banner2 from '../assets/images/electronics.jpg';
import banner1 from '../assets/images/fashion.jpg';

// Import promo images
import freeShippingImg from '../assets/images/free-shipping.jpg';
import guaranteeImg from '../assets/images/guarantee.jpg';
import supportImg from '../assets/images/support.jpg';

// Import placeholder
import placeholderIcon from '../assets/images/placeholder-icon.png';

const Home = () => {
  const [featuredItems, setFeaturedItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [trendingItems, setTrendingItems] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);

  
  const banners = [
    {
      id: 1,
      image: banner1,
      title: 'Summer Sale',
      description: 'Up to 70% off on summer collection'
    },
    {
      id: 2,
      image: banner2,
      title: 'Tech Week',
      description: 'Latest gadgets and electronics'
    },
    {
      id: 3,
      image: banner3,
      title: 'Fashion Deal',
      description: 'Designer brands at amazing prices'
    }
  ];

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [itemsResponse, categoriesResponse] = await Promise.all([
          axios.get('http://localhost:9000/api/items/featured'),
          axios.get('http://localhost:9000/api/categories')
        ]);

        setFeaturedItems(itemsResponse.data);
        setCategories(categoriesResponse.data);

        // Mock data for trending and new arrivals
        setTrendingItems(itemsResponse.data.slice(0, 4));
        setNewArrivals(itemsResponse.data.slice(4, 8));
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching home data:', error);
        setLoading(false);
      }
    };

    fetchHomeData();

    // Auto-slide banner
    const slideInterval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(slideInterval);
  }, []);

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + banners.length) % banners.length);
  };

  const handleQuickView = (item) => {
    console.log('Quick view:', item);
  };

  const handleAddToWishlist = (item) => {
    console.log('Add to wishlist:', item);
  };

  // Helper function to get category icon based on category name
  const getCategoryIcon = (categoryName) => {
    try {
      return require(`../assets/images/categories/${categoryName.toLowerCase()}.png`);
    } catch (error) {
      return placeholderIcon;
    }
  };

  if (loading) {
    return <div className="home-loading">Loading amazing deals for you...</div>;
  }

  return (
    <div className="home-container">
      {/* Hero Banner Section */}
      <section className="hero-banner">
        <div className="banner-container">
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className={`banner-slide ${index === currentSlide ? 'active' : ''}`}
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              <img src={banner.image} alt={banner.title} />
              <div className="banner-content">
                <h2>{banner.title}</h2>
                <p>{banner.description}</p>
                <button className="shop-now-btn">Shop Now</button>
              </div>
            </div>
          ))}
        </div>
        <button className="banner-nav prev" onClick={prevSlide}>
          <ChevronLeft />
        </button>
        <button className="banner-nav next" onClick={nextSlide}>
          <ChevronRight />
        </button>
        <div className="banner-dots">
          {banners.map((_, index) => (
            <span
              key={index}
              className={`dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories-section">
        <h2>Shop by Category</h2>
        <div className="categories-grid">
          {categories.map(category => (
            <div key={category._id} className="category-card">
              <div className="category-icon">
                <img 
                  src={getCategoryIcon(category.name)} 
                  alt={category.name} 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = placeholderIcon;
                  }}
                />
              </div>
              <h3>{category.name}</h3>
              <span className="item-count">{category.itemCount} items</span>
            </div>
          ))}
        </div>
      </section>

      {/* Trending Items Section */}
      <section className="trending-section">
        <h2>Trending Now</h2>
        <div className="trending-grid">
          {trendingItems.map(item => (
            <div key={item._id} className="trending-card">
              <div className="trending-image">
                <img 
                  src={item.images[0]}
                  alt={item.title}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = placeholderIcon;
                  }}
                />
                <div className="trending-overlay">
                  <button onClick={() => handleQuickView(item)}>Quick View</button>
                  <button onClick={() => handleAddToWishlist(item)}>
                    <Heart size={20} />
                  </button>
                </div>
              </div>
              <div className="trending-content">
                <h3>{item.title}</h3>
                <div className="trending-price">
                  <span className="current-price">${item.price.toFixed(2)}</span>
                  {item.originalPrice && (
                    <span className="original-price">${item.originalPrice.toFixed(2)}</span>
                  )}
                </div>
                <div className="trending-rating">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={i < (item.rating || 0) ? 'filled' : ''}
                    />
                  ))}
                  <span>({item.reviewCount || 0})</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="new-arrivals-section">
        <h2>New Arrivals</h2>
        <div className="new-arrivals-grid">
          {newArrivals.map(item => (
            <div key={item._id} className="arrival-card">
              <div className="arrival-image">
                <img 
                  src={item.images[0]}
                  alt={item.title}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = placeholderIcon;
                  }}
                />
                <span className="new-tag">New</span>
              </div>
              <div className="arrival-content">
                <h3>{item.title}</h3>
                <p className="arrival-price">${item.price.toFixed(2)}</p>
                <button className="add-to-cart-btn">
                  <ShoppingCart size={16} />
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Items */}
      <section className="featured-section">
        <h2>Featured Items</h2>
        <UserItemList items={featuredItems} />
      </section>

      {/* Promotional Banners */}
      <section className="promo-section">
        <div className="promo-grid">
          <div className="promo-card">
            <img src={freeShippingImg} alt="Free Shipping" />
            <div className="promo-content">
              <h3>Free Shipping</h3>
              <p>On orders over $50</p>
            </div>
          </div>
          <div className="promo-card">
            <img src={guaranteeImg} alt="Money Back Guarantee" />
            <div className="promo-content">
              <h3>100% Money Back</h3>
              <p>30 day guarantee</p>
            </div>
          </div>
          <div className="promo-card">
            <img src={supportImg} alt="24/7 Support" />
            <div className="promo-content">
              <h3>24/7 Support</h3>
              <p>Dedicated support</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;