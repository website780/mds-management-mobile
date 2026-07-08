// src/redux/features/blog/blogAPI.js
import axiosInstance from '../../../services/axios.config';

export const blogAPI = {
  // ── Image Upload ────────────────────────────────────────────────────────────
  // Uploads a single File object to S3 and returns the public URL string.
  // Used by BlogForm (featured image) and RichTextEditor (inline images).
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await axiosInstance.post('/blogs/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    // Response shape: { success: true, files: ['https://...s3...url'] }
    return response.data.files[0];
  },

  // ── Public blogs (for public pages) ────────────────────────────────────────
  getAllPublicBlogs: async (params = {}) => {
    const response = await axiosInstance.get('/blogs/', { params });
    return response.data;
  },

  // ── Admin blogs ─────────────────────────────────────────────────────────────
  getAllBlogs: async (params = {}) => {
    const response = await axiosInstance.get('/blogs/all', { params });
    return response.data;
  },

  // ── Single blog ─────────────────────────────────────────────────────────────
  getBlogBySlug: async (slug) => {
    const response = await axiosInstance.get(`/blogs/${slug}`);
    return response.data;
  },

  // ── Categories ──────────────────────────────────────────────────────────────
  getAllCategories: async () => {
    const response = await axiosInstance.get('/blogs/categories');
    return response.data;
  },

  // ── CRUD ────────────────────────────────────────────────────────────────────
  createBlog: async (blogData) => {
    const response = await axiosInstance.post('/blogs/', blogData);
    return response.data;
  },

  updateBlog: async (id, blogData) => {
    const response = await axiosInstance.put(`/blogs/${id}`, blogData);
    return response.data;
  },

  deleteBlog: async (id) => {
    const response = await axiosInstance.delete(`/blogs/${id}`);
    return response.data;
  },

  // ── Category management ─────────────────────────────────────────────────────
  createCategory: async (categoryData) => {
    const response = await axiosInstance.post('/blogs/category', categoryData);
    return response.data;
  },

  updateCategory: async (id, categoryData) => {
    const response = await axiosInstance.put(`/blogs/category/${id}`, categoryData);
    return response.data;
  },

  deleteCategory: async (id) => {
    const response = await axiosInstance.delete(`/blogs/category/${id}`);
    return response.data;
  },

  getCategoryVersions: async (id) => {
    const response = await axiosInstance.get(`/blogs/category/${id}/versions`);
    return response.data;
  },
};