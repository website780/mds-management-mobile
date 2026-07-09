import FeaturedArticle from "./FeaturedArticle";

export default function Header({ featuredArticle }) {
  return (
    <>
      <header className="bg-[#1035ac] relative text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Spiritual Travel Blogs & Sacred Journeys
          </h1>
          <p className="text-xl mb-8 text-blue-100">
            Discover sacred places, travel wisdom, and inspiring stories from
            fellow pilgrims
          </p>

          {/* <div className="flex justify-center items-center gap-8 md:gap-12">
          <div className="flex items-center gap-2">
            <MapPin className="w-6 h-6 text-red-400" />
            <span className="text-sm md:text-base">Sacred Destinations</span>
          </div>
          <div className="flex items-center gap-2">
            <Plane className="w-6 h-6 text-blue-300" />
            <span className="text-sm md:text-base">Travel Tips</span>
          </div>
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-yellow-400" />
            <span className="text-sm md:text-base">Inspiring Stories</span>
          </div>
        </div> */}
        </div>
      </header>
      <div className=" flex ">
        <div className=" relative bottom-10 mx-auto rounded-3xl  bg-white">
          {featuredArticle && <FeaturedArticle article={featuredArticle} />}
        </div>
      </div>
    </>
  );
}
