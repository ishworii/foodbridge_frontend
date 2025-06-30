import {
    LocationOn,
    People,
    Restaurant,
    Security,
    VolunteerActivism
} from '@mui/icons-material';
import {
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Container,
    Paper,
    Stack,
    Typography
} from '@mui/material';
import React from 'react';
import CountUp from 'react-countup';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const features = [
    {
      icon: <Restaurant sx={{ fontSize: 40 }} />,
      title: 'Share Surplus Food',
      description: 'Donate excess food to help reduce waste and feed those in need.',
      color: 'primary',
    },
    {
      icon: <People sx={{ fontSize: 40 }} />,
      title: 'Build Community',
      description: 'Connect with neighbors and strengthen your local community bonds.',
      color: 'secondary',
    },
    {
      icon: <LocationOn sx={{ fontSize: 40 }} />,
      title: 'Local Impact',
      description: 'Make a difference right in your neighborhood with local donations.',
      color: 'success',
    },
    {
      icon: <Security sx={{ fontSize: 40 }} />,
      title: 'Safe & Secure',
      description: 'Verified users and secure platform for safe food sharing.',
      color: 'info',
    },
  ];

  const stats = [
    { number: '1,000+', label: 'Donations Made' },
    { number: '500+', label: 'Happy Recipients' },
    { number: '50+', label: 'Communities Served' },
    { number: '95%', label: 'Satisfaction Rate' },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Donor',
      content: 'FoodBridge helped me connect with my community while reducing food waste. It\'s amazing to see the impact!',
      avatar: 'SJ',
    },
    {
      name: 'Mike Chen',
      role: 'Receiver',
      content: 'The platform is so easy to use. I can find fresh food donations in my area whenever I need them.',
      avatar: 'MC',
    },
    {
      name: 'Emma Rodriguez',
      role: 'Donor',
      content: 'I love how FoodBridge makes it simple to give back to my community. Highly recommend!',
      avatar: 'ER',
    },
  ];

  return (
    <Layout showFooter>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 8,
          mb: 6,
          borderRadius: 4,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            opacity: 0.3,
          },
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: 'repeat(2, 1fr)',
              },
              gap: 4,
              alignItems: 'center',
            }}
          >
            <Box>
              <Typography
                variant="h2"
                component="h1"
                sx={{
                  fontWeight: 700,
                  mb: 3,
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  lineHeight: 1.2,
                }}
              >
                Connect Through
                <Box component="span" sx={{ display: 'block', color: '#ff6b35' }}>
                  Food Sharing
                </Box>
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  mb: 4,
                  opacity: 0.9,
                  fontWeight: 400,
                  lineHeight: 1.4,
                }}
              >
                Join thousands of people making a difference in their communities by sharing surplus food and reducing waste.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                {user ? (
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate('/donations')}
                    sx={{
                      py: 2,
                      px: 4,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      background: '#ff6b35',
                      '&:hover': {
                        background: '#e64a19',
                      },
                    }}
                  >
                    Browse Donations
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="contained"
                      size="large"
                      onClick={() => navigate('/register')}
                      sx={{
                        py: 2,
                        px: 4,
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        background: '#ff6b35',
                        '&:hover': {
                          background: '#e64a19',
                        },
                      }}
                    >
                      Get Started
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={() => navigate('/login')}
                      sx={{
                        py: 2,
                        px: 4,
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        borderColor: 'white',
                        color: 'white',
                        '&:hover': {
                          borderColor: 'white',
                          background: 'rgba(255,255,255,0.1)',
                        },
                      }}
                    >
                      Sign In
                    </Button>
                  </>
                )}
              </Stack>
            </Box>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
              }}
            >
              <Box
                sx={{
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: -20,
                    left: -20,
                    right: -20,
                    bottom: -20,
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: 4,
                    zIndex: 0,
                  },
                }}
              >
                <Restaurant
                  sx={{
                    fontSize: { xs: 200, md: 300 },
                    color: 'rgba(255,255,255,0.2)',
                    position: 'relative',
                    zIndex: 1,
                  }}
                />
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Stats Section */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(2, 1fr)',
              md: 'repeat(4, 1fr)',
            },
            gap: 3,
          }}
        >
          {stats.map((stat, index) => (
            <Paper
              key={index}
              elevation={2}
              sx={{
                p: 3,
                textAlign: 'center',
                borderRadius: 3,
                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                color: 'primary.main',
              }}
            >
              <Typography
                variant="h3"
                component="div"
                sx={{
                  fontWeight: 700,
                  color: 'primary.main',
                  mb: 1,
                }}
              >
                <CountUp end={parseInt(stat.number.replace(/[^\d]/g, ''))} duration={2} separator="," suffix={stat.number.replace(/\d+/g, '')} />
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {stat.label}
              </Typography>
            </Paper>
          ))}
        </Box>
      </Container>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant="h3"
            component="h2"
            sx={{
              fontWeight: 700,
              mb: 2,
            }}
          >
            Why Choose FoodBridge?
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ maxWidth: 600, mx: 'auto' }}
          >
            We make it easy and safe to share food with your community
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(4, 1fr)',
            },
            gap: 4,
          }}
        >
          {features.map((feature, index) => (
            <Card
              key={index}
              sx={{
                height: '100%',
                borderRadius: 3,
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                },
              }}
            >
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${feature.color}.main 0%, ${feature.color}.dark 100%)`,
                    color: 'white',
                    mb: 3,
                  }}
                >
                  {feature.icon}
                </Box>
                <Typography
                  variant="h6"
                  component="h3"
                  sx={{
                    fontWeight: 600,
                    mb: 2,
                  }}
                >
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Container>

      {/* Testimonials Section */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant="h3"
            component="h2"
            sx={{
              fontWeight: 700,
              mb: 2,
            }}
          >
            What Our Users Say
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ maxWidth: 600, mx: 'auto' }}
          >
            Real stories from our community members
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: 'repeat(3, 1fr)',
            },
            gap: 4,
          }}
        >
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              sx={{
                height: '100%',
                borderRadius: 3,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.2)',
                      mr: 2,
                      width: 56,
                      height: 56,
                    }}
                  >
                    {testimonial.avatar}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {testimonial.name}
                    </Typography>
                    <Chip
                      label={testimonial.role}
                      size="small"
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        fontSize: '0.75rem',
                      }}
                    />
                  </Box>
                </Box>
                <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                  "{testimonial.content}"
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Container>

      {/* CTA Section */}
      <Container maxWidth="md" sx={{ mb: 8 }}>
        <Paper
          elevation={4}
          sx={{
            p: 6,
            borderRadius: 4,
            textAlign: 'center',
            background: 'linear-gradient(135deg, #ff6b35 0%, #e64a19 100%)',
            color: 'white',
          }}
        >
          <VolunteerActivism sx={{ fontSize: 60, mb: 3 }} />
          <Typography
            variant="h4"
            component="h2"
            sx={{
              fontWeight: 700,
              mb: 3,
            }}
          >
            Ready to Make a Difference?
          </Typography>
          <Typography
            variant="h6"
            sx={{
              mb: 4,
              opacity: 0.9,
              maxWidth: 600,
              mx: 'auto',
            }}
          >
            Join thousands of people who are already making their communities better through food sharing.
          </Typography>
          {user ? (
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/donations')}
              sx={{
                py: 2,
                px: 4,
                fontSize: '1.1rem',
                fontWeight: 600,
                bgcolor: 'white',
                color: 'primary.main',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.9)',
                },
              }}
            >
              Browse Donations
            </Button>
          ) : (
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/register')}
              sx={{
                py: 2,
                px: 4,
                fontSize: '1.1rem',
                fontWeight: 600,
                bgcolor: 'white',
                color: 'primary.main',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.9)',
                },
              }}
            >
              Get Started Today
            </Button>
          )}
        </Paper>
      </Container>
    </Layout>
  );
};

export default HomePage; 