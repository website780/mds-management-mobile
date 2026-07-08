"use client"
import { Box, Card, CardContent, Typography, Grid, CircularProgress, Alert, Button, FormControl, InputLabel, Select, MenuItem } from "@mui/material"
import { useState, useEffect } from "react"
import { useDispatch, useSelector } from 'react-redux'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Tooltip,
} from "recharts"
import { ArrowUpward, ArrowDownward, Refresh } from "@mui/icons-material"
import { clearError, fetchDashboardStats, fetchRecentBookings, refreshAllDashboardData, selectDashboardError, selectDashboardLoading, selectLastUpdated, selectMetricCards, selectReservationTrend, selectRoomAvailability } from "@/redux/features/stats/dashboardSlice"
import { getAllProperties } from "@/redux/features/property/propertySlice"


// Component for metric cards
const MetricCard = ({ data }) => {
  const renderChart = () => {
    switch (data.chartType) {
      case "bar":
        return (
          <ResponsiveContainer width="100%" height={60} style={{ overflow: "visible" }}>
            <BarChart data={data.chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <Tooltip
                cursor={{ fill: "rgba(255, 152, 0, 0.1)" }}
                wrapperStyle={{ zIndex: 1000 }}
                position={{ x: undefined, y: undefined }}
                allowEscapeViewBox={{ x: true, y: true }}
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #FF9800",
                  borderRadius: "8px",
                  fontSize: "12px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  padding: "8px 12px",
                  zIndex: 1000,
                }}
                labelStyle={{ color: "#FF9800", fontWeight: "bold" }}
              />
              <Bar dataKey="value" fill="#FF9800" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )
      case "donut":
        return (
          <ResponsiveContainer width="100%" height={60} style={{ overflow: "visible" }}>
            <PieChart margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <Tooltip
                cursor={false}
                wrapperStyle={{ zIndex: 1000 }}
                position={{ x: undefined, y: undefined }}
                allowEscapeViewBox={{ x: true, y: true }}
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #4CAF50",
                  borderRadius: "8px",
                  fontSize: "12px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  padding: "8px 12px",
                }}
                formatter={(value, name) => [value, name]}
              />
              <Pie data={data.chartData} cx="50%" cy="50%" innerRadius={15} outerRadius={25} dataKey="value">
                {data.chartData?.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke={entry.color}
                    strokeWidth={0}
                    style={{ filter: "drop-shadow(0 0 2px rgba(0,0,0,0.1))" }}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        )
      case "line":
        return (
          <ResponsiveContainer width="100%" height={60} style={{ overflow: "visible" }}>
            <LineChart data={data.chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <Tooltip
                cursor={{ stroke: "#2196F3", strokeWidth: 1, strokeDasharray: "3 3" }}
                wrapperStyle={{ zIndex: 1000 }}
                position={{ x: undefined, y: undefined }}
                allowEscapeViewBox={{ x: true, y: true }}
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #2196F3",
                  borderRadius: "8px",
                  fontSize: "12px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  padding: "8px 12px",
                }}
                labelStyle={{ color: "#2196F3", fontWeight: "bold" }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#2196F3"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: "#2196F3", stroke: "#fff", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )
      case "pie":
        return (
          <ResponsiveContainer width="100%" height={60} style={{ overflow: "visible" }}>
            <PieChart margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <Tooltip
                cursor={false}
                wrapperStyle={{ zIndex: 1000 }}
                position={{ x: undefined, y: undefined }}
                allowEscapeViewBox={{ x: true, y: true }}
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #4CAF50",
                  borderRadius: "8px",
                  fontSize: "12px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  padding: "8px 12px",
                }}
                formatter={(value, name) => [value, name]}
              />
              <Pie data={data.chartData} cx="50%" cy="50%" outerRadius={25} dataKey="value">
                {data.chartData?.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke={entry.color}
                    strokeWidth={0}
                    style={{ filter: "drop-shadow(0 0 2px rgba(0,0,0,0.1))" }}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        )
      default:
        return null
    }
  }

  return (
    <Card sx={{ height: "100%", overflow: "visible", position: "relative" }}>
      <CardContent sx={{ overflow: "visible" }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box flex={1}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {data.title}
            </Typography>
            <Typography variant="h4" component="div" fontWeight="bold">
              {data.value}
            </Typography>
            <Box display="flex" alignItems="center" mt={1}>
              {data.change > 0 ? (
                <ArrowUpward sx={{ fontSize: 16, color: "success.main" }} />
              ) : (
                <ArrowDownward sx={{ fontSize: 16, color: "error.main" }} />
              )}
              <Typography variant="body2" color={data.change > 0 ? "success.main" : "error.main"} fontWeight="medium">
                {Math.abs(data.change)}%
              </Typography>
            </Box>
          </Box>
          <Box width={80} height={60} sx={{ position: "relative", overflow: "visible" }}>
            {renderChart()}
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

// Main Dashboard Component
const HotelDashboard = () => {
  const dispatch = useDispatch();
  
  // Redux selectors
  const metricCardsData = useSelector(selectMetricCards);
  const roomAvailabilityData = useSelector(selectRoomAvailability);
  const reservationData = useSelector(selectReservationTrend);
  const isLoading = useSelector(selectDashboardLoading);
  const error = useSelector(selectDashboardError);
  const lastUpdated = useSelector(selectLastUpdated);
  
  // Get properties from the property slice
  const { properties } = useSelector((state) => ({
    properties: state.property.properties,
  }));

  // Local state
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch properties on component mount
  useEffect(() => {
    dispatch(getAllProperties());
  }, [dispatch]);

  // Initialize selected property
  useEffect(() => {
    // Try to get from localStorage first
    const storedProperty = localStorage.getItem('selectedProperty');
    
    if (storedProperty) {
      try {
        const property = JSON.parse(storedProperty);
        setSelectedProperty(property);
        fetchDashboardData(property);
      } catch (err) {
        console.error('Error parsing selected property:', err);
      }
    } else if (properties && properties.length > 0) {
      // If no stored property, select the first published one
      const firstPublishedProperty = properties.find(p => p.status === 'published') || properties[0];
      setSelectedProperty(firstPublishedProperty);
      localStorage.setItem('selectedProperty', JSON.stringify(firstPublishedProperty));
      fetchDashboardData(firstPublishedProperty);
    }
  }, [properties]);

  // Function to fetch dashboard data for a property
  const fetchDashboardData = (property) => {
    if (!property) return;
    
    dispatch(fetchDashboardStats({ 
      propertyId: property.id || property._id 
    }));
    
    dispatch(fetchRecentBookings({ 
      propertyId: property.id || property._id, 
      limit: 5 
    }));
  };

  // Handle property selection change
  const handlePropertyChange = (event) => {
    const propertyId = event.target.value;
    const property = properties.find(p => (p.id || p._id) === propertyId);
    
    if (property) {
      setSelectedProperty(property);
      localStorage.setItem('selectedProperty', JSON.stringify(property));
      fetchDashboardData(property);
    }
  };

  // Handle manual refresh
  const handleRefresh = async () => {
    if (!selectedProperty) return;
    
    setRefreshing(true);
    try {
      await dispatch(refreshAllDashboardData({ 
        propertyId: selectedProperty.id || selectedProperty._id 
      })).unwrap();
    } catch (err) {
      console.error('Refresh failed:', err);
    } finally {
      setRefreshing(false);
    }
  };

  // Handle error dismissal
  const handleClearError = () => {
    dispatch(clearError());
  };

  // Get published properties for dropdown
  const availableProperties = properties?.filter(p => p.status === 'published') || [];

  // Loading state
  if (isLoading && !metricCardsData.length) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading dashboard...</Typography>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert 
          severity="error" 
          onClose={handleClearError}
          action={
            <Button onClick={handleRefresh} disabled={refreshing}>
              {refreshing ? <CircularProgress size={20} /> : <Refresh />}
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  // No properties available
  if (!availableProperties.length) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          No published properties found. Please publish a property first.
        </Typography>
      </Box>
    );
  }

  // Calculate room status data for the horizontal bar
  const totalRooms = roomAvailabilityData.total || 1;
  const roomStatusData = [
    {
      name: "Occupied",
      value: (roomAvailabilityData.occupied / totalRooms) * 100,
      count: roomAvailabilityData.occupied,
      color: "#FF9800",
    },
    {
      name: "Reserved",
      value: (roomAvailabilityData.reserved / totalRooms) * 100,
      count: roomAvailabilityData.reserved,
      color: "#FFB74D",
    },
    {
      name: "Available",
      value: (roomAvailabilityData.available / totalRooms) * 100,
      count: roomAvailabilityData.available,
      color: "#C8E6C9",
    },
    {
      name: "Not Ready",
      value: (roomAvailabilityData.notReady / totalRooms) * 100,
      count: roomAvailabilityData.notReady,
      color: "#E0E0E0",
    },
  ];

  return (
    <Box sx={{ p: 3, backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      {/* Header with property dropdown and refresh button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" fontWeight="bold">
          Property Dashboard
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          {/* Property Selection Dropdown */}
          <FormControl sx={{ minWidth: 250 }}>
            <InputLabel id="property-select-label">Select Property</InputLabel>
            <Select
              labelId="property-select-label"
              value={selectedProperty ? (selectedProperty.id || selectedProperty._id) : ''}
              label="Select Property"
              onChange={handlePropertyChange}
              size="small"
            >
              {availableProperties.map((property) => (
                <MenuItem key={property.id || property._id} value={property.id || property._id}>
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      {property.placeName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {property.location?.city}, {property.location?.state}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Last Updated Info */}
          {lastUpdated && (
            <Typography variant="caption" color="text.secondary">
              Last updated: {new Date(lastUpdated).toLocaleTimeString()}
            </Typography>
          )}
          
          {/* Refresh Button */}
          <Button
            variant="outlined"
            onClick={handleRefresh}
            disabled={refreshing || !selectedProperty}
            startIcon={refreshing ? <CircularProgress size={16} /> : <Refresh />}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Selected Property Info Card */}
      {selectedProperty && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  {selectedProperty.placeName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedProperty.propertyType} • {selectedProperty.location?.city}, {selectedProperty.location?.state}
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="caption" color="text.secondary">
                  Status
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: selectedProperty.status === 'published' ? 'success.main' : 'warning.main',
                    textTransform: 'capitalize',
                    fontWeight: 'medium'
                  }}
                >
                  {selectedProperty.status}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Metric Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {metricCardsData.map((metric, index) => (
          <Grid item size={{xs:12,sm:6,md:3}} key={index}>
            <MetricCard data={metric} />
          </Grid>
        ))}
      </Grid>

      {/* Bottom Section - Charts */}
      <Grid container spacing={3}>
        {/* Room Availability */}
        <Grid item size={{xs:12, md:6}}>
          <Card sx={{ height: "388px" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Room Availability
              </Typography>

              {/* Horizontal Bar Chart */}
              <Box sx={{ mb: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    height: 40,
                    borderRadius: 1,
                    overflow: "hidden",
                    backgroundColor: "#f0f0f0",
                  }}
                >
                  {roomStatusData.map((status, index) => (
                    <Box
                      key={index}
                      sx={{
                        width: `${status.value}%`,
                        backgroundColor: status.color,
                        transition: "all 0.3s ease",
                      }}
                    />
                  ))}
                </Box>
              </Box>

              {/* Status Grid */}
              <Grid container spacing={2}>
                <Grid item size={{xs:6}}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Occupied
                    </Typography>
                    <Typography variant="h5" fontWeight="bold">
                      {roomAvailabilityData.occupied}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item size={{xs:6}}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Reserved
                    </Typography>
                    <Typography variant="h5" fontWeight="bold">
                      {roomAvailabilityData.reserved}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item size={{xs:6}}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Available
                    </Typography>
                    <Typography variant="h5" fontWeight="bold">
                      {roomAvailabilityData.available}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item size={{xs:6}}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Not Ready
                    </Typography>
                    <Typography variant="h5" fontWeight="bold">
                      {roomAvailabilityData.notReady}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Reservation Chart */}
        <Grid item size={{xs:12, md:6}}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight="bold">
                  Reservation Trend
                </Typography>
                <Box display="flex" gap={2}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        backgroundColor: "#673AB7",
                        borderRadius: "2px",
                      }}
                    />
                    <Typography variant="body2">Booked</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        backgroundColor: "#FF9800",
                        borderRadius: "2px",
                      }}
                    />
                    <Typography variant="body2">Cancelled</Typography>
                  </Box>
                </Box>
              </Box>

              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={reservationData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e0e0e0",
                      borderRadius: "4px",
                    }}
                  />
                  <Bar dataKey="booked" stackId="a" fill="#673AB7" radius={[0, 0, 4, 4]} />
                  <Bar dataKey="cancelled" stackId="a" fill="#FF9800" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default HotelDashboard;
