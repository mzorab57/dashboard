import api from './axios';

// Get tags with pagination and search
export const getTags = async (params = {}) => {
  const response = await api.get('/tags/get.php', { params });
  return response.data;
};

// Create new tag
export const createTag = async (tagData) => {
  const response = await api.post('/tags/create.php', tagData);
  return response.data;
};

// Update tag
export const updateTag = async (id, tagData) => {
  const response = await api.post(`/tags/update.php?id=${id}`, tagData);
  return response.data;
};

// Delete tag
export const deleteTag = async (id) => {
  const response = await api.post(`/tags/delete.php?id=${id}`);
  return response.data;
};

// Search tags
export const searchTags = async (searchTerm) => {
  return getTags({ search: searchTerm });
};

// Get tag by ID
export const getTagById = async (id) => {
  const response = await api.get(`/tags/get.php?id=${id}`);
  return response.data;
};

// Get active tags only
export const getActiveTags = async () => {
  return getTags({ is_active: 1 });
};

// Get tags by name
export const getTagsByName = async (name) => {
  return getTags({ name: name });
};

// Get popular tags
export const getPopularTags = async (limit = 10) => {
  return getTags({ limit: limit, order_by: 'usage_count' });
};