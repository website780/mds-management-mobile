import { View, Text, ScrollView, Image, Pressable, TextInput, FlatList, StyleSheet, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { Heart, MapPin, Wifi, Car, Utensils, Shield, Droplets } from 'lucide-react-native';

import { View, Text, Image, Pressable, TextInput, ScrollView, FlatList } from "react-native";
"use client"

import { Button } from "react-native-paper"
import { ChevronLeft, ChevronRight } from "lucide-react-native"


export default function Pagination({ currentPage, totalPages, onPageChange }) {
  const getVisiblePages = () => {
    const pages = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, "...", totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 2, totalPages - 1, totalPages)
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages)
      }
    }

    return pages
  }

  return (
    <View style={styles.container}>
      <Button
        variant="outline"
        size="sm"
        onPress={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        style={styles.container}
      >
        <ChevronLeft style={styles.container} />
        Previous
      </Button>

      <View style={styles.container}>
        {getVisiblePages().map((page, index) => (
          <View key={index}>
            {page === "..." ? (
              <Text style={styles.container}>...</Text>
            ) : (
              <Pressable 
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onPress={() => onPageChange(page)}
                className={`w-10 h-10 ${
                  currentPage === page ? "bg-[#1035ac] hover:bg-[#0d2a8f] text-white" : "hover:bg-gray-50 bg-[#3741511c] "
                }`}
              >
                {page}
              </Pressable>
            )}
          </View>
        ))}
      </View>

      <Button
        variant="outline"
        size="sm"
        onPress={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        style={styles.container}
      >
        Next
        <ChevronRight style={styles.container} />
      </Button>
    </View>
  )
}
