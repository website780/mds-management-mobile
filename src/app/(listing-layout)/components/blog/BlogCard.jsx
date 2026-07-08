import Link from "expo-router";
import {
  CalendarIcon,
  ClockIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
} from "react-native-heroicons/outline";

const BlogCard = ({ blog, onDelete, isDeleting }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status) => {
    return status === "published"
      ? "bg-green-100 text-green-800"
      : "bg-yellow-100 text-yellow-800";
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* {blog.image && (
        <img
          src={blog.image}
          alt={blog.title}
          className="w-full h-48 object-cover"
        />
      )} */}

      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(blog.status)}`}
          >
            {blog.status}
          </span>
          <div className="flex items-center text-sm text-gray-500">
            <CalendarIcon className="w-4 h-4 mr-1" />
            {formatDate(blog.createdAt)}
          </div>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {blog.title}
        </h3>

        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {blog.content.replace(/<[^>]*>/g, "").substring(0, 150)}...
        </p>

        {blog.tags && blog.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {blog.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
            {blog.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{blog.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center">
            <EyeIcon className="w-4 h-4 mr-1" />
            {blog.views} views
          </div>
          <div className="flex items-center">
            <ClockIcon className="w-4 h-4 mr-1" />
            {blog.readTime} min read
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Link
            href={`/host/edit-blog/${blog.slug}`}
            className="flex items-center px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            <PencilIcon className="w-4 h-4 mr-1" />
            Edit
          </Link>

          <button
            onClick={onDelete}
            disabled={isDeleting}
            className="flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:text-red-500 disabled:opacity-50"
          >
            <TrashIcon className="w-4 h-4 mr-1" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlogCard;
