import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowRight, Sparkles, Star, ChevronLeft, ChevronRight, TrendingUp, Package } from 'lucide-react';
import '../../src/css/Home.css';
import summerSaleBanner from '../assets/images/summer-sale-banner.jpg';
import newarrivals from '../assets/images/new-arrivals-banner.jpg';
import freeShipping from '../assets/images/free-shipping-banner.jpg';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

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
    image: freeShipping ,
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

        setFeaturedItems(featuredResponse.data);
        setTrendingItems(trendingResponse.data);
        setNewArrivals(newArrivalsResponse.data);
        setCategoryItems(categoryResponse.data);
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
    <Link to={`/item/${item._id}`} key={item._id} className="homepage-item-card">
      <div className="homepage-item-image">
        {item.images && item.images[0] ? (
          <img 
            src={`/assets/images/products/${item.images[0]}`} 
            alt={item.title}
            loading="lazy"
          />
        ) : (
          <div className="homepage-no-image">No Image</div>
        )}
        {item.listingType === 'Auction' && (
          <div className="homepage-badge auction">Auction</div>
        )}
        {item.condition !== 'New' && (
          <div className="homepage-badge condition">{item.condition}</div>
        )}
      </div>
      <div className="homepage-item-details">
        <h3>{item.title}</h3>
        <div className="homepage-item-category">{item.category}</div>
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
      </div>
    </Link>
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
    </div>
    <Footer/>
    </>
   


  );
};

export default Home;