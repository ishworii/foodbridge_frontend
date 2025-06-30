import { Box, Container, Paper, Typography } from '@mui/material';
import React from 'react';
import Layout from '../components/Layout';

const AboutPage: React.FC = () => (
  <Layout showFooter>
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3, mb: 4 }}>
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}>
          About FoodBridge
        </Typography>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Connecting Communities, Reducing Waste
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          FoodBridge is a community-driven platform dedicated to reducing food waste and fighting hunger by connecting donors with recipients in their local area. Our mission is to make food sharing easy, safe, and impactful for everyone.
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          We believe that everyone deserves access to fresh, nutritious food. By bridging the gap between surplus and need, we empower individuals, families, and organizations to make a real difference in their communities.
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Since our launch, FoodBridge has helped thousands of people share food, build connections, and create a more sustainable future. Join us in our mission to end food insecurity and build stronger, more caring communities.
        </Typography>
      </Paper>
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
          "Together, we can bridge the gap and nourish our world."
        </Typography>
        <Typography variant="body2" color="text.secondary">
          — The FoodBridge Team
        </Typography>
      </Box>
    </Container>
  </Layout>
);

export default AboutPage; 