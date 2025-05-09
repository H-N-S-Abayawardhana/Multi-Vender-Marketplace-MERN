// src/pages/SellerAnalytics.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar, Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import '../../css/seller/SellerAnalytics.css';
import NavBar from '../../components/seller/sellerNavBar';
import Footer from '../../components/Footer';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);



const SellerAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchSellerStats = async () => {
      try {
        // Get the seller email from localStorage
        const sellerEmail = localStorage.getItem('email');
        if (!sellerEmail) {
          throw new Error('Seller email not found in localStorage');
        }

        // Fetch data from the API
        const response = await axios.get(`http://localhost:9000/api/analytics/seller-stats?email=${sellerEmail}`);
        setStats(response.data.data);
      } catch (err) {
        console.error('Error fetching seller stats:', err);
        setError(err.message || 'Failed to fetch analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchSellerStats();
  }, []);

  if (loading) return <div className="seller-analytics-loader">Loading analytics...</div>;
  if (error) return <div className="seller-analytics-error">Error: {error}</div>;
  if (!stats) return <div className="seller-analytics-empty">No data available</div>;

  // Prepare data for the monthly orders and revenue chart
  const monthlyOrdersChartData = {
    labels: stats.monthlyData.map(item => item.month),
    datasets: [
      {
        label: 'Orders',
        data: stats.monthlyData.map(item => item.orders),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Prepare data for the monthly revenue chart
  const monthlyRevenueChartData = {
    labels: stats.monthlyData.map(item => item.month),
    datasets: [
      {
        label: 'Revenue ($)',
        data: stats.monthlyData.map(item => item.revenue),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        fill: true,
      },
    ],
  };

  // Prepare data for the order status pie chart
  const statusLabels = Object.keys(stats.ordersByStatus);
  const statusData = Object.values(stats.ordersByStatus);
  const backgroundColors = [
    'rgba(255, 99, 132, 0.6)',
    'rgba(54, 162, 235, 0.6)',
    'rgba(255, 206, 86, 0.6)',
    'rgba(75, 192, 192, 0.6)',
    'rgba(153, 102, 255, 0.6)',
  ];

  const orderStatusChartData = {
    labels: statusLabels,
    datasets: [
      {
        data: statusData,
        backgroundColor: backgroundColors,
        borderColor: backgroundColors.map(color => color.replace('0.6', '1')),
        borderWidth: 1,
      },
    ],
  };

  // Options for charts
  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Monthly Orders',
      },
    },
  };

  const lineOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Monthly Revenue',
      },
    },
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Orders by Status',
      },
    },
  };

  return (
    <>
    <NavBar/>
    <div className="seller-analytics-container">
      <h1 className="seller-analytics-title">Seller Analytics Dashboard</h1>

      <div className="seller-analytics-summary">
        <div className="seller-analytics-card">
          <h3>Total Orders</h3>
          <p className="seller-analytics-number">{stats.totalOrders}</p>
        </div>
        <div className="seller-analytics-card">
          <h3>Total Revenue</h3>
          <p className="seller-analytics-number">${stats.totalRevenue.toFixed(2)}</p>
        </div>
      </div>

      <div className="seller-analytics-charts-grid">
        <div className="seller-analytics-chart">
          <h2>Monthly Orders</h2>
          <Bar data={monthlyOrdersChartData} options={barOptions} />
        </div>

        <div className="seller-analytics-chart">
          <h2>Monthly Revenue</h2>
          <Line data={monthlyRevenueChartData} options={lineOptions} />
        </div>

        <div className="seller-analytics-chart">
          <h2>Orders by Status</h2>
          <Pie data={orderStatusChartData} options={pieOptions} />
        </div>
      </div>

      <div className="seller-analytics-top-items">
        <h2>Top Selling Items</h2>
        <ul className="seller-analytics-items-list">
          {stats.topSellingItems.map((item, index) => (
            <li key={index}>
              <span className="seller-analytics-item-name">{item.title}</span>
              <span className="seller-analytics-item-count">{item.count} units</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
    <Footer/>
    </>
  );
};

export default SellerAnalytics;