import {
  AccessTime,
  CheckCircle,
  Delete,
  Edit,
  LocationOn,
  Restaurant
} from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Donation } from '../types';

interface DonationCardProps {
  donation: Donation;
  onClaim: (id: number) => void;
  onEdit?: (id: number) => void;
  onDelete?: (donation: Donation) => void;
}

const DonationCard: React.FC<DonationCardProps> = ({
  donation,
  onClaim,
  onEdit,
  onDelete,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const getStatusColor = () => {
    return donation.is_claimed ? 'success' : 'primary';
  };

  const getStatusIcon = () => {
    return donation.is_claimed ? <CheckCircle /> : <Restaurant />;
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'visible',
      }}
    >
      {/* Status Badge */}
      <Box
        sx={{
          position: 'absolute',
          top: -8,
          right: 16,
          zIndex: 1,
        }}
      >
        <Chip
          icon={getStatusIcon()}
          label={donation.is_claimed ? 'Claimed' : 'Available'}
          color={getStatusColor()}
          size="small"
          sx={{
            fontWeight: 600,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}
        />
      </Box>

      <CardContent sx={{ flexGrow: 1, pt: 3 }}>
        {/* Title */}
        <Typography
          gutterBottom
          variant="h6"
          component="h3"
          sx={{
            fontWeight: 600,
            color: 'text.primary',
            mb: 2,
            lineHeight: 1.3,
            cursor: 'pointer',
            '&:hover': {
              color: 'primary.main',
              textDecoration: 'underline',
            },
          }}
          onClick={() => navigate(`/donations/${donation.id}`)}
        >
          {donation.title}
        </Typography>

        {/* Description */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 3,
            lineHeight: 1.6,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            cursor: 'pointer',
            '&:hover': {
              color: 'text.primary',
            },
          }}
          onClick={() => navigate(`/donations/${donation.id}`)}
        >
          {/* Display rich text content safely with theme support */}
          <Box
            dangerouslySetInnerHTML={{
              __html: donation.description.replace(/<[^>]*>/g, '').substring(0, 150) + '...'
            }}
            sx={{
              color: 'inherit',
              '& h1, & h2, & h3, & h4, & h5, & h6': {
                color: 'inherit',
                fontWeight: 600,
                mb: 0.5,
              },
              '& p': {
                color: 'inherit',
                mb: 0.5,
              },
              '& ul, & ol': {
                color: 'inherit',
                pl: 1,
                mb: 0.5,
              },
              '& li': {
                color: 'inherit',
                mb: 0.25,
              },
              '& strong, & b': {
                color: 'inherit',
                fontWeight: 600,
              },
              '& em, & i': {
                color: 'inherit',
                fontStyle: 'italic',
              },
            }}
          />
        </Typography>

        {/* Image Preview */}
        {donation.image_url && (
          <Box
            component="img"
            src={donation.image_url}
            alt={donation.title}
            sx={{
              width: '100%',
              height: 120,
              objectFit: 'cover',
              borderRadius: 1,
              mb: 2,
              cursor: 'pointer',
            }}
            onClick={() => navigate(`/donations/${donation.id}`)}
          />
        )}

        {/* Details Grid */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {/* Location */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocationOn sx={{ fontSize: 18, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {donation.location}
            </Typography>
          </Box>

          {/* Quantity */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Restaurant sx={{ fontSize: 18, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              Quantity: {donation.quantity}
            </Typography>
          </Box>

          {/* Food Type */}
          {donation.food_type && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Restaurant sx={{ fontSize: 18, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                Type: {donation.food_type.charAt(0).toUpperCase() + donation.food_type.slice(1)}
              </Typography>
            </Box>
          )}

          {/* Expiry Date */}
          {donation.expiry_date && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccessTime sx={{ fontSize: 18, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                Expires: {new Date(donation.expiry_date).toLocaleDateString()}
              </Typography>
            </Box>
          )}

          {/* Time */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AccessTime sx={{ fontSize: 18, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              Posted {formatDate(donation.created_at)}
            </Typography>
          </Box>
        </Box>
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0 }}>
        <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
          {/* Claim Button for Receivers */}
          {user?.role === 'receiver' && !donation.is_claimed && (
            <Button
              variant="contained"
              color="secondary"
              fullWidth
              onClick={() => onClaim(donation.id)}
              sx={{ fontWeight: 600 }}
            >
              Claim Donation
            </Button>
          )}

          {/* Edit/Delete for Donors */}
          {user?.role === 'donor' && user.id === donation.donor && (
            <>
              {onEdit && (
                <Tooltip title="Edit donation">
                  <IconButton
                    color="primary"
                    onClick={() => onEdit(donation.id)}
                    sx={{ 
                      flex: 1,
                      borderRadius: 1,
                      '&:hover': {
                        backgroundColor: 'primary.main',
                        color: 'white',
                      },
                    }}
                  >
                    <Edit />
                  </IconButton>
                </Tooltip>
              )}
              {onDelete && (
                <Tooltip title="Delete donation">
                  <IconButton
                    color="error"
                    onClick={() => onDelete(donation)}
                    sx={{ 
                      flex: 1,
                      borderRadius: 1,
                      '&:hover': {
                        backgroundColor: 'error.main',
                        color: 'white',
                      },
                    }}
                  >
                    <Delete />
                  </IconButton>
                </Tooltip>
              )}
            </>
          )}

          {/* Claimed Status */}
          {donation.is_claimed && (
            <Button
              variant="outlined"
              color="success"
              fullWidth
              disabled
              startIcon={<CheckCircle />}
            >
              Already Claimed
            </Button>
          )}
        </Box>
      </CardActions>
    </Card>
  );
};

export default DonationCard; 