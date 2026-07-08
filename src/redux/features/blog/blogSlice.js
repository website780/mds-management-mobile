// src/redux/features/blog/blogSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { blogAPI } from './blogAPI';

// Initial state
const initialState = {
  blogs: [],
  currentBlog: null,
  categories: [],
  categoryVersions: [],
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  filters: {
    page: 1,
    limit: 10,
    category: '',
    status: '',
    tag: '',
    search: '',
  },
  currentCategory: '',
  currentTag: '',
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  isCategoriesLoading: false,
  isCategoryCreating: false,
  isCategoryUpdating: false,
  isCategoryDeleting: false,
  error: null,
  categoriesError: null,
  categoryError: null,
};

// Fetch public blogs (for public pages)
export const fetchAllPublicBlogs = createAsyncThunk(
  'blog/fetchAllPublicBlogs',
  async (params, { rejectWithValue }) => {
    try {
      const response = await blogAPI.getAllPublicBlogs(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch blogs');
    }
  }
);

// Fetch all blogs (for admin)
export const fetchAllBlogs = createAsyncThunk(
  'blog/fetchAllBlogs',
  async (params, { rejectWithValue }) => {
    try {
      const response = await blogAPI.getAllBlogs(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch blogs');
    }
  }
);

export const fetchAllCategories = createAsyncThunk(
  'blog/fetchAllCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await blogAPI.getAllCategories();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch categories');
    }
  }
);

export const fetchBlogBySlug = createAsyncThunk(
  'blog/fetchBlogBySlug',
  async (slug, { rejectWithValue }) => {
    try {
      const response = await blogAPI.getBlogBySlug(slug);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch blog');
    }
  }
);

export const createBlog = createAsyncThunk(
  'blog/createBlog',
  async (blogData, { rejectWithValue }) => {
    try {
      const response = await blogAPI.createBlog(blogData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create blog');
    }
  }
);

export const updateBlog = createAsyncThunk(
  'blog/updateBlog',
  async ({ id, blogData }, { rejectWithValue }) => {
    try {
      const response = await blogAPI.updateBlog(id, blogData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update blog');
    }
  }
);

export const deleteBlog = createAsyncThunk(
  'blog/deleteBlog',
  async (id, { rejectWithValue }) => {
    try {
      const response = await blogAPI.deleteBlog(id);
      return { id, ...response };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete blog');
    }
  }
);

// Category async thunks
export const createCategory = createAsyncThunk(
  'blog/createCategory',
  async (categoryData, { rejectWithValue }) => {
    try {
      const response = await blogAPI.createCategory(categoryData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create category');
    }
  }
);

export const updateCategory = createAsyncThunk(
  'blog/updateCategory',
  async ({ id, categoryData }, { rejectWithValue }) => {
    try {
      const response = await blogAPI.updateCategory(id, categoryData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update category');
    }
  }
);

export const deleteCategory = createAsyncThunk(
  'blog/deleteCategory',
  async (id, { rejectWithValue }) => {
    try {
      const response = await blogAPI.deleteCategory(id);
      return { id, ...response };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete category');
    }
  }
);

export const fetchCategoryVersions = createAsyncThunk(
  'blog/fetchCategoryVersions',
  async (id, { rejectWithValue }) => {
    try {
      const response = await blogAPI.getCategoryVersions(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch category versions');
    }
  }
);

const blogSlice = createSlice({
  name: 'blog',
  initialState,
  reducers: {
    clearBlogError: (state) => {
      state.error = null;
    },
    clearCategoriesError: (state) => {
      state.categoriesError = null;
    },
    clearCategoryError: (state) => {
      state.categoryError = null;
    },
    setCurrentBlog: (state, action) => {
      state.currentBlog = action.payload;
    },
    clearCurrentBlog: (state) => {
      state.currentBlog = null;
    },
    updateFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = {
        page: 1,
        limit: 10,
        category: '',
        status: '',
        tag: '',
        search: '',
      };
      state.currentCategory = '';
      state.currentTag = '';
    },
    setCurrentCategory: (state, action) => {
      state.currentCategory = action.payload;
    },
    setCurrentTag: (state, action) => {
      state.currentTag = action.payload;
    },
    clearCategoryAndTag: (state) => {
      state.currentCategory = '';
      state.currentTag = '';
    },
  },
  extraReducers: (builder) => {
    // Fetch all public blogs
    builder
      .addCase(fetchAllPublicBlogs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllPublicBlogs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.blogs = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchAllPublicBlogs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

    // Fetch all blogs (admin)
    builder
      .addCase(fetchAllBlogs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllBlogs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.blogs = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchAllBlogs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

    // Fetch all categories
    builder
      .addCase(fetchAllCategories.pending, (state) => {
        state.isCategoriesLoading = true;
        state.categoriesError = null;
      })
      .addCase(fetchAllCategories.fulfilled, (state, action) => {
        state.isCategoriesLoading = false;
        state.categories = action.payload.data || action.payload;
      })
      .addCase(fetchAllCategories.rejected, (state, action) => {
        state.isCategoriesLoading = false;
        state.categoriesError = action.payload;
      })

    // Fetch blog by slug
    builder
      .addCase(fetchBlogBySlug.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBlogBySlug.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentBlog = action.payload.data;
      })
      .addCase(fetchBlogBySlug.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

    // Create blog
    builder
      .addCase(createBlog.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createBlog.fulfilled, (state, action) => {
        state.isCreating = false;
        state.blogs.unshift(action.payload.data);
      })
      .addCase(createBlog.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload;
      })

    // Update blog
    builder
      .addCase(updateBlog.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateBlog.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.blogs.findIndex(blog => blog._id === action.payload.data._id);
        if (index !== -1) {
          state.blogs[index] = action.payload.data;
        }
        if (state.currentBlog && state.currentBlog._id === action.payload.data._id) {
          state.currentBlog = action.payload.data;
        }
      })
      .addCase(updateBlog.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      })

    // Delete blog
    builder
      .addCase(deleteBlog.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteBlog.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.blogs = state.blogs.filter(blog => blog._id !== action.payload.id);
        if (state.currentBlog && state.currentBlog._id === action.payload.id) {
          state.currentBlog = null;
        }
      })
      .addCase(deleteBlog.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload;
      })

    // Create category
    builder
      .addCase(createCategory.pending, (state) => {
        state.isCategoryCreating = true;
        state.categoryError = null;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.isCategoryCreating = false;
        state.categories.push(action.payload.data);
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.isCategoryCreating = false;
        state.categoryError = action.payload;
      })

    // Update category
    builder
      .addCase(updateCategory.pending, (state) => {
        state.isCategoryUpdating = true;
        state.categoryError = null;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.isCategoryUpdating = false;
        const index = state.categories.findIndex(cat => cat._id === action.payload.data._id);
        if (index !== -1) {
          state.categories[index] = action.payload.data;
        }
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.isCategoryUpdating = false;
        state.categoryError = action.payload;
      })

    // Delete category
    builder
      .addCase(deleteCategory.pending, (state) => {
        state.isCategoryDeleting = true;
        state.categoryError = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.isCategoryDeleting = false;
        state.categories = state.categories.filter(cat => cat._id !== action.payload.id);
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.isCategoryDeleting = false;
        state.categoryError = action.payload;
      })

    // Fetch category versions
    builder
      .addCase(fetchCategoryVersions.pending, (state) => {
        state.isLoading = true;
        state.categoryError = null;
      })
      .addCase(fetchCategoryVersions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categoryVersions = action.payload.data;
      })
      .addCase(fetchCategoryVersions.rejected, (state, action) => {
        state.isLoading = false;
        state.categoryError = action.payload;
      });
  },
});

export const {
  clearBlogError,
  clearCategoriesError,
  clearCategoryError,
  setCurrentBlog,
  clearCurrentBlog,
  updateFilters,
  resetFilters,
  setCurrentCategory,
  setCurrentTag,
  clearCategoryAndTag,
} = blogSlice.actions;

export default blogSlice.reducer;