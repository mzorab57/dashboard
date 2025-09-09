import api from './axios';

// Get all product specifications with optional filters
export const getProductSpecifications = async (params = {}) => {
  const response = await api.get('/product_specifications/get.php', { params });
  return response.data;
};

// Get product specifications by product ID
export const getProductSpecificationsByProductId = async (productId, params = {}) => {
  const response = await api.get('/product_specifications/get.php', {
    params: { product_id: productId, ...params }
  });
  return response.data;
};

// Get single product specification by ID
export const getProductSpecificationById = async (id) => {
  const response = await api.get(`/product_specifications/get.php?id=${id}`);
  return response.data;
};

// Create new product specification
export const createProductSpecification = async (data) => {
  const response = await api.post('/product_specifications/create.php', data);
  return response.data;
};

// Create multiple product specifications
export const createProductSpecifications = async (productId, specs, startOrder = null) => {
  const response = await api.post('/product_specifications/create.php', {
    product_id: productId,
    specs,
    ...(startOrder && { start_order: startOrder })
  });
  return response.data;
};

// Update product specification
export const updateProductSpecification = async (id, data) => {
  const response = await api.put('/product_specifications/update.php', {
    id,
    ...data
  });
  return response.data;
};

// Delete product specification
export const deleteProductSpecification = async (id) => {
  const response = await api.delete('/product_specifications/delete.php', {
    data: { id }
  });
  return response.data;
};

// Update display order
export const updateSpecificationOrder = async (id, displayOrder) => {
  const response = await api.put('/product_specifications/update.php', {
    id,
    display_order: displayOrder
  });
  return response.data;
};

// Get grouped specifications by product ID
export const getGroupedSpecificationsByProductId = async (productId) => {
  const response = await api.get('/product_specifications/get.php', {
    params: { product_id: productId, grouped: 1 }
  });
  return response.data;
};

// Get specifications by group
export const getSpecificationsByGroup = async (productId, specGroup) => {
  const response = await api.get('/product_specifications/get.php', {
    params: { product_id: productId, spec_group: specGroup }
  });
  return response.data;
};