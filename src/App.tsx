import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';

//import DonationsPage from './pages/DonationsPage';
//import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2E7D32', // A pleasant green
    },
    secondary: {
      main: '#FFB300', // A warm amber
    },
  },
});

function App() {
  return (
    // The ThemeProvider applies the MUI theme to all children.
    <ThemeProvider theme={theme}>
      {/* CssBaseline provides a consistent baseline of styles across browsers. */}
      <CssBaseline />
      
      {/* The Router provides the foundation for page navigation. */}
      <Router>
        {/* The AuthProvider makes user authentication data available to all routes. */}
        <AuthProvider>
          {/* The Routes component is where we define our individual page routes. */}
          <Routes>
            {/* When the user navigates to the root URL ("/"), they will see the DonationsPage. 
                We will later wrap this in a ProtectedRoute. */}
            {/* <Route path="/" element={<DonationsPage />} /> */}

            {/* When the user navigates to "/login", they will see the LoginPage. */}
            {/* <Route path="/login" element={<LoginPage />} /> */}

            {/* When the user navigates to "/register", they will see the RegisterPage. */}
            <Route path="/register" element={<RegisterPage />} />
          </Routes>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;