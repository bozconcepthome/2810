import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

// Get or create session ID
const getSessionId = () => {
  let sessionId = sessionStorage.getItem('session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('session_id', sessionId);
  }
  return sessionId;
};

// Get user ID from localStorage if logged in
const getUserId = () => {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub;
    } catch (e) {
      return null;
    }
  }
  return null;
};

export const trackEvent = async (eventType, eventData) => {
  try {
    await axios.post(`${API_URL}/api/analytics/event`, {
      event_type: eventType,
      event_data: eventData,
      user_id: getUserId(),
      session_id: getSessionId()
    });
  } catch (error) {
    // Silently fail - don't disrupt user experience
    console.error('Analytics tracking error:', error);
  }
};

// Convenience functions
export const trackPageView = (pageName, additionalData = {}) => {
  trackEvent('page_view', {
    page: pageName,
    ...additionalData
  });
};

export const trackProductClick = (product) => {
  trackEvent('product_click', {
    product_id: product.id,
    product_name: product.product_name,
    category: product.category,
    price: product.price
  });
};

export const trackCategoryClick = (categoryName) => {
  trackEvent('category_click', {
    category: categoryName
  });
};

export const trackAddToCart = (product, quantity = 1) => {
  trackEvent('add_to_cart', {
    product_id: product.id,
    product_name: product.product_name,
    category: product.category,
    price: product.price,
    quantity: quantity
  });
};
