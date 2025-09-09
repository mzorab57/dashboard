import api from './axios';

// Get all products with optional filters
export const getProducts = async (params = {}) => {
  const response = await api.get('/products/get.php', { params });
  return response.data;
};

// Get single product by ID
export const getProductById = async (id) => {
  const response = await api.get(`/products/get.php?id=${id}`);
  return response.data;
};

// Create new product
export const createProduct = async (data) => {
  const config = data instanceof FormData ? {
    headers: { 'Content-Type': 'multipart/form-data' }
  } : {};
  const response = await api.post('/products/create.php', data, config);
  return response.data;
};

// Update product
export const updateProduct = async (data) => {
  const config = data instanceof FormData ? {
    headers: { 'Content-Type': 'multipart/form-data' }
  } : {};
  const response = await api.post('/products/update.php', data, config);
  return response.data;
};

// Delete product
export const deleteProduct = async (id) => {
  const response = await api.post('/products/delete.php', { id });
  return response.data;
};

// Search products
export const searchProducts = async (searchTerm, params = {}) => {
  const response = await api.get('/products/get.php', {
    params: { search: searchTerm, ...params }
  });
  return response.data;
};

// Get products by category
export const getProductsByCategory = async (categoryId, params = {}) => {
  const response = await api.get('/products/get.php', {
    params: { category_id: categoryId, ...params }
  });
  return response.data;
};

// Get products by subcategory
export const getProductsBySubcategory = async (subcategoryId, params = {}) => {
  const response = await api.get('/products/get.php', {
    params: { subcategory_id: subcategoryId, ...params }
  });
  return response.data;
};

// Get featured products
export const getFeaturedProducts = async (params = {}) => {
  const response = await api.get('/products/get.php', {
    params: { is_featured: 1, ...params }
  });
  return response.data;
};

// Get active products
export const getActiveProducts = async (params = {}) => {
  const response = await api.get('/products/get.php', {
    params: { is_active: 1, ...params }
  });
  return response.data;
};