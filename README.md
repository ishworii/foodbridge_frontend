# FoodBridge Frontend

A modern, beautiful React frontend for the FoodBridge food donation platform. Built with TypeScript, Material-UI, and modern React patterns.

## 🎨 Features

- **Modern Design**: Beautiful, responsive UI with Material-UI components
- **TypeScript**: Full type safety throughout the application
- **Authentication**: JWT-based authentication with protected routes
- **Role-based Access**: Different interfaces for donors, receivers, and admins
- **Admin Dashboard**: Platform statistics, donation management, and user monitoring
- **Activity Tab**: Users see only their own activity (created/claimed donations)
- **Theme Toggle**: Switch between dark and light mode on any page (including login/register)
- **Responsive Design**: Works perfectly on all device sizes

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend server running (see backend README)

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start the development server**
   ```bash
   npm run dev
   ```

3. **Open your browser**
   Navigate to `http://localhost:5173`

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/               # Page components (Login, Register, Dashboard, Profile, etc.)
├── context/             # React context providers (Auth, Theme)
├── api/                 # API utilities (axiosInstance, donationService)
├── types.ts             # TypeScript type definitions
└── App.tsx              # Main application component
```

## 🌟 User Experience

### For Donors
- Create and manage donations
- Edit donation details
- View donation status
- Delete donations

### For Receivers
- Browse available donations
- Search and filter donations
- Claim donations
- View claimed donations

### For Admins
- Access the admin dashboard via the "Admin" link (superusers only)
- View platform statistics
- Manage all donations (edit/delete)
- Monitor user activity

### Authentication
- Secure login/logout
- Protected routes
- JWT token management
- Automatic redirects

## 🎨 Theming
- **Dark/Light Mode**: Toggle theme using the sun/moon icon in the top-right corner of every page, including login and register
- **Theme is global**: Applies to all pages and components

## 🔗 API Integration

The frontend integrates with the Django backend API:
- RESTful endpoints
- JWT authentication
- Real-time updates
- Error handling

## 📱 Responsive Design

- Mobile-first approach
- Tablet and desktop optimized
- Touch-friendly interfaces
- Adaptive layouts

## 🚀 Deployment

The application is ready for deployment to:
- Vercel
- Netlify
- AWS S3
- Any static hosting service

Build the application with:
```bash
npm run build
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is part of the FoodBridge platform.
