import { Box, Button, Container, Paper, TextField, Typography } from '@mui/material';
import React, { useState } from 'react';
import Layout from '../components/Layout';

const ContactPage: React.FC = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <Layout>
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}>
            Contact Us
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Have a question, suggestion, or want to get involved? Reach out to us below!
          </Typography>
          {submitted ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h5" color="success.main" sx={{ mb: 2 }}>
                Thank you for contacting us!
              </Typography>
              <Typography variant="body2">We'll get back to you soon.</Typography>
            </Box>
          ) : (
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                sx={{ mb: 2 }}
                required
              />
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                sx={{ mb: 2 }}
                required
              />
              <TextField
                fullWidth
                label="Message"
                name="message"
                value={form.message}
                onChange={handleChange}
                multiline
                rows={4}
                sx={{ mb: 3 }}
                required
              />
              <Button type="submit" variant="contained" color="primary" fullWidth>
                Send Message
              </Button>
            </form>
          )}
          <Box sx={{ mt: 4 }}>
            <Typography variant="body2" color="text.secondary">
              Or email us directly at <a href="mailto:info@foodbridge.org">info@foodbridge.org</a>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Layout>
  );
};

export default ContactPage; 