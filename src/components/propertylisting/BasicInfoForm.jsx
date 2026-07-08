import { useEffect, useState } from 'react';
import { 
  TextField, FormControl, InputLabel, Select, 
  MenuItem, FormHelperText, Grid, Typography,
  Alert, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  Checkbox,
  ListItemText,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { checkEmailVerificationStatus, sendEmailOTP, verifyEmailOTP } from '@/redux/features/property/propertySlice';
import toast from 'react-hot-toast';
import ResponsiveFormControl from '../ResponsiveFormControl';
import ResponsiveTextField from '../ResponsiveTextField';
export default function BasicInfoForm({ formData, onChange, errors, propertyId, onEmailVerified }) {
  const dispatch = useDispatch();
   const { isLoading, error, currentProperty } = useSelector(state => state.property);
    const theme = useTheme();
     const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  
  const [showOTPDialog, setShowOTPDialog] = useState(false);
  const [otp, setOtp] = useState('');
   const [emailForVerification, setEmailForVerification] = useState('');

  // Check verification status when component mounts or propertyId changes
  useEffect(() => {
    if (propertyId) {
      dispatch(checkEmailVerificationStatus(propertyId));
    }
  }, [propertyId, dispatch]);

  // Check if current property email is verified
  const isCurrentEmailVerified = currentProperty?.emailVerified && 
                                 currentProperty?.email === formData.email;

  const handleSendOTP = async () => {
    if (!formData.email) {
      toast.error('Please enter email address first');
      return;
    }
    
    setEmailForVerification(formData.email);
    console.log(propertyId, "")
    try {
      await dispatch(sendEmailOTP({ 
        propertyId, 
        email: formData.email 
      })).unwrap();
      setShowOTPDialog(true);
    } catch (error) {
      console.error('Failed to send OTP:', error);
    }
  };

   const handleVerifyOTP = async () => {
    try {
      await dispatch(verifyEmailOTP({ 
        propertyId, 
        email: emailForVerification, 
        otp 
      })).unwrap();
      
      setShowOTPDialog(false);
      setOtp('');
      
      // Call the callback to update basic info in parent component
      if (onEmailVerified) {
        await onEmailVerified();
      }
      
      toast.success('Email verified successfully!');
    } catch (error) {
      console.error('Failed to verify OTP:', error);
      toast.error('Failed to verify OTP. Please try again.');
    }
  };

  const propertyTypes = [
    'Dharamshala', 'Ashram(Spiritual centers offering meditation/yoga stay with a guru or community)', 'Trust Guest House( Guesthouses owned/operated by temple or religious trusts)', 'Yatri Niwas / Pilgrim Lodge(Budget stays designed for pilgrims by governments or religious orgs)'
  ];
  

  const languageOptions = [
  'English', 'Hindi', 'Gujarati', 'Marathi', 'Bengali', 
  'Kannada', 'Tamil', 'Telugu', 'Malayalam', 'Punjabi'
];

  // const rentalForms = ['Entire place', 'Private room', 'Share room'];

 const ratingArray = Array.from({ length: 5 }, (_, i) => 5 - i);


  // 1. Base array of years
const currentYear = new Date().getFullYear();
const baseYears = Array.from({ length: currentYear - 1800 + 1 }, (_, i) => currentYear - i);

// 2. Filtered years for "Property Built" 
// (Should only show years up to the "Booking Since" year, if selected)
const builtYearOptions = formData.bookingSince 
  ? baseYears.filter(year => year <= parseInt(formData.bookingSince))
  : baseYears;

// 3. Filtered years for "Accepting Booking Since" 
// (Should only show years from the "Property Built" year onwards)
const bookingYearOptions = formData.propertyBuilt 
  ? baseYears.filter(year => year >= parseInt(formData.propertyBuilt))
  : baseYears;

  return (
    <div>

      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
            Property Details
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Update your property details here
          </Typography>

      <Grid sx={{ mt: 5 }} container spacing={2}>
        <Grid item size={{xs:12, md:3}}>
          <ResponsiveFormControl 
          
                     
            sx={{
              "& .MuiOutlinedInput-root": {

                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#2e2e2e",
                },
                "&.Mui-focused": {
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#1976d2",
                  },
                },
                "& .MuiInputLabel-outlined": {
                  color: "#2e2e2e",
                  "&.Mui-focused": {
                    color: "secondary.main",

                  },
                },
              },
            }} 
            fullWidth error={!!errors?.propertyType}>
            <InputLabel>Property Type</InputLabel>
            <Select
              value={formData.propertyType || ''}
              onChange={(e) => onChange('propertyType', e.target.value)}
              label="Property Type"
            >
              {propertyTypes.map(type => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </Select>
            {errors?.propertyType && (
              <FormHelperText>{errors.propertyType}</FormHelperText>
            )}
          </ResponsiveFormControl>
        </Grid>
        
        <Grid item size={{xs:12, md:3}}>
          <ResponsiveTextField
            
            sx={{
              "& .MuiOutlinedInput-root": {
                color: "#000",

                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#2e2e2e",
                },
                "&.Mui-focused": {
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#1976d2",
                  },
                },
                "& .MuiInputLabel-outlined": {
                  color: "#2e2e2e",
                  "&.Mui-focused": {
                    color: "secondary.main",

                  },
                },
              },
            }}
            fullWidth
            label="Name of the Property"
            value={formData.placeName || ''}
            onChange={(e) => onChange('placeName', e.target.value)}
            error={!!errors?.placeName}
            helperText={errors?.placeName}
          />
        </Grid>
        
        
        <Grid item size={{xs:12, md:3}}>
          <ResponsiveFormControl
          
          fullWidth            
            sx={{
              "& .MuiOutlinedInput-root": {
                color: "#000",

                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#2e2e2e",
                },
                "&.Mui-focused": {
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#1976d2",
                  },
                },
                "& .MuiInputLabel-outlined": {
                  color: "#2e2e2e",
                  "&.Mui-focused": {
                    color: "secondary.main",

                  },
                },
              },
            }} >
            <InputLabel>When was the property built? (Optional)</InputLabel>
           <Select
            value={formData.propertyBuilt || ''}
            onChange={(e) => onChange('propertyBuilt', e.target.value)}
            label="When was the property built? (Optional)"
          >
            {builtYearOptions.map(year => (
              <MenuItem key={year} value={year.toString()}>{year}</MenuItem>
            ))}
          </Select>
           
          </ResponsiveFormControl>
        </Grid>
        
        <Grid item size={{xs:12, md:3}}>
          <ResponsiveFormControl
          
          fullWidth            
            sx={{
              "& .MuiOutlinedInput-root": {
                color: "#000",

                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#2e2e2e",
                },
                "&.Mui-focused": {
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#1976d2",
                  },
                },
                "& .MuiInputLabel-outlined": {
                  color: "#2e2e2e",
                  "&.Mui-focused": {
                    color: "secondary.main",

                  },
                },
              },
            }}>
            <InputLabel>Accepting booking since? (Optional)</InputLabel>
            <Select
              value={formData.bookingSince || ''}
              onChange={(e) => onChange('bookingSince', e.target.value)}
              label="Accepting booking since? (Optional)"
            >
              {bookingYearOptions.map(year => (
                <MenuItem key={year} value={year.toString()}>{year}</MenuItem>
              ))}
            </Select>
            
          </ResponsiveFormControl>
        </Grid>
        <Grid item size={{xs:12, md:4}}>

        </Grid>
        
        

<Grid item size={{xs:12}}>
<Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
  Contact details to be shared with guests
</Typography>
<Typography variant="body1" sx={{ mb: 3 }}>
  These contact details will be shared with the guests when they make a booking
</Typography>
<Grid container sx={{mt:3}} spacing={2}>

          <Grid item size={{xs:12, md:5}}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
          <ResponsiveTextField
            sx={{ flex: 1 /* your existing styles */ }}
            fullWidth
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={(e) => onChange('email', e.target.value)}
            error={!!errors.email}
            placeholder=""
          />
        </div>
      </Grid>


        
        <Grid item size={{xs:12, md:2}}>
          <ResponsiveTextField
            sx={{
              "& .MuiOutlinedInput-root": {
                color: "#000",

                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#2e2e2e",
                },
                "&.Mui-focused": {
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#1976d2",
                  },
                },
                "& .MuiInputLabel-outlined": {
                  color: "#2e2e2e",
                  "&.Mui-focused": {
                    color: "secondary.main",

                  },
                },
              },
            }}
            fullWidth
            
            label="Mobile Number"
            value={formData.mobileNumber}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, ""); // strips non-digits
              onChange('mobileNumber', value);
            }}
            error={!!errors.mobileNumber}
            placeholder=""
            inputProps={{
              maxLength: 10,
              pattern: '[0-9]*',
              inputMode: 'numeric',
              onWheel: (e) => e.target.blur(),
            }}
            />
        </Grid>
        <Grid item size={{xs:12, md:3}}>
  <ResponsiveFormControl fullWidth >
    <InputLabel>Languages Spoken</InputLabel>
    <Select
      multiple
      value={Array.isArray(formData.languagesSpoken) ? formData.languagesSpoken : []}
      onChange={(e) => onChange('languagesSpoken', typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
      renderValue={(selected) => Array.isArray(selected) ? selected.join(', ') : selected}
      label="Languages Spoken"
    >
      {languageOptions.map((name) => (
        <MenuItem key={name} value={name}>
          <Checkbox checked={(formData.languagesSpoken || []).indexOf(name) > -1} />
          <ListItemText primary={name} />
        </MenuItem>
      ))}
    </Select>
  </ResponsiveFormControl>
</Grid>
        
        <Grid item size={{xs:12, md:2}}>
          <ResponsiveTextField
                     
            sx={{
              "& .MuiOutlinedInput-root": {
                color: "#000",

                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#2e2e2e",
                },
                "&.Mui-focused": {
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#1976d2",
                  },
                },
                "& .MuiInputLabel-outlined": {
                  color: "#2e2e2e",
                  "&.Mui-focused": {
                    color: "secondary.main",

                  },
                },
              },
            }}
            fullWidth
            label="Landline (Optional)"
            value={formData.landline}
            onChange={(e) => onChange('landline', e.target.value)}
            error={!!errors.landline}
            helperText={errors.landline}
            placeholder=""
            inputProps={{
              maxLength: 11,
              pattern: '[0-9]*',
              inputMode: 'numeric',
              onWheel: (e) => e.target.blur(),
            }}
          />
        </Grid>
        </Grid>
      </Grid>
      </Grid>
    </div>
  );
}