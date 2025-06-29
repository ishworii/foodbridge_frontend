import { CheckCircle, Close } from '@mui/icons-material';
import {
    Alert,
    Box,
    IconButton,
    Slide,
    Snackbar,
    Typography,
} from '@mui/material';
import React from 'react';

interface SuccessNotificationProps {
  open: boolean;
  message: string;
  onClose: () => void;
  autoHideDuration?: number;
}

const SuccessNotification: React.FC<SuccessNotificationProps> = ({
  open,
  message,
  onClose,
  autoHideDuration = 4000,
}) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      TransitionComponent={Slide}
      sx={{
        '& .MuiSnackbar-root': {
          top: 24,
        },
      }}
    >
      <Alert
        onClose={onClose}
        severity="success"
        icon={<CheckCircle />}
        action={
          <IconButton
            aria-label="close"
            color="inherit"
            size="small"
            onClick={onClose}
          >
            <Close fontSize="inherit" />
          </IconButton>
        }
        sx={{
          width: '100%',
          minWidth: 300,
          maxWidth: 500,
          borderRadius: 2,
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          '& .MuiAlert-icon': {
            fontSize: 24,
          },
          '& .MuiAlert-message': {
            fontSize: '1rem',
            fontWeight: 500,
          },
        }}
      >
        <Box>
          <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
            Success!
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {message}
          </Typography>
        </Box>
      </Alert>
    </Snackbar>
  );
};

export default SuccessNotification; 