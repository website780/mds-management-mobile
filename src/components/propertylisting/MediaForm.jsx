'use client'
import { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Typography, Button, Grid, Card, CardMedia,
  IconButton, Chip, TextField, Dialog, DialogTitle, DialogContent,
  DialogActions, FormControlLabel, Checkbox, Alert, LinearProgress,
  List, ListItem, ListItemIcon, ListItemText, Badge, Divider, ListItemButton
} from '@mui/material';
import {
  CloudUpload, Delete, Edit, Star, Close, Search, ArrowBack, ArrowForward
} from '@mui/icons-material';
import {
  uploadPropertyMedia, updateMediaItem, deleteMediaItem, completeMediaStep
} from '@/redux/features/property/propertySlice';
import { useConfirm } from '@/hooks/useConfirm';
import toast from 'react-hot-toast';
import ResponsiveTextField from '../ResponsiveTextField';

const MediaForm = ({ propertyId, onComplete, onBack, isEmbedded }) => {
  const dispatch = useDispatch();
  const { currentProperty, isLoading, error } = useSelector(state => state.property);
  const { confirm, ConfirmDialog } = useConfirm();

  const [editingMedia, setEditingMedia] = useState(null);
  const [editDialog, setEditDialog] = useState(false);
  const [tagGroupDialog, setTagGroupDialog] = useState(false);
  const [isProcessingUpload, setIsProcessingUpload] = useState(false);
  
  // Carousel State synced with RoomMediaForm structure
  const [selectedGroupContext, setSelectedGroupContext] = useState(null); 
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  const [customTag, setCustomTag] = useState('');
  const [validationError, setValidationError] = useState('');

  const fileInputRef = useRef(null);

  const images = currentProperty?.media?.images || [];
  const videos = currentProperty?.media?.videos || [];
  const allMedia = [...images, ...videos];

  const itemsWithoutTags = allMedia.filter(item => !item.tags || item.tags.length === 0);

  const availableTags = [
    'Activities and Experiences', 'Bhojnalay', 'Bonfire', 'Entrance', 
    'Food', 'Food Menu', 'Kitchen', 'Living area', 'Lobby/ Common Area', 
    'Lounge', 'Others', 'OutsideView', 'Room', 'Washroom', 'Bed',
  ];

  const getMediaByTag = () => {
    const groupedMedia = {};
    allMedia.forEach(item => {
      if (item.tags && item.tags.length > 0) {
        item.tags.forEach(tag => {
          if (!groupedMedia[tag]) groupedMedia[tag] = [];
          groupedMedia[tag].push(item);
        });
      }
    });
    return groupedMedia;
  };

  const groupedMedia = getMediaByTag();

  // Derived state for the Carousel (Identical to RoomMediaForm logic)
  const carouselItems = selectedGroupContext ? (groupedMedia[selectedGroupContext.tag] || []) : [];
  const safeIndex = Math.min(selectedImageIndex, Math.max(0, carouselItems.length - 1));
  const currentCarouselItem = carouselItems[safeIndex];

  useEffect(() => {
    if (tagGroupDialog && carouselItems.length === 0) {
      setTagGroupDialog(false);
      setSelectedGroupContext(null);
    }
  }, [carouselItems.length, tagGroupDialog]);

  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files);
    setValidationError('');

    if (files.length > 20) {
      setValidationError('You can upload maximum 20 files at once');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (files.length === 0) return;

    const formData = new FormData();
    files.forEach(file => formData.append('media', file));

    setIsProcessingUpload(true);
    try {
      const result = await dispatch(uploadPropertyMedia({ propertyId, formData })).unwrap();
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      // Automatically open the tag dialog for the first untagged item
      const propData = result.property || result;
      const updatedMedia = [...(propData?.media?.images || []), ...(propData?.media?.videos || [])];
      const newlyUntagged = updatedMedia.find(item => !item.tags || item.tags.length === 0);
      if (newlyUntagged) {
        handleEditMedia(newlyUntagged);
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsProcessingUpload(false);
    }
  };

  const handleDeleteMedia = async (mediaId) => {
    const ok = await confirm({
      title: 'Delete Media?',
      description: 'This media item will be permanently removed.',
      confirmText: 'Delete',
      confirmColor: 'error',
    });
    if (!ok) return;
    try {
      await dispatch(deleteMediaItem({ propertyId, mediaId })).unwrap();
      setEditDialog(false);
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handleEditMedia = (mediaItem) => {
    setEditingMedia({ ...mediaItem, tags: mediaItem.tags || [] });
    setEditDialog(true);
  };

  const handleTagGroupClick = (tag) => {
    setSelectedGroupContext({ tag });
    setSelectedImageIndex(0);
    setTagGroupDialog(true);
  };

  const handleSaveEdit = async () => {
    if (!editingMedia?.tags || editingMedia.tags.length === 0) {
      toast.error('Please select at least one tag before saving.');
      return;
    }
    try {
      await dispatch(updateMediaItem({
        propertyId,
        mediaId: editingMedia._id,
        data: { tags: editingMedia.tags, isCover: editingMedia.isCover, displayOrder: editingMedia.displayOrder }
      })).unwrap();
      setEditDialog(false);
      setEditingMedia(null);
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  const handleCompleteStep = async () => {
    if (itemsWithoutTags.length > 0) {
      setValidationError(`${itemsWithoutTags.length} media item(s) are missing tags. Please add tags to all media items before proceeding.`);
      return;
    }
    try {
      await dispatch(completeMediaStep(propertyId)).unwrap();
      onComplete?.();
    } catch (error) {
      console.error('Complete step failed:', error);
    }
  };

  const handleTagToggle = (tag) => {
    if (!editingMedia) return;
    setEditingMedia(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag]
    }));
  };

  const removeTag = (tagToRemove) => {
    setEditingMedia(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
  };

  const addCustomTag = () => {
    if (customTag.trim() && !editingMedia.tags.includes(customTag.trim())) {
      setEditingMedia(prev => ({ ...prev, tags: [...prev.tags, customTag.trim()] }));
      setCustomTag('');
    }
  };

  const nextImage = () => { if (safeIndex < carouselItems.length - 1) setSelectedImageIndex(safeIndex + 1); };
  const previousImage = () => { if (safeIndex > 0) setSelectedImageIndex(safeIndex - 1); };

  const handleSetCoverFromGroup = async (mediaItem) => {
    if (mediaItem.type !== 'image') return;
    try {
      await dispatch(updateMediaItem({
        propertyId, mediaId: mediaItem._id, data: { ...mediaItem, isCover: true }
      })).unwrap();
    } catch (error) {
      console.error('Set cover failed:', error);
    }
  };

  const TagGroupCard = ({ tag, mediaItems }) => {
    const firstImage = mediaItems[0];
    const imageCount = mediaItems.filter(item => item.type === 'image').length;
    const videoCount = mediaItems.filter(item => item.type === 'video').length;

    return (
      <Card 
        sx={{
          width: 260, position: 'relative', cursor: 'pointer', borderRadius: 3,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', overflow: 'visible', 
          background: 'transparent', boxShadow: 'none',
          '&:hover': { transform: 'translateY(-4px)', '& .image-container': { boxShadow: 6 } }
        }}
        onClick={() => handleTagGroupClick(tag)}
      >
        <Box sx={{ position: 'absolute', top: -6, left: 10, right: 10, height: '10px', bgcolor: '#e0e0e0', borderRadius: '8px 8px 0 0', zIndex: 0 }} />
        <Box className="image-container" sx={{ height: 180, width: '100%', bgcolor: '#f5f5f5', borderRadius: 3, overflow: 'hidden', position: 'relative', zIndex: 1, border: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {firstImage.type === 'image' ? (
            <CardMedia component="img" image={firstImage.url} alt={firstImage.filename} sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
          ) : (
            <video src={firstImage.url} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} muted />
          )}
          <Badge badgeContent={mediaItems.length} color="primary" sx={{ position: 'absolute', top: 12, right: 12 }} />
        </Box>
        <Box sx={{ p: 1.5, textAlign: 'center' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#333', mb: 0.5 }}>{tag}</Typography>
          <Typography variant="caption" color="text.secondary">
            {imageCount} {imageCount === 1 ? 'Photo' : 'Photos'} {videoCount > 0 && ` • ${videoCount} Videos`}
          </Typography>
        </Box>
      </Card>
    );
  };

  return (
    <Box>
      <ConfirmDialog />
      <Typography sx={{ marginBottom: "20px"}} variant="subtitle1" gutterBottom><Divider className="py-5" /></Typography>
      <Typography variant="h5" gutterBottom>
        Upload Photos and Videos of the Property
        <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
          Upload photos and videos to showcase unique features. Each item must have at least one tag.
        </Typography>
      </Typography>

      <Box className='flex justify-between items-center mb-4'>
        <Typography variant="h5" gutterBottom></Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <input ref={fileInputRef} type="file" multiple accept="image/*,video/*" onChange={handleFileSelect} style={{ display: 'none' }} />
          <Button variant="contained" sx={{ bgcolor: '#1035ac', color: 'white', '&:hover': { bgcolor: '#0c2780' } }} startIcon={<CloudUpload />} onClick={() => fileInputRef.current?.click()} disabled={isLoading}>
            {isLoading ? 'Uploading...' : 'Upload Files'}
          </Button>
        </Box>
      </Box>

      {validationError && <Alert severity="error" sx={{ mb: 2 }}>{validationError}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {isLoading && (<Box sx={{ mt: 2, mb: 2 }}><Typography variant="body2" sx={{ mb: 1 }}>Uploading files...</Typography><LinearProgress /></Box>)}

      {Object.keys(groupedMedia).length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>Media by Tags</Typography>
          <Grid container spacing={2}>
            {Object.entries(groupedMedia).map(([tag, mediaItems]) => (
              <Grid item key={tag}><TagGroupCard tag={tag} mediaItems={mediaItems} /></Grid>
            ))}
          </Grid>
        </Box>
      )}

      {itemsWithoutTags.length > 0 && !isProcessingUpload && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom color="error">Untagged Media ({itemsWithoutTags.length})</Typography>
          <Grid container spacing={2}>
            {itemsWithoutTags.map((mediaItem) => (
              <Grid item key={mediaItem._id}>
                <Card sx={{ width: 200, height: 150, position: 'relative', cursor: 'pointer', border: '2px solid #f44336', borderRadius: 2, overflow: 'hidden', '&:hover': { transform: 'scale(1.02)', transition: 'transform 0.2s ease-in-out', boxShadow: 3 }}} onClick={() => handleEditMedia(mediaItem)}>
                  {mediaItem.type === 'image' ? (
                    <CardMedia component="img" image={`${mediaItem.url}`} sx={{ height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <video src={`${mediaItem.url}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted loop autoPlay preload="metadata" />
                  )}
                  <Chip label="Needs Tags" color="error" size="small" sx={{ position: 'absolute', top: 8, left: 8, fontSize: '0.7rem', height: 20 }} />
                  <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); handleDeleteMedia(mediaItem._id); }} sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(255,255,255,0.9)', '&:hover': { bgcolor: 'white' }, zIndex: 10 }}>
                    <Delete fontSize="small" />
                  </IconButton>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      <Alert severity={allMedia.length >= 1 ? "success" : "info"} sx={{ mb: 2 }}>
        {allMedia.length >= 1 ? `Great! You have ${allMedia.length} media items uploaded.` : `You need at least 1 media item. Currently have ${allMedia.length}.`}
      </Alert>

      {/* Identical Carousel Dialog to RoomMediaForm */}
      <Dialog open={tagGroupDialog} onClose={() => setTagGroupDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" component="span">
            {selectedGroupContext?.tag} ({carouselItems.length} items)
          </Typography>
          <IconButton onClick={() => setTagGroupDialog(false)}><Close /></IconButton>
        </DialogTitle>
        <DialogContent>
          {currentCarouselItem && (
            <Box sx={{ position: 'relative' }}>
              {currentCarouselItem.type === 'image' ? (
              <img src={currentCarouselItem.url} style={{ width: '100%', maxHeight: '70vh', objectFit: 'contain', borderRadius: 8 }} />
            ) : (
                <video src={currentCarouselItem.url} style={{ width: '100%', height: '500px', borderRadius: 8 }} controls />
              )}

              {safeIndex > 0 && (
                <IconButton onClick={previousImage} sx={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', bgcolor: 'rgba(0,0,0,0.5)', color: 'white' }}>
                  <ArrowBack />
                </IconButton>
              )}
              {safeIndex < carouselItems.length - 1 && (
                <IconButton onClick={nextImage} sx={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', bgcolor: 'rgba(0,0,0,0.5)', color: 'white' }}>
                  <ArrowForward />
                </IconButton>
              )}
              <Chip label={`${safeIndex + 1} / ${carouselItems.length}`} sx={{ position: 'absolute', bottom: 16, right: 16, bgcolor: 'rgba(0,0,0,0.7)', color: 'white' }} />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {currentCarouselItem?.type === 'image' && (
            <Button startIcon={<Star />} onClick={() => handleSetCoverFromGroup(currentCarouselItem)} disabled={currentCarouselItem.isCover}>
              {currentCarouselItem.isCover ? 'Cover Photo' : 'Set as Cover'}
            </Button>
          )}
          <Button startIcon={<Edit />} onClick={() => handleEditMedia(currentCarouselItem)}>
            Edit Tags
          </Button>
          <Button startIcon={<Delete />} color="error" onClick={() => handleDeleteMedia(currentCarouselItem._id)}>
            Delete
          </Button>
          <Box sx={{ flexGrow: 1 }} />
          <Button onClick={() => setTagGroupDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>{editingMedia?.tags?.length > 0 ? editingMedia.tags[0] : 'Add Tags'}</DialogTitle>
        <DialogContent>
          {editingMedia && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={{ position: 'relative' }}>
                  {editingMedia.type === 'image' ? (
                    <img src={`${editingMedia.url}`} style={{ width: '100%', height: '400px', objectFit: 'cover', borderRadius: '8px' }} />
                  ) : (
                    <video src={`${editingMedia.url}`} style={{ width: '100%', height: '400px', objectFit: 'cover', borderRadius: '8px' }} controls />
                  )}
                  <IconButton sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(255,255,255,0.8)' }} onClick={() => handleDeleteMedia(editingMedia._id)}>
                    <Delete />
                  </IconButton>
                </Box>
                {editingMedia.type === 'image' && (
                  <FormControlLabel control={<Checkbox checked={editingMedia.isCover || false} onChange={(e) => setEditingMedia(prev => ({ ...prev, isCover: e.target.checked }))} />} label="Set as cover photo" sx={{ mt: 2 }} />
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Tags Added</Typography>
                <Box sx={{ mb: 2, minHeight: 60, border: `1px solid ${(!editingMedia.tags || editingMedia.tags.length === 0) ? '#f44336' : '#e0e0e0'}`, borderRadius: 1, p: 2, bgcolor: '#f9f9f9', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                  {editingMedia.tags.length > 0 ? (
                    editingMedia.tags.map((tag) => <Chip key={tag} label={tag} onDelete={() => removeTag(tag)} deleteIcon={<Close />} color="primary" variant="outlined" />)
                  ) : (<Typography variant="body2" color="text.secondary">No tags selected</Typography>)}
                </Box>
                <ResponsiveTextField fullWidth placeholder="Add Tags" value={customTag} onChange={(e) => setCustomTag(e.target.value)} onKeyPress={(e) => { if (e.key === 'Enter') addCustomTag(); }} sx={{ mb: 2 }} InputProps={{ startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} /> }} />
                <Box sx={{ maxHeight: 300, overflow: 'auto', border: '1px solid #e0e0e0', borderRadius: 1 }}>
                  <List dense>
                    {availableTags.map((tag) => (
                      <ListItem key={tag} dense disablePadding>
                        <ListItemButton onClick={() => handleTagToggle(tag)}>
                          <ListItemIcon><Checkbox edge="start" checked={editingMedia.tags.includes(tag)} size="small" /></ListItemIcon>
                          <ListItemText primary={tag} primaryTypographyProps={{ fontSize: '0.875rem' }} />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditDialog(false)} variant="outlined" sx={{ color: '#1035ac', borderColor:"#1035ac" }}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained" sx={{ bgcolor: '#1035ac', color: 'white', '&:hover': { bgcolor: '#0c2780' } }} disabled={!editingMedia?.tags || editingMedia.tags.length === 0}>Save</Button>
        </DialogActions>
      </Dialog>

      {!isEmbedded && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button variant="outlined" onClick={onBack} sx={{ color: '#1035ac', borderColor:"#1035ac" }}>Previous</Button>
          <Button variant="contained" sx={{ bgcolor: '#1035ac', color: 'white', '&:hover': { bgcolor: '#0c2780' } }} onClick={handleCompleteStep} disabled={isLoading || allMedia.length < 1 || itemsWithoutTags.length > 0}>Save & Continue</Button>
        </Box>
      )}
    </Box>
  );
};

export default MediaForm;