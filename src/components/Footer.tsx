import { Box, Container, Link, Typography } from '@mui/material';
import React from 'react';

const Footer: React.FC = () => (
  <Box sx={{
    background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
    color: 'white',
    py: 3,
    mt: 8,
    textAlign: 'center',
  }}>
    <Container maxWidth="lg">
      <Typography variant="body2" sx={{ mb: 1 }}>
        &copy; {new Date().getFullYear()} FoodBridge. All rights reserved.
      </Typography>
      <Typography variant="body2">
        <Link href="/about" color="inherit" underline="hover" sx={{ mx: 1 }}>
          About
        </Link>
        |
        <Link href="/contact" color="inherit" underline="hover" sx={{ mx: 1 }}>
          Contact
        </Link>
      </Typography>
    </Container>
  </Box>
);

export default Footer; 