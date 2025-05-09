import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Cell 
} from 'recharts';
import '../../css/admin/AnalyzeSellers.css';
import AdminNavBar from '../../components/admin/adminNavBar';
import Footer from '../../components/Footer';

const AnalyzeSellers = () => {
  const [sellers, setSellers] = useState([]);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  // Fetch all sellers on component mount
  useEffect(() => {
    const fetchSellers = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:9000/api/analyze/sellers', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSellers(response.data.data);
      } catch (err) {
        setError('Failed to fetch sellers. ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };

    fetchSellers();
  }, []);

  // Fetch analytics when a seller is selected
  const handleSellerSelect = async (e) => {
    const sellerEmail = e.target.value;
    if (!sellerEmail) {
      setSelectedSeller(null);
      setAnalytics(null);
      return;
    }

    try {
      setLoading(true);
      setSelectedSeller(sellerEmail);
      
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:9000/api/analyze/seller/${sellerEmail}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setAnalytics(response.data.data);
    } catch (err) {
      setError('Failed to fetch analytics. ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD' 
    }).format(value);
  };

  return (
    <>
    <AdminNavBar/>
    <div className="analyze-sellers-container">
      <h1 className="analyze-sellers-title">Seller Performance Analysis</h1>
      
      {error && <div className="analyze-sellers-error">{error}</div>}
      
      <div className="analyze-sellers-selection">
        <label htmlFor="seller-select">Select a Seller:</label>
        <select 
          id="seller-select" 
          className="analyze-sellers-select"
          onChange={handleSellerSelect}
          disabled={loading}
        >
          <option value="">-- Select Seller --</option>
          {sellers.map(seller => (
            <option key={seller.email} value={seller.email}>
              {seller.name} ({seller.email})
            </option>
          ))}
        </select>
      </div>
      
      {loading && <div className="analyze-sellers-loading">Loading data...</div>}
      
      {analytics && !loading && (
        <div className="analyze-sellers-dashboard">
          <div className="analyze-sellers-header">
            <h2>Analytics for {analytics.sellerInfo.name}</h2>
            <p className="analyze-sellers-email">{analytics.sellerInfo.email}</p>
          </div>
          
          <div className="analyze-sellers-summary">
            <div className="analyze-sellers-stat">
              <h3>Total Orders</h3>
              <p className="analyze-sellers-stat-value">{analytics.summary.totalOrders}</p>
            </div>
            <div className="analyze-sellers-stat">
              <h3>Total Revenue</h3>
              <p className="analyze-sellers-stat-value">
                {formatCurrency(analytics.summary.totalRevenue)}
              </p>
            </div>
            <div className="analyze-sellers-stat">
              <h3>Average Order Value</h3>
              <p className="analyze-sellers-stat-value">
                {formatCurrency(analytics.summary.averageOrderValue)}
              </p>
            </div>
          </div>
          
          <div className="analyze-sellers-charts">
            {/* Monthly Revenue Chart */}
            <div className="analyze-sellers-chart-container">
              <h3>Monthly Revenue</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.monthlySalesData.labels.map((label, index) => ({
                  name: label,
                  revenue: analytics.monthlySalesData.revenue[index]
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#8884d8" 
                    activeDot={{ r: 8 }} 
                    name="Revenue" 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            {/* Monthly Orders Chart */}
            <div className="analyze-sellers-chart-container">
              <h3>Monthly Orders</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.monthlySalesData.labels.map((label, index) => ({
                  name: label,
                  orders: analytics.monthlySalesData.orders[index]
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="orders" fill="#82ca9d" name="Orders" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            {/* Order Status Distribution */}
            <div className="analyze-sellers-chart-container">
              <h3>Order Status Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.orderStatusData.labels.map((label, index) => ({
                      name: label,
                      value: analytics.orderStatusData.values[index]
                    }))}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {analytics.orderStatusData.labels.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => value} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Top Selling Items */}
          <div className="analyze-sellers-top-items">
            <h3>Top Selling Items</h3>
            <table className="analyze-sellers-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Quantity Sold</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {analytics.topItems.map((item, index) => (
                  <tr key={index}>
                    <td>{item.title}</td>
                    <td>{item.totalSold}</td>
                    <td>{formatCurrency(item.totalRevenue)}</td>
                  </tr>
                ))}
                {analytics.topItems.length === 0 && (
                  <tr>
                    <td colSpan="3" className="analyze-sellers-no-data">No items found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {!analytics && !loading && selectedSeller && (
        <div className="analyze-sellers-no-data-message">
          No data available for this seller
        </div>
      )}
    </div>
    <Footer/>
    </>
  );
};

export default AnalyzeSellers;