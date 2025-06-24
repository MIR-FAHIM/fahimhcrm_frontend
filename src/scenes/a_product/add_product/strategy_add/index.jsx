import React, { useState } from 'react';
import { Box, Typography, TextField, Button, FormControlLabel, Checkbox, CircularProgress, Alert } from '@mui/material';
import { base_url } from "../../../../api/config";
const AddProductStrategy = () => {
  const [productId, setProductId] = useState('');
  const [strategyTitle, setStrategyTitle] = useState('');
  const [strategySubtitle, setStrategySubtitle] = useState('');
  const [type, setType] = useState('product');
  const [isActive, setIsActive] = useState(true);
  const [isImportant, setIsImportant] = useState(false);
  const [isSuggested, setIsSuggested] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!productId || !strategyTitle || !strategySubtitle) {
      alert('Please fill all the required fields.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData();
    formData.append('product_id', productId);
    formData.append('strategy_title', strategyTitle);
    formData.append('strategy_subtitle', strategySubtitle);
    formData.append('type', type);
    formData.append('is_active', isActive ? '1' : '0');
    formData.append('is_important', isImportant ? '1' : '0');
    formData.append('is_suggested', isSuggested ? '1' : '0');

    try {
      const response = await fetch(`${base_url}/api/addStrategy`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to add strategy.');
      }

      setSuccess(true);
      setProductId('');
      setStrategyTitle('');
      setStrategySubtitle('');
      setIsActive(true);
      setIsImportant(false);
      setIsSuggested(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h6" gutterBottom>
        Add Product Strategy
      </Typography>

      {error && (
        <Alert severity="error" sx={{ marginBottom: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ marginBottom: 2 }}>
          Strategy added successfully!
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

        {/* Strategy Title */}
        <Box sx={{ marginBottom: 2 }}>
          <Typography variant="body1" gutterBottom>
            Strategy Title
          </Typography>
          <TextField
            fullWidth
            type="text"
            value={strategyTitle}
            onChange={(e) => setStrategyTitle(e.target.value)}
            placeholder="Enter strategy title"
            required
          />
        </Box>

        {/* Strategy Subtitle */}
        <Box sx={{ marginBottom: 2 }}>
          <Typography variant="body1" gutterBottom>
            Strategy Subtitle
          </Typography>
          <TextField
            fullWidth
            type="text"
            value={strategySubtitle}
            onChange={(e) => setStrategySubtitle(e.target.value)}
            placeholder="Enter strategy subtitle"
            required
          />
        </Box>

        {/* Type */}
        <Box sx={{ marginBottom: 2 }}>
          <Typography variant="body1" gutterBottom>
            Type
          </Typography>
          <TextField
            fullWidth
            select
            value={type}
            onChange={(e) => setType(e.target.value)}
            SelectProps={{
              native: true,
            }}
          >
            <option value="product">Product</option>
            <option value="category">Category</option>
          </TextField>
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

        {/* Is Important */}
        <Box sx={{ marginBottom: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={isImportant}
                onChange={() => setIsImportant(!isImportant)}
                name="is_important"
              />
            }
            label="Is Important"
          />
        </Box>

        {/* Is Suggested */}
        <Box sx={{ marginBottom: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={isSuggested}
                onChange={() => setIsSuggested(!isSuggested)}
                name="is_suggested"
              />
            }
            label="Is Suggested"
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
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Add Strategy'}
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default AddProductStrategy;
