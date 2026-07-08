import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

const CategoryForm = ({ category, onSubmit, onCancel, isEdit = false }) => {
  const { isCategoryCreating, isCategoryUpdating, categoryError } = useSelector(state => state.blog);
  
  const [formData, setFormData] = useState({
    name: ''
  });

  useEffect(() => {
    if (isEdit && category) {
      setFormData({
        name: category.name || ''
      });
    }
  }, [isEdit, category]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isLoading = isCategoryCreating || isCategoryUpdating;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {categoryError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">{categoryError}</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category Name *
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter category name..."
        />
        <p className="mt-1 text-sm text-gray-500">
          The slug will be automatically generated from the name.
        </p>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              {isEdit ? 'Updating...' : 'Creating...'}
            </div>
          ) : (
            isEdit ? 'Update Category' : 'Create Category'
          )}
        </button>
      </div>
    </form>
  );
};

export default CategoryForm;