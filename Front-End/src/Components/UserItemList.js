import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingCart, CreditCard, Search, Filter, X, Minus, Plus } from 'lucide-react';
import '../../src/css/useritemlist.css';
import CheckoutPage from '../Pages/CheckoutPage';

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
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [itemQuantities, setItemQuantities] = useState({});

  
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
    const fetchItems = async () => {
      try {
        const response = await axios.get('http://localhost:9000/api/items/all');
        console.log('Items received:', response.data);
        setItems(response.data);
        setFilteredItems(response.data);
        
        // Initialize quantities for each item to 1
        const initialQuantities = {};
        response.data.forEach(item => {
          initialQuantities[item._id] = 1;
        });
        setItemQuantities(initialQuantities);
        
        // Extract unique conditions for filters
        const conditions = [...new Set(response.data.map(item => item.condition))];
        setAvailableFilters(prev => ({ ...prev, conditions }));
        
        setLoading(false);
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

  // Quantity adjustment handlers
  const increaseQuantity = (itemId) => {
    const item = items.find(item => item._id === itemId);
    
    // Check if the current quantity is less than available stock
    if (itemQuantities[itemId] < item.quantity) {
      setItemQuantities(prev => ({
        ...prev,
        [itemId]: prev[itemId] + 1
      }));
    } else {
      // Optional: Show feedback that max quantity is reached
      alert(`Sorry, only ${item.quantity} items are available in stock.`);
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

  const handleAddToCart = (item) => {
    // TODO: Implement cart functionality with selected quantity
    const quantity = itemQuantities[item._id] || 1;
    console.log('Added to cart:', item, 'Quantity:', quantity);
  };

  const handleBuyNow = (item) => {
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

      // Update item quantity in the UI immediately
      setItems(prevItems =>
        prevItems.map(item =>
          item._id === selectedItem._id
            ? { ...item, quantity: Math.max(0, item.quantity - orderedQuantity) }
            : item
        )
      );

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

  if (loading) {
    return <div className="user-itemlist-loading">Loading...</div>;
  }

  if (error) {
    return <div className="user-itemlist-error">{error}</div>;
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
                <span>$</span>
                <input 
                  type="number" 
                  min="0" 
                  value={filters.priceRange.min}
                  onChange={(e) => handlePriceRangeChange('min', e.target.value)}
                />
              </div>
              <span>to</span>
              <div className="price-input">
                <span>$</span>
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
          filteredItems.map((item) => (
            <div key={item._id} className="user-itemlist-card">
              <div className="user-itemlist-image-container">
                {item.images && item.images.length > 0 ? (
                  <img 
                    src={`http://localhost:9000${item.images[0]}`} 
                    alt={item.title} 
                    className="user-itemlist-image"
                  />
                ) : (
                  <div className="user-itemlist-no-image">No Image</div>
                )}
                {item.quantity < 5 && item.quantity > 0 && (
                  <span className="user-itemlist-low-stock">
                    {item.quantity} left
                  </span>
                )}
                {item.quantity === 0 && (
                  <span className="user-itemlist-out-of-stock">
                    Out of Stock
                  </span>
                )}
              </div>
              <div className="user-itemlist-content">
                <h3 className="user-itemlist-item-title">{item.title}</h3>
                <p className="user-itemlist-price">${item.price.toFixed(2)}</p>
                <div className="user-itemlist-details">
                  {item.condition && (
                    <span className="user-itemlist-condition">{item.condition}</span>
                  )}
                  {item.category && (
                    <span className="user-itemlist-category">{item.category}</span>
                  )}
                </div>
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
                
                {/* Quantity controls */}
                {item.quantity > 0 && (
                  <div className="user-itemlist-quantity-control">
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
                        onClick={() => increaseQuantity(item._id)}
                        disabled={itemQuantities[item._id] >= item.quantity}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <span className="available-stock">
                      (Max: {item.quantity})
                    </span>
                  </div>
                )}
                
                <div className="user-itemlist-buttons">
                  <button 
                    className="user-itemlist-cart-btn"
                    onClick={() => handleAddToCart(item)}
                    disabled={item.quantity === 0}
                  >
                    <ShoppingCart size={16} />
                    <span>Add</span>
                  </button>
                  <button 
                    className="user-itemlist-buy-btn"
                    onClick={() => handleBuyNow(item)}
                    disabled={item.quantity === 0}
                  >
                    <CreditCard size={16} />
                    <span>Buy</span>
                  </button>
                </div>
              </div>
            </div>
          ))
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
    </div>
  );
};

export default UserItemList;