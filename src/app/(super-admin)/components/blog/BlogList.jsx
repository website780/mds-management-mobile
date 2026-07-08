"use client"
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import BlogCard from './BlogCard';
import BlogFilters from './BlogFilters';
import LoadingSpinner from '@/component/common/LoadingSpinner';
import ErrorMessage from '@/component/common/ErrorMessage';
import Pagination from '@/component/common/Pagination';
import ConfirmDialog from '@/component/common/ConfirmDialog';
import { fetchAllBlogs, deleteBlog, updateFilters } from '@/redux/features/blog/blogSlice';

const BlogList = () => {
  const dispatch = useDispatch();
  const { 
    blogs, 
    pagination, 
    filters, 
    isLoading, 
    isDeleting, 
    error 
  } = useSelector(state => state.blog);
  
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, blogId: null, blogTitle: '' });

  useEffect(() => {
    dispatch(fetchAllBlogs(filters));
  }, [dispatch, filters]);

  const handleFilterChange = (newFilters) => {
    dispatch(updateFilters(newFilters));
  };

  const handlePageChange = (page) => {
    dispatch(updateFilters({ page }));
  };

  const handleDeleteClick = (blog) => {
    setDeleteConfirm({
      show: true,
      blogId: blog._id,
      blogTitle: blog.title
    });
  };

  const handleDeleteConfirm = async () => {
    await dispatch(deleteBlog(deleteConfirm.blogId));
    setDeleteConfirm({ show: false, blogId: null, blogTitle: '' });
    // Refresh the list
    dispatch(fetchAllBlogs(filters));
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm({ show: false, blogId: null, blogTitle: '' });
  };

  if (isLoading && blogs.length === 0) {
    return <LoadingSpinner text="Loading blogs..." />;
  }

  if (error) {
    return (
      <ErrorMessage 
        message={error} 
        onRetry={() => dispatch(fetchAllBlogs(filters))}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">All Blogs</h1>
        <div className="text-sm text-gray-500">
          {pagination.total} total blogs
        </div>
      </div>

      <BlogFilters 
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      {blogs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No blogs found matching your criteria.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {blogs.map((blog) => (
              <BlogCard
                key={blog._id}
                blog={blog}
                onDelete={() => handleDeleteClick(blog)}
                isDeleting={isDeleting}
              />
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}

      <ConfirmDialog
        isOpen={deleteConfirm.show}
        title="Delete Blog"
        message={`Are you sure you want to delete "${deleteConfirm.blogTitle}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default BlogList;