# FoodBridge Frontend

A modern, beautiful React frontend for the FoodBridge food donation platform. Built with TypeScript, Material-UI, and modern React patterns.

## 🎨 Features

- **Modern Design**: Beautiful, responsive UI with Material-UI components
- **TypeScript**: Full type safety throughout the application
- **Authentication**: JWT-based authentication with protected routes
- **Role-based Access**: Different interfaces for donors and receivers
- **Real-time Updates**: Live donation status updates
- **Search & Filter**: Advanced filtering and search capabilities
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
│   ├── Header.tsx      # Navigation header
│   ├── Layout.tsx      # Main layout wrapper
│   ├── DonationCard.tsx # Individual donation display
│   ├── DonationForm.tsx # Create/edit donation form
│   ├── LoadingSpinner.tsx # Loading states
│   └── ProtectedRoute.tsx # Route protection
├── pages/              # Page components
│   ├── DonationPage.tsx # Main donations listing
│   ├── LoginPage.tsx   # Authentication
│   └── RegisterPage.tsx # User registration
├── context/            # React context providers
│   └── AuthContext.tsx # Authentication state
├── api/                # API utilities
│   └── axiosInstance.ts # Axios configuration
├── types.ts            # TypeScript type definitions
└── App.tsx             # Main application component
```

## 🎯 Key Components

### DonationCard
Modern card component displaying donation information with:
- Status badges (Available/Claimed)
- Role-based action buttons
- Responsive design
- Hover effects

### DonationForm
Modal form for creating and editing donations with:
- Form validation
- Real-time feedback
- Responsive layout
- Loading states

### Header
Navigation header with:
- User authentication status
- Role-based navigation
- Modern gradient design
- User menu

## 🎨 Design System

### Color Palette
- **Primary**: Modern blue (#1976d2)
- **Secondary**: Warm orange (#ff6b35)
- **Success**: Green (#2e7d32)
- **Background**: Light gray (#f5f5f5)

### Typography
- **Font**: Inter (Google Fonts)
- **Weights**: 300, 400, 500, 600, 700
- **Responsive**: Scales appropriately across devices

### Components
- **Cards**: Elevated with hover effects
- **Buttons**: Modern styling with gradients
- **Forms**: Clean, accessible design
- **Navigation**: Intuitive and responsive

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Style

- TypeScript for type safety
- Functional components with hooks
- Material-UI for consistent design
- Responsive design patterns
- Accessibility best practices

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

### Authentication
- Secure login/logout
- Protected routes
- JWT token management
- Automatic redirects

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
