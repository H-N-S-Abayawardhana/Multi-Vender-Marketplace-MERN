import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:9000/api';

export const fetchUserOrders = async (email) => {
  try {
    const response = await axios.get(`${API_URL}/orders/user/${email}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};