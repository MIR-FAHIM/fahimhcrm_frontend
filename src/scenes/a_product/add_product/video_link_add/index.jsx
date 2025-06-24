import React, { useState } from 'react';
import { Box, Typography, Button, CircularProgress, Alert, TextField, FormControlLabel, Checkbox } from '@mui/material';
import { base_url } from "../../../../api/config";
const AddProductVideo = () => {
  const [videoLink, setVideoLink] = useState('');
  const [productId, setProductId] = useState('');
  const [fileName, setFileName] = useState('');
  const [isYoutube, setIsYoutube] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!videoLink || !productId || !fileName) {
      alert('Please fill all the required fields.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData();
    formData.append('video_link', videoLink);
    formData.append('is_youtube', isYoutube ? '1' : '0');
    formData.append('is_paid', isPaid ? '1' : '0');
    formData.append('is_active', isActive ? '1' : '0');
    formData.append('file_name', fileName);
    formData.append('product_id', productId);

    try {
      const response = await fetch(`${base_url}/api/addProductVideos`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload video.');
      }

      setSuccess(true);
      setVideoLink('');
      setProductId('');
      setFileName('');
      setIsYoutube(false);
      setIsPaid(false);
      setIsActive(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h6" gutterBottom>
        Add Product Video
      </Typography>

      {error && (
        <Alert severity="error" sx={{ marginBottom: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ marginBottom: 2 }}>
          Video added successfully!
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        {/* Product ID */}
        <Box sx={{ marginBottom: 2 }}>
          <Typography variant="body1" gutterBottom>
            Product ID
          </Typography>
          <TextField
            fullWidth
            type="text"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            placeholder="Enter product ID"
            required
          />
        </Box>

        {/* Video Link */}
        <Box sx={{ marginBottom: 2 }}>
          <Typography variant="body1" gutterBottom>
            Video Link (YouTube URL)
          </Typography>
          <TextField
            fullWidth
            type="url"
            value={videoLink}
            onChange={(e) => setVideoLink(e.target.value)}
            placeholder="Enter video link"
            required
          />
        </Box>

        {/* File Name */}
        <Box sx={{ marginBottom: 2 }}>
          <Typography variant="body1" gutterBottom>
            File Name
          </Typography>
          <TextField
            fullWidth
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            placeholder="Enter file name"
            required
          />
        </Box>

        {/* Is YouTube Video */}
        <Box sx={{ marginBottom: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={isYoutube}
                onChange={() => setIsYoutube(!isYoutube)}
                name="is_youtube"
              />
            }
            label="Is YouTube Video"
          />
        </Box>

        {/* Is Paid Video */}
        <Box sx={{ marginBottom: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={isPaid}
                onChange={() => setIsPaid(!isPaid)}
                name="is_paid"
              />
            }
            label="Is Paid Video"
          />
        </Box>

        {/* Is Active */}
        <Box sx={{ marginBottom: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={isActive}
                onChange={() => setIsActive(!isActive)}
                name="is_active"
              />
            }
            label="Is Active"
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
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Add Video'}
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default AddProductVideo;
