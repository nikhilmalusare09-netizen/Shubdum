import api from './client';

export const createOrder = async (orderData) => {
  const res = await api.post('/orders', orderData);
  return res.data;
};

export const trackOrderByToken = async (identifier) => {
  const res = await api.get(`/orders/track/${encodeURIComponent(identifier.trim())}`);
  return res.data;
};

export const searchOrders = async (query) => {
  const res = await api.get('/orders/search', { params: { query: query.trim() } });
  return res.data;
};

export const getOrderById = async (orderId) => {
  const res = await api.get(`/orders/${orderId}`);
  return res.data;
};

export const downloadOrderPdfUrl = (orderId) => {
  return `/api/orders/${orderId}/pdf`;
};

