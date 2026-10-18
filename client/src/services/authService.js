import { apiRequest } from './api';

export const authService = {
  async register(data) {
    return await apiRequest('/auth/register', {
      method: 'POST',
      body: data
    });
  },

  async login(email, password) {
    return await apiRequest('/auth/login', {
      method: 'POST',
      body: { email, password }
    });
  },

  async getMe() {
    return await apiRequest('/auth/me');
  }
};
