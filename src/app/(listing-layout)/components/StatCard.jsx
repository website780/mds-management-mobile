import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function StatCard({ title, value, icon, trend }) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
      </View>

      <Text style={styles.value}>{value}</Text>

      {trend && (
        <View style={styles.trendContainer}>
          <Text style={[styles.trendText, trend.isUp ? styles.trendUp : styles.trendDown]}>
            {trend.isUp ? '↑' : '↓'} {trend.value}% {trend.text}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    padding: 16, // p-4
    borderRadius: 8, // rounded-lg
    borderWidth: 1, // border
    borderColor: '#e5e7eb',
    // Mobile requires specific shadow properties instead of just 'shadow-sm'
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2, // Required for Android shadows
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 14, // text-sm
    fontWeight: '500', // font-medium
    color: '#6b7280', // text-gray-500
  },
  iconContainer: {
    padding: 8, // p-2
    backgroundColor: 'rgba(16, 53, 172, 0.1)', // bg-[#1035ac]/10
    borderRadius: 50, // rounded-full
  },
  value: {
    marginTop: 8, // mt-2
    fontSize: 24, // text-2xl
    fontWeight: 'bold', // font-bold
    color: '#1035ac', // text-[#1035ac]
  },
  trendContainer: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendText: {
    fontSize: 12, // text-xs
  },
  trendUp: {
    color: '#16a34a', // text-green-600
  },
  trendDown: {
    color: '#dc2626', // text-red-600
  }
});