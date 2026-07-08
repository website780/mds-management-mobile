import { useState, useCallback } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  DialogContentText, Button
} from '@mui/material';

export const useConfirm = () => {
  const [state, setState] = useState({
    open: false,
    title: '',
    description: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    confirmColor: 'primary',
    resolve: null,
  });

  const confirm = useCallback(({ title, description, confirmText = 'Confirm', cancelText = 'Cancel', confirmColor = 'primary' }) => {
    return new Promise((resolve) => {
      setState({ open: true, title, description, confirmText, cancelText, confirmColor, resolve });
    });
  }, []);

  const handleConfirm = () => {
    state.resolve(true);
    setState(prev => ({ ...prev, open: false }));
  };

  const handleCancel = () => {
    state.resolve(false);
    setState(prev => ({ ...prev, open: false }));
  };

  const ConfirmDialog = () => (
    <Dialog
      open={state.open}
      onClose={handleCancel}
      PaperProps={{ sx: { borderRadius: 3, minWidth: 380 } }}
    >
      <DialogTitle sx={{ pb: 1, fontWeight: 700 }}>
        {state.title}
      </DialogTitle>

      {state.description && (
        <DialogContent>
          <DialogContentText>{state.description}</DialogContentText>
        </DialogContent>
      )}

      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <Button onClick={handleCancel} variant="outlined">
          {state.cancelText}
        </Button>
        <Button onClick={handleConfirm} variant="contained" color={state.confirmColor}>
          {state.confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );

  return { confirm, ConfirmDialog };
};