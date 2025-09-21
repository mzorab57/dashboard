import api from './axios';

// Get subcategories with pagination and search
export const getSubcategories = async (params = {}) => {
  try {
    const response = await api.get('/subcategories/get.php', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    throw error;
  }
};

// Create new subcategory
export const createSubcategory = async (formData) => {
  try {
    const response = await api.post('/subcategories/create.php', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating subcategory:', error);
    throw error;
  }
};

// Update subcategory
export const updateSubcategory = async (id, formData) => {
  try {
    const response = await api.post(`/subcategories/update.php?id=${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating subcategory:', error);
    throw error;
  }
};

// Delete subcategory
export const deleteSubcategory = async (id) => {
  try {
    const response = await api.post(`/subcategories/delete.php?id=${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting subcategory:', error);
    throw error;
  }
};

// Search subcategories
export const searchSubcategories = async (searchTerm) => {
  try {
    return getSubcategories({ search: searchTerm });
  } catch (error) {
    console.error('Error searching subcategories:', error);
    throw error;
  }
};

// Get subcategory by ID
export const getSubcategoryById = async (id) => {
  try {
    const response = await api.get(`/subcategories/get.php?id=${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching subcategory by ID:', error);
    throw error;
  }
};

// Get subcategories by category ID
export const getSubcategoriesByCategory = async (categoryId, type = null) => {
  try {
    const params = { category_id: categoryId, is_active: 1 };
    if (type) params.type = type;
    
    return getSubcategories(params);
  } catch (error) {
    console.error('Error fetching subcategories by category:', error);
    throw error;
  }
};

// Get active subcategories only
export const getActiveSubcategories = async () => {
  try {
    return getSubcategories({ is_active: 1 });
  } catch (error) {
    console.error('Error fetching active subcategories:', error);
    throw error;
  }
};

// Get subcategories with products
export const getSubcategoriesWithProducts = async (categoryId = null) => {
  try {
    const params = {};
    if (categoryId) params.category_id = categoryId;
    
    const response = await api.get('/subcategories/with_products.php', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching subcategories with products:', error);
    throw error;
  }
};

// Bulk operations
export const bulkDeleteSubcategories = async (ids) => {
  try {
    const response = await api.post('/subcategories/bulk_delete.php', { ids });
    return response.data;
  } catch (error) {
    console.error('Error bulk deleting subcategories:', error);
    throw error;
  }
};

export const bulkUpdateSubcategoriesStatus = async (ids, isActive) => {
  try {
    const response = await api.post('/subcategories/bulk_update_status.php', { 
      ids, 
      is_active: isActive 
    });
    return response.data;
  } catch (error) {
    console.error('Error bulk updating subcategories status:', error);
    throw error;
  }
};

export default {
  getSubcategories,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
  searchSubcategories,
  getSubcategoryById,
  getSubcategoriesByCategory,
  getActiveSubcategories,
  getSubcategoriesWithProducts,
  bulkDeleteSubcategories,
  bulkUpdateSubcategoriesStatus
};