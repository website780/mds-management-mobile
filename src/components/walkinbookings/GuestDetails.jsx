// components/BookingFlow/steps/GuestDetails.jsx
import React, { useState, useMemo } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, TextField, Button, FormControl,
  InputLabel, Select, MenuItem, IconButton, Alert, Accordion,
  AccordionSummary, AccordionDetails
} from '@mui/material';
import { DatePicker }                from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider }     from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns }           from '@mui/x-date-pickers/AdapterDateFns';
import { subYears }                 from 'date-fns';
import {
  Add, Remove, ExpandMore, Person,
  Phone, Email, Home, CreditCard,
} from '@mui/icons-material';
import { AlertCircle } from 'lucide-react';

// ── Constants ────────────────────────────────────────────────────────────────

const ID_TYPES = [
  { value: 'aadhar',          label: 'Aadhar Card'     },
  { value: 'passport',        label: 'Passport'        },
  { value: 'driving_license', label: 'Driving License' },
  { value: 'voter_id',        label: 'Voter ID'        },
  { value: 'pan',             label: 'PAN Card'        },
];

const REQUIRED_PRIMARY = [
  { field: 'firstName', label: 'First Name' },
  { field: 'lastName',  label: 'Last Name'  },
  { field: 'email',     label: 'Email'      },
  { field: 'phone',     label: 'Phone'      },
  { field: 'address',   label: 'Address'    },
  { field: 'idNumber',  label: 'ID Number'  },
];

// ── Component ────────────────────────────────────────────────────────────────

const GuestDetails = ({ bookingData, onNext, onBack, onDataChange }) => {
  const theme    = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [primaryGuest, setPrimaryGuest] = useState(bookingData.primaryGuest || {
    firstName: '', lastName: '', email: '', phone: '',
    address: '', idType: 'aadhar', idNumber: '',
    dateOfBirth: null, age: '20', gender: 'male',
  });
  const [additionalGuests, setAdditionalGuests] = useState(bookingData.additionalGuests || []);
  const [specialRequests,  setSpecialRequests]  = useState(bookingData.specialRequests  || '');
  const [touched,          setTouched]          = useState({});
  const [submitAttempted,  setSubmitAttempted]  = useState(false);

  const totalGuests          = bookingData.guestCount.adults + bookingData.guestCount.children;
  const additionalGuestsNeeded = Math.max(0, totalGuests - 1);

  // ── Field-level errors ───────────────────────────────────────────────────
  const fieldErrors = useMemo(() => {
    const errs = {};
    if (!primaryGuest.firstName?.trim()) errs.firstName = 'First name is required';
    if (!primaryGuest.lastName?.trim())  errs.lastName  = 'Last name is required';
    if (!primaryGuest.email?.trim())     errs.email     = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(primaryGuest.email))
      errs.email = 'Enter a valid email address';
    if (!primaryGuest.phone?.trim())     errs.phone     = 'Phone is required';
    else if (!/^[6-9]\d{9}$/.test(primaryGuest.phone.replace(/\D/g, '')))
      errs.phone = 'Enter a valid 10-digit mobile number';
    if (!primaryGuest.address?.trim())   errs.address   = 'Address is required';
    if (!primaryGuest.idNumber?.trim())  errs.idNumber  = 'ID number is required';
    if (!primaryGuest.dateOfBirth)       errs.dateOfBirth = 'Date of birth is required';

    additionalGuests.forEach((g, i) => {
      if (!g.firstName?.trim()) errs[`ag${i}firstName`] = 'Required';
      if (!g.lastName?.trim())  errs[`ag${i}lastName`]  = 'Required';
      if (!g.age)               errs[`ag${i}age`]       = 'Required';
      if (!g.idNumber?.trim())  errs[`ag${i}idNumber`]  = 'Required';
    });

    return errs;
  }, [primaryGuest, additionalGuests]);

  const isFormValid = Object.keys(fieldErrors).length === 0;

  const showError    = (field) => (touched[field] || submitAttempted) && fieldErrors[field];
  const markTouched  = (field) => setTouched((p) => ({ ...p, [field]: true }));

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handlePrimary = (field, value) => {
    // Phone: digits only, max 10
    if (field === 'phone') value = value.replace(/\D/g, '').slice(0, 10);
    setPrimaryGuest((p) => ({ ...p, [field]: value }));
  };

  const handleAdditional = (index, field, value) => {
    const updated = [...additionalGuests];
    updated[index] = { ...updated[index], [field]: value };
    setAdditionalGuests(updated);
  };

  const addAdditionalGuest = () => {
    if (additionalGuests.length < additionalGuestsNeeded) {
      setAdditionalGuests((p) => [
        ...p,
        { firstName: '', lastName: '', age: '', idType: 'aadhar', idNumber: '', relationship: 'family' },
      ]);
    }
  };
  const removeAdditionalGuest = (index) =>
    setAdditionalGuests((p) => p.filter((_, i) => i !== index));

  const handleNext = () => {
    setSubmitAttempted(true);
    const allTouched = {};
    REQUIRED_PRIMARY.forEach(({ field }) => { allTouched[field] = true; });
    allTouched.dateOfBirth = true;
    setTouched(allTouched);

    if (!isFormValid) {
      const firstErrField = REQUIRED_PRIMARY.find(({ field }) => fieldErrors[field])?.field;
      document.getElementById(`field-${firstErrField}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    onDataChange({ primaryGuest, additionalGuests, specialRequests });
    onNext();
  };

  // ── Shared input styling ─────────────────────────────────────────────────
  const inputSx = (field) => ({
    '& .MuiOutlinedInput-root': showError(field)
      ? { '& fieldset': { borderColor: '#d32f2f' } }
      : {},
  });

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ width: '100%' }}>
        <Typography variant="h6" gutterBottom>Guest Details</Typography>

        {/* Error count banner */}
        {submitAttempted && !isFormValid && (
          <Alert
            severity="error"
            sx={{ mb: 2, borderRadius: 2, display: 'flex', alignItems: 'center' }}
          >
            Please fix {Object.keys(fieldErrors).length} field{Object.keys(fieldErrors).length > 1 ? 's' : ''} before continuing.
          </Alert>
        )}

        {/* ── Primary Guest ── */}
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Person sx={{ mr: 1, color: '#1035ac' }} />
              <Typography variant="h6">Primary Guest</Typography>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} id="field-firstName">
                <TextField
                  fullWidth label="First Name *"
                  value={primaryGuest.firstName}
                  onChange={(e) => handlePrimary('firstName', e.target.value)}
                  onBlur={() => markTouched('firstName')}
                  error={!!showError('firstName')}
                  helperText={showError('firstName')}
                  sx={inputSx('firstName')}
                />
              </Grid>
              <Grid item xs={12} sm={6} id="field-lastName">
                <TextField
                  fullWidth label="Last Name *"
                  value={primaryGuest.lastName}
                  onChange={(e) => handlePrimary('lastName', e.target.value)}
                  onBlur={() => markTouched('lastName')}
                  error={!!showError('lastName')}
                  helperText={showError('lastName')}
                  sx={inputSx('lastName')}
                />
              </Grid>

              <Grid item xs={12} sm={6} id="field-email">
                <TextField
                  fullWidth label="Email *" type="email"
                  value={primaryGuest.email}
                  onChange={(e) => handlePrimary('email', e.target.value)}
                  onBlur={() => markTouched('email')}
                  error={!!showError('email')}
                  helperText={showError('email')}
                  InputProps={{ startAdornment: <Email sx={{ mr: 1, color: 'action.active' }} /> }}
                  sx={inputSx('email')}
                />
              </Grid>
              <Grid item xs={12} sm={6} id="field-phone">
                <TextField
                  fullWidth label="Phone *"
                  value={primaryGuest.phone}
                  onChange={(e) => handlePrimary('phone', e.target.value)}
                  onBlur={() => markTouched('phone')}
                  inputMode="numeric"
                  inputProps={{ maxLength: 10 }}
                  placeholder="9876543210"
                  error={!!showError('phone')}
                  helperText={showError('phone')}
                  InputProps={{ startAdornment: <Phone sx={{ mr: 1, color: 'action.active' }} /> }}
                  sx={inputSx('phone')}
                />
              </Grid>

              {/* Age + Gender */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Age</InputLabel>
                  <Select
                    value={primaryGuest.age}
                    onChange={(e) => handlePrimary('age', e.target.value)}
                    label="Age"
                  >
                    {Array.from({ length: 83 }, (_, i) => i + 18).map((a) => (
                      <MenuItem key={a} value={String(a)}>{a} years</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Gender</InputLabel>
                  <Select
                    value={primaryGuest.gender}
                    onChange={(e) => handlePrimary('gender', e.target.value)}
                    label="Gender"
                  >
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} id="field-address">
                <TextField
                  fullWidth label="Address *" multiline rows={2}
                  value={primaryGuest.address}
                  onChange={(e) => handlePrimary('address', e.target.value)}
                  onBlur={() => markTouched('address')}
                  error={!!showError('address')}
                  helperText={showError('address')}
                  InputProps={{
                    startAdornment: (
                      <Home sx={{ mr: 1, color: 'action.active', alignSelf: 'flex-start', mt: 1 }} />
                    ),
                  }}
                  sx={inputSx('address')}
                />
              </Grid>

              {/* ID proof */}
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>ID Type</InputLabel>
                  <Select
                    value={primaryGuest.idType}
                    onChange={(e) => handlePrimary('idType', e.target.value)}
                    label="ID Type"
                    startAdornment={<CreditCard sx={{ mr: 1, color: 'action.active' }} />}
                  >
                    {ID_TYPES.map((t) => (
                      <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4} id="field-idNumber">
                <TextField
                  fullWidth label="ID Number *"
                  value={primaryGuest.idNumber}
                  onChange={(e) => handlePrimary('idNumber', e.target.value)}
                  onBlur={() => markTouched('idNumber')}
                  error={!!showError('idNumber')}
                  helperText={showError('idNumber')}
                  sx={inputSx('idNumber')}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <DatePicker
                  label="Date of Birth *"
                  value={primaryGuest.dateOfBirth}
                  onChange={(date) => {
                    handlePrimary('dateOfBirth', date);
                    markTouched('dateOfBirth');
                  }}
                  maxDate={subYears(new Date(), 18)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!showError('dateOfBirth'),
                      helperText: showError('dateOfBirth'),
                    },
                  }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* ── Additional Guests ── */}
        {additionalGuestsNeeded > 0 && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', mb: 2, gap: 2 }}>
                <Typography variant="h6">
                  Additional Guests ({additionalGuests.length}/{additionalGuestsNeeded})
                </Typography>
                <Button
                  startIcon={<Add />}
                  onClick={addAdditionalGuest}
                  disabled={additionalGuests.length >= additionalGuestsNeeded}
                  variant="outlined" size="small"
                  sx={{ color: '#1035ac', borderColor: '#1035ac' }}
                >
                  Add Guest
                </Button>
              </Box>

              {additionalGuests.map((guest, index) => (
                <Accordion key={index} sx={{ mb: 2 }}>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography>
                      Guest {index + 1} – {guest.firstName || 'New Guest'} {guest.lastName}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth label="First Name *"
                          value={guest.firstName}
                          onChange={(e) => handleAdditional(index, 'firstName', e.target.value)}
                          error={!!fieldErrors[`ag${index}firstName`]}
                          helperText={fieldErrors[`ag${index}firstName`]}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth label="Last Name *"
                          value={guest.lastName}
                          onChange={(e) => handleAdditional(index, 'lastName', e.target.value)}
                          error={!!fieldErrors[`ag${index}lastName`]}
                          helperText={fieldErrors[`ag${index}lastName`]}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth label="Age *" type="number"
                          value={guest.age}
                          onChange={(e) => handleAdditional(index, 'age', e.target.value)}
                          error={!!fieldErrors[`ag${index}age`]}
                          helperText={fieldErrors[`ag${index}age`]}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <FormControl fullWidth>
                          <InputLabel>ID Type</InputLabel>
                          <Select
                            value={guest.idType}
                            onChange={(e) => handleAdditional(index, 'idType', e.target.value)}
                            label="ID Type"
                          >
                            {ID_TYPES.map((t) => (
                              <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth label="ID Number *"
                          value={guest.idNumber}
                          onChange={(e) => handleAdditional(index, 'idNumber', e.target.value)}
                          error={!!fieldErrors[`ag${index}idNumber`]}
                          helperText={fieldErrors[`ag${index}idNumber`]}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                          <InputLabel>Relationship</InputLabel>
                          <Select
                            value={guest.relationship}
                            onChange={(e) => handleAdditional(index, 'relationship', e.target.value)}
                            label="Relationship"
                          >
                            <MenuItem value="family">Family</MenuItem>
                            <MenuItem value="friend">Friend</MenuItem>
                            <MenuItem value="colleague">Colleague</MenuItem>
                            <MenuItem value="other">Other</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                        <IconButton onClick={() => removeAdditionalGuest(index)} color="error" size="small">
                          <Remove />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              ))}

              {additionalGuestsNeeded > additionalGuests.length && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Add {additionalGuestsNeeded - additionalGuests.length} more guest(s) to match your booking.
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* ── Special Requests ── */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Special Requests</Typography>
            <TextField
              fullWidth
              label="Special Requests (Optional)"
              multiline rows={3}
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              placeholder="Early check-in, extra pillows, accessibility needs…"
            />
          </CardContent>
        </Card>

        {/* ── Navigation ── */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button
            variant="outlined" onClick={onBack} size="large"
            sx={{ borderColor: '#1035ac', color: '#1035ac' }}
          >
            Back
          </Button>
          <Button
            variant="contained" onClick={handleNext} size="large"
            sx={{ bgcolor: '#1035ac', '&:hover': { bgcolor: '#0d2b8a' } }}
          >
            Next
          </Button>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default GuestDetails;