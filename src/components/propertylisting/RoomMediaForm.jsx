import { View, Text, ScrollView, Image, Pressable, TextInput, FlatList, StyleSheet, Modal } from 'react-native';
import { useRouter } from 'expo-router';

'use client'
import { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Typography, Button, Grid, Card, CardMedia,
  IconButton, Chip, TextField, Dialog, DialogTitle, DialogContent,
  DialogActions, FormControlLabel, Checkbox, Alert, LinearProgress,
  List, ListItem, ListItemIcon, ListItemText, Badge, Accordion,
  AccordionSummary, AccordionDetails
} from "react-native-paper";
import {
  UploadCloud as CloudUpload,
  Trash2 as Delete,
  Pencil as Edit,
  Star,
  X as Close,
  AlertTriangle as Warning,
  ChevronDown as ExpandMore,
  ArrowLeft as ArrowBack,
  ArrowRight as ArrowForward,
  Search
} from 'lucide-react-native';
import {
  uploadRoomMedia, updateRoomMediaItem, deleteRoomMediaItem,
} from '@/redux/features/property/propertySlice';
import {toast} from "@backpackapp-io/react-native-toast";
import { useConfirm } from '@/hooks/useConfirm';
import ResponsiveTextField from '../ResponsiveTextField';

// Added singleRoomId to props
const RoomMediaForm = ({ propertyId, singleRoomId, onComplete, onBack }) => {
  const dispatch = useDispatch();
  const { currentProperty, isLoading, error } = useSelector(state => state.property);
  const { confirm, ConfirmDialog } = useConfirm();

  const [editingMedia, setEditingMedia] = useState(null);
  const [editDialog, setEditDialog] = useState(false);
  const [tagGroupDialog, setTagGroupDialog] = useState(false);
  
  const [selectedGroupContext, setSelectedGroupContext] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  const [customTag, setCustomTag] = useState('');
  const [validationError, setValidationError] = useState('');
  const [expandedRoom, setExpandedRoom] = useState(null);

  const fileInputRefs = useRef({});

  // Filter to a single room if singleRoomId is provided, else map all
  const allRooms = currentProperty?.rooms || [];
  const roomsToDisplay = singleRoomId ? allRooms.filter(r => r._id === singleRoomId) : allRooms;

  const availableRoomTags = [
    'Bed', 'Bathroom/Washroom', 'Room View', 'Balcony', 'Furniture',
    'Amenities', 'Decor', 'Lighting', 'Storage', 'Window View', 'Others'
  ];

  const getRoomMediaItems = (room) => {
    if (!room?.media) return [];
    return [...(room.media.images || []), ...(room.media.videos || [])];
  };

  const getRoomMediaByTag = (room) => {
    const grouped = {};
    getRoomMediaItems(room).forEach(item => {
      (item.tags || []).forEach(tag => {
        if (!grouped[tag]) grouped[tag] = [];
        grouped[tag].push(item);
      });
    });
    return grouped;
  };

  const getRoomItemsWithoutTags = (room) =>
    getRoomMediaItems(room).filter(item => !item.tags || item.tags.length === 0);

  let carouselItems = [];
  if (selectedGroupContext) {
    const r = allRooms.find(room => room._id === selectedGroupContext.roomId);
    if (r) {
      const grouped = getRoomMediaByTag(r);
      carouselItems = grouped[selectedGroupContext.tag] || [];
    }
  }
  const safeIndex = Math.min(selectedImageIndex, Math.max(0, carouselItems.length - 1));
  const currentCarouselItem = carouselItems[safeIndex];

  useEffect(() => {
    // If we only have 1 room, automatically expand its accordion
    if (roomsToDisplay.length === 1 && !expandedRoom) {
       setExpandedRoom(roomsToDisplay[0]._id);
    }
  }, [roomsToDisplay.length]);

  useEffect(() => {
    if (tagGroupDialog && carouselItems.length === 0) {
      setTagGroupDialog(false);
      setSelectedGroupContext(null);
    }
  }, [carouselItems.length, tagGroupDialog]);

  const handleFileSelect = async (event, roomId) => {
    const files = Array.from(event.target.files);
    setValidationError('');
    if (files.length > 20) {
      setValidationError('You can upload maximum 20 files at once');
      if (fileInputRefs.current[roomId]) fileInputRefs.current[roomId].value = '';
      return;
    }
    if (files.length === 0) return;

    const formData = new FormData();
    files.forEach(file => formData.append('media', file));

    try {
      await dispatch(uploadRoomMedia({ propertyId, roomId, formData })).unwrap();
      if (fileInputRefs.current[roomId]) fileInputRefs.current[roomId].value = '';
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  const handleDeleteMedia = async (roomId, mediaId) => {
    const ok = await confirm({
      title: 'Delete Media?',
      description: 'This media item will be permanently removed.',
      confirmText: 'Delete',
      confirmColor: 'error',
    });
    if (!ok) return;

    try {
      await dispatch(deleteRoomMediaItem({ propertyId, roomId, mediaId })).unwrap();
      setEditDialog(false);
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleEditMedia = (mediaItem, roomId) => {
    setEditingMedia({ ...mediaItem, roomId, tags: mediaItem.tags || [] });
    setEditDialog(true);
  };

  const handleTagGroupClick = (tag, roomId) => {
    setSelectedGroupContext({ tag, roomId });
    setSelectedImageIndex(0);
    setTagGroupDialog(true);
  };

  const handleSaveEdit = async () => {
    if (!editingMedia?.tags?.length) {
      Toast.error('Please select at least one tag before saving.');
      return;
    }
    try {
      await dispatch(updateRoomMediaItem({
        propertyId, roomId: editingMedia.roomId, mediaId: editingMedia._id,
        data: { tags: editingMedia.tags, isCover: editingMedia.isCover, displayOrder: editingMedia.displayOrder, }
      })).unwrap();
      setEditDialog(false);
      setEditingMedia(null);
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

  const handleSetCover = async (mediaItem, roomId) => {
    if (mediaItem.type !== 'image') return;
    try {
      await dispatch(updateRoomMediaItem({
        propertyId, roomId, mediaId: mediaItem._id, data: { isCover: !mediaItem.isCover }
      })).unwrap();
    } catch (err) {
      console.error('Set cover failed:', err);
    }
  };

  const handleTagToggle = (tag) => {
    if (!editingMedia) return;
    setEditingMedia(prev => ({
      ...prev, tags: prev.tags.includes(tag) ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag]
    }));
  };

  const removeTag = (tag) => setEditingMedia(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));

  const addCustomTag = () => {
    if (customTag.trim() && !editingMedia.tags.includes(customTag.trim())) {
      setEditingMedia(prev => ({ ...prev, tags: [...prev.tags, customTag.trim()] }));
      setCustomTag('');
    }
  };

  const nextImage = () => { if (safeIndex < carouselItems.length - 1) setSelectedImageIndex(safeIndex + 1); };
  const previousImage = () => { if (safeIndex > 0) setSelectedImageIndex(safeIndex - 1); };

  const handleCompleteStep = () => {
    const roomsWithUntagged = roomsToDisplay.filter(r => getRoomItemsWithoutTags(r).length > 0);
    if (roomsWithUntagged.length > 0) {
      const total = roomsWithUntagged.reduce((acc, r) => acc + getRoomItemsWithoutTags(r).length, 0);
      setValidationError(`${total} media item(s) are missing tags.`);
      return;
    }
    onComplete?.();
  };

  // Stacked Outer UI Card identical to MediaForm
  const TagGroupCard = ({ tag, mediaItems, roomId }) => {
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
        onPress={() => handleTagGroupClick(tag, roomId)}
      >
        <Box sx={{ position: 'absolute', top: -6, left: 10, right: 10, height: '10px', bgcolor: '#e0e0e0', borderRadius: '8px 8px 0 0', zIndex: 0 }} />
        <Box style={styles.container} sx={{ height: 180, width: '100%', bgcolor: '#f5f5f5', borderRadius: 3, overflow: 'hidden', position: 'relative', zIndex: 1, border: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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

      <Typography variant="h5" gutterBottom>Upload Room Photos and Videos</Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
        Upload photos and videos for each room. Each media item must have at least one tag.
      </Typography>

      {validationError && <Alert severity="error" sx={{ mb: 2 }}>{validationError}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {roomsToDisplay.length === 0 && (
        <Alert severity="info">No rooms found. Please add rooms first.</Alert>
      )}

      {roomsToDisplay.map((room) => {
        const groupedMedia = getRoomMediaByTag(room);
        const untaggedItems = getRoomItemsWithoutTags(room);
        const totalMedia = getRoomMediaItems(room);

        return (
          <Accordion key={room._id} expanded={expandedRoom === room._id} onChangeText={(_, isExpanded) => setExpandedRoom(isExpanded ? room._id : null)} sx={{ mb: 2 }}>
           <AccordionSummary expandIcon={<ExpandMore />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', width: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                  <Typography variant="h6">{room.roomName}</Typography>
                 {totalMedia.length < 1 && <Typography component="span" color="error.main" sx={{ ml: 1, fontSize: '0.85rem', fontWeight: 500 }}>(Minimum 1 photo required)</Typography>} 
                </Box>
                <Chip label={`${totalMedia.length} media`} size="small" color="primary" />
                {untaggedItems.length > 0 && (
                  <Badge badgeContent={untaggedItems.length} color="error">
                    <Chip label="Untagged" size="small" color="error" icon={<Warning />} />
                  </Badge>
                )}
              </Box>
            </AccordionSummary>

            <AccordionDetails>
              <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <TextInput ref={el => fileInputRefs.current[room._id] = el} type="file" multiple accept="image/*,video/*" onChangeText={(e) => handleFileSelect(e, room._id)} style={{ display: 'none' }} />
                <Button variant="contained" sx={{ bgcolor: '#1035ac', color: 'white', '&:hover': { bgcolor: '#0c2780' } }} startIcon={<CloudUpload />} onPress={() => fileInputRefs.current[room._id]?.click()} disabled={isLoading}>
                  {isLoading ? 'Uploading...' : 'Upload Files'}
                </Button>
              </Box>

              {isLoading && (<Box sx={{ mb: 3 }}><Typography variant="body2" sx={{ mb: 1 }}>Uploading files...</Typography><LinearProgress /></Box>)}

              {Object.keys(groupedMedia).length > 0 && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" gutterBottom>Media by Tags</Typography>
                  <Grid container spacing={2}>
                    {Object.entries(groupedMedia).map(([tag, items]) => (
                      <Grid item key={tag}><TagGroupCard tag={tag} mediaItems={items} roomId={room._id} /></Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              {untaggedItems.length > 0 && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" gutterBottom color="error">Untagged Media ({untaggedItems.length})</Typography>
                  <Grid container spacing={2}>
                    {untaggedItems.map((item) => (
                      <Grid item key={item._id}>
                        <Card sx={{ width: 200, height: 150, position: 'relative', cursor: 'pointer', border: '2px solid #f44336', borderRadius: 2, overflow: 'hidden', '&:hover': { transform: 'scale(1.02)', transition: 'transform 0.2s', boxShadow: 3 }}} onPress={() => handleEditMedia(item, room._id)}>
                          {item.type === 'image' ? (
                            <CardMedia component="img" image={item.url} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <video src={item.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted loop autoPlay preload="metadata" />
                          )}
                          <Chip label="Needs Tags" color="error" size="small" sx={{ position: 'absolute', top: 8, left: 8, fontSize: '0.7rem', height: 20 }} />
                          <IconButton size="small" color="error" onPress={(e) => { e.stopPropagation(); handleDeleteMedia(room._id, item._id); }} sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(255,255,255,0.9)', '&:hover': { bgcolor: 'white' }, zIndex: 10 }}>
                            <Delete fontSize="small"/>
                          </IconButton>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
            </AccordionDetails>
          </Accordion>
        );
      })}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button variant="outlined" onPress={onBack} sx={{ color: '#1035ac', borderColor:"#1035ac" }}>Previous</Button>
        <Button variant="contained" sx={{ bgcolor: '#1035ac', color: 'white', '&:hover': { bgcolor: '#0c2780' } }} onPress={handleCompleteStep}>Save & Continue</Button>
      </Box>

      {/* Carousel Dialog Identical to MediaForm */}
      <Dialog open={tagGroupDialog} onClose={() => setTagGroupDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            {selectedGroupContext?.tag} ({carouselItems.length} items)
          </Typography>
          <IconButton onPress={() => setTagGroupDialog(false)}><Close /></IconButton>
        </DialogTitle>
        <DialogContent>
          {currentCarouselItem && (
            <Box sx={{ position: 'relative' }}>
               {currentCarouselItem.type === 'image' ? (
              <Image src={currentCarouselItem.url} style={{ width: '100%', maxHeight: '70vh', objectFit: 'contain', borderRadius: 8 }} />
            ) : (
                <video src={currentCarouselItem.url} style={{ width: '100%', height: '500px', borderRadius: 8 }} controls />
              )}

              {safeIndex > 0 && (
                <IconButton onPress={previousImage} sx={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', bgcolor: 'rgba(0,0,0,0.5)', color: 'white' }}><ArrowBack /></IconButton>
              )}
              {safeIndex < carouselItems.length - 1 && (
                <IconButton onPress={nextImage} sx={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', bgcolor: 'rgba(0,0,0,0.5)', color: 'white' }}><ArrowForward /></IconButton>
              )}
              <Chip label={`${safeIndex + 1} / ${carouselItems.length}`} sx={{ position: 'absolute', bottom: 16, right: 16, bgcolor: 'rgba(0,0,0,0.7)', color: 'white' }} />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {currentCarouselItem?.type === 'image' && (
            <Button startIcon={<Star />} onPress={() => handleSetCover(currentCarouselItem, selectedGroupContext.roomId)} disabled={currentCarouselItem.isCover}>
              {currentCarouselItem.isCover ? 'Cover Photo' : 'Set as Cover'}
            </Button>
          )}
          <Button startIcon={<Edit />} onPress={() => handleEditMedia(currentCarouselItem, selectedGroupContext.roomId)}>Edit Tags</Button>
          <Button startIcon={<Delete />} color="error" onPress={() => handleDeleteMedia(selectedGroupContext.roomId, currentCarouselItem._id)}>Delete</Button>
          <Box sx={{ flexGrow: 1 }} />
          <Button onPress={() => setTagGroupDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Tags Dialog */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>{editingMedia?.tags?.length > 0 ? editingMedia.tags[0] : 'Add Tags'}</DialogTitle>
        <DialogContent>
          {editingMedia && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                {editingMedia.type === 'image' ? (
                  <Image src={editingMedia.url} style={{ width: '100%', height: '400px', objectFit: 'cover', borderRadius: 8 }} />
                ) : (
                  <video src={editingMedia.url} style={{ width: '100%', height: '400px', borderRadius: 8 }} controls />
                )}
                {editingMedia.type === 'image' && (
                  <FormControlLabel control={<Checkbox checked={editingMedia.isCover || false} onChangeText={(e) => setEditingMedia(prev => ({ ...prev, isCover: e.target.checked }))} />} label="Set as cover photo" sx={{ mt: 2 }} />
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Tags Added</Typography>
                <Box sx={{ mb: 2, minHeight: 60, borderRadius: 1, p: 2, bgcolor: '#f9f9f9', border: `1px solid ${editingMedia.tags.length === 0 ? '#f44336' : '#e0e0e0'}`, display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                  {editingMedia.tags.length > 0 ? (
                    editingMedia.tags.map(tag => <Chip key={tag} label={tag} onDelete={() => removeTag(tag)} deleteIcon={<Close />} color="primary" variant="outlined" />)
                  ) : (<Typography variant="body2" color="text.secondary">No tags selected</Typography>)}
                </Box>
                <ResponsiveTextField fullWidth size="small" placeholder="Add custom tag" value={customTag} onChangeText={(e) => setCustomTag(e.target.value)} onKeyPress={(e) => { if (e.key === 'Enter') addCustomTag(); }} sx={{ mb: 2 }} InputProps={{ startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} /> }} />
                <Box sx={{ maxHeight: 300, overflow: 'auto', border: '1px solid #e0e0e0', borderRadius: 1 }}>
                  <List dense>
                    {availableRoomTags.map(tag => (
                      <ListItem key={tag} dense button onPress={() => handleTagToggle(tag)}>
                        <ListItemIcon><Checkbox edge="start" checked={editingMedia.tags.includes(tag)} size="small" /></ListItemIcon>
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
          <Button onPress={() => setEditDialog(false)} variant="outlined">Cancel</Button>
          <Button onPress={handleSaveEdit} variant="contained" disabled={!editingMedia?.tags?.length}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RoomMediaForm;