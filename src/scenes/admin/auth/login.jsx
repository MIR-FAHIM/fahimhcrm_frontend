import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginController } from "../../../api/controller/admin_controller/user_controller";
import { TextField, Button, Typography, Container, Box, CircularProgress } from "@mui/material";

// Login component
const Login = () => {
  const navigate = useNavigate();

  // Local state to manage form inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Function to handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    
    setLoading(true);
    setError("");

    // Simple client-side validation (optional but recommended)
    if (!email || !password) {
      setError("Please fill in all fields.");
      setLoading(false);
      return;
    }

    try {
      // Assuming loginController returns a promise, passing email and password
      const response = await loginController({ email, password });

      if (response.status === 200) {
        // Extract token from response
        const token = response?.token;
        const userId = response?.user.id;

        if (token) {
          localStorage.setItem("authToken", token); // Store the token in localStorage
          localStorage.setItem("userId", userId); // Store the token in localStorage
         navigate("/"); // Redirect to homepage or dashboard
        } else {
          setError("Failed to retrieve token. Please try again.");
        }
      } else {
        setError("Invalid credentials. Please try again.");
      }
    } catch (error) {
      setError("An error occurred. Please try again later.");
    } finally {
      setLoading(false); // Always stop loading state
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          backgroundColor: "#fff",
          padding: 3,
          borderRadius: 2,
          boxShadow: 3,
        }}
      >
        <Typography variant="h4" gutterBottom>
          Welcome Back
        </Typography>

        {/* Error message */}
        {error && (
          <Typography color="error" variant="body2" align="center" sx={{ marginBottom: 2 }}>
            {error}
          </Typography>
        )}

        {/* Form */}
        <form onSubmit={handleLogin}>
          <TextField
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            margin="normal"
            required
          />

          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            margin="normal"
            required
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ marginTop: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Login"}
          </Button>
        </form>

        <Box sx={{ marginTop: 2 }}>
          <Typography variant="body2" color="textSecondary" align="center">
            Don't have an account?{" "}
            <Button
              component="a"
              href="/signup"
              color="primary"
              sx={{ textTransform: "none" }}
            >
              Sign Up
            </Button>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default Login;
