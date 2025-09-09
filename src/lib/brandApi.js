import api from './axios';

// Get brands with pagination and search
export const getBrands = async (params = {}) => {
  const response = await api.get('/brands/get.php', { params });
  return response.data;
};

// Create new brand
export const createBrand = async (formData) => {
  const response = await api.post('/brands/create.php', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

// Update brand
export const updateBrand = async (id, formData) => {
  const response = await api.post(`/brands/update.php?id=${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

// Delete brand
export const deleteBrand = async (id) => {
  const response = await api.post(`/brands/delete.php?id=${id}`);
  return response.data;
};

// Search brands
export const searchBrands = async (searchTerm) => {
  return getBrands({ search: searchTerm });
};

// Get brand by ID
export const getBrandById = async (id) => {
  const response = await api.get(`/brands/get.php?id=${id}`);
  return response.data;
};

// Get active brands only
export const getActiveBrands = async () => {
  return getBrands({ is_active: 1 });
};

// Get featured brands
export const getFeaturedBrands = async () => {
  return getBrands({ is_featured: 1 });
};