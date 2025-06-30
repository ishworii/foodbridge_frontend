import { Box, Container } from '@mui/material';
import React from 'react';
import Footer from './Footer';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
  showFooter?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, showFooter }) => {
  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Header />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {children}
      </Container>
      {showFooter && <Footer />}
    </Box>
  );
};

export default Layout;