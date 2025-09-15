import api from './axios';

// Get all product tags (requires tag_id or tag_slug for backend compatibility)
export const getProductTags = async (params = {}) => {
  try {
    // If no specific tag_id or product_id is provided, get all product tags by fetching all tags first
    if (!params.tag_id && !params.tag_slug && !params.product_id) {
      // Get all product tags by using a different approach - get all relationships
      const response = await api.get('/product_tags/get.php', { 
        params: { 
          ...params,
          get_all: true // This might need backend modification
        } 
      });
      return response.data;
    }
    
    const response = await api.get('/product_tags/get.php', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch product tags');
  }
};

// Get all product tag relationships
export const getAllProductTags = async (params = {}) => {
  try {
    const response = await api.get('/product_tags/get.php', { 
      params: { 
        ...params,
        get_all: true
      } 
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch all product tags');
  }
};

// Create a new product tag
export const createProductTag = async (productTagData) => {
  try {
    const response = await api.post('/product_tags/create.php', productTagData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to create product tag');
  }
};

// Update an existing product tag
export const updateProductTag = async (id, productTagData) => {
  try {
    const response = await api.post(`/product_tags/update.php?id=${id}`, productTagData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to update product tag');
  }
};

// Delete a product tag
export const deleteProductTag = async (id) => {
  try {
    const response = await api.post(`/product_tags/delete.php?id=${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to delete product tag');
  }
};

// Get product tags by product ID
export const getProductTagsByProductId = async (productId) => {
  try {
    const response = await api.get('/product_tags/get.php', {
      params: { product_id: productId }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch product tags by product ID');
  }
};

// Get product tags by tag ID
export const getProductTagsByTagId = async (tagId) => {
  try {
    const response = await api.get('/product_tags/get.php', {
      params: { tag_id: tagId }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch product tags by tag ID');
  }
};

// Bulk create product tags
export const bulkCreateProductTags = async (productTagsData) => {
  try {
    const response = await api.post('/product_tags/create.php', {
      bulk: true,
      data: productTagsData
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to bulk create product tags');
  }
};

// Bulk delete product tags
export const bulkDeleteProductTags = async (ids) => {
  try {
    const response = await api.post('/product_tags/delete.php', {
      bulk: true,
      ids: ids
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to bulk delete product tags');
  }
};

// Delete all product tags for a specific product
export const deleteProductTagsByProductId = async (productId) => {
  try {
    const response = await api.post('/product_tags/delete.php', {
      product_id: productId
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to delete product tags by product ID');
  }
};

// Delete all product tags for a specific tag
export const deleteProductTagsByTagId = async (tagId) => {
  try {
    const response = await api.post('/product_tags/delete.php', {
      tag_id: tagId
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to delete product tags by tag ID');
  }
};

// Get product tags with related product and tag information
export const getProductTagsWithDetails = async (params = {}) => {
  try {
    const response = await api.get('/product_tags/get.php', {
      params: {
        ...params,
        include_details: true
      }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch product tags with details');
  }
};

// Check if a product tag relationship exists
export const checkProductTagExists = async (productId, tagId) => {
  try {
    const response = await api.get('/product_tags/get.php', {
      params: {
        product_id: productId,
        tag_id: tagId,
        check_exists: true
      }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to check product tag existence');
  }
};

// Get product tags count
export const getProductTagsCount = async (params = {}) => {
  try {
    const response = await api.get('/product_tags/get.php', {
      params: {
        ...params,
        count_only: true
      }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to get product tags count');
  }
};

// Get most used tags for products
export const getMostUsedProductTags = async (limit = 10) => {
  try {
    const response = await api.get('/product_tags/get.php', {
      params: {
        most_used: true,
        limit: limit
      }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to get most used product tags');
  }
};

// Get products by tag
export const getProductsByTag = async (tagId, params = {}) => {
  try {
    const response = await api.get('/product_tags/get.php', {
      params: {
        tag_id: tagId,
        get_products: true,
        ...params
      }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to get products by tag');
  }
};

// Get tags by product
export const getTagsByProduct = async (productId, params = {}) => {
  try {
    const response = await api.get('/product_tags/get.php', {
      params: {
        product_id: productId,
        get_tags: true,
        ...params
      }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to get tags by product');
  }
};