import { apiRequest } from './api';

export const studentService = {
  async getProfile() {
    return await apiRequest('/profile/me');
  },

  async updateProfile(profileData) {
    return await apiRequest('/profile/me', {
      method: 'PUT',
      body: profileData
    });
  },

  async getSavedScholarships() {
    return await apiRequest('/tracking/saved');
  },

  async saveScholarship(scholarshipId) {
    return await apiRequest('/tracking/saved', {
      method: 'POST',
      body: { scholarshipId }
    });
  },

  async removeSavedScholarship(scholarshipId) {
    return await apiRequest(`/tracking/saved/${scholarshipId}`, {
      method: 'DELETE'
    });
  },

  async getTrackingList() {
    return await apiRequest('/tracking/status');
  },

  async updateTrackingStatus(scholarshipId, status, notes = '') {
    return await apiRequest('/tracking/status', {
      method: 'POST',
      body: { scholarshipId, status, notes }
    });
  },

  async getSummary() {
    return await apiRequest('/tracking/summary');
  }
};
