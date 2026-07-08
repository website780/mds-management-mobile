"use client";
import { fetchCurrentUser } from "@/redux/features/auth/authSlice";
import { blogAPI } from "@/redux/features/blog/blogAPI";
import {
    createBlog,
    fetchAllCategories,
    fetchBlogBySlug,
    updateBlog,
} from "@/redux/features/blog/blogSlice";
import { useParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import React, { lazy, Suspense } from 'react';

const RichTextEditor = lazy(() => import("../../../../components/blogs/RichTextEditor"));

const BlogForm = ({ isEdit = false }) => {
  const dispatch = useDispatch();
  const navigate = useRouter();
  const { slug } = useParams();

  const { currentBlog, categories, isCreating, isUpdating, error } =
    useSelector((state) => state.blog);

  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  // Grab the JWT so RichTextEditor can attach it to Jodit's raw XHR uploads.
  // Tries state.auth.token first, then state.auth.user?.token as fallback.
  const authToken = useSelector((state) => state.auth?.token);

  console.log(authToken, "token in blogfrom");

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    seoTitle: "",
    seoDescription: "",
    image: "", // always an S3 URL by the time we submit
    tags: [],
    category: "",
    status: "draft",
  });

  // Separate state for the local preview URL (object URL, not stored in formData)
  const [imagePreview, setImagePreview] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  const [imageError, setImageError] = useState("");

  const [tagInput, setTagInput] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    dispatch(fetchAllCategories());
    if (isEdit && slug) {
      dispatch(fetchBlogBySlug(slug));
    }
  }, [dispatch, isEdit, slug]);

  useEffect(() => {
    if (isEdit && currentBlog && categories.length > 0) {
      let categoryId = "";
      if (currentBlog.category) {
        categoryId =
          typeof currentBlog.category === "object"
            ? currentBlog.category._id || currentBlog.category.id
            : currentBlog.category;
      }

      setFormData({
        title: currentBlog.title || "",
        content: currentBlog.content || "",
        seoTitle: currentBlog.seoTitle || "",
        seoDescription: currentBlog.seoDescription || "",
        image: currentBlog.image || "",
        tags: currentBlog.tags || [],
        category: categoryId,
        status: currentBlog.status || "draft",
      });

      // Show the existing S3 image as preview
      if (currentBlog.image) {
        setImagePreview(currentBlog.image);
      }
    }
  }, [isEdit, currentBlog, categories]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleContentChange = (content) => {
    setFormData((prev) => ({ ...prev, content: content || "" }));
  };

  /**
   * Upload the selected file to S3 immediately (before form submit).
   * This avoids sending a large base64 string over the wire on submit.
   */
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageError("");

    // Show a local object-URL preview instantly — no base64 conversion needed
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);

    try {
      setImageUploading(true);
      const s3Url = await blogAPI.uploadImage(file);
      setFormData((prev) => ({ ...prev, image: s3Url }));
    } catch (err) {
      setImageError("Image upload failed. Please try again.");
      setImagePreview("");
      console.error("Featured image upload error:", err);
    } finally {
      setImageUploading(false);
    }
  };

  const handleTagKeyPress = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, tag] }));
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tagToRemove),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Don't submit while the image is still uploading
    if (imageUploading) return;

    try {
      if (isEdit && currentBlog) {
        await dispatch(
          updateBlog({ id: currentBlog._id, blogData: formData }),
        ).unwrap();
      } else {
        await dispatch(createBlog(formData)).unwrap();
      }
      navigate.push("/admin/bloglist");
    } catch (err) {
      console.error("Failed to save blog:", err);
    }
  };

  const isLoading = isCreating || isUpdating;

  if (!mounted) {
    return <div className="max-w-4xl mx-auto p-6">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow-lg rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-900">
            {isEdit ? "Edit Blog" : "Create New Blog"}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter blog title..."
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content *
            </label>
             <Suspense fallback={<ActivityIndicator size="large" color="#0000ff" />}>
            <RichTextEditor
              value={formData.content}
              onChange={handleContentChange}
              height={500}
              placeholder="Start writing your blog content..."
              disabled={isLoading}
              authToken={authToken}
            />
            </Suspense>
          </div>

          {/* Featured Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Featured Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />

            {/* Upload progress indicator */}
            {imageUploading && (
              <div className="mt-2 flex items-center gap-2 text-sm text-blue-600">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                Uploading image to S3…
              </div>
            )}

            {/* Error */}
            {imageError && (
              <p className="mt-1 text-sm text-red-600">{imageError}</p>
            )}

            {/* Preview — uses local object URL, not base64 */}
            {imagePreview && !imageUploading && (
              <img
                src={imagePreview}
                alt="Preview"
                className="mt-2 h-32 w-auto object-cover rounded border border-gray-200"
              />
            )}

            {/* Show the stored S3 URL for confirmation */}
            {formData.image && !imageUploading && (
              <p className="mt-1 text-xs text-gray-400 truncate">
                Saved: {formData.image}
              </p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-2 text-blue-500 hover:text-blue-700"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleTagKeyPress}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Type a tag and press Enter"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add Tag
              </button>
            </div>
          </div>

          {/* SEO */}
          <div className="border-t pt-6 mt-6">
            <h3 className="text-lg font-medium mb-4">SEO Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Meta Title
                </label>
                <input
                  type="text"
                  name="seoTitle"
                  value={formData.seoTitle}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Search engine title..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Meta Description
                </label>
                <textarea
                  name="seoDescription"
                  value={formData.seoDescription}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows="3"
                  placeholder="Brief summary for search results..."
                />
              </div>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate.push("/admin/bloglist")}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || imageUploading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  {isEdit ? "Updating…" : "Creating…"}
                </div>
              ) : imageUploading ? (
                "Uploading image…"
              ) : isEdit ? (
                "Update Blog"
              ) : (
                "Create Blog"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BlogForm;
