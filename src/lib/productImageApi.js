import api from './axios';

// Get all product images with optional filters
export const getProductImages = async (params = {}) => {
  const response = await api.get('/product_images/get.php', { params });
  return response.data;
};

// Get product images by product ID
export const getProductImagesByProductId = async (productId) => {
  const response = await api.get(`/product_images/get.php?product_id=${productId}`);
  return response.data;
};

// Get single product image by ID
export const getProductImageById = async (id) => {
  const response = await api.get(`/product_images/get.php?id=${id}`);
  return response.data;
};

// Create new product image
export const createProductImage = async (formData) => {
  const response = await api.post('/product_images/create.php', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Update product image
export const updateProductImage = async (id, data) => {
  const response = await api.put(`/product_images/update.php`, {
    id,
    ...data
  });
  return response.data;
};

// Delete product image
export const deleteProductImage = async (id) => {
  const response = await api.delete('/product_images/delete.php', {
    data: { id }
  });
  return response.data;
};

// Set primary image
export const setPrimaryImage = async (id) => {
  const response = await api.put('/product_images/update.php', {
    id,
    is_primary: 1
  });
  return response.data;
};

// Update display order
export const updateDisplayOrder = async (id, displayOrder) => {
  const response = await api.put('/product_images/update.php', {
    id,
    display_order: displayOrder
  });
  return response.data;
};