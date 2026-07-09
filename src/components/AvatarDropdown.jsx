import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, Modal, Pressable } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "expo-router";
import { User } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Make sure this is installed
import { logoutUser } from "@/redux/features/auth/authSlice";
import {
  FavouriteIcon,
  Logout03Icon,
  Task01Icon,
  UserSharingIcon,
} from "../components/Icons";

export default function AvatarDropdown() {
  const { isAuthenticated, isLoading, user } = useSelector(
    (state) => state.auth
  );
  
  const dispatch = useDispatch();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      // Clear React Native storage instead of cookies
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("authToken");
      await AsyncStorage.removeItem("jwt");

      // Dispatch logout action
      await dispatch(logoutUser());

      // Close modal
      setIsOpen(false);

      // Navigate to login page
      router.replace("/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Fallback: still redirect even if there's an error
      router.replace("/login");
    }
  };

  const handleNavigation = (path) => {
    setIsOpen(false);
    router.push(path);
  };

  // If not authenticated, show login button
  if (!isAuthenticated && isLoading) {
    return (
      <TouchableOpacity 
        onPress={() => router.push("/login")} 
        className="flex-row items-center justify-center"
      >
        <View className="overflow-hidden rounded-full border-2 border-white">
          <Image
            className="w-10 h-10"
            source={{
              uri: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
            }}
          />
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View className="relative z-50">
      {/* Dropdown Trigger */}
      <TouchableOpacity 
        className="items-center justify-center self-center"
        onPress={() => setIsOpen(true)}
      >
        <View className="w-10 h-10 rounded-full overflow-hidden bg-[#1035ac] items-center justify-center border-2 border-white">
          {user?.profilePhoto ? (
            <Image
              source={{ uri: user.profilePhoto }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <User className="w-5 h-5 text-white" strokeWidth={1.5} />
          )}
        </View>
      </TouchableOpacity>

      {/* Dropdown Menu Modal */}
      <Modal
        visible={isOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        {/* Invisible Overlay to capture outside clicks */}
        <Pressable 
          className="flex-1" 
          onPress={() => setIsOpen(false)} 
        />

        {/* Dropdown Content */}
        <View className="absolute top-16 right-4 w-64 bg-white rounded-3xl shadow-lg shadow-black/10 elevation-5">
          <View className="px-6 py-7">
            {/* Header / User Info */}
            <View className="flex-row items-center mb-4">
              <View className="w-12 h-12 rounded-full overflow-hidden bg-[#1035ac]">
                {user?.profilePhoto ? (
                  <Image
                    source={{ uri: user.profilePhoto }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="w-full h-full items-center justify-center">
                    <User className="w-5 h-5 text-white" strokeWidth={1.5} />
                  </View>
                )}
              </View>

              <View className="ml-3 flex-1">
                <Text className="font-semibold text-base text-gray-900">
                  {user?.name || "User"}
                </Text>
                <Text className="mt-0.5 text-xs text-gray-500" numberOfLines={1}>
                  {user?.email || ""}
                </Text>
              </View>
            </View>

            <View className="w-full border-b border-neutral-200 mb-2" />

            {/* Menu Items */}
            <TouchableOpacity
              onPress={() => handleNavigation("/account")}
              className="flex-row items-center rounded-lg p-3 hover:bg-neutral-100 active:bg-neutral-200"
            >
              <View className="items-center justify-center text-neutral-500 w-6">
                <UserSharingIcon />
              </View>
              <Text className="ml-4 text-sm font-medium text-gray-800">My Account</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleNavigation("/my-bookings")}
              className="flex-row items-center rounded-lg p-3 hover:bg-neutral-100 active:bg-neutral-200"
            >
              <View className="items-center justify-center text-neutral-500 w-6">
                <Task01Icon />
              </View>
              <Text className="ml-4 text-sm font-medium text-gray-800">My bookings</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleNavigation("/account-savelists")}
              className="flex-row items-center rounded-lg p-3 hover:bg-neutral-100 active:bg-neutral-200"
            >
              <View className="items-center justify-center text-neutral-500 w-6">
                <FavouriteIcon />
              </View>
              <Text className="ml-4 text-sm font-medium text-gray-800">Wishlist</Text>
            </TouchableOpacity>

            <View className="w-full border-b border-neutral-200 my-2" />

            <TouchableOpacity
              onPress={handleLogout}
              className="flex-row items-center rounded-lg p-3 hover:bg-neutral-100 active:bg-neutral-200"
            >
              <View className="items-center justify-center text-neutral-500 w-6">
                <Logout03Icon />
              </View>
              <Text className="ml-4 text-sm font-medium text-red-500">Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}