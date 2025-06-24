import React, { useEffect, useState } from 'react';
import { updateProductInfo } from '../../../../../api/controller/api_controller';
import { TextField, Button, Box, Grid, FormControlLabel, Checkbox } from '@mui/material';

const UpdateProductPage = ({ product }) => {
  // Initialize formData with the passed product data
  const [formData, setFormData] = useState({
    product_name: product.product_name || '',
    product_code: product.product_code || '',
    price: product.price || '',
    total_stock: product.total_stock || '',
    description: product.description || '',
    main_image_url: product.main_image_url || '',
    is_verified: product.is_verified || false,
    is_featured: product.is_featured || false,
    is_today_deal: product.is_today_deal || false,
    is_refundable: product.is_refundable || false,
    unit: product.unit || '',
    weight: product.weight || ''
  });

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Handle form submission to update product info
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await updateProductInfo( formData, product.id); // Use product.id from the prop

      if (response.data.status === 200) {
        alert('Product updated successfully!');
      } else {
        alert('Failed to update product');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      alert('An error occurred while updating the product');
    }
  };

  return (
    <Box sx={{ padding: 3 }}>
      <h1>Update Product</h1>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Product Name"
              fullWidth
              variant="outlined"
              name="product_name"
              value={formData.product_name}
              onChange={handleInputChange}
            />
           
          </Grid>
  
          <Grid item xs={12} sm={6}>
          <TextField
              label="Product Code"
              fullWidth
              variant="outlined"
              name="product_code"
              value={formData.product_code}
              onChange={handleInputChange}
            />
           
          </Grid>
         
          <Grid item xs={12} sm={6}>
            <TextField
              label="Price"
              fullWidth
              variant="outlined"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Total Stock"
              fullWidth
              variant="outlined"
              name="total_stock"
              value={formData.total_stock}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Unit"
              fullWidth
              variant="outlined"
              name="unit"
              value={formData.unit}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Weight"
              fullWidth
              variant="outlined"
              name="weight"
              value={formData.weight}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Product Description"
              fullWidth
              variant="outlined"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              multiline
              rows={4}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Main Image URL"
              fullWidth
              variant="outlined"
              name="main_image_url"
              value={formData.main_image_url}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.is_verified}
                  onChange={handleInputChange}
                  name="is_verified"
                />
              }
              label="Verified"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.is_featured}
                  onChange={handleInputChange}
                  name="is_featured"
                />
              }
              label="Featured"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.is_today_deal}
                  onChange={handleInputChange}
                  name="is_today_deal"
                />
              }
              label="Today's Deal"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.is_refundable}
                  onChange={handleInputChange}
                  name="is_refundable"
                />
              }
              label="Refundable"
            />
          </Grid>
          <Grid item xs={12}>
            <Button type="submit" variant="contained" color="primary">
              Update Product
            </Button>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default UpdateProductPage;
