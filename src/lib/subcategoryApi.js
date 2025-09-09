import api from './axios';

// Get subcategories with pagination and search
export const getSubcategories = async (params = {}) => {
  const response = await api.get('/subcategories/get.php', { params });
  return response.data;
};

// Create new subcategory
export const createSubcategory = async (formData) => {
  const response = await api.post('/subcategories/create.php', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

// Update subcategory
export const updateSubcategory = async (id, formData) => {
  const response = await api.post(`/subcategories/update.php?id=${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

// Delete subcategory
export const deleteSubcategory = async (id) => {
  const response = await api.post(`/subcategories/delete.php?id=${id}`);
  return response.data;
};

// Search subcategories
export const searchSubcategories = async (searchTerm) => {
  return getSubcategories({ search: searchTerm });
};

// Get subcategory by ID
export const getSubcategoryById = async (id) => {
  const response = await api.get(`/subcategories/get.php?id=${id}`);
  return response.data;
};

// Get subcategories by category ID
export const getSubcategoriesByCategory = async (categoryId) => {
  return getSubcategories({ category_id: categoryId });
};

// Get active subcategories only
export const getActiveSubcategories = async () => {
  return getSubcategories({ is_active: 1 });
};