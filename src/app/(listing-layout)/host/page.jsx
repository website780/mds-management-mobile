import React, { useEffect, useState } from "react";
import { 
  View, 
  ScrollView, 
  StyleSheet, 
  Dimensions, 
  ActivityIndicator 
} from "react-native";
import { 
  Text, 
  Card, 
  Button, 
  useTheme 
} from "react-native-paper";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BarChart, PieChart, LineChart } from "react-native-gifted-charts";
import { ArrowUp, ArrowDown, RefreshCw } from "lucide-react-native";
import { useRouter, Link } from "expo-router";
import { useDispatch, useSelector } from "react-redux";

// Redux imports (assuming these paths remain identical)
import { getAllProperties } from "@/redux/features/property/propertySlice";
import {
  clearError,
  fetchDashboardStats,
  fetchRecentBookings,
  refreshAllDashboardData,
  selectDashboardError,
  selectDashboardLoading,
  selectLastUpdated,
  selectMetricCards,
  selectReservationTrend,
  selectRoomAvailability,
} from "@/redux/features/stats/dashboardSlice";

const screenWidth = Dimensions.get("window").width;

// ----------------------------------------------------
// Component for small metric cards (Sparklines)
// ----------------------------------------------------
const MetricCard = ({ data }) => {
  const renderChart = () => {
    // Format data for gifted-charts based on chart type
    if (!data.chartData || data.chartData.length === 0) return null;

    switch (data.chartType) {
      case "bar":
        const barData = data.chartData.map(item => ({ value: item.value, frontColor: "#FF9800" }));
        return (
          <BarChart
            data={barData}
            width={60}
            height={40}
            barWidth={8}
            hideRules
            hideYAxisText
            hideAxesAndRules
            initialSpacing={0}
          />
        );
      case "donut":
      case "pie":
        const pieData = data.chartData.map(item => ({ value: item.value, color: item.color || "#4CAF50" }));
        return (
          <PieChart
            data={pieData}
            radius={20}
            innerRadius={data.chartType === "donut" ? 12 : 0}
            backgroundColor="transparent"
          />
        );
      case "line":
        const lineData = data.chartData.map(item => ({ value: item.value }));
        return (
          <LineChart
            data={lineData}
            width={60}
            height={40}
            hideDataPoints
            hideRules
            hideYAxisText
            hideAxesAndRules
            color="#2196F3"
            thickness={2}
            initialSpacing={0}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Card style={styles.metricCard}>
      <Card.Content style={styles.metricCardContent}>
        <View style={styles.metricInfo}>
          <Text variant="bodySmall" style={styles.textSecondary}>
            {data.title}
          </Text>
          <Text variant="headlineSmall" style={styles.metricValue}>
            {data.value}
          </Text>
          <View style={styles.changeContainer}>
            {data.change > 0 ? (
              <ArrowUp size={16} color="#2e7d32" />
            ) : (
              <ArrowDown size={16} color="#d32f2f" />
            )}
            <Text
              variant="bodySmall"
              style={{
                color: data.change > 0 ? "#2e7d32" : "#d32f2f",
                fontWeight: "bold",
                marginLeft: 4,
              }}
            >
              {Math.abs(data.change)}%
            </Text>
          </View>
        </View>
        <View style={styles.chartContainer}>{renderChart()}</View>
      </Card.Content>
    </Card>
  );
};

// ----------------------------------------------------
// Main Dashboard Component
// ----------------------------------------------------
const HotelDashboard = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const theme = useTheme();

  // Redux selectors
  const metricCardsData = useSelector(selectMetricCards);
  const roomAvailabilityData = useSelector(selectRoomAvailability);
  const reservationData = useSelector(selectReservationTrend);
  const isLoading = useSelector(selectDashboardLoading);
  const error = useSelector(selectDashboardError);
  const lastUpdated = useSelector(selectLastUpdated);

  const { properties } = useSelector((state) => ({
    properties: state.property.properties,
  }));

  // Local state
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    dispatch(getAllProperties());
  }, [dispatch]);

  const availableProperties = properties?.filter((p) => p.status === "published") || [];

  // Automatic redirect
  useEffect(() => {
    let redirectTimer;
    if (properties && properties.length >= 0 && availableProperties.length === 0) {
      redirectTimer = setTimeout(() => {
        router.push("/host/properties");
      }, 1500);
    }
    return () => clearTimeout(redirectTimer);
  }, [properties, availableProperties.length, router]);

  // Load Initial Property using AsyncStorage (Mobile Native)
  useEffect(() => {
    const loadStoredProperty = async () => {
      try {
        const storedProperty = await AsyncStorage.getItem("selectedProperty");

        if (storedProperty) {
          const property = JSON.parse(storedProperty);
          setSelectedProperty(property);
          fetchDashboardData(property);
        } else if (properties && properties.length > 0) {
          const firstPublishedProperty = properties.find((p) => p.status === "published") || properties[0];
          setSelectedProperty(firstPublishedProperty);
          await AsyncStorage.setItem("selectedProperty", JSON.stringify(firstPublishedProperty));
          fetchDashboardData(firstPublishedProperty);
        }
      } catch (err) {
        console.error("Error loading selected property:", err);
      }
    };

    if (properties) {
      loadStoredProperty();
    }
  }, [properties]);

  const fetchDashboardData = (property) => {
    if (!property) return;
    const propertyId = property.id || property._id;
    dispatch(fetchDashboardStats({ propertyId }));
    dispatch(fetchRecentBookings({ propertyId, limit: 5 }));
  };

  const handlePropertyChange = async (propertyId) => {
    const property = properties.find((p) => (p.id || p._id) === propertyId);
    if (property) {
      setSelectedProperty(property);
      await AsyncStorage.setItem("selectedProperty", JSON.stringify(property));
      fetchDashboardData(property);
    }
  };

  const handleRefresh = async () => {
    if (!selectedProperty) return;
    setRefreshing(true);
    try {
      await dispatch(
        refreshAllDashboardData({
          propertyId: selectedProperty.id || selectedProperty._id,
        })
      ).unwrap();
    } catch (err) {
      console.error("Refresh failed:", err);
    } finally {
      setRefreshing(false);
    }
  };

  if (isLoading && !metricCardsData.length) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text variant="titleMedium" style={{ marginTop: 16 }}>
          Loading dashboard...
        </Text>
      </View>
    );
  }

  if (properties && !availableProperties.length) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" style={{ marginBottom: 16 }} />
        <Text variant="titleMedium" style={styles.textSecondary}>
          No published properties found.
        </Text>
        <Link href="/host/properties" asChild>
          <Button mode="contained" style={{ marginTop: 16 }}>Go to Properties</Button>
        </Link>
      </View>
    );
  }

  // Calculate room status percentages for horizontal bar
  const totalRooms = roomAvailabilityData?.total || 1;
  const roomStatusData = [
    { name: "Occupied", count: roomAvailabilityData?.occupied || 0, color: "#FF9800" },
    { name: "Reserved", count: roomAvailabilityData?.reserved || 0, color: "#FFB74D" },
    { name: "Available", count: roomAvailabilityData?.available || 0, color: "#C8E6C9" },
    { name: "Not Ready", count: roomAvailabilityData?.notReady || 0, color: "#E0E0E0" },
  ].map(status => ({
    ...status,
    percentage: (status.count / totalRooms) * 100
  }));

  // Format reservation data for Stacked Bar Chart
  const formattedReservationData = reservationData?.map((data) => ({
    label: data.date,
    stacks: [
      { value: data.booked || 0, color: "#673AB7", marginBottom: 2 },
      { value: data.cancelled || 0, color: "#FF9800" },
    ],
  })) || [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      
      {/* Header Area */}
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>Dashboard</Text>
        <View style={styles.headerActions}>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedProperty ? (selectedProperty.id || selectedProperty._id) : ""}
              onValueChange={handlePropertyChange}
              mode="dropdown"
            >
              {availableProperties.map((property) => (
                <Picker.Item
                  key={property.id || property._id}
                  label={`${property.placeName} (${property.location?.city})`}
                  value={property.id || property._id}
                />
              ))}
            </Picker>
          </View>

          <Button
            mode="outlined"
            onPress={handleRefresh}
            loading={refreshing}
            disabled={refreshing || !selectedProperty}
            icon={() => !refreshing && <RefreshCw size={16} color={theme.colors.primary} />}
          >
            Refresh
          </Button>
        </View>
      </View>

      {/* Selected Property Info */}
      {selectedProperty && (
        <Card style={styles.propertyCard}>
          <Card.Content style={styles.propertyCardContent}>
            <View>
              <Text variant="titleLarge" style={styles.boldText}>{selectedProperty.placeName}</Text>
              <Text variant="bodyMedium" style={styles.textSecondary}>
                {selectedProperty.propertyType} • {selectedProperty.location?.city}, {selectedProperty.location?.state}
              </Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text variant="bodySmall" style={styles.textSecondary}>Status</Text>
              <Text style={{
                color: selectedProperty.status === "published" ? "#2e7d32" : "#ed6c02",
                fontWeight: "bold",
                textTransform: "capitalize"
              }}>
                {selectedProperty.status}
              </Text>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Metrics Grid */}
      <View style={styles.gridContainer}>
        {metricCardsData.map((metric, index) => (
          <View key={index} style={styles.gridItem}>
            <MetricCard data={metric} />
          </View>
        ))}
      </View>

      {/* Room Availability Card */}
      <Card style={styles.chartCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.cardTitle}>Room Availability</Text>
          
          {/* Custom Horizontal Bar */}
          <View style={styles.horizontalBarContainer}>
            {roomStatusData.map((status, index) => (
              <View
                key={index}
                style={{
                  width: `${status.percentage}%`,
                  backgroundColor: status.color,
                  height: "100%",
                }}
              />
            ))}
          </View>

          {/* Status Labels */}
          <View style={styles.statusGrid}>
            {roomStatusData.map((status, index) => (
              <View key={index} style={styles.statusItem}>
                <Text variant="bodySmall" style={styles.textSecondary}>{status.name}</Text>
                <Text variant="titleMedium" style={styles.boldText}>{status.count}</Text>
              </View>
            ))}
          </View>
        </Card.Content>
      </Card>

      {/* Reservation Trend Stacked Bar Chart */}
      <Card style={styles.chartCard}>
        <Card.Content>
          <View style={styles.chartHeader}>
            <Text variant="titleMedium" style={styles.cardTitle}>Reservation Trend</Text>
            <View style={styles.legendContainer}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: "#673AB7" }]} />
                <Text variant="bodySmall">Booked</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: "#FF9800" }]} />
                <Text variant="bodySmall">Cancelled</Text>
              </View>
            </View>
          </View>

          <View style={styles.barChartWrapper}>
             <BarChart
                stackData={formattedReservationData}
                barWidth={18}
                spacing={24}
                roundedTop
                roundedBottom
                hideRules
                xAxisThickness={0}
                yAxisThickness={0}
                yAxisTextStyle={{ color: 'gray', fontSize: 10 }}
                noOfSections={4}
                width={screenWidth - 80} // Account for padding
              />
          </View>
        </Card.Content>
      </Card>

    </ScrollView>
  );
};

// ----------------------------------------------------
// Styles
// ----------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: Dimensions.get("window").height * 0.6,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontWeight: "bold",
    marginBottom: 16,
  },
  headerActions: {
    gap: 12,
  },
  pickerContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    overflow: "hidden",
  },
  propertyCard: {
    marginBottom: 20,
  },
  propertyCardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  gridItem: {
    width: "48%", // 2 items per row on mobile
    marginBottom: 16,
  },
  metricCard: {
    height: 100,
  },
  metricCardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 12,
  },
  metricInfo: {
    flex: 1,
  },
  metricValue: {
    fontWeight: "bold",
    marginVertical: 4,
  },
  changeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  chartContainer: {
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "flex-end",
  },
  chartCard: {
    marginBottom: 20,
  },
  cardTitle: {
    fontWeight: "bold",
    marginBottom: 16,
  },
  horizontalBarContainer: {
    flexDirection: "row",
    height: 40,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#f0f0f0",
    marginBottom: 20,
  },
  statusGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  statusItem: {
    width: "50%",
    marginBottom: 12,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  legendContainer: {
    flexDirection: "row",
    gap: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  barChartWrapper: {
    marginLeft: -10, // Slight adjustment to pull the chart left
  },
  boldText: {
    fontWeight: "bold",
  },
  textSecondary: {
    color: "#666",
  },
});

export default HotelDashboard;