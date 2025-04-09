import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/categories.css';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';


const Categories = () => {
  const navigate = useNavigate();

  const handleCategoryClick = () => {
    navigate('/');
    // Scroll to the categories section on the home page
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }, 100);
  };

  const categories = [
    { name: 'Computer', emoji: '🔌' },
    { name: 'Clothing', emoji: '👕' },
    { name: 'Home', emoji: '🏠' },
    { name: 'Books', emoji: '📚' },
    { name: 'Sports', emoji: '⚽' },
    { name: 'Toys', emoji: '🧸' },
    { name: 'Beauty', emoji: '💄' },
    { name: 'Automotive', emoji: '🚗' },
    { name: 'Garden', emoji: '🌱' },
    { name: 'Health', emoji: '❤️' },
    { name: 'Pet Supplies', emoji: '🐾' },
    { name: 'Office Products', emoji: '📎' },
    { name: 'Music', emoji: '🎵' },
    { name: 'Movies', emoji: '🎬' },
    { name: 'Food', emoji: '🍔' },
    { name: 'Art', emoji: '🎨' },
    { name: 'Collectibles', emoji: '🏆' },
    { name: 'Jewelry', emoji: '💍' },
    { name: 'Tools', emoji: '🔨' }
  ];

  return (
    <>
    <NavBar/>
    <div className="categories-container">
      <h2 className="categories-title">Shop By Categories</h2>
      <div className="categories-grid">
        {categories.map((category, index) => (
          <div 
            key={index} 
            className="categories-item" 
            onClick={handleCategoryClick}
          >
            <div className="categories-icon">
              <span className="categories-emoji">{category.emoji}</span>
            </div>
            <p className="categories-name">{category.name}</p>
          </div>
        ))}
      </div>
    </div>
    
    <Footer/>
    </>
  );
};

export default Categories;