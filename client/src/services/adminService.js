import { apiRequest } from './api';

export const adminService = {
  async getOverview() {
    return await apiRequest('/admin/overview');
  },

  async getStudents() {
    return await apiRequest('/admin/students');
  },

  async updateStudent(id, data) {
    return await apiRequest(`/admin/students/${id}`, {
      method: 'PUT',
      body: data
    });
  },

  async getApplications() {
    return await apiRequest('/admin/applications');
  },

  async updateApplication(id, data) {
    return await apiRequest(`/admin/applications/${id}`, {
      method: 'PUT',
      body: data
    });
  },

  async getEligibilityRules() {
    return await apiRequest('/admin/rules');
  },

  async getReports() {
    return await apiRequest('/admin/reports');
  }
};
