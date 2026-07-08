// components/BookingDashboard.jsx
"use client"
import React, { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Tab,
  Tabs,
  Alert,
  Snackbar,
  CircularProgress,
  Fab,
  Tooltip,
} from '@mui/material'
import {
  Add,
  MoreVert,
  Edit,
  Delete,
  CheckCircle,
  ExitToApp,
  Cancel,
  Payment,
  Visibility,
  FilterList,
  Refresh,
  Download,
} from '@mui/icons-material'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchAllBookings,
  fetchBookingStats,
  checkInGuest,
  checkOutGuest,
  cancelBooking,
  updateFilters,
  clearBookingError,
} from '@/redux/features/bookings/bookingSlice'
import { format } from 'date-fns'

const BookingDashboard = () => {
  const [selectedTab, setSelectedTab] = useState(0)
  const [anchorEl, setAnchorEl] = useState(null)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [dialogType, setDialogType] = useState('')
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [selectedProperty, setSelectedProperty] = useState(null)

  const dispatch = useDispatch()
  const {
    bookings,
    bookingStats,
    pagination,
    filters,
    isLoading,
    isUpdating,
    error,
  } = useSelector(state => state.booking)

  useEffect(() => {
    // Listen for property changes
    const handlePropertyChange = (event) => {
      setSelectedProperty(event.detail)
      dispatch(updateFilters({ propertyId: event.detail._id, page: 1 }))
    }

    window.addEventListener('propertyChanged', handlePropertyChange)
    
    // Load selected property from localStorage
    const saved = localStorage.getItem('selectedProperty')
    if (saved) {
      const property = JSON.parse(saved)
      setSelectedProperty(property)
      dispatch(updateFilters({ propertyId: property._id }))
    }

    return () => {
      window.removeEventListener('propertyChanged', handlePropertyChange)
    }
  }, [dispatch])

  useEffect(() => {
    if (selectedProperty) {
      dispatch(fetchAllBookings(filters))
      dispatch(fetchBookingStats({ propertyId: selectedProperty._id }))
    }
  }, [dispatch, filters, selectedProperty])

  useEffect(() => {
    if (error) {
      setSnackbar({ open: true, message: error, severity: 'error' })
      dispatch(clearBookingError())
    }
  }, [error, dispatch])

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue)
    const statusMap = ['', 'confirmed', 'checked-in', 'checked-out', 'cancelled']
    dispatch(updateFilters({ status: statusMap[newValue], page: 1 }))
  }

  const handlePageChange = (event, newPage) => {
    dispatch(updateFilters({ page: newPage + 1 }))
  }

  const handleRowsPerPageChange = (event) => {
    dispatch(updateFilters({ limit: parseInt(event.target.value), page: 1 }))
  }

  const handleMenuClick = (event, booking) => {
    setAnchorEl(event.currentTarget)
    setSelectedBooking(booking)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedBooking(null)
  }

  const handleAction = (action) => {
    setDialogType(action)
    setOpenDialog(true)
    handleMenuClose()
  }

  const handleConfirmAction = async () => {
    if (!selectedBooking) return

    try {
      switch (dialogType) {
        case 'checkin':
          await dispatch(checkInGuest(selectedBooking._id)).unwrap()
          setSnackbar({ open: true, message: 'Guest checked in successfully', severity: 'success' })
          break
        case 'checkout':
          await dispatch(checkOutGuest(selectedBooking._id)).unwrap()
          setSnackbar({ open: true, message: 'Guest checked out successfully', severity: 'success' })
          break
        case 'cancel':
          await dispatch(cancelBooking({ 
            id: selectedBooking._id, 
            cancellationData: { reason: 'Cancelled by admin' } 
          })).unwrap()
          setSnackbar({ open: true, message: 'Booking cancelled successfully', severity: 'success' })
          break
        default:
          break
      }
      setOpenDialog(false)
      dispatch(fetchAllBookings(filters))
    } catch (error) {
      setSnackbar({ open: true, message: error.message, severity: 'error' })
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'primary'
      case 'checked-in': return 'success'
      case 'checked-out': return 'info'
      case 'cancelled': return 'error'
      case 'no-show': return 'warning'
      default: return 'default'
    }
  }

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success'
      case 'partial': return 'warning'
      case 'pending': return 'error'
      case 'failed': return 'error'
      case 'refunded': return 'info'
      default: return 'default'
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount)
  }

  if (!selectedProperty) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          No Property Selected
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Please select a property from the sidebar to view bookings.
        </Typography>
      </Box>
    )
  }

  return (
    <></>
  )}