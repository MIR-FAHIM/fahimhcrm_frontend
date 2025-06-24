import React, { useState } from 'react';
import { Box, Typography, Button, CircularProgress, Alert } from '@mui/material';
import { base_url } from "../../../../api/config";
const AddProductImages = () => {
  const [images, setImages] = useState([]);
  const [productId, setProductId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Handle image selection
  const handleImageChange = (e) => {
    const files = e.target.files;
    setImages([...images, ...files]); // Add selected files to state
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!productId || images.length === 0) {
      alert('Please enter product ID and select images.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData();
    images.forEach((image) => {
      formData.append('images[]', image); // Append each image
    });
    formData.append('product_id', productId); // Append product ID

    try {
      const response = await fetch(`${base_url}/api/addProductImages`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload images.');
      }

      setSuccess(true);
      setImages([]); // Reset images state after successful upload
      setProductId(''); // Reset product ID
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h6" gutterBottom>
        Add Product Images
      </Typography>

      {error && (
        <Alert severity="error" sx={{ marginBottom: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ marginBottom: 2 }}>
          Images uploaded successfully!
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        {/* Product ID Input */}
        <Box sx={{ marginBottom: 2 }}>
          <Typography variant="body1" gutterBottom>
            Product ID
          </Typography>
          <input
            type="text"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            placeholder="Enter product ID"
            required
            style={{ padding: '8px', width: '100%' }}
          />
        </Box>

        {/* File Input for Multiple Images */}
        <Box sx={{ marginBottom: 2 }}>
          <Typography variant="body1" gutterBottom>
            Select Images (multiple)
          </Typography>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            multiple
            required
            style={{ padding: '8px', width: '100%' }}
          />
        </Box>

        {/* Submit Button */}
        <Box sx={{ marginTop: 2 }}>
          <Button
            variant="contained"
            color="primary"
            type="submit"
            disabled={loading}
            sx={{ width: '100%' }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Upload Images'}
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default AddProductImages;
