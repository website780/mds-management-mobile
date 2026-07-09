import { View, Text, ScrollView, Image, Pressable, TextInput, FlatList, StyleSheet, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { Heart, MapPin, Wifi, Car, Utensils, Shield, Droplets } from 'lucide-react-native';

import { View, Text, Image, Pressable, TextInput, ScrollView, FlatList } from "react-native";
"use client"

import { Search, X } from "lucide-react-native"
import { Input } from "react-native-paper"

export default function SearchBar({ 
  searchQuery, 
  setSearchQuery, 
  totalResults, 
  onSearchChange, 
  isSearching = false 
}) {
  const handleSearchChange = (value) => {
    setSearchQuery(value)
    // Don't call onSearchChange immediately - let debounce handle it
  }

  const handleClearSearch = () => {
    setSearchQuery("")
  }

  return (
    <View style={styles.container}>
      <View style={styles.container}>
        <View style={styles.container}>
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
            isSearching ? 'text-[#1035ac] animate-pulse' : 'text-gray-400'
          }`} />
          
          <TextInput type="text"
            placeholder="Search articles"
            value={searchQuery}
            onChangeText={(e) => handleSearchChange(e.target.value)}
            style={styles.container}
          />
          
          {searchQuery && (
            <Pressable 
              onPress={handleClearSearch}
              style={styles.container}
            >
              <X style={styles.container} />
            </Pressable>
          )}
          
          {isSearching && (
            <View style={styles.container}>
              <View style={styles.container}></View>
            </View>
          )}
        </View>
        
        <View style={styles.container}>
          {isSearching ? (
            <Text style={styles.container}>Searching...</Text>
          ) : (
            <span>Showing {totalResults} articles</Text>
          )}
        </View>
      </View>
      
      {searchQuery && !isSearching && (
        <View style={styles.container}>
          Search results for: <Text style={styles.container}>"{searchQuery}"</Text>
        </View>
      )}
    </View>
  )
}