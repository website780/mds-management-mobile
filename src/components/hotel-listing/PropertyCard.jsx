import { View, Text, ScrollView, Image, Pressable, TextInput, FlatList, StyleSheet, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { Heart, MapPin, Wifi, Car, Utensils, Shield, Droplets } from 'lucide-react-native';

import { View, Text, Image, Pressable, TextInput, ScrollView, FlatList } from "react-native";
// components/PropertyCard.jsx
import {
    checkWishlistStatus,
    selectIsActionLoading,
    selectIsInWishlist,
    toggleWishlist,
} from "@/redux/features/wishlist/wishlistSlice";
import { Button } from "react-native-paper";
import { useRouter, Link } from "expo-router";
import {
    Car,
    Droplets,
    Heart,
    MapPin,
    Shield,
    Utensils,
    Wifi,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import { toast } from "@backpackapp-io/react-native-toast";
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
        return <Wifi style={styles.container} />;
      case "parking":
        return <Car style={styles.container} />;
      case "meals":
        return <Utensils style={styles.container} />;
      case "security":
        return <Shield style={styles.container} />;
      case "hot water":
        return <Droplets style={styles.container} />;
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
        Toast.success("Added to wishlist!");
      } else {
        Toast.success("Removed from wishlist!");
      }
    } catch (error) {
      Toast.error(error || "Failed to update wishlist");
    }
  };

  const currentImage = images[currentImageIndex];
  const imageUrl = currentImage ? `${currentImage.url}` : null;
  const thumbnailImages = images.slice(0, 4);
  const hasMoreImages = images.length > 4;

  return (
    <Link href={`/hotel-details/${slug}`} style={styles.container}>
      <View style={styles.container}>
        <View style={styles.container}>
          {/* ── Mobile Layout ─────────────────────────────────────── */}
          <View style={styles.container}>
            <View style={styles.container}>
              {verified && (
                <View style={styles.container}>
                  <Text style={styles.container}>✓</Text> Verified
                </View>
              )}

              {/* ✅ Wishlist button - stopPropagation prevents Link navigation */}
              <Pressable 
                onPress={handleWishlistToggle}
                disabled={isActionLoading}
                style={styles.container}
              >
                <Heart
                  className={`w-5 h-5 transition-all ${
                    isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"
                  } ${isActionLoading ? "animate-pulse" : ""}`}
                />
              </Pressable>

              <View style={styles.container}>
                {imageUrl ? (
                  <Image 
                    src={imageUrl}
                    alt={currentImage.filename || name}
                    style={styles.container}
                  />
                ) : (
                  <View style={styles.container}>
                    <View style={styles.container}>
                      <View style={styles.container}>
                        <Text style={styles.container}>🏨</Text>
                      </View>
                      <View style={styles.container}>
                        Hotel Image
                      </View>
                    </View>
                  </View>
                )}
                {images.length > 0 && (
                  <View style={styles.container}>
                    {currentImageIndex + 1} / {images.length}
                  </View>
                )}
              </View>
            </View>

            <View style={styles.container}>
              <Text style={styles.container}>
                {name}
              </Text>
              <View style={styles.container}>
                <MapPin style={styles.container} />
                <p>{location}</Text>
              </View>

              <View style={styles.container}>
                {amenities.slice(0, 4).map((amenity) => (
                  <View 
                    key={amenity}
                    style={styles.container}
                  >
                    {getAmenityIcon(amenity)}
                    <span>{amenity}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.container}>
                <div>
                  <View style={styles.container}>
                    Starting from
                  </View>
                  <View style={styles.container}>
                    ₹{Math.round(price * 1.2).toLocaleString()}
                  </View>
                  <View style={styles.container}>
                    ₹{price.toLocaleString()}
                  </View>
                  <View style={styles.container}>per night</View>
                </View>
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
              </View>
            </View>
          </View>

          {/* ── Desktop Layout ────────────────────────────────────── */}
          <View style={styles.container}>
            <View style={styles.container}>
              {verified && (
                <View style={styles.container}>
                  <Text style={styles.container}>✓</Text> Verified
                </View>
              )}

              {/* ✅ Wishlist button */}
              <Pressable 
                onPress={handleWishlistToggle}
                disabled={isActionLoading}
                style={styles.container}
              >
                <Heart
                  className={`w-5 h-5 transition-all ${
                    isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"
                  } ${isActionLoading ? "animate-pulse" : ""}`}
                />
              </Pressable>

              <View style={styles.container}>
                {imageUrl ? (
                  <Image 
                    src={imageUrl}
                    alt={currentImage.filename || name}
                    style={styles.container}
                  />
                ) : (
                  <View style={styles.container}>
                    <View style={styles.container}>
                      <View style={styles.container}>
                        <Text style={styles.container}>🏨</Text>
                      </View>
                      <View style={styles.container}>
                        Hotel Image
                      </View>
                    </View>
                  </View>
                )}
              </View>

              {/* ✅ Thumbnails - stopPropagation prevents Link navigation */}
              {thumbnailImages.length > 0 && (
                <View style={styles.container}>
                  {thumbnailImages.map((image, index) => {
                    const thumbUrl = `${image.url}`;
                    const isLast = index === 3 && hasMoreImages;
                    return (
                      <View 
                        key={index}
                        className={`w-16 h-16 relative cursor-pointer overflow-hidden rounded-lg ${
                          index === currentImageIndex
                            ? "ring-2 ring-blue-500 ring-offset-2"
                            : ""
                        } hover:scale-105 transition-all duration-300 shadow-md`}
                        onPress={(e) => handleThumbnailClick(e, index)}
                      >
                        <Image 
                          src={thumbUrl}
                          alt={image.filename || `${name} ${index + 1}`}
                          style={styles.container}
                        />
                        {isLast && (
                          <View style={styles.container}>
                            <View style={styles.container}>
                              <View style={styles.container}>
                                +{images.length - 4}
                              </View>
                              <View style={styles.container}>more</View>
                            </View>
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              )}
            </View>

            {/* Desktop Content */}
            <View style={styles.container}>
              <View style={styles.container}>
                <View style={styles.container}>
                  <Text style={styles.container}>
                    {name}
                  </Text>
                  <View style={styles.container}>
                    <MapPin style={styles.container} />
                    <Text style={styles.container}>{location}</Text>
                  </View>
                  <View style={styles.container}>
                    {amenities.slice(0, 6).map((amenity) => (
                      <View 
                        key={amenity}
                        style={styles.container}
                      >
                        {getAmenityIcon(amenity)}
                        <span>{amenity}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                <View style={styles.container}>
                  <div>
                    <View style={styles.container}>
                      Starting from
                    </View>
                    <View style={styles.container}>
                      ₹{Math.round(price * 1.2).toLocaleString()}
                    </View>
                    <View style={styles.container}>
                      ₹{price.toLocaleString()}
                    </View>
                    <View style={styles.container}>per night</View>
                  </View>
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
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>
    </Link>
  );
}
