import ArticleCard from "./ArticleCard"

export default function ArticleGrid({ articles, isLoading = false }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-gray-300 h-32 rounded-t-lg"></div>
            <div className="p-3 bg-white rounded-b-lg border">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-4 bg-gray-300 rounded"></div>
                <div className="w-16 h-4 bg-gray-300 rounded"></div>
                <div className="w-16 h-4 bg-gray-300 rounded"></div>
              </div>
              <div className="w-full h-6 bg-gray-300 rounded mb-2"></div>
              <div className="w-3/4 h-4 bg-gray-300 rounded mb-4"></div>
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <div className="w-12 h-6 bg-gray-300 rounded-full"></div>
                  <div className="w-16 h-6 bg-gray-300 rounded-full"></div>
                </div>
                <div className="w-20 h-8 bg-gray-300 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (articles.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No articles found matching your criteria.</p>
        <p className="text-gray-400 text-sm mt-2">Try adjusting your search or filters.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {articles.map((article) => (
        <ArticleCard key={article._id || article.id} article={article} />
      ))}
    </div>
  )
}