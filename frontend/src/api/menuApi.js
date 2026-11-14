import api from './client';

export const fetchCustomerMenu = async ({ foodType, categoryId, search } = {}) => {
  const params = {};
  if (foodType && foodType !== 'ALL') params.foodType = foodType;
  if (categoryId) params.categoryId = categoryId;
  if (search) params.search = search;
  const res = await api.get('/menu', { params });
  return res.data;
};

export const fetchCategories = async (foodType) => {
  const params = {};
  if (foodType && foodType !== 'ALL') params.foodType = foodType;
  const res = await api.get('/menu/categories', { params });
  return res.data;
};

export const fetchAdminMenu = async ({ foodType, categoryId, published, search } = {}) => {
  const params = {};
  if (foodType && foodType !== 'ALL') params.foodType = foodType;
  if (categoryId) params.categoryId = categoryId;
  if (published !== undefined && published !== null && published !== '') params.published = published;
  if (search) params.search = search;
  const res = await api.get('/admin/menu', { params });
  return res.data;
};

export const createDish = async (dishData) => {
  const res = await api.post('/admin/menu', dishData);
  return res.data;
};

export const updateDish = async (id, dishData) => {
  const res = await api.put(`/admin/menu/${id}`, dishData);
  return res.data;
};

export const deleteDish = async (id) => {
  await api.delete(`/admin/menu/${id}`);
};

export const toggleAvailability = async (id) => {
  const res = await api.patch(`/admin/menu/${id}/toggle-availability`);
  return res.data;
};

export const togglePublish = async (id) => {
  const res = await api.patch(`/admin/menu/${id}/toggle-publish`);
  return res.data;
};

export const createCategory = async (catData) => {
  const res = await api.post('/admin/categories', catData);
  return res.data;
};

