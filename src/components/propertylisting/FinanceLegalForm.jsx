// components/FinanceLegalForm.jsx
import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Typography, TextField, Select, MenuItem, FormControl, InputLabel,
  FormControlLabel, RadioGroup, Radio, Button, Paper, Grid, Alert,
  CircularProgress, Chip, FormLabel, Card, CardContent, CardMedia,
  styled, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon, CheckCircle as CheckCircleIcon,
  LocationOn as LocationIcon, Delete as DeleteIcon, Close as CloseIcon,
  ArrowBack, ArrowForward,
} from '@mui/icons-material';
import {
  completeFinanceLegalStep, getFinanceLegal, updateFinanceDetails,
  updateLegalDetails, uploadRegistrationDocument, deleteRegistrationDocument,
} from '@/redux/features/property/propertySlice';
import toast, { Toaster } from "react-hot-toast";
import { useConfirm } from '@/hooks/useConfirm';
import ResponsiveTextField from '../ResponsiveTextField';
import ResponsiveFormControl from '../ResponsiveFormControl';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const UploadArea = styled(Box)(({ theme }) => ({
  border: `2px dashed ${theme.palette.primary.main}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(2),
  textAlign: 'center',
  backgroundColor: theme.palette.action.hover,
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: theme.palette.action.selected,
    borderColor: theme.palette.primary.dark,
  },
}));

const CompactCardContent = styled(CardContent)({
  padding: '16px',
  '&:last-child': {
    paddingBottom: '16px',
  },
});

const FinanceLegalForm = forwardRef(({ propertyId, onComplete }, ref) => {
  const dispatch = useDispatch();
  const { confirm, ConfirmDialog } = useConfirm();

  const { currentFinanceLegal, isLoading, error } = useSelector(state => state.property);
  const errorMessage = typeof error === 'string' ? error : error?.message || null;
  
  const [financeData, setFinanceData] = useState({
    bankDetails: { accountNumber: '', reenterAccountNumber: '', ifscCode: '', bankName: '' },
    taxDetails: { hasGSTIN: false, gstin: '', pan: '', hasTAN: false, tan: '' }
  });
  
  const [legalData, setLegalData] = useState({
    ownershipDetails: { ownershipType: '', propertyAddress: '' }
  });
  
  const [accountNumberError, setAccountNumberError] = useState('');
  const [previewDialog, setPreviewDialog] = useState(false);
  const [selectedDocIndex, setSelectedDocIndex] = useState(0);
  
  // NEW: State to hold files locally before the final save
  const [pendingFiles, setPendingFiles] = useState([]);
  
  const fileInputRef = useRef(null);
  const initialLoadRef = useRef(true);
  const hasAutoCompleted = useRef(false);

  // Clean up object URLs to prevent memory leaks when component unmounts
  useEffect(() => {
    return () => {
      pendingFiles.forEach(fileObj => URL.revokeObjectURL(fileObj.previewUrl));
    };
  }, [pendingFiles]);

  useEffect(() => {
    if (propertyId) {
      dispatch(getFinanceLegal(propertyId));
    }
  }, [dispatch, propertyId]);

  useEffect(() => {
    if (currentFinanceLegal) {
      setFinanceData({
        bankDetails: currentFinanceLegal.finance?.bankDetails || financeData.bankDetails,
        taxDetails: currentFinanceLegal.finance?.taxDetails || financeData.taxDetails
      });
      setLegalData({
        ownershipDetails: currentFinanceLegal.legal?.ownershipDetails || legalData.ownershipDetails
      });
    }
  }, [currentFinanceLegal]);

  useEffect(() => {
    if (!currentFinanceLegal) return;
    const isFinanceDone = currentFinanceLegal.financeCompleted;
    const isLegalDone = currentFinanceLegal.legalCompleted;

    if (initialLoadRef.current) {
      if (Object.keys(currentFinanceLegal).length > 0) {
        initialLoadRef.current = false; 
        if (isFinanceDone && isLegalDone) {
          hasAutoCompleted.current = true;
          onComplete?.();
        }
      }
      return;
    }

    if (!isFinanceDone || !isLegalDone) {
      hasAutoCompleted.current = false;
      return;
    }

    if (isFinanceDone && isLegalDone && !hasAutoCompleted.current) {
      hasAutoCompleted.current = true;
      dispatch(completeFinanceLegalStep(propertyId))
        .unwrap()
        .then(() => {
          onComplete?.();
          toast.success('Finance & Legal step completed!');
        })
        .catch((error) => {
          hasAutoCompleted.current = false;
          toast.error(`Validation errors:\n${error.errors?.join('\n') || error.message}`);
        });
    }
  }, [currentFinanceLegal, dispatch, propertyId, onComplete]);

  // ─── Ref Logic: Saves text fields FIRST, then uploads documents ─────────
  useImperativeHandle(ref, () => ({
    saveAll: async () => {
      if (financeData.bankDetails.accountNumber !== financeData.bankDetails.reenterAccountNumber) {
        setAccountNumberError('Account numbers do not match');
        toast.error('Account numbers do not match');
        return false;
      }
      
      try {
        // 1. Save text fields to satisfy backend validation
        await dispatch(updateFinanceDetails({ propertyId, data: financeData })).unwrap();
        await dispatch(updateLegalDetails({ propertyId, data: legalData })).unwrap();

        // 2. Upload pending documents ONLY after text fields are successfully saved
        if (pendingFiles.length > 0) {
          const toastId = toast.loading('Uploading documents...');
          try {
            for (const pending of pendingFiles) {
              const formData = new FormData();
              formData.append('registrationDocument', pending.file);
              await dispatch(uploadRegistrationDocument({ propertyId, formData })).unwrap();
            }
            toast.success('All documents uploaded successfully!', { id: toastId });
            setPendingFiles([]); // Clear pending files after success
          } catch (uploadErr) {
            toast.error(uploadErr.message || 'Failed to upload some documents', { id: toastId });
            return false; // Stop progression if upload fails
          }
        }
        return true;
      } catch (error) {
        toast.error(error.message || 'Failed to save Finance & Legal details');
        return false;
      }
    }
  }));

  const handleFinanceChange = (section, field, value) => {
    setFinanceData(prev => ({
      ...prev, [section]: { ...prev[section], [field]: value }
    }));
    if (field === 'accountNumber' || field === 'reenterAccountNumber') {
      setAccountNumberError('');
    }
  };

  const handleLegalChange = (section, field, value) => {
    setLegalData(prev => ({
      ...prev, [section]: { ...prev[section], [field]: value }
    }));
  };

  // ─── Only stores file locally instead of dispatching immediately ─────────
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    if (file.size > 15 * 1024 * 1024) {
      toast.error('File size must be less than 15MB');
      return;
    }
    
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only PDF, PNG, JPG, and JPEG files are allowed');
      return;
    }
    
    // Create a local preview URL and add to pending state
    const previewUrl = URL.createObjectURL(file);
    setPendingFiles(prev => [...prev, { file, previewUrl, originalName: file.name }]);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // ─── Handles deletion for both saved and pending documents ──────────────
  const handleDeleteDocument = async (doc) => {
    const ok = await confirm({
      title: 'Delete Document?',
      description: 'This document will be permanently removed.',
      confirmText: 'Delete',
      confirmColor: 'error',
    });
    if (!ok) return;

    if (doc.isPending) {
      // Remove from local pending state
      setPendingFiles(prev => prev.filter((_, i) => i !== doc.pendingIndex));
      setPreviewDialog(false);
      toast.success('Pending document removed');
    } else {
      // Remove from backend
      try {
        const identifier = doc._id || doc.filename;
        await dispatch(deleteRegistrationDocument({ propertyId, documentId: identifier })).unwrap();
        toast.success('Document deleted successfully!');
        setPreviewDialog(false);
      } catch (error) {
        toast.error(error.message || 'Failed to delete document');
      }
    }
  };

  const openPreview = (index) => {
    setSelectedDocIndex(index);
    setPreviewDialog(true);
  };

  // ─── Merge backend documents and local pending files for UI ─────────────
  const savedDocuments = currentFinanceLegal?.legal?.ownershipDetails?.registrationDocuments || [];
  const allDocuments = [
    ...savedDocuments.map(doc => ({ ...doc, isPending: false })),
    ...pendingFiles.map((pf, index) => ({
      _id: `pending-${index}`, 
      originalName: pf.originalName, 
      url: pf.previewUrl, 
      isPending: true, 
      pendingIndex: index 
    }))
  ];

  const nextDocument = () => {
    if (selectedDocIndex < allDocuments.length - 1) setSelectedDocIndex(selectedDocIndex + 1);
  };

  const previousDocument = () => {
    if (selectedDocIndex > 0) setSelectedDocIndex(selectedDocIndex - 1);
  };

  const currentDocument = allDocuments[selectedDocIndex];

  if (isLoading && !currentFinanceLegal) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper elevation={2} sx={{ p: 2, mx: 'auto', mt: 2 }}>
      <Toaster position="top-right" />
      <ConfirmDialog />
      
      {errorMessage && <Alert severity="error" sx={{ mb: 2 }}>{errorMessage}</Alert>}

      <Grid container spacing={3} alignItems="stretch">
        
        {/* LEFT COLUMN: Banking & Tax */}
        <Grid item size={{xs: 12, lg: 6}} sx={{ display: 'flex' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="h6">Finance Details</Typography>
              {currentFinanceLegal?.financeCompleted && (
                <Chip icon={<CheckCircleIcon />} label="Completed" color="success" variant="outlined" />
              )}
            </Box>

            <Card variant="outlined" sx={{ mb: 2 }}>
              <CompactCardContent>
                <Grid container spacing={2}>
                  <Grid item size={{ xs:12, sm:6}}>
                    <ResponsiveTextField  fullWidth label="Account Number" value={financeData.bankDetails.accountNumber} onChange={(e) => handleFinanceChange('bankDetails', 'accountNumber', e.target.value)} required error={!!accountNumberError} />
                  </Grid>
                  <Grid item size={{ xs:12, sm:6}}>
                    <ResponsiveTextField  fullWidth label="Re-enter Account" value={financeData.bankDetails.reenterAccountNumber} onChange={(e) => handleFinanceChange('bankDetails', 'reenterAccountNumber', e.target.value)} required error={!!accountNumberError} helperText={accountNumberError} />
                  </Grid>
                  <Grid item size={{ xs:12, sm:6}}>
                    <ResponsiveTextField  fullWidth label="IFSC Code" value={financeData.bankDetails.ifscCode} onChange={(e) => handleFinanceChange('bankDetails', 'ifscCode', e.target.value.toUpperCase())} required />
                  </Grid>
                  <Grid item size={{ xs:12, sm:6}}>
                    <ResponsiveFormControl fullWidth required>
                      <InputLabel>Bank Name</InputLabel>
                      <Select value={financeData.bankDetails.bankName} label="Bank Name" onChange={(e) => handleFinanceChange('bankDetails', 'bankName', e.target.value)}>
                        <MenuItem value="State Bank of India">State Bank of India</MenuItem>
                        <MenuItem value="HDFC Bank">HDFC Bank</MenuItem>
                        <MenuItem value="ICICI Bank">ICICI Bank</MenuItem>
                        <MenuItem value="Axis Bank">Axis Bank</MenuItem>
                        <MenuItem value="Punjab National Bank">Punjab National Bank</MenuItem>
                        <MenuItem value="Bank of Baroda">Bank of Baroda</MenuItem>
                      </Select>
                    </ResponsiveFormControl>
                  </Grid>
                </Grid>
              </CompactCardContent>
            </Card>

            <Card variant="outlined" sx={{ flexGrow: 1 }}>
              <CompactCardContent>
                <Box display="flex" alignItems="center" gap={2} mb={1}>
                  <FormLabel sx={{ fontSize: '0.875rem' }}>Have GSTIN?</FormLabel>
                  <RadioGroup row value={financeData.taxDetails.hasGSTIN} onChange={(e) => handleFinanceChange('taxDetails', 'hasGSTIN', e.target.value === 'true')}>
                    <FormControlLabel value={false} control={<Radio />} label="No" sx={{ '.MuiTypography-root': { fontSize: '0.875rem' } }} />
                    <FormControlLabel value={true} control={<Radio />} label="Yes" sx={{ '.MuiTypography-root': { fontSize: '0.875rem' } }} />
                  </RadioGroup>
                </Box>

                <Grid container spacing={2}>
                  <Grid item size={{ xs:12, sm:6}}>
                    <ResponsiveTextField  fullWidth label="GSTIN" value={financeData.taxDetails.gstin} onChange={(e) => handleFinanceChange('taxDetails', 'gstin', e.target.value.toUpperCase())} disabled={!financeData.taxDetails.hasGSTIN} required={financeData.taxDetails.hasGSTIN} />
                  </Grid>
                  <Grid item size={{ xs:12, sm:6}}>
                    <ResponsiveTextField  fullWidth label="PAN" value={financeData.taxDetails.pan} onChange={(e) => handleFinanceChange('taxDetails', 'pan', e.target.value.toUpperCase())} required />
                  </Grid>
                </Grid>

                <Box display="flex" alignItems="center" gap={2} mt={1} mb={financeData.taxDetails.hasTAN ? 1 : 0}>
                  <FormLabel sx={{ fontSize: '0.875rem' }}>Have TAN?</FormLabel>
                  <RadioGroup row value={financeData.taxDetails.hasTAN} onChange={(e) => handleFinanceChange('taxDetails', 'hasTAN', e.target.value === 'true')}>
                    <FormControlLabel value={false} control={<Radio />} label="No" sx={{ '.MuiTypography-root': { fontSize: '0.875rem' } }} />
                    <FormControlLabel value={true} control={<Radio />} label="Yes" sx={{ '.MuiTypography-root': { fontSize: '0.875rem' } }} />
                  </RadioGroup>
                </Box>

                {financeData.taxDetails.hasTAN && (
                  <ResponsiveTextField  fullWidth label="TAN" value={financeData.taxDetails.tan} onChange={(e) => handleFinanceChange('taxDetails', 'tan', e.target.value.toUpperCase())} required={financeData.taxDetails.hasTAN} />
                )}
              </CompactCardContent>
            </Card>
          </Box>
        </Grid>

        {/* RIGHT COLUMN: Legal & Ownership */}
        <Grid item size={{xs: 12, lg: 6}} sx={{ display: 'flex' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="h6">Legal Details</Typography>
              {currentFinanceLegal?.legalCompleted && (
                <Chip icon={<CheckCircleIcon />} label="Completed" color="success" variant="outlined" />
              )}
            </Box>

            <Card variant="outlined" sx={{ flexGrow: 1 }}>
              <CompactCardContent>
                <ResponsiveFormControl fullWidth required sx={{ mb: 2 }}>
                  <InputLabel>Ownership Type</InputLabel>
                  <Select value={legalData.ownershipDetails.ownershipType} label="Ownership Type" onChange={(e) => handleLegalChange('ownershipDetails', 'ownershipType', e.target.value)}>
                    <MenuItem value="My Own property">My Own property</MenuItem>
                    <MenuItem value="Leased property">Leased property</MenuItem>
                    <MenuItem value="Family property">Family property</MenuItem>
                    <MenuItem value="Partnership">Partnership</MenuItem>
                    <MenuItem value="Trust property">Trust property</MenuItem>
                  </Select>
                </ResponsiveFormControl>

                {currentFinanceLegal?.legal?.ownershipDetails?.propertyAddress && (
                  <Alert severity="info" icon={<LocationIcon />} sx={{ py: 0, mb: 2, '.MuiAlert-message': { fontSize: '0.85rem' } }}>
                    Address: {currentFinanceLegal.legal.ownershipDetails.propertyAddress}
                  </Alert>
                )}

                {allDocuments.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" fontWeight={600} gutterBottom>
                      Uploaded Documents ({allDocuments.length})
                    </Typography>
                    <Box display="flex" gap={1} flexWrap="wrap">
                      {allDocuments.map((doc, index) => (
                        <Card 
                          key={doc._id || index}
                          sx={{
                            width: 100,
                            height: 80,
                            position: 'relative',
                            cursor: 'pointer',
                            border: '1px solid',
                            borderColor: doc.isPending ? 'warning.main' : 'success.main',
                            '&:hover': { transform: 'scale(1.05)', transition: 'all 0.2s' }
                          }}
                          onClick={() => openPreview(index)}
                        >
                          {doc.originalName?.match(/\.(jpg|jpeg|png)$/i) ? (
                            <CardMedia component="img" image={doc.url} sx={{ height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f5f5' }}>
                              <Typography variant="caption" align="center" sx={{ px: 1, fontSize: '0.65rem' }}>
                                {doc.originalName}
                              </Typography>
                            </Box>
                          )}
                          {doc.isPending && (
                            <Box sx={{ position: 'absolute', bottom: 0, width: '100%', bgcolor: 'warning.main', color: 'white', textAlign: 'center', fontSize: '0.65rem' }}>
                              Pending
                            </Box>
                          )}
                          <IconButton
                            sx={{ position: 'absolute', top: 2, right: 2, p: 0.2, bgcolor: 'rgba(255,255,255,0.8)' }}
                            onClick={(e) => { e.stopPropagation(); handleDeleteDocument(doc); }}
                          >
                            <DeleteIcon sx={{ fontSize: '1rem' }} color="error" />
                          </IconButton>
                        </Card>
                      ))}
                    </Box>
                  </Box>
                )}

                <UploadArea >
                  <Box  height={100} display="flex" alignItems="center" justifyContent="center" gap={2}>
                    <CloudUploadIcon color="primary" />
                    <Typography variant="body2">Drag & Drop or</Typography>
                    <Button component="label" variant="outlined">
                      Browse
                      <VisuallyHiddenInput ref={fileInputRef} type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={handleFileSelect} />
                    </Button>
                  </Box>
                </UploadArea>
              </CompactCardContent>
            </Card>
          </Box>
        </Grid>
      </Grid>

      {/* Preview Dialog */}
      <Dialog open={previewDialog} onClose={() => setPreviewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1" noWrap sx={{ maxWidth: '80%' }}>
            {currentDocument?.originalName} {currentDocument?.isPending && '(Pending Upload)'}
          </Typography>
          <IconButton onClick={() => setPreviewDialog(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, bgcolor: '#333', height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          {currentDocument && (
            <>
              {currentDocument.originalName?.match(/\.(jpg|jpeg|png)$/i) ? (
                <img src={currentDocument.url} alt="Doc" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
              ) : (
                <Button variant="contained" href={currentDocument.url} target="_blank">Open PDF</Button>
              )}
              <IconButton onClick={previousDocument} disabled={selectedDocIndex === 0} sx={{ position: 'absolute', left: 10, color: 'white' }}>
                <ArrowBack />
              </IconButton>
              <IconButton onClick={nextDocument} disabled={selectedDocIndex === allDocuments.length - 1} sx={{ position: 'absolute', right: 10, color: 'white' }}>
                <ArrowForward />
              </IconButton>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button color="error" onClick={() => currentDocument && handleDeleteDocument(currentDocument)}>Delete</Button>
          <Box sx={{ flexGrow: 1 }} />
          <Button onClick={() => setPreviewDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
});

FinanceLegalForm.displayName = 'FinanceLegalForm';

export default FinanceLegalForm;