import api from './client';

export const adminLogin = async (username, password) => {
  const res = await api.post('/auth/login', { username, password });
  return res.data;
};

export const fetchDashboardStats = async () => {
  const res = await api.get('/admin/dashboard/stats');
  return res.data;
};

export const fetchAdminOrders = async ({ status, paymentStatus, tableNumber, search } = {}) => {
  const params = {};
  if (status && status !== 'ALL') params.status = status;
  if (paymentStatus && paymentStatus !== 'ALL') params.paymentStatus = paymentStatus;
  if (tableNumber && tableNumber !== 'ALL') params.tableNumber = tableNumber;
  if (search) params.search = search;
  const res = await api.get('/admin/orders', { params });
  return res.data;
};

export const updateOrderStatus = async (orderId, status) => {
  const res = await api.patch(`/admin/orders/${orderId}/status`, { status });
  return res.data;
};

export const updatePaymentStatus = async (orderId, paymentStatus, paymentMethod = 'CASH', notes = '') => {
  const res = await api.patch(`/admin/orders/${orderId}/payment`, {
    paymentStatus,
    paymentMethod,
    notes,
  });
  return res.data;
};

export const fetchTables = async () => {
  const res = await api.get('/tables');
  return res.data;
};

export const createTable = async (tableNumber, capacity) => {
  const res = await api.post('/admin/tables', { tableNumber, capacity });
  return res.data;
};

export const deleteTable = async (id) => {
  await api.delete(`/admin/tables/${id}`);
};

export const fetchTableBill = async (tableNumber) => {
  const res = await api.get(`/admin/billing/table/${encodeURIComponent(tableNumber)}`);
  return res.data;
};

export const checkoutTableBill = async (tableNumber, paymentMethod = 'CASH', notes = '') => {
  const res = await api.post(`/admin/billing/table/${encodeURIComponent(tableNumber)}/checkout`, {
    paymentMethod,
    notes,
  });
  return res.data;
};

export const downloadTableBillPdfUrl = (tableNumber) => {
  return `/api/tables/${encodeURIComponent(tableNumber)}/bill-pdf`;
};

