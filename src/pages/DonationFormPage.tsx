import {
  Add as AddIcon,
  ArrowBack,
  CheckCircle,
  Description,
  Edit as EditIcon,
  Image as ImageIcon,
  LocationOn,
  Numbers,
  Restaurant,
  Warning
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
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  TextField,
  Typography
} from '@mui/material';
import { Editor } from '@tinymce/tinymce-react';
import React, { useEffect, useRef, useState } from 'react';
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
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    quantity: '',
    location: '',
    food_type: '',
    expiry_date: '',
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
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
      
      // Set image preview if donation has an image
      if (donation.image_url) {
        setImagePreview(donation.image_url);
      }
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
      // Create FormData for multipart upload (includes image)
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('quantity', formData.quantity);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('food_type', formData.food_type);
      formDataToSend.append('expiry_date', formData.expiry_date);
      
      // Add image if selected
      if (selectedImage) {
        formDataToSend.append('image', selectedImage);
      }

      // Debug: Check authentication
      const token = localStorage.getItem('access_token');
      console.log('Auth token exists:', !!token);
      console.log('User is authenticated:', !!token);

      if (isEditMode) {
        await axiosInstance.put(`/donations/${id}/`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        setSuccessMessage('Donation updated successfully!');
      } else {
        await axiosInstance.post('/donations/', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        setSuccessMessage('Donation created successfully!');
      }

      setSuccessOpen(true);
      
      // Navigate back to donations page after a short delay
      setTimeout(() => {
        navigate('/donations');
      }, 2000);
    } catch (err: any) {
      console.error('Donation creation error:', err);
      console.error('Error response:', err.response);
      
      if (err.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
      } else if (err.response?.status === 403) {
        setError('You do not have permission to create donations.');
      } else {
        setError(
          err.response?.data?.title?.[0] ||
          err.response?.data?.description?.[0] ||
          err.response?.data?.quantity?.[0] ||
          err.response?.data?.location?.[0] ||
          err.response?.data?.error ||
          'Failed to save donation. Please try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProceedWithEdit = () => {
    setShowClaimedWarning(false);
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageRemove = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerImageSelect = () => {
    fileInputRef.current?.click();
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

            {/* Rich Text Description Editor */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                Description *
              </Typography>
              <Editor
                apiKey="ksu2ok2cbzl6tnixr5xqmzk49rcl3bnfjr0whcm3r8xvdvqf"
                value={formData.description}
                onEditorChange={(content: string) => setFormData(prev => ({ ...prev, description: content }))}
                init={{
                  height: 300,
                  menubar: false,
                  skin: 'oxide',
                  content_css: 'default',
                  plugins: [
                    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                    'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                    'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                  ],
                  toolbar: 'undo redo | blocks | ' +
                    'bold italic forecolor | alignleft aligncenter ' +
                    'alignright alignjustify | bullist numlist outdent indent | ' +
                    'removeformat | help',
                  content_style: `
                    p { margin: 0 0 8px 0; }
                    h1, h2, h3, h4, h5, h6 { margin: 16px 0 8px 0; font-weight: 600; }
                    ul, ol { margin: 8px 0; padding-left: 20px; }
                    li { margin: 4px 0; }
                    a { text-decoration: none; }
                    a:hover { text-decoration: underline; }
                    blockquote { border-left: 4px solid #1976d2; padding-left: 16px; margin: 16px 0; font-style: italic; }
                    code { padding: 2px 4px; border-radius: 3px; font-family: 'Courier New', monospace; font-size: 13px; }
                    pre { padding: 12px; border-radius: 4px; overflow-x: auto; font-family: 'Courier New', monospace; font-size: 13px; margin: 8px 0; }
                    strong, b { font-weight: 600; }
                    em, i { font-style: italic; }
                  `,
                }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Provide detailed information about your donation. You can use formatting options above.
              </Typography>
            </Box>

            {/* Image Upload */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                Image (Optional)
              </Typography>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageSelect}
                accept="image/*"
                style={{ display: 'none' }}
              />
              
              {imagePreview ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box
                    component="img"
                    src={imagePreview}
                    alt="Preview"
                    sx={{
                      maxWidth: '100%',
                      maxHeight: 200,
                      objectFit: 'cover',
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  />
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={handleImageRemove}
                    startIcon={<ImageIcon />}
                  >
                    Remove Image
                  </Button>
                </Box>
              ) : (
                <Button
                  variant="outlined"
                  onClick={triggerImageSelect}
                  startIcon={<ImageIcon />}
                  sx={{ width: '100%', py: 2 }}
                >
                  Add Image
                </Button>
              )}
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Add a photo of your donation to help receivers see what's available.
              </Typography>
            </Box>
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

            <FormControl fullWidth>
              <InputLabel>Food Type</InputLabel>
              <Select
                value={formData.food_type}
                label="Food Type"
                onChange={(e) => setFormData(prev => ({ ...prev, food_type: e.target.value }))}
              >
                <MenuItem value="">Not specified</MenuItem>
                <MenuItem value="fruits">Fruits</MenuItem>
                <MenuItem value="vegetables">Vegetables</MenuItem>
                <MenuItem value="grains">Grains & Bread</MenuItem>
                <MenuItem value="dairy">Dairy & Eggs</MenuItem>
                <MenuItem value="meat">Meat & Fish</MenuItem>
                <MenuItem value="canned">Canned Goods</MenuItem>
                <MenuItem value="frozen">Frozen Foods</MenuItem>
                <MenuItem value="baked">Baked Goods</MenuItem>
                <MenuItem value="prepared">Prepared Meals</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Expiry Date"
              type="date"
              value={formData.expiry_date}
              onChange={handleChange('expiry_date')}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
              helperText="When does this food expire? (Optional)"
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
                  <Box 
                    sx={{ 
                      p: 2, 
                      bgcolor: 'background.default', 
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                      color: 'text.secondary',
                      '& h1, & h2, & h3, & h4, & h5, & h6': {
                        color: 'text.primary',
                        fontWeight: 600,
                        mb: 1,
                      },
                      '& p': {
                        color: 'text.secondary',
                        mb: 1,
                        lineHeight: 1.6,
                      },
                      '& ul, & ol': {
                        color: 'text.secondary',
                        pl: 2,
                        mb: 1,
                        lineHeight: 1.6,
                      },
                      '& li': {
                        color: 'text.secondary',
                        mb: 0.5,
                      },
                      '& strong, & b': {
                        color: 'text.primary',
                        fontWeight: 600,
                      },
                      '& em, & i': {
                        color: 'text.secondary',
                        fontStyle: 'italic',
                      },
                      '& a': {
                        color: 'primary.main',
                        textDecoration: 'none',
                        '&:hover': {
                          textDecoration: 'underline',
                        },
                      },
                    }}
                    dangerouslySetInnerHTML={{ __html: formData.description }}
                  />
                </Box>
                
                {imagePreview && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Image</Typography>
                    <Box
                      component="img"
                      src={imagePreview}
                      alt="Donation preview"
                      sx={{
                        maxWidth: '100%',
                        maxHeight: 200,
                        objectFit: 'cover',
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'divider',
                      }}
                    />
                  </Box>
                )}
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Quantity</Typography>
                  <Typography variant="body1">{formData.quantity}</Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Food Type</Typography>
                  <Typography variant="body1">{formData.food_type || 'Not specified'}</Typography>
                </Box>
                
                {formData.expiry_date && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Expiry Date</Typography>
                    <Typography variant="body1">{new Date(formData.expiry_date).toLocaleDateString()}</Typography>
                  </Box>
                )}
                
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
                color: 'primary.main',
              }}
            >
              {isEditMode ? 'Edit Donation' : 'Create Donation'}
            </Typography>
          </Box>
          <Typography 
            variant="body1" 
            sx={{ 
              color: 'text.secondary',
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