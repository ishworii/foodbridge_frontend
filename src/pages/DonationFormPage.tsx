import {
    Add as AddIcon,
    ArrowBack,
    CheckCircle,
    Description,
    Edit as EditIcon,
    LocationOn,
    Numbers,
    Restaurant,
    Warning,
} from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Paper,
    Step,
    StepContent,
    StepLabel,
    Stepper,
    TextField,
    Typography,
    useTheme
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import Layout from '../components/Layout';
import LocationInput from '../components/LocationInput';
import SuccessNotification from '../components/SuccessNotification';

const steps = [
  {
    label: 'Basic Information',
    description: 'Provide the title and description of your donation',
    icon: <Restaurant />,
  },
  {
    label: 'Details & Location',
    description: 'Specify quantity and pickup location',
    icon: <LocationOn />,
  },
  {
    label: 'Review & Submit',
    description: 'Review your donation details before submitting',
    icon: <Description />,
  },
];

const DonationFormPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    quantity: '',
    location: '',
    food_type: '',
    expiry_date: '',
  });
  const [donationDetails, setDonationDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successOpen, setSuccessOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showClaimedWarning, setShowClaimedWarning] = useState(false);

  const isEditMode = Boolean(id);

  useEffect(() => {
    if (isEditMode && id) {
      fetchDonation();
    }
  }, [id, isEditMode]);

  const fetchDonation = async () => {
    try {
      const response = await axiosInstance.get(`/donations/${id}/`);
      const donation = response.data;
      setDonationDetails(donation);
      setFormData({
        title: donation.title,
        description: donation.description,
        quantity: donation.quantity.toString(),
        location: donation.location,
        food_type: donation.food_type || '',
        expiry_date: donation.expiry_date || '',
      });
    } catch (err) {
      setError('Failed to load donation details');
      console.error(err);
    }
  };

  const handleNext = () => {
    // Check if donation is claimed before proceeding
    if (isEditMode && donationDetails?.is_claimed && activeStep === 0) {
      setShowClaimedWarning(true);
      return;
    }
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 0:
        return formData.title.trim() !== '' && formData.description.trim() !== '';
      case 1:
        return formData.quantity.trim() !== '' && 
               parseInt(formData.quantity) > 0 && 
               formData.location.trim() !== '';
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const payload = {
        ...formData,
        quantity: parseInt(formData.quantity),
      };

      if (isEditMode) {
        await axiosInstance.put(`/donations/${id}/`, payload);
        setSuccessMessage('Donation updated successfully!');
      } else {
        await axiosInstance.post('/donations/', payload);
        setSuccessMessage('Donation created successfully!');
      }

      setSuccessOpen(true);
      
      // Navigate back to donations page after a short delay
      setTimeout(() => {
        navigate('/donations');
      }, 2000);
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

  const handleProceedWithEdit = () => {
    setShowClaimedWarning(false);
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Claimed Donation Warning */}
            {isEditMode && donationDetails?.is_claimed && (
              <Alert 
                severity="warning" 
                icon={<Warning />}
                sx={{ mb: 2 }}
              >
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  This donation has been claimed
                </Typography>
                <Typography variant="body2">
                  Editing a claimed donation may affect the person who claimed it. 
                  Consider contacting them first to ensure the changes won't cause issues.
                </Typography>
              </Alert>
            )}

            <TextField
              label="Title"
              value={formData.title}
              onChange={handleChange('title')}
              required
              fullWidth
              placeholder="e.g., Fresh vegetables from local market"
              helperText="Give your donation a clear, descriptive title"
              InputProps={{
                startAdornment: <Restaurant sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />

            <TextField
              label="Description"
              value={formData.description}
              onChange={handleChange('description')}
              required
              fullWidth
              multiline
              rows={6}
              placeholder="Describe what you're donating, any special requirements, dietary restrictions, or additional details that would help receivers..."
              helperText="Provide detailed information about your donation"
              InputProps={{
                startAdornment: <Description sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Box>
        );

      case 1:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              label="Quantity"
              value={formData.quantity}
              onChange={handleChange('quantity')}
              required
              type="number"
              fullWidth
              placeholder="e.g., 5"
              helperText="Number of items or servings available"
              InputProps={{
                startAdornment: <Numbers sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />

            <LocationInput
              value={formData.location}
              onChange={(value) => setFormData(prev => ({ ...prev, location: value }))}
              label="Pickup Location"
              required
              placeholder="Enter pickup location..."
              helperText="Where can people pick up this donation?"
            />
          </Box>
        );

      case 2:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircle color="primary" />
                Review Your Donation
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Title</Typography>
                  <Typography variant="body1">{formData.title}</Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                  <Typography variant="body1">{formData.description}</Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Quantity</Typography>
                  <Typography variant="body1">{formData.quantity}</Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Location</Typography>
                  <Typography variant="body1">{formData.location}</Typography>
                </Box>
              </Box>
            </Paper>

            {/* Final warning for claimed donations */}
            {isEditMode && donationDetails?.is_claimed && (
              <Alert 
                severity="info" 
                icon={<CheckCircle />}
              >
                <Typography variant="body2">
                  You're about to update a claimed donation. The person who claimed it will be notified of any changes.
                </Typography>
              </Alert>
            )}
          </Box>
        );

      default:
        return 'Unknown step';
    }
  };

  return (
    <Layout>
      <SuccessNotification
        open={successOpen}
        message={successMessage}
        onClose={() => setSuccessOpen(false)}
        autoHideDuration={6000}
      />

      {/* Claimed Donation Warning Dialog */}
      <Dialog
        open={showClaimedWarning}
        onClose={() => setShowClaimedWarning(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Warning color="warning" />
          Donation Already Claimed
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            This donation has been claimed by someone. Editing it may affect their plans.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Consider the following before proceeding:
          </Typography>
          <Box component="ul" sx={{ mt: 1, pl: 2 }}>
            <Typography component="li" variant="body2" color="text.secondary">
              Changes to pickup location may inconvenience the person who claimed it
            </Typography>
            <Typography component="li" variant="body2" color="text.secondary">
              Reducing quantity might leave them without enough food
            </Typography>
            <Typography component="li" variant="body2" color="text.secondary">
              They may need to be notified of significant changes
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowClaimedWarning(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleProceedWithEdit} 
            variant="contained" 
            color="warning"
          >
            Proceed with Edit
          </Button>
        </DialogActions>
      </Dialog>

      <Container maxWidth="md">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <IconButton 
              onClick={() => navigate('/donations')}
              sx={{ mr: 2 }}
            >
              <ArrowBack />
            </IconButton>
            <Typography 
              variant="h4" 
              component="h1" 
              sx={{ 
                fontWeight: 700,
                color: theme.palette.text.primary,
              }}
            >
              {isEditMode ? 'Edit Donation' : 'Create Donation'}
            </Typography>
          </Box>
          <Typography 
            variant="body1" 
            sx={{ 
              color: theme.palette.text.secondary,
              ml: 6,
            }}
          >
            {isEditMode 
              ? 'Update your donation details below'
              : 'Share food with your community by creating a donation'
            }
          </Typography>
        </Box>

        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Stepper */}
        <Paper sx={{ p: 4, mb: 4 }}>
          <Stepper activeStep={activeStep} orientation="vertical">
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel
                  StepIconComponent={() => (
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      bgcolor: activeStep >= index ? 'primary.main' : 'grey.300',
                      color: activeStep >= index ? 'white' : 'grey.600',
                    }}>
                      {step.icon}
                    </Box>
                  )}
                >
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {step.label}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {step.description}
                    </Typography>
                  </Box>
                </StepLabel>
                <StepContent>
                  <Box sx={{ mt: 2 }}>
                    {getStepContent(index)}
                  </Box>
                  <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                    <Button
                      disabled={activeStep === 0}
                      onClick={handleBack}
                      variant="outlined"
                    >
                      Back
                    </Button>
                    {activeStep === steps.length - 1 ? (
                      <Button
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={loading || !isStepValid(activeStep)}
                        startIcon={loading ? <CircularProgress size={20} /> : (isEditMode ? <EditIcon /> : <AddIcon />)}
                      >
                        {loading ? 'Saving...' : (isEditMode ? 'Update Donation' : 'Create Donation')}
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        onClick={handleNext}
                        disabled={!isStepValid(activeStep)}
                      >
                        Next
                      </Button>
                    )}
                  </Box>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </Paper>
      </Container>
    </Layout>
  );
};

export default DonationFormPage; 