'use client'
import { useState, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
  Box, Typography, Button, Grid, Card, CardMedia, CardContent,
  IconButton, Chip, TextField, Dialog, DialogTitle, DialogContent,
  DialogActions, FormControlLabel, Checkbox, Alert, LinearProgress, Badge,
  List, ListItem, ListItemIcon, ListItemText,
} from '@mui/material';
import {
  CloudUpload, Delete, Edit, Star, Close, Search, ArrowBack, ArrowForward,
} from '@mui/icons-material';
import {
  uploadRoomMedia, updateRoomMediaItem, deleteRoomMediaItem,
} from '@/redux/features/property/propertySlice';
import toast from 'react-hot-toast';
import { useConfirm } from '@/hooks/useConfirm';

const SingleRoomMediaForm = ({
  propertyId,
  singleRoomId,
  singleRoom,
  onMediaUploaded,
  hideCompleteButton = false,
  onBack,
}) => {
  const dispatch = useDispatch();
  const { confirm, ConfirmDialog } = useConfirm();

  const [isUploading, setIsUploading]     = useState(false);
  const [editingMedia, setEditingMedia]   = useState(null);
  const [editDialog, setEditDialog]       = useState(false);
  const [tagGroupDialog, setTagGroupDialog] = useState(false);
  const [selectedTagGroup, setSelectedTagGroup] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [customTag, setCustomTag]         = useState('');
  const [validationError, setValidationError] = useState('');

  const fileInputRef = useRef(null);

  const availableRoomTags = [
    'Bed', 'Bathroom/Washroom', 'Room View', 'Balcony', 'Furniture',
    'Amenities', 'Decor', 'Lighting', 'Storage', 'Window View', 'Others',
  ];

  // ── Helper to safely extract the updated room from API results ──
  const extractUpdatedRoom = (result) => {
    // 1. If backend returns the full response object with a 'room' key
    if (result?.room) return result.room;

    // 2. If backend returns { property: { rooms: [...] } }
    if (result?.property?.rooms) {
      return result.property.rooms.find(r => r._id === singleRoomId || r.id === singleRoomId) || result;
    }

    // 3. FIX: If the Redux thunk returned the 'property' object directly! 
    // It will have a 'rooms' array, so we extract our specific room from it.
    if (result?.rooms && Array.isArray(result.rooms)) {
      return result.rooms.find(r => r._id === singleRoomId || r.id === singleRoomId) || result;
    }

    return result;
  };

  const getAllMedia = () => {
    if (!singleRoom?.media) return [];
    return [...(singleRoom.media.images || []), ...(singleRoom.media.videos || [])];
  };

  const getMediaByTag = () => {
    const grouped = {};
    getAllMedia().forEach(item => {
      (item.tags || []).forEach(tag => {
        if (!grouped[tag]) grouped[tag] = [];
        grouped[tag].push(item);
      });
    });
    return grouped;
  };

  const getUntaggedMedia = () =>
    getAllMedia().filter(item => !item.tags || item.tags.length === 0);

  // ── Upload ──
  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    setValidationError('');

    if (!singleRoomId) {
      toast.error('Please save the room before uploading media.');
      return;
    }
    if (files.length === 0) return;
    if (files.length > 20) {
      setValidationError('You can upload a maximum of 20 files at once.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const formData = new FormData();
    files.forEach(file => formData.append('media', file));

    setIsUploading(true);
    try {
      const result = await dispatch(
        uploadRoomMedia({ propertyId, roomId: singleRoomId, formData })
      ).unwrap();

      const updatedRoom = extractUpdatedRoom(result);
      onMediaUploaded?.(updatedRoom);
      
      const updatedMedia = [...(updatedRoom?.media?.images || []), ...(updatedRoom?.media?.videos || [])];
      const newlyUntagged = updatedMedia.find(item => !item.tags || item.tags.length === 0);
      if (newlyUntagged) {
        handleEditMedia(newlyUntagged);
      } else {
        toast.success('Media uploaded!');
      }
    } catch (err) {
      console.error('Upload failed:', err);
      setValidationError(err.message || 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // ── Delete ──
  const handleDeleteMedia = async (mediaId) => {
    const ok = await confirm({
      title: 'Delete Media?',
      description: 'This media item will be permanently removed.',
      confirmText: 'Delete',
      confirmColor: 'error',
    });
    if (!ok) return;

    try {
      const result = await dispatch(
        deleteRoomMediaItem({ propertyId, roomId: singleRoomId, mediaId })
      ).unwrap();

      onMediaUploaded?.(extractUpdatedRoom(result));
      setTagGroupDialog(false);
      setEditDialog(false);
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  // ── Edit / Tags ──
  const handleEditMedia = (mediaItem) => {
    setEditingMedia({ ...mediaItem, tags: mediaItem.tags || [] });
    setEditDialog(true);
  };

  const handleSaveEdit = async () => {
    if (!editingMedia?.tags?.length) {
      toast.error('Please select at least one tag before saving.');
      return;
    }
    try {
      const result = await dispatch(updateRoomMediaItem({
        propertyId,
        roomId: singleRoomId,
        mediaId: editingMedia._id,
        data: {
          tags: editingMedia.tags,
          isCover: editingMedia.isCover,
          displayOrder: editingMedia.displayOrder,
        },
      })).unwrap();

      onMediaUploaded?.(extractUpdatedRoom(result));
      setEditDialog(false);
      setEditingMedia(null);
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

  const handleSetCover = async (mediaItem) => {
    if (mediaItem.type !== 'image') return;
    try {
      const result = await dispatch(updateRoomMediaItem({
        propertyId,
        roomId: singleRoomId,
        mediaId: mediaItem._id,
        data: { isCover: !mediaItem.isCover },
      })).unwrap();
      
      onMediaUploaded?.(extractUpdatedRoom(result));
    } catch (err) {
      console.error('Set cover failed:', err);
    }
  };

  const handleTagToggle = (tag) => {
    if (!editingMedia) return;
    setEditingMedia(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const removeTag = (tag) =>
    setEditingMedia(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));

  const addCustomTag = () => {
    if (customTag.trim() && !editingMedia.tags.includes(customTag.trim())) {
      setEditingMedia(prev => ({ ...prev, tags: [...prev.tags, customTag.trim()] }));
      setCustomTag('');
    }
  };

  const handleTagGroupClick = (tag, mediaItems) => {
    setSelectedTagGroup({ tag, mediaItems });
    setSelectedImageIndex(0);
    setTagGroupDialog(true);
  };

  const nextImage = () => {
    if (selectedTagGroup && selectedImageIndex < selectedTagGroup.mediaItems.length - 1)
      setSelectedImageIndex(i => i + 1);
  };

  const previousImage = () => {
    if (selectedTagGroup && selectedImageIndex > 0)
      setSelectedImageIndex(i => i - 1);
  };

  const allMedia     = getAllMedia();
  const groupedMedia = getMediaByTag();
  const untagged     = getUntaggedMedia();
  const roomNotSaved = !singleRoomId;

  return (
    <Box id="media-upload-anchor">
      <ConfirmDialog />
<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
       <Box
  sx={{
    display: 'flex',
    flexDirection: { xs: 'column', sm: 'row' }, // Stack on mobile, side-by-side on larger screens
    justifyContent: 'space-between',
    alignItems: { xs: 'stretch', sm: 'flex-start' }, // Button stretches on mobile, aligns top on desktop
    gap: 2, // Adds space between text and button when stacked
    mb: 2,
  }}
>
  {/* Text Section */}
  <Box sx={{ flex: 1 }}>
    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
      Room Photos &amp; Videos
      {singleRoom?.roomName ? ` — ${singleRoom.roomName}` : ''}
      <Typography
        component="span"
        color="error.main"
        sx={{
          ml: { xs: 0, sm: 1 }, // Remove left margin on mobile so it flushes left when wrapped
          mt: { xs: 0.5, sm: 0 }, 
          width: { xs: '100%', sm: 'auto' }, // Forces to next line gracefully on very small screens
          fontSize: '0.9rem',
          fontWeight: 500,
        }}
      >
        (Minimum 1 photo required)
      </Typography>
    </Typography>
    
    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
      {roomNotSaved
        ? 'Save the room above to enable media upload.'
        : 'Upload photos and videos. Each item must have at least one tag.'}
    </Typography>
  </Box>

  {/* Button Section */}
  <Box sx={{ display: 'flex', flexShrink: 0 }}>
    <input
      ref={fileInputRef}
      type="file"
      multiple
      accept="image/*,video/*"
      onChange={handleFileSelect}
      style={{ display: 'none' }}
    />
    <Button
      variant="contained"
      startIcon={<CloudUpload />}
      sx={{
        bgcolor: '#1035ac',
        color: 'white',
        '&:hover': { bgcolor: '#0c2780' },
        width: { xs: '100%', sm: 'auto' }, // Full width on mobile, auto width on desktop
        height: 'fit-content',
        whiteSpace: 'nowrap',
      }}
      onClick={() => fileInputRef.current?.click()}
      disabled={roomNotSaved || isUploading}
      title={roomNotSaved ? 'Save the room first' : 'Upload files'}
    >
      {isUploading ? 'Uploading…' : 'Upload Files'}
    </Button>
  </Box>
</Box>
      </Box>

      {roomNotSaved && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Save the room details above before uploading media.
        </Alert>
      )}
      {validationError && (
        <Alert severity="error" sx={{ mb: 2 }}>{validationError}</Alert>
      )}
      {isUploading && <LinearProgress sx={{ mb: 2 }} />}

      {!roomNotSaved && allMedia.length === 0 && (
        <Alert severity="info">No media uploaded yet. Upload at least one photo to continue.</Alert>
      )}

      {Object.keys(groupedMedia).length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" gutterBottom fontWeight={600}>
            Media by Tag
          </Typography>
          <Grid container spacing={2}>
            {Object.entries(groupedMedia).map(([tag, items]) => {
              const first       = items[0];
              const imageCount  = items.filter(i => i.type === 'image').length;
              const videoCount  = items.filter(i => i.type === 'video').length;
              return (
                <Grid item key={tag}>
                  <Card
                    sx={{
                      width: 240, height: 180, position: 'relative', cursor: 'pointer',
                      border: '1px solid #e0e0e0', borderRadius: 2, overflow: 'hidden',
                      '&:hover': { transform: 'scale(1.02)', transition: 'transform 0.2s', boxShadow: 3 },
                    }}
                    onClick={() => handleTagGroupClick(tag, items)}
                  >
                    {first.type === 'image' ? (
                      <CardMedia component="img" image={first.url} alt={first.filename}
                        sx={{ width: '100%', height: '70%', objectFit: 'cover' }} />
                    ) : (
                      <video src={first.url}
                        style={{ width: '100%', height: '70%', objectFit: 'cover' }}
                        muted loop autoPlay preload="metadata" />
                    )}
                    <CardContent sx={{ height: '30%', p: 1 }}>
                      <Typography variant="subtitle2" fontWeight={600}>{tag}</Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                        {imageCount > 0 && (
                          <Chip label={`${imageCount} img`} size="small" color="primary" variant="outlined"
                            sx={{ fontSize: '0.65rem', height: 18 }} />
                        )}
                        {videoCount > 0 && (
                          <Chip label={`${videoCount} vid`} size="small" color="secondary" variant="outlined"
                            sx={{ fontSize: '0.65rem', height: 18 }} />
                        )}
                      </Box>
                    </CardContent>
                    <Badge badgeContent={items.length} color="primary"
                      sx={{ position: 'absolute', top: 8, right: 8 }} />
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      )}

      {untagged.length > 0 && (
  <Box sx={{ mb: 4 }}>
    <Typography variant="subtitle1" gutterBottom fontWeight={600} color="error.main">
      Untagged Media ({untagged.length}) — click to add tags
    </Typography>
    <Grid container spacing={2}>
      {untagged.map(item => (
        <Grid item key={item._id}>
          <Card
            sx={{
              width: 180, height: 140, position: 'relative', cursor: 'pointer',
              border: '2px solid #f44336', borderRadius: 2, overflow: 'hidden',
              '&:hover': { transform: 'scale(1.02)', transition: 'transform 0.2s', boxShadow: 3 },
            }}
            onClick={() => handleEditMedia(item)}
          >
            {item.type === 'image' ? (
              <CardMedia component="img" image={item.url} alt={item.filename}
                sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <video src={item.url}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                muted loop autoPlay preload="metadata" />
            )}
            <Chip label="Add Tags" color="error" size="small"
              sx={{ position: 'absolute', top: 6, left: 6, fontSize: '0.65rem', height: 20 }} />
            
            {/* Added Delete IconButton directly on the untagged card */}
            <IconButton 
              size="small" 
              color="error" 
              onClick={(e) => { 
                e.stopPropagation(); // Prevents the card's onClick (handleEditMedia) from firing
                handleDeleteMedia(item._id); 
              }} 
              sx={{ 
                position: 'absolute', 
                top: 6, 
                right: 6, 
                bgcolor: 'rgba(255,255,255,0.9)', 
                '&:hover': { bgcolor: 'white' }, 
                zIndex: 10 
              }}
            >
              <Delete fontSize="small" />
            </IconButton>

          </Card>
        </Grid>
      ))}
    </Grid>
    <Alert severity="warning" sx={{ mt: 2 }}>
      {untagged.length} item(s) are missing tags. Click them to add tags.
    </Alert>
  </Box>
)}

      {!hideCompleteButton && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          {onBack && <Button variant="outlined" sx={{ color: '#1035ac', borderColor:"#1035ac" }} onClick={onBack}>Previous</Button>}
          <Button variant="contained" sx={{ bgcolor: '#1035ac', color: 'white', '&:hover': { bgcolor: '#0c2780' } }} onClick={() => onSave?.()}>Save &amp; Continue</Button>
        </Box>
      )}

      <Dialog open={tagGroupDialog} onClose={() => setTagGroupDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            {selectedTagGroup?.tag} ({selectedTagGroup?.mediaItems.length} items)
          </Typography>
          <IconButton onClick={() => setTagGroupDialog(false)}><Close /></IconButton>
        </DialogTitle>

        <DialogContent>
          {selectedTagGroup && (
            <Box sx={{ position: 'relative' }}>
              {selectedTagGroup.mediaItems[selectedImageIndex]?.type === 'image' ? (
                <img
                  src={selectedTagGroup.mediaItems[selectedImageIndex].url}
                  style={{ width: '100%', maxHeight: '70vh', objectFit: 'contain', borderRadius: 8 }}
                />
              ) : (
                <video
                  src={selectedTagGroup.mediaItems[selectedImageIndex].url}
                  style={{ width: '100%', height: 500, borderRadius: 8 }} controls
                />
              )}
              {selectedImageIndex > 0 && (
                <IconButton onClick={previousImage} sx={{
                  position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
                  bgcolor: 'rgba(0,0,0,0.5)', color: 'white',
                }}><ArrowBack /></IconButton>
              )}
              {selectedImageIndex < selectedTagGroup.mediaItems.length - 1 && (
                <IconButton onClick={nextImage} sx={{
                  position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
                  bgcolor: 'rgba(0,0,0,0.5)', color: 'white',
                }}><ArrowForward /></IconButton>
              )}
              <Chip
                label={`${selectedImageIndex + 1} / ${selectedTagGroup.mediaItems.length}`}
                sx={{ position: 'absolute', bottom: 16, right: 16, bgcolor: 'rgba(0,0,0,0.7)', color: 'white' }}
              />
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          {selectedTagGroup?.mediaItems[selectedImageIndex]?.type === 'image' && (
            <Button
              startIcon={<Star />}
              onClick={() => handleSetCover(selectedTagGroup.mediaItems[selectedImageIndex])}
              disabled={selectedTagGroup?.mediaItems[selectedImageIndex]?.isCover}
            >
              {selectedTagGroup?.mediaItems[selectedImageIndex]?.isCover ? 'Cover Photo' : 'Set as Cover'}
            </Button>
          )}
          <Button startIcon={<Edit />}
            onClick={() => handleEditMedia(selectedTagGroup.mediaItems[selectedImageIndex])}>
            Edit Tags
          </Button>
          <Button startIcon={<Delete />} color="error"
            onClick={() => handleDeleteMedia(selectedTagGroup.mediaItems[selectedImageIndex]._id)}>
            Delete
          </Button>
          <Box sx={{ flexGrow: 1 }} />
          <Button onClick={() => setTagGroupDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          {editingMedia?.tags?.length > 0 ? editingMedia.tags[0] : 'Add Tags'}
        </DialogTitle>

        <DialogContent>
          {editingMedia && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                {editingMedia.type === 'image' ? (
                  <img src={editingMedia.url} alt={editingMedia.filename}
                    style={{ width: '100%', height: 400, objectFit: 'cover', borderRadius: 8 }} />
                ) : (
                  <video src={editingMedia.url}
                    style={{ width: '100%', height: 400, borderRadius: 8 }} controls />
                )}
                {editingMedia.type === 'image' && (
                  <FormControlLabel
                    control={
                      <Checkbox checked={editingMedia.isCover || false}
                        onChange={e => setEditingMedia(prev => ({ ...prev, isCover: e.target.checked }))} />
                    }
                    label="Set as cover photo" sx={{ mt: 2 }} />
                )}
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Tags Added</Typography>
                <Box sx={{
                  mb: 2, minHeight: 60, borderRadius: 1, p: 2, bgcolor: '#f9f9f9',
                  border: `1px solid ${editingMedia.tags.length === 0 ? '#f44336' : '#e0e0e0'}`,
                  display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center',
                }}>
                  {editingMedia.tags.length > 0 ? (
                    editingMedia.tags.map(tag => (
                      <Chip key={tag} label={tag} onDelete={() => removeTag(tag)}
                        deleteIcon={<Close />} color="primary" variant="outlined" />
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">No tags selected</Typography>
                  )}
                </Box>

                <TextField
                  fullWidth size="small" placeholder="Add custom tag"
                  value={customTag} onChange={e => setCustomTag(e.target.value)}
                  onKeyPress={e => { if (e.key === 'Enter') addCustomTag(); }}
                  sx={{ mb: 2 }}
                  InputProps={{ startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} /> }}
                />

                <Box sx={{ maxHeight: 300, overflow: 'auto', border: '1px solid #e0e0e0', borderRadius: 1 }}>
                  <List dense>
                    {availableRoomTags.map(tag => (
                      <ListItem key={tag} dense button onClick={() => handleTagToggle(tag)}>
                        <ListItemIcon>
                          <Checkbox edge="start" checked={editingMedia.tags.includes(tag)} size="small" />
                        </ListItemIcon>
                        <ListItemText primary={tag} primaryTypographyProps={{ fontSize: '0.875rem' }} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditDialog(false)} variant="outlined">Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained"
            disabled={!editingMedia?.tags?.length}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SingleRoomMediaForm;