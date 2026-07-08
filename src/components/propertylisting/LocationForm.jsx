import { 
  TextField, Grid, Typography, Box, FormControl, InputLabel, Select, MenuItem, FormHelperText
} from '@mui/material';
import { useEffect, useState, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import toast from 'react-hot-toast';
import ResponsiveTextField from '../ResponsiveTextField';
import ResponsiveFormControl from '../ResponsiveFormControl';

export default function LocationForm({ formData, onChange, errors, onSave }) {
  const indianStates = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", 
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", 
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", 
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", 
    "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
  ];
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const mapRef = useRef(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const searchInputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  
  const [geocodeCache, setGeocodeCache] = useState(new Map());
  const [reverseGeocodeCache, setReverseGeocodeCache] = useState(new Map());
  const [lastGeocodedAddress, setLastGeocodedAddress] = useState('');
  
  const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const createCoordKey = (lat, lng) => `${lat.toFixed(6)},${lng.toFixed(6)}`;
  const createAddressKey = (address) => address.toLowerCase().trim();

  const initializeMap = (lat = 19.238068, lng = 72.852251) => {
    if (mapRef.current && window.google && isMapLoaded) {
      const mapInstance = new window.google.maps.Map(mapRef.current, {
        center: { lat, lng },
        zoom: 15,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });

      const markerInstance = new window.google.maps.Marker({
        position: { lat, lng },
        map: mapInstance,
        draggable: true,
      });

      markerInstance.addListener('dragend', (event) => {
        const newLat = event.latLng.lat();
        const newLng = event.latLng.lng();
        reverseGeocode(newLat, newLng);
      });

      setMap(mapInstance);
      setMarker(markerInstance);
    }
  };

  const reverseGeocode = (lat, lng) => {
    if (!window.google) return;
    
    const coordKey = createCoordKey(lat, lng);
    
    if (reverseGeocodeCache.has(coordKey)) {
      const cachedResult = reverseGeocodeCache.get(coordKey);
      onChange('street', cachedResult.street);
      onChange('city', cachedResult.city);
      onChange('state', cachedResult.state);
      onChange('country', cachedResult.country);
      onChange('postalCode', cachedResult.postalCode);
      onChange('coordinates', { lat, lng });
      return;
    }
    
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const addressComponents = results[0].address_components;
        let streetNumber = '';
        let route = '';
        let locality = '';
        let administrativeAreaLevel1 = '';
        let country = '';
        let postalCode = '';

        addressComponents.forEach(component => {
          const types = component.types;
          if (types.includes('street_number')) streetNumber = component.long_name;
          else if (types.includes('route')) route = component.long_name;
          else if (types.includes('locality') || types.includes('sublocality_level_1')) locality = component.long_name;
          else if (types.includes('administrative_area_level_1')) administrativeAreaLevel1 = component.long_name;
          else if (types.includes('country')) country = component.long_name;
          else if (types.includes('postal_code')) postalCode = component.long_name;
        });

        const street = `${streetNumber} ${route}`.trim();
        const cacheData = {
          street: street || locality,
          city: locality,
          state: administrativeAreaLevel1,
          country: country,
          postalCode: postalCode
        };
        
        setReverseGeocodeCache(prev => new Map(prev.set(coordKey, cacheData)));
        
        onChange('street', cacheData.street);
        onChange('city', cacheData.city);
        onChange('state', cacheData.state);
        onChange('country', cacheData.country);
        onChange('postalCode', cacheData.postalCode);
        onChange('coordinates', { lat, lng });
      }
    });
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by this browser.');
      return;
    }

    setIsGettingLocation(true);
    const options = { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        if (map && marker && window.google) {
          const newPosition = new window.google.maps.LatLng(latitude, longitude);
          map.setCenter(newPosition);
          map.setZoom(18);
          marker.setPosition(newPosition);
        } else {
          initializeMap(latitude, longitude);
        }
        reverseGeocode(latitude, longitude);
        onChange('coordinates', { lat: latitude, lng: longitude });
        setIsGettingLocation(false);
      },
      (error) => {
        setIsGettingLocation(false);
        let errorMessage = 'Unable to get your current location. ';
        switch(error.code) {
          case error.PERMISSION_DENIED: errorMessage += 'Please allow location access in your browser settings.'; break;
          case error.POSITION_UNAVAILABLE: errorMessage += 'Location information is unavailable.'; break;
          case error.TIMEOUT: errorMessage += 'Location request timed out. Please try again.'; break;
          default: errorMessage += 'Please ensure location services are enabled.'; break;
        }
        toast.error(errorMessage);
      },
      options
    );
  };

  useEffect(() => {
    const loader = new Loader({
      apiKey: GOOGLE_MAPS_API_KEY,
      version: "weekly",
      libraries: ["places"]
    });

    loader.load().then(() => setIsMapLoaded(true)).catch(error => console.error('Error loading Google Maps:', error));
  }, []);

  useEffect(() => {
    if (isMapLoaded && window.google) {
      setTimeout(() => initializeMap(), 100);
    }
  }, [isMapLoaded]);

  useEffect(() => {
    if (isMapLoaded && searchInputRef.current && !autocompleteRef.current && window.google && window.google.maps && window.google.maps.places) {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(
        searchInputRef.current,
        {
          types: ['establishment', 'geocode'],
          fields: ['place_id', 'formatted_address', 'address_components', 'geometry']
        }
      );
      autocompleteRef.current.addListener('place_changed', handlePlaceSelect);
    }
  }, [isMapLoaded]);

  useEffect(() => {
    const geocodeAndUpdateMap = () => {
      if (!window.google || !map || !marker) return;
      const addressParts = [
        formData?.houseName, formData?.street, formData?.city, 
        formData?.state, formData?.postalCode, formData?.country
      ].filter(part => part && part.trim() !== '');
      
      if (addressParts.length === 0) return;
      const fullAddress = addressParts.join(', ');
      const addressKey = createAddressKey(fullAddress);
      
      if (lastGeocodedAddress === addressKey) return;
      
      if (geocodeCache.has(addressKey)) {
        const cachedCoords = geocodeCache.get(addressKey);
        map.setCenter({ lat: cachedCoords.lat, lng: cachedCoords.lng });
        map.setZoom(16);
        marker.setPosition({ lat: cachedCoords.lat, lng: cachedCoords.lng });
        onChange('coordinates', { lat: cachedCoords.lat, lng: cachedCoords.lng });
        setLastGeocodedAddress(addressKey);
        return;
      }
      
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: fullAddress }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const location = results[0].geometry.location;
          const lat = location.lat();
          const lng = location.lng();
          
          setGeocodeCache(prev => new Map(prev.set(addressKey, { lat, lng })));
          setLastGeocodedAddress(addressKey);
          
          map.setCenter({ lat, lng });
          map.setZoom(16);
          marker.setPosition({ lat, lng });
          onChange('coordinates', { lat, lng });
        }
      });
    };

    const timeoutId = setTimeout(() => geocodeAndUpdateMap(), 1000);
    return () => clearTimeout(timeoutId);
  }, [formData?.houseName, formData?.street, formData?.city, formData?.state, formData?.postalCode, formData?.country, map, marker, geocodeCache, lastGeocodedAddress]);

  const handlePlaceSelect = () => {
    const place = autocompleteRef.current.getPlace();
    if (!place.address_components) return;

    let lat = null, lng = null;

    if (place.geometry && map && marker) {
      const location = place.geometry.location;
      lat = location.lat();
      lng = location.lng();
      map.setCenter({ lat, lng });
      map.setZoom(16);
      marker.setPosition({ lat, lng });
    }

    const addressComponents = place.address_components;
    let streetNumber = '', route = '', locality = '', administrativeAreaLevel1 = '', country = '', postalCode = '';

    addressComponents.forEach(component => {
      const types = component.types;
      if (types.includes('street_number')) streetNumber = component.long_name;
      else if (types.includes('route')) route = component.long_name;
      else if (types.includes('locality') || types.includes('sublocality_level_1')) locality = component.long_name;
      else if (types.includes('administrative_area_level_1')) administrativeAreaLevel1 = component.long_name;
      else if (types.includes('country')) country = component.long_name;
      else if (types.includes('postal_code')) postalCode = component.long_name;
    });

    const street = `${streetNumber} ${route}`.trim();
    
    onChange('street', street || locality);
    onChange('city', locality);
    onChange('state', administrativeAreaLevel1);
    onChange('country', country);
    onChange('postalCode', postalCode);

    if (lat !== null && lng !== null) {
      onChange('coordinates', { lat, lng });
      const fullAddress = place.formatted_address || [street, locality, administrativeAreaLevel1, country, postalCode].filter(Boolean).join(', ');
      const addressKey = createAddressKey(fullAddress);
      setGeocodeCache(prev => new Map(prev.set(addressKey, { lat, lng })));
      setLastGeocodedAddress(addressKey);
    }
    
    if (searchInputRef.current) searchInputRef.current.value = '';
  };

  const commonTextFieldStyles = {
    "& .MuiOutlinedInput-root": {
      "& .MuiOutlinedInput-notchedOutline": { borderColor: "#2e2e2e" },
      "&.Mui-focused": { "& .MuiOutlinedInput-notchedOutline": { borderColor: "#1976d2" } },
      "& .MuiInputLabel-outlined": {
        color: "#2e2e2e",
        "&.Mui-focused": { color: "secondary.main" },
      },
    },
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Grid container spacing={4}>
        {/* Left Column: Form Details */}
        <Grid item size={{ xs: 12, md: 7, lg: 6 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
            Property Location Details
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Please fill in the location details of your property.
          </Typography>

          {/* Search Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="body2" color="primary" sx={{ mb: 1 }}>
              Search for your location:
            </Typography>
            <ResponsiveTextField
            
              sx={commonTextFieldStyles}
              fullWidth
              inputRef={searchInputRef}
              placeholder="Search here"
              variant="outlined"
              disabled={!isMapLoaded}
              helperText={!isMapLoaded ? "Loading Google Maps..." : "Start typing to search for your location"}
            />
            <Typography 
            size='small'
              variant="body2" 
              color="primary" 
              sx={{ 
                mt: 1,
                cursor: isGettingLocation ? 'wait' : 'pointer',
                opacity: isGettingLocation ? 0.6 : 1,
                display: 'inline-block',
                fontWeight: 500
              }}
              onClick={!isGettingLocation ? getCurrentLocation : undefined}
            >
              {isGettingLocation ? 'Getting Location...' : 'Or Use My Current Location'}
            </Typography>
          </Box>
          
         
        </Grid>

        {/* Right Column: Map */}
        <Grid item size={{ xs: 12, md: 5, lg: 6 }}>
          <Box
            ref={mapRef}
            sx={{
              width: '100%',
              height: { xs: '200px', md: '100%' }, // Responsive map height
              minHeight: '200px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              overflow: 'hidden' // Keeps rounded corners intact
            }}
          />
        </Grid>
         {/* Form Fields Section */}
          <Grid container spacing={2}>
            <Grid item size={{ xs: 12, sm: 2 }}>
              <ResponsiveTextField
              
                sx={commonTextFieldStyles}
                fullWidth
                label="House/Building/Apartment No."
                value={formData?.houseName || ''}
                onChange={(e) => onChange('houseName', e.target.value)}
                error={!!errors?.houseName}
                helperText={errors?.houseName}
              />
            </Grid>
            
            <Grid item size={{ xs: 12, sm: 2 }}>
              <ResponsiveTextField
              
                sx={commonTextFieldStyles}
                fullWidth
                label="Locality/Area/Street/Sector"
                value={formData?.street || ''}
                onChange={(e) => onChange('street', e.target.value)}
                error={!!errors?.street}
                helperText={errors?.street}
              />
            </Grid>
            
            <Grid item size={{ xs: 12, sm: 2 }}>
              <ResponsiveTextField
              
                sx={commonTextFieldStyles}
                fullWidth
                label="Pincode"
                value={formData?.postalCode || ''}
                onChange={(e) => onChange('postalCode', e.target.value)}
                error={!!errors?.postalCode}
                helperText={errors?.postalCode}
              />
            </Grid>

            <Grid item size={{ xs: 12, sm: 2 }}>
              <ResponsiveTextField
              
                sx={commonTextFieldStyles}
                fullWidth
                label="City"
                value={formData?.city || ''}
                onChange={(e) => onChange('city', e.target.value)}
                error={!!errors?.city}
                helperText={errors?.city}
              />
            </Grid>

            <Grid item size={{ xs: 12, sm: 2 }}>
              <ResponsiveFormControl fullWidth sx={commonTextFieldStyles} error={!!errors?.state}>
                <InputLabel>State</InputLabel>
                <Select
                  value={formData?.state || ''}
                  label="State"
                  onChange={(e) => onChange('state', e.target.value)}
                >
                  {indianStates.map((state) => (
                    <MenuItem key={state} value={state}>
                      {state}
                    </MenuItem>
                  ))}
                </Select>
                {errors?.state && <FormHelperText>{errors.state}</FormHelperText>}
              </ResponsiveFormControl>
            </Grid>
            
            <Grid item size={{ xs: 12, sm: 2 }}>
              <ResponsiveTextField
              
                sx={commonTextFieldStyles}
                fullWidth
                label="Country"
                value={formData?.country || ''}
                onChange={(e) => onChange('country', e.target.value)}
                error={!!errors?.country}
                helperText={errors?.country}
              />
            </Grid>
            
            <Grid item size={{ xs: 12, sm: 2 }}>
              <ResponsiveTextField
              
                sx={commonTextFieldStyles}
                fullWidth
                label="Latitude (Optional)"
                type="number"
                value={formData?.coordinates?.lat || ''}
                onChange={(e) => {
                  const newLat = parseFloat(e.target.value);
                  onChange('coordinates', { ...formData?.coordinates, lat: isNaN(newLat) ? null : newLat });
                }}
              />
            </Grid>

            <Grid item size={{ xs: 12, sm: 2 }}>
              <ResponsiveTextField
              
                sx={commonTextFieldStyles}
                fullWidth
                label="Longitude (Optional)"
                type="number"
                value={formData?.coordinates?.lng || ''}
                onChange={(e) => {
                  const newLng = parseFloat(e.target.value);
                  onChange('coordinates', { ...formData?.coordinates, lng: isNaN(newLng) ? null : newLng });
                }}
              />
            </Grid>
          </Grid> 
      </Grid>
    </Box>
  );
}