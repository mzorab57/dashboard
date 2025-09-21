import api from './axios';

// Get all discounts
export const getDiscounts = async (params = {}) => {
  const response = await api.get('/discounts/get.php', { params });
  return response.data;
};

// Get categories with pagination and search
export const getCategories = async (params = {}) => {
  const response = await api.get('/categories/get.php', { params });
  return response.data;
};

// Get subcategories with pagination and search
export const getSubcategories = async (params = {}) => {
  const response = await api.get('/subcategories/get.php', { params });
  return response.data;
};

// Get all products with optional filters
export const getProducts = async (params = {}) => {
  const response = await api.get('/products/get.php', { params });
 
  return response.data;
};

// Get discount by ID
export const getDiscountById = async (id) => {
  const response = await api.get('/discounts/get.php', { params: { id } });
  return response.data;
};

// Create new discount
export const createDiscount = async (discountData) => {
  const response = await api.post('/discounts/create.php', discountData);
  return response.data;
};

// Update discount
export const updateDiscount = async (id, discountData) => {
  const response = await api.put('/discounts/update.php', { id, ...discountData });
  return response.data;
};

// Delete discount
export const deleteDiscount = async (id) => {
  const response = await api.delete(`/discounts/delete.php?id=${id}`);
  return response.data;
};

// Calculate product discounts (NEW)
export const calculateProductDiscounts = async (productId, productIds = null) => {
  const params = {};
  if (productIds) {
    params.product_ids = Array.isArray(productIds) ? productIds.join(',') : productIds;
  } else {
    params.product_id = productId;
  }
  const response = await api.get('/discounts/calculate.php', { params });
  return response.data;
};

// Get products with discounts (NEW)
export const getProductsWithDiscounts = async (params = {}) => {
  const response = await api.get('/products/list_with_discounts.php', { params });
  return response.data;
};

// Get product discounts (LEGACY - kept for compatibility)
export const getProductDiscounts = async (productId, subcategoryId = null, categoryId = null) => {
  const response = await api.get('/discounts/get.php', {
    params: {
      product_id: productId,
      subcategory_id: subcategoryId,
      category_id: categoryId
    }
  });
  return response.data;
};

// Search discounts
export const searchDiscounts = async (query) => {
  const response = await api.get('/discounts/get.php', { params: { q: query } });
  return response.data;
};