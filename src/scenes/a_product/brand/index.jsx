import React, { useState, useEffect } from "react";
import axios from "axios";
import { Box, Typography, Card, CardContent, Grid, Button, Modal, TextField } from "@mui/material";
import { base_url } from "../../../api/config";
const BrandList = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false); // Modal open state
  const [newBrand, setNewBrand] = useState({
    brand_name: "",
    type: "",
    description: "",
    logo: "",
  });

  // Fetch the brands from the API
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await axios.get(`${base_url}/api/getBrands`);
        setBrands(response.data.data); // Set the brand data to state
      } catch (error) {
        console.error("Error fetching brands:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewBrand((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleCreateBrand = async () => {
    try {
      const formData = new FormData();
      formData.append("brand_name", newBrand.brand_name);
      formData.append("type", newBrand.type);
      formData.append("description", newBrand.description);
      formData.append("logo", newBrand.logo); // Assuming the logo is a URL or file path

      const response = await axios.post(`${base_url}/api/createBrand`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data) {
        setBrands([...brands, response.data]); // Add the new brand to the list
        setOpen(false); // Close the modal
      }
    } catch (error) {
      console.error("Error creating brand:", error);
    }
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  if (loading) {
    return <Typography variant="h6">Loading...</Typography>;
  }

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h5" gutterBottom>
        Brand List
      </Typography>
      <Button variant="contained" color="primary" onClick={handleOpen}>
        Add Brand
      </Button>
      <Grid container spacing={2} sx={{ marginTop: 2 }}>
        {brands.map((brand) => (
          <Grid item xs={12} sm={6} md={4} key={brand.id}>
            <Card>
              <CardContent>
                {/* Displaying Logo */}
                {brand.logo && (
                  <img
                    src={brand.logo}
                    alt={`${brand.brand_name} Logo`}
                    style={{ width: 100, height: 100, objectFit: "cover", marginBottom: 10 }}
                  />
                )}
                <Typography variant="h6">{brand.brand_name}</Typography>
                <Typography color="textSecondary">Type: {brand.type}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {brand.description}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Created At: {new Date(brand.created_at).toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add Brand Modal */}
      <Modal open={open} onClose={handleClose}>
        <Box sx={{ width: 400, padding: 3, margin: "auto", backgroundColor: "white", borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Create a New Brand
          </Typography>
          <TextField
            fullWidth
            label="Brand Name"
            name="brand_name"
            value={newBrand.brand_name}
            onChange={handleInputChange}
            margin="normal"
            sx={{
              backgroundColor: "black",  // Black background
              color: "white",  // White text
              "& .MuiInputBase-root": {
                color: "white",  // White text color inside the input
              },
              "& .MuiFormLabel-root": {
                color: "white",  // White label color
              },
            }}
          />
          <TextField
            fullWidth
            label="Type"
            name="type"
            value={newBrand.type}
            onChange={handleInputChange}
            margin="normal"
            sx={{
              backgroundColor: "black",  // Black background
              color: "white",  // White text
              "& .MuiInputBase-root": {
                color: "white",  // White text color inside the input
              },
              "& .MuiFormLabel-root": {
                color: "white",  // White label color
              },
            }}
          />
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={newBrand.description}
            onChange={handleInputChange}
            margin="normal"
            sx={{
              backgroundColor: "black",  // Black background
              color: "white",  // White text
              "& .MuiInputBase-root": {
                color: "white",  // White text color inside the input
              },
              "& .MuiFormLabel-root": {
                color: "white",  // White label color
              },
            }}
          />
          <TextField
            fullWidth
            label="Logo URL"
            name="logo"
            value={newBrand.logo}
            onChange={handleInputChange}
            margin="normal"
            sx={{
              backgroundColor: "black",  // Black background
              color: "white",  // White text
              "& .MuiInputBase-root": {
                color: "white",  // White text color inside the input
              },
              "& .MuiFormLabel-root": {
                color: "white",  // White label color
              },
            }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreateBrand}
            sx={{ marginTop: 2 }}
          >
            Create Brand
          </Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default BrandList;
