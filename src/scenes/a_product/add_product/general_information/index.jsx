import React, {useContext, useState, useEffect } from "react";

import {DataContext } from "../../../../context/DataContext";
import {postProduct, fetchWarehouse} from "../../../../api/controller/api_controller";
import {
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Checkbox,
  FormControlLabel,
  CircularProgress,
} from "@mui/material";

const GeneralProductInfo = () => {
  const [productData, setProductData] = useState({
    product_name: "",
    product_cat_id: "",
    warehouse_id: "",
    price: "",
    warehouse_price: "",
    total_stock: "",
    product_code: "",
    suggested_price: "",
    description: "",
    main_image_url: "",
    is_verified: false,
    winning_rate: "",
    is_featured: false,
    is_today_deal: false,
    is_refundable: false,
    brand_id: "",
    unit: "",
    weight: "",
    show_stock: false,
    sku: "",
  });
  const [warehouses, setWare] = useState([]);
  const { categories, loadingCat } = useContext(DataContext);
  const { brandss, loadingBrand } = useContext(DataContext);
  const getWarehouse = async () => {
      try {
        const data = await fetchWarehouse();
        setWare(data); // Set the fetched withdrawals data
      
      } catch (error) {
        enqueueSnackbar("Failed to fetch warehouses data", { variant: "error" });
     
      }
    };

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    
    getWarehouse();
    setLoading(false);
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProductData((prevState) => ({
      ...prevState,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Perform form validation
    if (!productData.product_name || !productData.product_cat_id || !productData.price || !productData.suggested_price) {
      alert("Please fill all the required fields.");
      return;
    }

    // Convert price, stock, and weight to number before submitting
    const dataToSubmit = {
      ...productData,

    price: parseFloat(productData.price),
    total_stock: parseInt(productData.total_stock, 10),
    suggested_price: parseFloat(productData.suggested_price),
    weight: parseFloat(productData.weight),
    is_verified: productData.is_verified ? 1 : 0,
    is_featured: productData.is_featured ? 1 : 0,
    is_today_deal: productData.is_today_deal ? 1 : 0,
    is_refundable: productData.is_refundable ? 1 : 0,
    show_stock: productData.show_stock ? 1 : 0,
    };

    console.log("Submitting Product Data:", dataToSubmit);
    // Here, you would send this data to your API
    try {
      setLoading(true); // Start loading spinner
      const response = await postProduct(dataToSubmit); // Call API controller
      console.log("Product created successfully:", response);
      // Handle success (e.g., redirect, show success message, etc.)
    } catch (error) {
      console.error("Error creating product:", error);
      // Handle error (e.g., show error message)
    } finally {
      setLoading(false); // Stop loading spinner
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", padding: 2 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h6" gutterBottom>
        Product General Information
      </Typography>
      <form onSubmit={handleSubmit}>
        {/* Product Name */}
        <TextField
          fullWidth
          label="Product Name"
          name="product_name"
          value={productData.product_name}
          onChange={handleInputChange}
          margin="normal"
          required
        />

        {/* Category Dropdown */}
        <FormControl fullWidth margin="normal">
          <InputLabel>Category</InputLabel>
          <Select
            label="Category"
            name="product_cat_id"
            value={productData.product_cat_id}
            onChange={handleInputChange}
            required
          >
            {categories.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.product_cat_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth margin="normal">
          <InputLabel>Warehouse</InputLabel>
          <Select
            label="Warehouse"
            name="warehouse_id"
            value={productData.warehouse_id}
            onChange={handleInputChange}
            required
          >
            {warehouses.map((ware) => (
              <MenuItem key={ware.id} value={ware.id}>
                {ware.warehouse_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Price */}
        <TextField
          fullWidth
          label="Price"
          name="price"
          type="number"
          value={productData.price}
          onChange={handleInputChange}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="Warehouse Price"
          name="warehouse_price"
          type="number"
          value={productData.warehouse_price}
          onChange={handleInputChange}
          margin="normal"
          required
        />

        {/* Total Stock */}
        <TextField
          fullWidth
          label="Total Stock"
          name="total_stock"
          type="number"
          value={productData.total_stock}
          onChange={handleInputChange}
          margin="normal"
        />

        {/* Product Code */}
        <TextField
          fullWidth
          label="Product Code"
          name="product_code"
          value={productData.product_code}
          onChange={handleInputChange}
          margin="normal"
        />

        {/* Suggested Price */}
        <TextField
          fullWidth
          label="Suggested Price"
          name="suggested_price"
          type="number"
          value={productData.suggested_price}
          onChange={handleInputChange}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="Winning Rate"
          name="winning_rate"
          type="number"
          value={productData.winning_rate}
          onChange={handleInputChange}
          margin="normal"
          required
        />

        {/* Description */}
        <TextField
          fullWidth
          label="Description"
          name="description"
          value={productData.description}
          onChange={handleInputChange}
          margin="normal"
        />

        {/* Main Image URL */}
        <TextField
          fullWidth
          label="Main Image URL"
          name="main_image_url"
          value={productData.main_image_url}
          onChange={handleInputChange}
          margin="normal"
        />

        {/* Checkbox Inputs */}
        <FormControlLabel
          control={
            <Checkbox
              name="is_verified"
              checked={productData.is_verified}
              onChange={handleInputChange}
            />
          }
          label="Is Verified?"
        />
        <FormControlLabel
          control={
            <Checkbox
              name="is_featured"
              checked={productData.is_featured}
              onChange={handleInputChange}
            />
          }
          label="Is Featured?"
        />
        <FormControlLabel
          control={
            <Checkbox
              name="is_today_deal"
              checked={productData.is_today_deal}
              onChange={handleInputChange}
            />
          }
          label="Is Today Deal?"
        />
        <FormControlLabel
          control={
            <Checkbox
              name="is_refundable"
              checked={productData.is_refundable}
              onChange={handleInputChange}
            />
          }
          label="Is Refundable?"
        />
        <FormControlLabel
          control={
            <Checkbox
              name="show_stock"
              checked={productData.show_stock}
              onChange={handleInputChange}
            />
          }
          label="Show Stock?"
        />

        {/* Brand Dropdown */}
        <FormControl fullWidth margin="normal">
          <InputLabel>Brand</InputLabel>
          <Select
            label="Brand"
            name="brand_id"
            value={productData.brand_id}
            onChange={handleInputChange}
          >
            {brandss.map((brand) => (
              <MenuItem key={brand.id} value={brand.id}>
                {brand.brand_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Unit */}
        <TextField
          fullWidth
          label="Unit"
          name="unit"
          value={productData.unit}
          onChange={handleInputChange}
          margin="normal"
        />

        {/* Weight */}
        <TextField
          fullWidth
          label="Weight"
          name="weight"
          type="number"
          value={productData.weight}
          onChange={handleInputChange}
          margin="normal"
        />

        {/* SKU */}
        <TextField
          fullWidth
          label="SKU"
          name="sku"
          value={productData.sku}
          onChange={handleInputChange}
          margin="normal"
        />

        {/* Submit Button */}
        <Button variant="contained" color="primary" type="submit" sx={{ marginTop: 2 }}>
          Create Product
        </Button>
      </form>
    </Box>
  );
};

export default GeneralProductInfo;
