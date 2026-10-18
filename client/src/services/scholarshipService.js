import { apiRequest } from './api';

export const scholarshipService = {
  async getAll(params = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        searchParams.append(key, val);
      }
    });
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return await apiRequest(`/scholarships${query}`);
  },

  async getById(id) {
    return await apiRequest(`/scholarships/${id}`);
  },

  async getRecommendations() {
    return await apiRequest('/scholarships/recommendations');
  },

  async create(data) {
    return await apiRequest('/scholarships', {
      method: 'POST',
      body: data
    });
  },

  async update(id, data) {
    return await apiRequest(`/scholarships/${id}`, {
      method: 'PUT',
      body: data
    });
  },

  async delete(id) {
    return await apiRequest(`/scholarships/${id}`, {
      method: 'DELETE'
    });
  }
};
