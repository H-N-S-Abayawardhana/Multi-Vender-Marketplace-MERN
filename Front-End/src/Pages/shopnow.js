import React, { useState } from 'react';
import { Bell, TrendingUp, Tag, Gift } from 'lucide-react';
import UserItemList from '../components/UserItemList';
import NavBar from '../components/NavBar'
import Footer from '../components/Footer'
import '../../src/css/shopnow.css';

const FeaturedDeals = () => {
  return (
    <div className="shop-now-page-deals-grid">
      {[
        { title: "Flash Sale", discount: "50% OFF", ends: "2 hours", icon: <Tag className="shop-now-page-icon-red" /> },
        { title: "Bundle Deals", discount: "Buy 2 Get 1", ends: "Today", icon: <Gift className="shop-now-page-icon-purple" /> },
        { title: "Clearance", discount: "Up to 70% OFF", ends: "This week", icon: <TrendingUp className="shop-now-page-icon-green" /> }
      ].map((deal, index) => (
        <div key={index} className="shop-now-page-deal-card">
          {deal.icon}
          <div>
            <h3 className="shop-now-page-deal-title">{deal.title}</h3>
            <p className="shop-now-page-deal-discount">{deal.discount}</p>
            <p className="shop-now-page-deal-time">Ends in: {deal.ends}</p>
          </div>
        </div>
      ))}
    </div>
  );
};


const CategoryNav = () => {
  const topCategories = [
    "All Items",
    "New Arrivals",
    "Best Sellers",
    "Deals",
    "Featured Brands"
  ];

  return (
    <>
    
    <div className="shop-now-page-category-nav">
      <div className="shop-now-page-category-list">
        {topCategories.map((category, index) => (
          <button
            key={index}
            className="shop-now-page-category-button"
          >
            {category}
          </button>
        ))}
      </div>
    </div>
    <Footer/>
    </>
  );
};

const TabPanel = ({ children, value, index }) => {
  return value === index ? <div className="shop-now-page-tab-panel">{children}</div> : null;
};

const ShopNowPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  
  return (
    <>
    <NavBar />
    <div className="shop-now-page-container">
      
      
      <div className="shop-now-page-content">
        <h1 className="shop-now-page-title">Shop Now</h1>
        
        <div className="shop-now-page-welcome-alert">
          🎉 Welcome to our marketplace! Discover amazing products from our verified vendors.
        </div>

        <CategoryNav />
        
        <div className="shop-now-page-tabs-container">
          <div className="shop-now-page-tabs-header">
            <button 
              className={`shop-now-page-tab-button ${activeTab === 0 ? 'shop-now-page-active' : ''}`}
              onClick={() => setActiveTab(0)}
            >
              All Products
            </button>
            <button 
              className={`shop-now-page-tab-button ${activeTab === 1 ? 'shop-now-page-active' : ''}`}
              onClick={() => setActiveTab(1)}
            >
              Today's Deals
            </button>
            <button 
              className={`shop-now-page-tab-button ${activeTab === 2 ? 'shop-now-page-active' : ''}`}
              onClick={() => setActiveTab(2)}
            >
              Trending Now
            </button>
          </div>

          <TabPanel value={activeTab} index={0}>
            <UserItemList />
          </TabPanel>
          
          <TabPanel value={activeTab} index={1}>
            <FeaturedDeals />
          </TabPanel>
          
          <TabPanel value={activeTab} index={2}>
            <UserItemList />
          </TabPanel>
        </div>
      </div>
    </div>
    
    </>
  );
};

export default ShopNowPage;