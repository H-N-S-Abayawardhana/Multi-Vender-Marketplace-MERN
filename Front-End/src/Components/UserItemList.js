import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ShoppingCart, 
  CreditCard, 
  Search, 
  Filter, 
  X, 
  Minus, 
  Plus, 
  Heart,
  Truck
} from 'lucide-react';
import '../../src/css/useritemlist.css';
import CheckoutPage from '../Pages/CheckoutPage';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Predefined categories list
const PREDEFINED_CATEGORIES = [
  'Electronics',
  'Clothing',
  'Home',
  'Books',
  'Sports',
  'Toys',
  'Beauty',
  'Automotive',
  'Garden',
  'Health',
  'Pet Supplies',
  'Office Products',
  'Music',
  'Movies',
  'Food',
  'Art',
  'Collectibles',
  'Jewelry',
  'Tools'
];

const UserItemList = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [itemQuantities, setItemQuantities] = useState({});
  const [wishlist, setWishlist] = useState([]);
  const [showSignIn, setShowSignIn] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    categories: [],
    conditions: [],
    priceRange: { min: 0, max: 10000 }
  });
  const [availableFilters, setAvailableFilters] = useState({
    categories: PREDEFINED_CATEGORIES,
    conditions: []
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const email = localStorage.getItem('email');
    setIsLoggedIn(!!email);

    const fetchItems = async () => {
      try {
        setLoading(true);

        // Create array of API calls
        const apiCalls = [
          axios.get('http://localhost:9000/api/items/all')
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
        const itemsResponse = responses[0];
        const receivedItems = itemsResponse.data;
        
        console.log('Items received:', receivedItems);
        setItems(receivedItems);
        setFilteredItems(receivedItems);
        
        // Initialize quantities for each item to 1
        const initialQuantities = {};
        receivedItems.forEach(item => {
          initialQuantities[item._id] = 1;
        });
        setItemQuantities(initialQuantities);
        
        // Extract unique conditions for filters
        const conditions = [...new Set(receivedItems.map(item => item.condition))];
        setAvailableFilters(prev => ({ ...prev, conditions }));
        
        // Extract wishlist item IDs if available
        if (email && responses.length > 1) {
          const wishlistResponse = responses[1];
          const wishlistData = wishlistResponse.data.map(item => item.itemId);
          setWishlist(wishlistData);
        }

        // Simulate network delay for smoother transitions
        setTimeout(() => {
          setLoading(false);
        }, 800);
      } catch (err) {
        console.error('Error:', err);
        setError('Failed to fetch items. Please try again later.');
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  // Apply filters and search
  useEffect(() => {
    let result = [...items];
    
    // Apply search
    if (searchTerm) {
      const lowercasedSearch = searchTerm.toLowerCase();
      result = result.filter(item => 
        item.title.toLowerCase().includes(lowercasedSearch) ||
        (item.description && item.description.toLowerCase().includes(lowercasedSearch)) ||
        (item.category && item.category.toLowerCase().includes(lowercasedSearch))
      );
    }
    
    // Apply category filter
    if (filters.categories.length > 0) {
      result = result.filter(item => filters.categories.includes(item.category));
    }
    
    // Apply condition filter
    if (filters.conditions.length > 0) {
      result = result.filter(item => filters.conditions.includes(item.condition));
    }
    
    // Apply price range filter
    result = result.filter(item => 
      item.price >= filters.priceRange.min && 
      item.price <= filters.priceRange.max
    );
    
    setFilteredItems(result);
  }, [items, searchTerm, filters]);

  // Format price to display in LKR
  const formatPrice = (price) => {
    return `LKR ${price.toFixed(2)}`;
  };

  // Calculate discount percentage
  const calculateDiscount = (originalPrice, price) => {
    if (!originalPrice || originalPrice <= price) return null;
    const discount = Math.round(((originalPrice - price) / originalPrice) * 100);
    return discount > 0 ? discount : null;
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
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
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
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
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

  const toggleCategoryFilter = (category) => {
    setFilters(prev => {
      if (prev.categories.includes(category)) {
        return { ...prev, categories: prev.categories.filter(c => c !== category) };
      } else {
        return { ...prev, categories: [...prev.categories, category] };
      }
    });
  };

  const toggleConditionFilter = (condition) => {
    setFilters(prev => {
      if (prev.conditions.includes(condition)) {
        return { ...prev, conditions: prev.conditions.filter(c => c !== condition) };
      } else {
        return { ...prev, conditions: [...prev.conditions, condition] };
      }
    });
  };

  const handlePriceRangeChange = (type, value) => {
    setFilters(prev => ({
      ...prev,
      priceRange: {
        ...prev.priceRange,
        [type]: Number(value)
      }
    }));
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setFilters({
      categories: [],
      conditions: [],
      priceRange: { min: 0, max: 10000 }
    });
  };
  
  // Helper function to count items per category
  const getCategoryCount = (category) => {
    return items.filter(item => item.category === category).length;
  };

  // Item card rendering for consistency with Home page
  const renderItemCard = (item) => {
    const discount = calculateDiscount(item.originalPrice, item.price);
    const isWishlisted = wishlist.includes(item._id);
    
    return (
      <div key={item._id} className="user-itemlist-card">
        <Link to={`/item/${item._id}`} className="user-itemlist-item-link">
          <div className="user-itemlist-image-container">
            {item.images && item.images[0] ? (
              <img 
                src={`http://localhost:9000${item.images[0]}`} 
                alt={item.title} 
                className="user-itemlist-image"
              />
            ) : (
              <div className="user-itemlist-no-image">No Image Available</div>
            )}
            
            {/* Badge container */}
            <div className="user-itemlist-badges">
              {item.listingType === 'Auction' && (
                <div className="user-itemlist-badge auction">Auction</div>
              )}
              {item.condition !== 'New' && (
                <div className="user-itemlist-badge condition">{item.condition}</div>
              )}
              {discount && (
                <div className="user-itemlist-badge discount">-{discount}%</div>
              )}
            </div>
            
            {/* Stock indicator */}
            {item.quantity < 5 && item.quantity > 0 && (
              <span className="user-itemlist-low-stock">
                Only {item.quantity} left
              </span>
            )}
            {item.quantity === 0 && (
              <span className="user-itemlist-out-of-stock">
                Out of Stock
              </span>
            )}
            
            {/* Wishlist button */}
            <button 
              className={`user-itemlist-wishlist-btn ${isWishlisted ? 'active' : ''}`}
              onClick={(e) => toggleWishlist(item._id, e)}
              aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart size={20} fill={isWishlisted ? "#ff4d4d" : "none"} color={isWishlisted ? "#ff4d4d" : "#666"} />
            </button>
          </div>
          
          <div className="user-itemlist-content">
            <h3 className="user-itemlist-item-title">{item.title}</h3>
            
            <div className="user-itemlist-price">
              {item.listingType === 'Fixed' ? (
                <>
                  <span className="user-itemlist-current-price">{formatPrice(item.price)}</span>
                  {item.originalPrice && item.originalPrice > item.price && (
                    <span className="user-itemlist-original-price">
                      {formatPrice(item.originalPrice)}
                    </span>
                  )}
                </>
              ) : (
                <span className="user-itemlist-current-price">Starting bid: {formatPrice(item.startingBid)}</span>
              )}
            </div>
            
            {item.rating && (
              <div className="user-itemlist-item-rating">
                <span>⭐ {item.rating.toFixed(1)} <span className="user-itemlist-review-count">({item.reviews || 0})</span></span>
              </div>
            )}
            
            <p className="user-itemlist-description">
              {item.description ? (
                <>
                  {item.description.slice(0, 60)}
                  {item.description.length > 60 ? '...' : ''}
                </>
              ) : (
                'No description available'
              )}
            </p>
            
            <div className="user-itemlist-shipping-info">
              <Truck size={14} />
              <span>
                {item.shippingDetails?.cost === 0 
                  ? 'Free Shipping' 
                  : `Shipping: ${formatPrice(item.shippingDetails?.cost || 0)}`}
              </span>
            </div>
          </div>
        </Link>
        
        {/* Add quantity control and action buttons */}
        <div className="user-itemlist-actions">
          {item.quantity > 0 ? (
            <>
              <div className="user-itemlist-quantity-control">
                <button 
                  className="user-itemlist-quantity-btn decrease"
                  onClick={(e) => decreaseQuantity(item._id, e)}
                  disabled={itemQuantities[item._id] <= 1}
                  aria-label="Decrease quantity"
                >
                  <Minus size={16} />
                </button>
                <span className="user-itemlist-quantity-value">{itemQuantities[item._id] || 1}</span>
                <button 
                  className="user-itemlist-quantity-btn increase"
                  onClick={(e) => increaseQuantity(item._id, item.quantity, e)}
                  disabled={itemQuantities[item._id] >= item.quantity}
                  aria-label="Increase quantity"
                >
                  <Plus size={16} />
                </button>
                <span className="user-itemlist-max-quantity">
                  of {item.quantity}
                </span>
              </div>
              
              <div className="user-itemlist-item-buttons">
                <button 
                  className="user-itemlist-cart-btn"
                  onClick={(e) => handleAddToCart(item, e)}
                  aria-label="Add to cart"
                >
                  <ShoppingCart size={16} />
                  <span>Add to Cart</span>
                </button>
                <button 
                  className="user-itemlist-buy-btn"
                  onClick={(e) => handleBuyNow(item, e)}
                  aria-label="Buy now"
                >
                  <CreditCard size={16} />
                  <span>Buy Now</span>
                </button>
              </div>
            </>
          ) : (
            <div className="user-itemlist-out-of-stock-message">
              Out of Stock
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="user-itemlist-loading">
        <div className="user-itemlist-loading-spinner"></div>
        <p>Discovering amazing products just for you...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-itemlist-error">
        <div className="user-itemlist-error-icon">⚠️</div>
        <p>{error}</p>
        <button className="user-itemlist-retry-btn" onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  if (items.length === 0) {
    return <div className="user-itemlist-empty">No items available at the moment.</div>;
  }

  return (
    <div className="user-itemlist-container">
      <h2 className="user-itemlist-title">Available Items</h2>
      
      {/* Search and filter bar */}
      <div className="user-itemlist-search-filter">
        <div className="user-itemlist-search">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search items..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button 
              className="clear-search" 
              onClick={() => setSearchTerm('')}
            >
              <X size={16} />
            </button>
          )}
        </div>
        
        <button 
          className={`user-itemlist-filter-toggle ${showFilters ? 'active' : ''}`}
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter size={18} />
          <span>Filter</span>
        </button>
      </div>
      
      {/* Filter panel */}
      {showFilters && (
        <div className="user-itemlist-filter-panel">
          <div className="filter-section">
            <h4>Categories</h4>
            <div className="filter-options categories-list">
              {availableFilters.categories.map(category => (
                <label key={category} className="filter-checkbox">
                  <input 
                    type="checkbox" 
                    checked={filters.categories.includes(category)}
                    onChange={() => toggleCategoryFilter(category)} 
                  />
                  <span>{category}</span>
                  <span className="item-count">({getCategoryCount(category)})</span>
                </label>
              ))}
            </div>
          </div>
          
          <div className="filter-section">
            <h4>Condition</h4>
            <div className="filter-options">
              {availableFilters.conditions.map(condition => (
                <label key={condition} className="filter-checkbox">
                  <input 
                    type="checkbox" 
                    checked={filters.conditions.includes(condition)}
                    onChange={() => toggleConditionFilter(condition)} 
                  />
                  <span>{condition}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div className="filter-section">
            <h4>Price Range</h4>
            <div className="price-range-inputs">
              <div className="price-input">
                <span>LKR</span>
                <input 
                  type="number" 
                  min="0" 
                  value={filters.priceRange.min}
                  onChange={(e) => handlePriceRangeChange('min', e.target.value)}
                />
              </div>
              <span>to</span>
              <div className="price-input">
                <span>LKR</span>
                <input 
                  type="number" 
                  min="0" 
                  value={filters.priceRange.max}
                  onChange={(e) => handlePriceRangeChange('max', e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <div className="filter-actions">
            <button 
              className="clear-filters-btn"
              onClick={clearAllFilters}
            >
              Clear All Filters
            </button>
          </div>
        </div>
      )}
      
      {/* Results summary */}
      <div className="user-itemlist-results-summary">
        <p>Showing {filteredItems.length} of {items.length} items</p>
      </div>
      
      {/* Item grid */}
      <div className="user-itemlist-grid">
        {filteredItems.length === 0 ? (
          <div className="no-results">No items match your current filters.</div>
        ) : (
          filteredItems.map(renderItemCard)
        )}
      </div>

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
  );
};

export default UserItemList;