"use client"

import { useSelector } from "react-redux"

export default function CategoryFilter({
  selectedCategory,
  onCategoryChange,
  totalResults = 0,
  isLoading = false,
  error = null,
}) {
  const getCategoryIcon = (category) => {
    switch (category) {
      case "All Articles":
        return "📚"
      case "Spiritual Places":
        return "🕉️"
      case "Travel Tips":
        return "✈️"
      case "Partner Stories":
        return "🤝"
      default:
        return "📄"
    }
  }


const { categories} = useSelector(state => state.blog)



  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Browse by Category</h3>
        <div className="text-red-500 text-center py-4">
          <p>Error loading categories: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Browse by Category</h3>
      
      {isLoading ? (
        <div className="flex flex-wrap gap-3">
          {[...Array(4)].map((_, index) => (
            <div key={index+1} className="animate-pulse">
              <div className="h-12 w-32 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap gap-3">
           <button
              onClick={() => onCategoryChange("All Articles")}
              className={`flex items-center gap-2 transition-colors ${
                selectedCategory === "All Articles"
                  ? "bg-[#1035ac] hover:bg-[#0d2a8f] rounded-lg py-3 px-5 text-white"
                  : "border-gray-200 bg-[#3741511c] py-3 px-5 rounded-lg hover:border-[#1035ac] hover:text-[#1035ac]"
              }`}
            >
              {/* <span>{getCategoryIcon("All Articles")}</span> */}
              <span>{"All Articles"}</span>
              {selectedCategory === "All Articles" && (
                <span className="text-xs px-2 py-1 rounded-full bg-white/20 text-white">
                  {totalResults}
                </span>
              )}
            </button>
          {/* {categories?.map((category) => (
            
            <button
              key={category?._id}
              onClick={() => onCategoryChange(category?._id)}
              className={`flex items-center gap-2 transition-colors ${
                selectedCategory === category?._id
                  ? "bg-[#1035ac] hover:bg-[#0d2a8f] rounded-lg py-3 px-5 text-white"
                  : "border-gray-200 bg-[#3741511c] py-3 px-5 rounded-lg hover:border-[#1035ac] hover:text-[#1035ac]"
              }`}
            >
              <span>{getCategoryIcon(category?.name)}</span>
              <span>{category?.name}</span>
              {selectedCategory === category?.name && (
                <span className="text-xs px-2 py-1 rounded-full bg-white/20 text-white">
                  {totalResults}
                </span>
              )}
            </button>
          ))} */}
        </div>
      )}
    </div>
  )
}