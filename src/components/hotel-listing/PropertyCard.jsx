// components/PropertyCard.jsx
import {
    checkWishlistStatus,
    selectIsActionLoading,
    selectIsInWishlist,
    toggleWishlist,
} from "@/redux/features/wishlist/wishlistSlice";
import { Button } from "@mui/material";
import Link, { useRouter } from "expo-router";
import {
    Car,
    Droplets,
    Heart,
    MapPin,
    Shield,
    Utensils,
    Wifi,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";

export function PropertyCard({
  id,
  slug,
  name,
  location,
  rating,
  reviews,
  price,
  verified,
  distance,
  amenities,
  tags,
  images = [],
  languagesSpoken = [],
  landline,
}) {
  const dispatch = useDispatch();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const isWishlisted = useSelector(selectIsInWishlist(id));
  const isActionLoading = useSelector(selectIsActionLoading(id));
  const router = useRouter();
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    dispatch(checkWishlistStatus(id));
  }, [dispatch, id]);

  const getAmenityIcon = (amenity) => {
    switch (amenity.toLowerCase()) {
      case "wifi":
        return <Wifi className="w-4 h-4" />;
      case "parking":
        return <Car className="w-4 h-4" />;
      case "meals":
        return <Utensils className="w-4 h-4" />;
      case "security":
        return <Shield className="w-4 h-4" />;
      case "hot water":
        return <Droplets className="w-4 h-4" />;
      default:
        return null;
    }
  };

  // ✅ FIX: Stop propagation so thumbnail clicks don't trigger the Link
  const handleThumbnailClick = (e, index) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex(index);
  };

  // ✅ FIX: Stop propagation so wishlist clicks don't trigger the Link
  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const result = await dispatch(toggleWishlist(id)).unwrap();
      if (result.data.action === "added") {
        toast.success("Added to wishlist!");
      } else {
        toast.success("Removed from wishlist!");
      }
    } catch (error) {
      toast.error(error || "Failed to update wishlist");
    }
  };

  const currentImage = images[currentImageIndex];
  const imageUrl = currentImage ? `${currentImage.url}` : null;
  const thumbnailImages = images.slice(0, 4);
  const hasMoreImages = images.length > 4;

  return (
    <Link href={`/hotel-details/${slug}`} className="block">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-blue-200 group">
        <div className="flex flex-col">
          {/* ── Mobile Layout ─────────────────────────────────────── */}
          <div className="md:hidden">
            <div className="relative w-full">
              {verified && (
                <div className="absolute top-3 left-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 z-5 shadow-lg">
                  <span className="text-sm">✓</span> Verified
                </div>
              )}

              {/* ✅ Wishlist button - stopPropagation prevents Link navigation */}
              <button
                onClick={handleWishlistToggle}
                disabled={isActionLoading}
                className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full z-10 shadow-lg hover:scale-110 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Heart
                  className={`w-5 h-5 transition-all ${
                    isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"
                  } ${isActionLoading ? "animate-pulse" : ""}`}
                />
              </button>

              <div className="h-56 relative overflow-hidden">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={currentImage.filename || name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg">
                        <span className="text-3xl">🏨</span>
                      </div>
                      <div className="text-sm text-gray-500 font-medium">
                        Hotel Image
                      </div>
                    </div>
                  </div>
                )}
                {images.length > 0 && (
                  <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium">
                    {currentImageIndex + 1} / {images.length}
                  </div>
                )}
              </div>
            </div>

            <div className="p-5">
              <h3 className="text-xl font-bold mb-1 text-gray-900 group-hover:text-blue-600 transition-colors">
                {name}
              </h3>
              <div className="flex items-center gap-1 text-gray-600 text-sm mb-3">
                <MapPin className="w-4 h-4 text-red-500" />
                <p>{location}</p>
              </div>

              <div className="flex flex-wrap gap-2 mb-5">
                {amenities.slice(0, 4).map((amenity) => (
                  <div
                    key={amenity}
                    className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 px-3 py-1.5 rounded-lg text-xs font-medium text-blue-700 flex items-center gap-1"
                  >
                    {getAmenityIcon(amenity)}
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <div>
                  <div className="text-xs text-gray-500 mb-1">
                    Starting from
                  </div>
                  <div className="text-sm text-gray-400 line-through">
                    ₹{Math.round(price * 1.2).toLocaleString()}
                  </div>
                  <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    ₹{price.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">per night</div>
                </div>
                {/* ✅ Inner <a> removed – outer Link handles navigation */}
                <Button
                  variant="contained"
                  sx={{
                    background:
                      "linear-gradient(135deg, #1035ac 0%, #7c3aed 100%)",
                    color: "white",
                    textTransform: "none",
                    borderRadius: "12px",
                    px: 3,
                    py: 1.5,
                    fontWeight: 600,
                    fontSize: "14px",
                    boxShadow: "0 4px 12px rgba(16, 53, 172, 0.3)",
                    "&:hover": {
                      background:
                        "linear-gradient(135deg, #0d2d8f 0%, #6d28d9 100%)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 6px 16px rgba(16, 53, 172, 0.4)",
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  View Details
                </Button>
              </div>
            </div>
          </div>

          {/* ── Desktop Layout ────────────────────────────────────── */}
          <div className="hidden md:flex">
            <div className="relative w-80 bg-gray-200 flex-shrink-0">
              {verified && (
                <div className="absolute top-3 left-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 z-2 shadow-lg">
                  <span className="text-sm">✓</span> Verified
                </div>
              )}

              {/* ✅ Wishlist button */}
              <button
                onClick={handleWishlistToggle}
                disabled={isActionLoading}
                className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full z-2 shadow-lg hover:scale-110 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Heart
                  className={`w-5 h-5 transition-all ${
                    isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"
                  } ${isActionLoading ? "animate-pulse" : ""}`}
                />
              </button>

              <div className="h-52 relative overflow-hidden rounded-tl-2xl">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={currentImage.filename || name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-blue-100 to-purple-100">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg">
                        <span className="text-3xl">🏨</span>
                      </div>
                      <div className="text-sm text-gray-500 font-medium">
                        Hotel Image
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ✅ Thumbnails - stopPropagation prevents Link navigation */}
              {thumbnailImages.length > 0 && (
                <div className="flex gap-1.5 p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-bl-2xl">
                  {thumbnailImages.map((image, index) => {
                    const thumbUrl = `${image.url}`;
                    const isLast = index === 3 && hasMoreImages;
                    return (
                      <div
                        key={index}
                        className={`w-16 h-16 relative cursor-pointer overflow-hidden rounded-lg ${
                          index === currentImageIndex
                            ? "ring-2 ring-blue-500 ring-offset-2"
                            : ""
                        } hover:scale-105 transition-all duration-300 shadow-md`}
                        onClick={(e) => handleThumbnailClick(e, index)}
                      >
                        <img
                          src={thumbUrl}
                          alt={image.filename || `${name} ${index + 1}`}
                          className="w-full h-full object-cover hover:brightness-110 transition-all"
                        />
                        {isLast && (
                          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                            <div className="text-white text-xs font-bold text-center">
                              <div className="text-base">
                                +{images.length - 4}
                              </div>
                              <div className="text-[10px]">more</div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Desktop Content */}
            <div className="flex-1 p-6">
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 h-full">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-1 text-gray-900 group-hover:text-blue-600 transition-colors">
                    {name}
                  </h3>
                  <div className="flex items-center gap-1 text-gray-600 mb-4">
                    <MapPin className="w-4 h-4 text-red-500" />
                    <p className="font-medium">{location}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {amenities.slice(0, 6).map((amenity) => (
                      <div
                        key={amenity}
                        className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 px-3 py-1.5 rounded-lg text-xs font-medium text-blue-700 flex items-center gap-1"
                      >
                        {getAmenityIcon(amenity)}
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-right lg:ml-6 flex flex-col justify-between h-full">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">
                      Starting from
                    </div>
                    <div className="text-sm text-gray-400 line-through mb-1">
                      ₹{Math.round(price * 1.2).toLocaleString()}
                    </div>
                    <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1">
                      ₹{price.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500 mb-1">per night</div>
                  </div>
                  <Button
                    sx={{
                      background:
                        "linear-gradient(135deg, #1035ac 0%, #7c3aed 100%)",
                      color: "white",
                      textTransform: "none",
                      borderRadius: "12px",
                      px: 4,
                      py: 1.5,
                      fontSize: "15px",
                      fontWeight: 600,
                      boxShadow: "0 4px 12px rgba(16, 53, 172, 0.3)",
                      "&:hover": {
                        background:
                          "linear-gradient(135deg, #0d2d8f 0%, #6d28d9 100%)",
                        transform: "translateY(-2px)",
                        boxShadow: "0 6px 16px rgba(16, 53, 172, 0.4)",
                      },
                      transition: "all 0.3s ease",
                      width: "100%",
                    }}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
