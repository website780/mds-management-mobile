"use client"
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from '@mui/material';

const EditUserDialog = ({ 
  open, 
  onClose, 
  editFormData, 
  onInputChange, 
  onSubmit, 
  isUpdating, 
  selectedUserId 
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Edit User - {selectedUserId?.name}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Name"
              value={editFormData.name}
              onChange={onInputChange('name')}
            />
          </Grid>
          <Grid item size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={editFormData.email}
              onChange={onInputChange('email')}
            />
          </Grid>
          <Grid item size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Username"
              value={editFormData.username}
              onChange={onInputChange('username')}
            />
          </Grid>
          <Grid item size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={editFormData.role}
                label="Role"
                onChange={onInputChange('role')}
              >
                <MenuItem value="guest">Guest</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="dharamshala partner">Dharamshala Partner</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Gender</InputLabel>
              <Select
                value={editFormData.gender}
                label="Gender"
                onChange={onInputChange('gender')}
              >
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
                <MenuItem value="Prefer not to say">Prefer not to say</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Date of Birth"
              type="date"
              value={editFormData.dateOfBirth}
              onChange={onInputChange('dateOfBirth')}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Phone Number"
              value={editFormData.phoneNumber}
              onChange={onInputChange('phoneNumber')}
            />
          </Grid>
          <Grid item size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Marital Status"
              value={editFormData.maritalStatus}
              onChange={onInputChange('maritalStatus')}
            />
          </Grid>
          <Grid item size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="State"
              value={editFormData.state}
              onChange={onInputChange('state')}
            />
          </Grid>
          <Grid item size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="City"
              value={editFormData.city}
              onChange={onInputChange('city')}
            />
          </Grid>
          <Grid item size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Address"
              multiline
              rows={3}
              value={editFormData.address}
              onChange={onInputChange('address')}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={onSubmit} 
          variant="contained"
          disabled={isUpdating}
        >
          {isUpdating ? <CircularProgress size={20} /> : 'Update'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditUserDialog;