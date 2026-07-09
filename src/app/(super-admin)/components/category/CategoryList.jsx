"use client"
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  fetchAllCategories, 
  deleteCategory, 
  createCategory,
  updateCategory 
} from '@/redux/features/blog/blogSlice';
// import CategoryCard from './CategoryCard';
import CategoryForm from './CategoryForm';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import Modal from '../ui/Modal';
import CategoryCard from './CategoryCard';



const CategoryList = () => {
  const dispatch = useDispatch();
  const { 
    categories, 
    isCategoriesLoading, 
    isCategoryDeleting,
    categoriesError 
  } = useSelector(state => state.blog);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ 
    show: false, 
    categoryId: null, 
    categoryName: '' 
  });

  useEffect(() => {
    dispatch(fetchAllCategories());
  }, [dispatch]);

  const handleCreateCategory = async (categoryData) => {
    try {
      await dispatch(createCategory(categoryData)).unwrap();
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to create category:', error);
    }
  };

  const handleUpdateCategory = async (categoryData) => {
    try {
      await dispatch(updateCategory({ 
        id: editCategory._id, 
        categoryData 
      })).unwrap();
      setEditCategory(null);
    } catch (error) {
      console.error('Failed to update category:', error);
    }
  };

  const handleDeleteClick = (category) => {
    setDeleteConfirm({
      show: true,
      categoryId: category._id,
      categoryName: category.name
    });
  };

  const handleDeleteConfirm = async () => {
    await dispatch(deleteCategory(deleteConfirm.categoryId));
    setDeleteConfirm({ show: false, categoryId: null, categoryName: '' });
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm({ show: false, categoryId: null, categoryName: '' });
  };

  if (isCategoriesLoading) {
    return <LoadingSpinner text="Loading categories..." />;
  }

  if (categoriesError) {
    return (
      <ErrorMessage 
        message={categoriesError} 
        onRetry={() => dispatch(fetchAllCategories())}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-[#1035ac] text-white rounded-md hover:bg-blue-900"
        >
          Create Category
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No categories found. Create your first category!</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <CategoryCard
              key={category._id}
              category={category}
              onEdit={() => setEditCategory(category)}
              onDelete={() => handleDeleteClick(category)}
              isDeleting={isCategoryDeleting}
            />
          ))}
        </div>
      )}

      {/* Create Category Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Category"
      >
        <CategoryForm
          onSubmit={handleCreateCategory}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>

      {/* Edit Category Modal */}
      <Modal
        isOpen={!!editCategory}
        onClose={() => setEditCategory(null)}
        title="Edit Category"
      >
        <CategoryForm
          category={editCategory}
          onSubmit={handleUpdateCategory}
          onCancel={() => setEditCategory(null)}
          isEdit
        />
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirm.show}
        title="Delete Category"
        message={`Are you sure you want to delete "${deleteConfirm.categoryName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        isLoading={isCategoryDeleting}
      />
    </div>
  );
};

export default CategoryList;