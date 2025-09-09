import api from './axios';

// Get categories with pagination and search
export const getCategories = async (params = {}) => {
  const response = await api.get('/categories/get.php', { params });
  return response.data;
};

// Create new category
export const createCategory = async (formData) => {
  const response = await api.post('/categories/create.php', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

// Update category
export const updateCategory = async (id, formData) => {
  const response = await api.post(`/categories/update.php?id=${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

// Delete category
export const deleteCategory = async (id) => {
  const response = await api.post(`/categories/delete.php?id=${id}`);
  return response.data;
};

// Search categories
export const searchCategories = async (searchTerm) => {
  return getCategories({ search: searchTerm });
};

// Get category by ID
export const getCategoryById = async (id) => {
  const response = await api.get(`/categories/get.php?id=${id}`);
  return response.data;
};

// Get active categories only
export const getActiveCategories = async () => {
  return getCategories({ is_active: 1 });
};