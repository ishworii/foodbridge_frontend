import { Add as AddIcon, Edit as EditIcon } from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import type { Donation } from '../types';
import LocationInput from './LocationInput';

interface DonationFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  donation?: Donation | null;
  mode: 'create' | 'edit';
}

const DonationForm: React.FC<DonationFormProps> = ({
  open,
  onClose,
  onSuccess,
  donation,
  mode,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    quantity: '',
    location: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (donation && mode === 'edit') {
      setFormData({
        title: donation.title,
        description: donation.description,
        quantity: donation.quantity.toString(),
        location: donation.location,
      });
    } else {
      setFormData({
        title: '',
        description: '',
        quantity: '',
        location: '',
      });
    }
    setError('');
  }, [donation, mode, open]);

  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        ...formData,
        quantity: parseInt(formData.quantity),
      };

      if (mode === 'create') {
        await axiosInstance.post('/donations/', payload);
      } else if (donation) {
        await axiosInstance.put(`/donations/${donation.id}/`, payload);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(
        err.response?.data?.title?.[0] ||
        err.response?.data?.description?.[0] ||
        err.response?.data?.quantity?.[0] ||
        err.response?.data?.location?.[0] ||
        'Failed to save donation. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    return (
      formData.title.trim() !== '' &&
      formData.description.trim() !== '' &&
      formData.quantity.trim() !== '' &&
      parseInt(formData.quantity) > 0 &&
      formData.location.trim() !== ''
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: '90vh',
          overflow: 'auto',
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {mode === 'create' ? (
            <AddIcon color="primary" />
          ) : (
            <EditIcon color="primary" />
          )}
          <Typography variant="h6" component="span">
            {mode === 'create' ? 'Create New Donation' : 'Edit Donation'}
          </Typography>
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 2, pb: 1 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              label="Title"
              value={formData.title}
              onChange={handleChange('title')}
              required
              fullWidth
              placeholder="e.g., Fresh vegetables from local market"
              helperText="Give your donation a clear, descriptive title"
            />

            <TextField
              label="Description"
              value={formData.description}
              onChange={handleChange('description')}
              required
              fullWidth
              multiline
              rows={4}
              placeholder="Describe what you're donating, any special requirements, or additional details..."
              helperText="Provide detailed information about your donation"
            />

            <TextField
              label="Quantity"
              value={formData.quantity}
              onChange={handleChange('quantity')}
              required
              type="number"
              inputProps={{ min: 1 }}
              fullWidth
              placeholder="1"
              helperText="Number of items or servings"
            />

            <LocationInput
              value={formData.location}
              onChange={(value) => setFormData(prev => ({ ...prev, location: value }))}
              label="Location"
              required
              placeholder="e.g., Downtown Market, 123 Main St"
              helperText="Where can the receiver pick up the donation?"
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button
            onClick={onClose}
            disabled={loading}
            sx={{ minWidth: 100 }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !isFormValid()}
            startIcon={loading ? <CircularProgress size={16} /> : undefined}
            sx={{ minWidth: 100 }}
          >
            {loading ? 'Saving...' : mode === 'create' ? 'Create' : 'Update'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default DonationForm; 