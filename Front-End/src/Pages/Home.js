// Home.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingCart, Heart, Search, Star, ChevronLeft, ChevronRight, Truck, Shield, Headphones } from 'lucide-react';
import UserItemList from '../components/UserItemList';
import '../../src/css/Home.css';

const Home = () => {
  const [featuredItems, setFeaturedItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [trendingItems, setTrendingItems] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [flashDeals, setFlashDeals] = useState([]);

  const banners = [
    {
      id: 1,
      image: '/assets/images/banners/fashion-banner.jpg', // 1920x600px
      title: 'Summer Collection 2025',
      subtitle: 'Fashion Week Special',
      description: 'Up to 70% off on designer brands'
    },
    {
      id: 2,
      image: '/assets/images/banners/tech-banner.jpg', // 1920x600px
      title: 'Tech Bonanza',
      subtitle: 'Latest Gadgets',
      description: 'Free shipping on orders above $999'
    },
    {
      id: 3,
      image: '/assets/images/banners/home-banner.jpg', // 1920x600px
      title: 'Home & Living',
      subtitle: 'Interior Special',
      description: 'Get 30% off on home decor'
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
        setTrendingItems(itemsResponse.data.slice(0, 8));
        setNewArrivals(itemsResponse.data.slice(8, 16));
        setFlashDeals(itemsResponse.data.slice(16, 20));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching home data:', error);
        setLoading(false);
      }
    };

    fetchHomeData();

    const slideInterval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(slideInterval);
  }, []);

  if (loading) {
    return (
      <div className="home-loading">
        <div className="home-loading-spinner"></div>
        <p>Discovering amazing deals for you...</p>
      </div>
    );
  }

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="home-hero">
        <div className="home-banner-container">
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className={`home-banner-slide ${index === currentSlide ? 'active' : ''}`}
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              <img src={banner.image} alt={banner.title} />
              <div className="home-banner-content">
                <span className="home-banner-subtitle">{banner.subtitle}</span>
                <h1>{banner.title}</h1>
                <p>{banner.description}</p>
                <button className="home-banner-btn">Shop Now</button>
              </div>
            </div>
          ))}
          <button className="home-banner-nav prev" onClick={() => setCurrentSlide(prev => (prev - 1 + banners.length) % banners.length)}>
            <ChevronLeft />
          </button>
          <button className="home-banner-nav next" onClick={() => setCurrentSlide(prev => (prev + 1) % banners.length)}>
            <ChevronRight />
          </button>
          <div className="home-banner-dots">
            {banners.map((_, index) => (
              <span
                key={index}
                className={`home-dot ${index === currentSlide ? 'active' : ''}`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Flash Deals */}
      <section className="home-flash-deals">
        <div className="home-section-header">
          <h2>Flash Deals</h2>
          <div className="home-countdown">
            Ends in: 12:30:45
          </div>
        </div>
        <div className="home-flash-grid">
          {flashDeals.map(deal => (
            <div key={deal._id} className="home-flash-card">
              <div className="home-flash-discount">-{deal.discount}%</div>
              <img src={deal.images[0]} alt={deal.title} />
              <div className="home-flash-content">
                <h3>{deal.title}</h3>
                <div className="home-flash-price">
                  <span className="home-price-current">${deal.price.toFixed(2)}</span>
                  <span className="home-price-original">${(deal.price * (100 / (100 - deal.discount))).toFixed(2)}</span>
                </div>
                <div className="home-flash-progress">
                  <div className="home-progress-bar" style={{ width: `${deal.soldPercentage}%` }}></div>
                  <span>Sold: {deal.soldPercentage}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="home-categories">
        <div className="home-section-header">
          <h2>Top Categories</h2>
          <a href="/categories" className="home-view-all">View All</a>
        </div>
        <div className="home-categories-grid">
          {categories.map(category => (
            <a key={category._id} href={`/category/${category.slug}`} className="home-category-card">
              <img 
                src={`/assets/images/categories/${category.slug}.png`} 
                alt={category.name}
                className="home-category-icon"
              />
              <h3>{category.name}</h3>
              <span>{category.itemCount} Products</span>
            </a>
          ))}
        </div>
      </section>

      {/* Trending Now */}
      <section className="home-trending">
        <div className="home-section-header">
          <h2>Trending Now</h2>
          <div className="home-trending-tabs">
            <button className="active">All</button>
            <button>Fashion</button>
            <button>Electronics</button>
            <button>Home</button>
          </div>
        </div>
        <div className="home-trending-grid">
          {trendingItems.map(item => (
            <div key={item._id} className="home-product-card">
              <div className="home-product-image">
                <img src={item.images[0]} alt={item.title} />
                <div className="home-product-actions">
                  <button className="home-action-btn">
                    <Heart size={20} />
                  </button>
                  <button className="home-action-btn">
                    <ShoppingCart size={20} />
                  </button>
                  <button className="home-action-btn">Quick View</button>
                </div>
              </div>
              <div className="home-product-content">
                <span className="home-product-category">{item.category}</span>
                <h3>{item.title}</h3>
                <div className="home-product-rating">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={i < (item.rating || 0) ? 'filled' : ''}
                    />
                  ))}
                  <span>({item.reviewCount})</span>
                </div>
                <div className="home-product-price">
                  <span className="home-price-current">${item.price.toFixed(2)}</span>
                  {item.originalPrice && (
                    <span className="home-price-original">${item.originalPrice.toFixed(2)}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="home-features">
        <div className="home-feature-card">
          <Truck size={40} />
          <h3>Free Shipping</h3>
          <p>On orders over $50</p>
        </div>
        <div className="home-feature-card">
          <Shield size={40} />
          <h3>Money Back</h3>
          <p>30 days guarantee</p>
        </div>
        <div className="home-feature-card">
          <Headphones size={40} />
          <h3>24/7 Support</h3>
          <p>Dedicated support</p>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="home-new-arrivals">
        <div className="home-section-header">
          <h2>New Arrivals</h2>
          <a href="/new-arrivals" className="home-view-all">View All</a>
        </div>
        <div className="home-arrivals-grid">
          {newArrivals.map(item => (
            <div key={item._id} className="home-product-card">
              <div className="home-product-image">
                <img src={item.images[0]} alt={item.title} />
                <span className="home-product-tag">New</span>
                <div className="home-product-actions">
                  <button className="home-action-btn">
                    <Heart size={20} />
                  </button>
                  <button className="home-action-btn">
                    <ShoppingCart size={20} />
                  </button>
                </div>
              </div>
              <div className="home-product-content">
                <h3>{item.title}</h3>
                <div className="home-product-price">
                  <span className="home-price-current">${item.price.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;