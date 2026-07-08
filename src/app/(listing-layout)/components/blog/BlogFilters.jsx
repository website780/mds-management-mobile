import { fetchAllCategories } from "@/redux/features/blog/blogSlice";
import { useEffect } from "react";
import { MagnifyingGlassIcon } from "react-native-heroicons/outline";
import { useDispatch, useSelector } from "react-redux";

const BlogFilters = ({ filters, onFilterChange }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchAllCategories());
  }, [dispatch]);

  const { categories } = useSelector((state) => state.blog);

  const handleInputChange = (field, value) => {
    onFilterChange({ [field]: value, page: 1 });
  };

  const handleReset = () => {
    onFilterChange({
      page: 1,
      limit: 10,
      category: "",
      status: "",
      tag: "",
      search: "",
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search
          </label>
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search blogs..."
              value={filters.search}
              onChange={(e) => handleInputChange("search", e.target.value)}
              className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => handleInputChange("status", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            value={filters.category}
            onChange={(e) => handleInputChange("category", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Tag Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tag
          </label>
          <input
            type="text"
            placeholder="Filter by tag..."
            value={filters.tag}
            onChange={(e) => handleInputChange("tag", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
        <button
          onClick={handleReset}
          className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
        >
          Reset Filters
        </button>

        <div className="text-sm text-gray-500">
          Showing {filters.limit} per page
        </div>
      </div>
    </div>
  );
};

export default BlogFilters;
