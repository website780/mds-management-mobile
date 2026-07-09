"use client"

export default function PopularTags({ tags, selectedTag, onTagChange }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Popular Tags</h3>
      <div className="flex flex-wrap gap-2">
        {tags.slice(0, 9).map((tag) => (
          <button
            key={tag}
            onClick={() => onTagChange(tag)}
            className={`text-sm transition-colors ${
              selectedTag === tag
                ? "bg-[#1035ac] text-white border-[#1035ac] py-2 px-3 rounded-full hover:bg-[#0d2a8f]"
                : "border-gray-200 text-gray-600 bg-[#3741511c] py-2 px-3 rounded-full hover:border-[#1035ac] hover:text-[#1035ac]"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  )
}