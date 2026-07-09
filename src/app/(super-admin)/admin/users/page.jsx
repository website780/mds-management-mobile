import { View, Text, ScrollView, Image, Pressable, TextInput, FlatList, StyleSheet, Modal } from 'react-native';
import { useRouter } from 'expo-router';

"use client"
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Button,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  Select,
  MenuItem,
  Grid,
  Avatar,
  Divider,
  Card,
  CardContent,
  Stack,
  useTheme,
  useMediaQuery,
} from "react-native-paper";
import {
  Edit as EditIcon,       // Or 'Pencil' if you prefer that style
  Trash2 as DeleteIcon,   // 'Trash2' is the standard Lucide trash can
  Eye as ViewIcon,
  Plus as AddIcon,
  X as CloseIcon,
  Download as DownloadIcon,
  Bell as NotificationsIcon,
  LifeBuoy as SupportIcon, // 'Headset' is also a good alternative here
  KeyRound as LockResetIcon,
  Ban as BlockIcon,
} from 'lucide-react-native';

import { 
  fetchAllUsers, 
  updateUser, 
  deleteUser, 
  fetchUserById,
  clearError,
  clearSelectedUser 
} from '@/redux/features/admin/adminSlice';
import { fetchUserBookingsByAdmin, clearUserBookings } from '@/redux/features/bookings/bookingSlice';
import UserProfileDialog from '../../components/users/UserProfileDialog';
import EditUserDialog from '../../components/users/EditUserDialog';

const BRAND_COLOR = '#1035AC';
const BRAND_HOVER = '#0d2b8a';

const UserManagement = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Admin State
  const { 
    users, 
    selectedUser, 
    isLoading, 
    isUpdating, 
    isDeleting, 
    error 
  } = useSelector((state) => state.admin);

  // Booking State
  const { userBookings, isUserBookingsLoading } = useSelector((state) => state.booking);

  // Table pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Dialog states
  const [editDialog, setEditDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [cityFilter, setCityFilter] = useState('All Cities');
  const [dateFilter, setDateFilter] = useState('');

  // Form state for editing
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    role: '',
    gender: '',
    dateOfBirth: '',
    address: '',
    maritalStatus: '',
    state: '',
    city: '',
    phoneNumber: '',
    username: '',
  });

  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      setTimeout(() => {
        dispatch(clearError());
      }, 5000);
    }
  }, [error, dispatch]);

  // Extract unique cities for the dropdown
  const uniqueCities = Array.from(new Set(users.map(u => u.city).filter(Boolean)));

  // Apply Search and Filters
  const filteredUsers = users.filter((user) => {
    // Search Filter (Name, Email, Phone)
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
      user.name?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.phoneNumber?.toLowerCase().includes(searchLower);

    // Role Filter
    const matchesRole = roleFilter === 'All Roles' || (user.role?.toLowerCase() === roleFilter.toLowerCase());

    // Status Filter (isDeleted flag)
    const userStatus = user.isDeleted ? 'blocked' : 'active';
    const matchesStatus = statusFilter === 'All Status' || userStatus === statusFilter.toLowerCase();

    // City Filter
    const matchesCity = cityFilter === 'All Cities' || user.city === cityFilter;

    // Date Filter
    const matchesDate = !dateFilter || (user.createdAt && user.createdAt.startsWith(dateFilter));

    return matchesSearch && matchesRole && matchesStatus && matchesCity && matchesDate;
  });

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Dialog Handlers (Kept exactly as requested)
  const handleEdit = (userId, name) => {
    dispatch(fetchUserById(userId)).then((result) => {
      if (result.type === 'admin/fetchUserById/fulfilled') {
        const user = result.payload.data;
        setEditFormData({
          name: user.name || '',
          email: user.email || '',
          role: user.role || '',
          gender: user.gender || '',
          dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
          address: user.address || '',
          maritalStatus: user.maritalStatus || '',
          state: user.state || '',
          city: user.city || '',
          phoneNumber: user.phoneNumber || '',
          username: user.username || '',
        });
        setSelectedUserId({userId, name});
        setEditDialog(true);
      }
    });
  };

  const handleView = (userId) => {
    dispatch(fetchUserById(userId)).then((result) => {
      if (result.type === 'admin/fetchUserById/fulfilled') {
        dispatch(fetchUserBookingsByAdmin(userId));
        setViewDialog(true);
      }
    });
  };

  const handleCloseViewDialog = () => {
    setViewDialog(false);
    dispatch(clearUserBookings());
  };

  const handleDelete = (userId, name) => {
    setSelectedUserId({userId, name});
    setDeleteDialog(true);
  };

  const handleEditSubmit = () => {
    dispatch(updateUser({ userId: selectedUserId.userId, userData: editFormData })).then((result) => {
      if (result.type === 'admin/updateUser/fulfilled') {
        setEditDialog(false);
        dispatch(clearSelectedUser());
      }
    });
  };

  const handleDeleteConfirm = () => {
    dispatch(deleteUser(selectedUserId.userId)).then((result) => {
      if (result.type === 'admin/deleteUser/fulfilled') {
        setDeleteDialog(false);
        setSelectedUserId(null);
      }
    });
  };

  const handleInputChange = (field) => (event) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return { backgroundColor: '#ffa726', color: 'white' };
      case 'dharamshala partner':
        return { backgroundColor: '#4caf50', color: 'white' };
      case 'guest':
        return { backgroundColor: '#e3f2fd', color: '#1976d2' };
      default:
        return { backgroundColor: '#f5f5f5', color: '#666' };
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return { backgroundColor: '#4caf50', color: 'white' };
      case 'suspended':
        return { backgroundColor: '#ff9800', color: 'white' };
      case 'blocked':
        return { backgroundColor: '#f44336', color: 'white' };
      default:
        return { backgroundColor: '#f5f5f5', color: '#666' };
    }
  };

  const getInitials = (name) => {
    return name?.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2) || 'U';
  };

  const clearFilters = () => {
    setSearchQuery('');
    setRoleFilter('All Roles');
    setStatusFilter('All Status');
    setCityFilter('All Cities');
    setDateFilter('');
    setPage(0);
  };

  const exportUsers = () => {
    console.log('Export users');
  };

  const tableActions = (user) => (
    <Box display="flex" gap={1} justifyContent="center" width="100%">
      <Button
        variant="text"
        size="small"
        onPress={() => handleView(user._id)}
        sx={{ color: BRAND_COLOR, fontWeight: 'bold' }}
      >
        View
      </Button>
      <Button
        variant="text"
        size="small"
        onPress={() => handleEdit(user._id, user.name)}
        sx={{ color: '#ff9800' }}
        startIcon={<EditIcon />}
      >
        Edit
      </Button>
    </Box>
  );

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress sx={{ color: BRAND_COLOR }} />
      </Box>
    );
  }

  // Calculate pagination boundaries based on FILTERED list
  const displayStart = filteredUsers.length === 0 ? 0 : page * rowsPerPage + 1;
  const displayEnd = Math.min((page + 1) * rowsPerPage, filteredUsers.length);

  return (
    <Box sx={{ p: { xs: 1, md: 3 } }}>
      {/* Header */}
      <Box mb={3}>
        <Typography variant="h4" component="h1" fontWeight="bold" mb={1}>
          User Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage all users, partners, and administrators across the platform.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Filters Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item size={{xs:12, md:2}}>
            <Typography variant="subtitle2" mb={1}>Search Users</Typography>
            <TextField
              fullWidth
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChangeText={(e) => setSearchQuery(e.target.value)}
              size="small" />
          </Grid>
          <Grid item size={{xs:6, md:2}}>
            <Typography variant="subtitle2" mb={1}>Role</Typography>
            <FormControl fullWidth size="small">
              <Select
                value={roleFilter}
                onChangeText={(e) => setRoleFilter(e.target.value)}
              >
                <MenuItem value="All Roles">All Roles</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="guest">Guest</MenuItem>
                <MenuItem value="dharamshala partner">Dharamshala Partner</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item size={{xs:6, md:2}}>
            <Typography variant="subtitle2" mb={1}>Status</Typography>
            <FormControl fullWidth size="small">
              <Select
                value={statusFilter}
                onChangeText={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="All Status">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="suspended">Suspended</MenuItem>
                <MenuItem value="blocked">Blocked</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item size={{xs:6, md:2}}>
            <Typography variant="subtitle2" mb={1}>City</Typography>
            <FormControl fullWidth size="small">
              <Select
                value={cityFilter}
                onChangeText={(e) => setCityFilter(e.target.value)}
              >
                <MenuItem value="All Cities">All Cities</MenuItem>
                {uniqueCities.map(city => (
                  <MenuItem key={city} value={city}>{city}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item size={{xs:6, md:2}}>
            <Typography variant="subtitle2" mb={1}>Signup Date</Typography>
            <TextField
              fullWidth
              type="date"
              size="small"
              value={dateFilter}
              onChangeText={(e) => setDateFilter(e.target.value)}
            />
          </Grid>
          <Grid item size={{xs:12, md:2}}>
            <Box display="flex" gap={1} mt={3}>
              <Button 
                variant="outlined" 
                onPress={clearFilters} 
                size="medium"
                sx={{ color: BRAND_COLOR, borderColor: BRAND_COLOR, '&:hover': { borderColor: BRAND_HOVER } }}
              >
                Clear Filters
              </Button>
              
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Users List */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6">Users List</Typography>
          <Typography variant="body2" color="text.secondary">
            Showing {displayStart}-{displayEnd} of {filteredUsers.length} users
          </Typography>
        </Box>
        
        {isMobile ? (
          /* Mobile Card Layout */
          <Stack spacing={2} sx={{ p: 2, bgcolor: '#f9fafb' }}>
            {filteredUsers
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((user) => (
                <Card key={user._id} elevation={1} sx={{ borderRadius: 2 }}>
                  <CardContent sx={{ pb: '16px !important' }}>
                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                      <Avatar sx={{ bgcolor: BRAND_COLOR, width: 48, height: 48 }}>
                        {getInitials(user.name)}
                      </Avatar>
                      <Box flex={1}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {user.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {user.email}
                        </Typography>
                      </Box>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <Grid container spacing={2} mb={2}>
                      <Grid item size={{xs: 6}}>
                        <Typography variant="caption" color="text.secondary">Role</Typography>
                        <Box mt={0.5}>
                          <Chip label={user.role || 'Guest'} size="small" sx={getRoleColor(user.role)} />
                        </Box>
                      </Grid>
                      <Grid item size={{xs: 6}}>
                        <Typography variant="caption" color="text.secondary">Status</Typography>
                        <Box mt={0.5}>
                          <Chip label={user.isDeleted ? 'Blocked' : 'Active'} size="small" sx={getStatusColor(user.isDeleted ? 'blocked' : 'active')} />
                        </Box>
                      </Grid>
                      <Grid item size={{xs: 6}}>
                        <Typography variant="caption" color="text.secondary">Joined</Typography>
                        <Typography variant="body2">{formatDate(user.createdAt)}</Typography>
                      </Grid>
                      <Grid item size={{xs: 6}}>
                        <Typography variant="caption" color="text.secondary">City</Typography>
                        <Typography variant="body2">{user.city || 'N/A'}</Typography>
                      </Grid>
                    </Grid>
                    <Box pt={1} borderTop={1} borderColor="divider">
                      {tableActions(user)}
                    </Box>
                  </CardContent>
                </Card>
              ))}
            {filteredUsers.length === 0 && (
              <Typography align="center" py={4} color="text.secondary">No users found.</Typography>
            )}
          </Stack>
        ) : (
          /* Desktop Table Layout */
          <TableContainer sx={{ maxHeight: 600 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>USER</TableCell>
                  <TableCell>ROLE</TableCell>
                  <TableCell>STATUS</TableCell>
                  <TableCell>JOINED</TableCell>
                  <TableCell align="center">ACTIONS</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((user) => (
                    <TableRow hover key={user._id}>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar sx={{ bgcolor: BRAND_COLOR, width: 40, height: 40 }}>
                            {getInitials(user.name)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {user.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {user.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={user.role || 'Guest'} 
                          size="small"
                          sx={getRoleColor(user.role)}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={user.isDeleted ? 'Blocked' : 'Active'} 
                          size="small"
                          sx={getStatusColor(user.isDeleted ? 'blocked' : 'active')}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(user.createdAt)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        {tableActions(user)}
                      </TableCell>
                    </TableRow>
                  ))}
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">No users found matching your filters.</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredUsers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Dialogs remain identical to your original code */}
      <UserProfileDialog
        open={viewDialog}
        onClose={handleCloseViewDialog}
        selectedUser={selectedUser}
        userBookings={userBookings}
        isUserBookingsLoading={isUserBookingsLoading}
        onEdit={handleEdit}
        formatDate={formatDate}
        getRoleColor={getRoleColor}
        getStatusColor={getStatusColor}
        getInitials={getInitials}
      />

      <EditUserDialog
        open={editDialog}
        onClose={() => setEditDialog(false)}
        editFormData={editFormData}
        onInputChange={handleInputChange}
        onSubmit={handleEditSubmit}
        isUpdating={isUpdating}
        selectedUserId={selectedUserId}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {selectedUserId?.name}'s account? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onPress={() => setDeleteDialog(false)} sx={{ color: 'text.secondary' }}>Cancel</Button>
          <Button 
            onPress={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            disabled={isDeleting}
          >
            {isDeleting ? <CircularProgress size={20} color="inherit" /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;