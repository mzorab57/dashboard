import api from './axios';

// Get users with pagination and search
export const getUsers = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const response = await api.get(`/users/get.php?${queryString}`);
  return response.data;
};

// Create new user
export const createUser = async (userData) => {
  const response = await api.post('/users/create.php', userData);
  return response.data;
};

// Update user
export const updateUser = async (id, userData) => {
  const response = await api.post(`/users/update.php?id=${id}`, userData);
  return response.data;
};

// Delete user (soft delete with restore option)
export const deleteUser = async (id, restore = false) => {
  const response = await api.post(`/users/delete.php?id=${id}`, { restore: restore ? 1 : 0 });
  return response.data;
};

// Search users
export const searchUsers = async (searchTerm) => {
  return getUsers({ search: searchTerm });
};

// Get user by ID
export const getUserById = async (id) => {
  const response = await api.get(`/users/get.php?id=${id}`);
  return response.data;
};

// Get active users only
export const getActiveUsers = async () => {
  return getUsers({ is_active: 1 });
};

// Get users by role
export const getUsersByRole = async (role) => {
  return getUsers({ role: role });
};

// Get deleted users
export const getDeletedUsers = async () => {
  return getUsers({ deleted: 1 });
};

// Restore deleted user
export const restoreUser = async (id) => {
  return deleteUser(id, true);
};