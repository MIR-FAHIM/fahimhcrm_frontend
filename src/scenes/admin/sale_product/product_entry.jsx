import { useState, useEffect } from "react";
import { addProduct, addVariant, getBrand, getCategory, getStock } from "../../../api/controller/admin_controller/product_controller";
import {
  Box,
  Button,
  Grid,
  TextField,
  Checkbox,
  FormControlLabel,
  MenuItem,
  useMediaQuery,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  InputAdornment,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Divider,
  CircularProgress
} from "@mui/material";
import { Add, Edit, Delete, Close } from "@mui/icons-material";

const initialValues = {
  product_name: "",
  description: "",
  is_active: true,
  addVariants: false,
  variantCount: 0,
  price: "",
  product_id: "",
  type: "",
  model: "",
  sku: "",
  product_code: "",
  quantity_required: 1,
  stock_id: 1,
  status: "available",
  discount: 0,
  vat: 0,
  discount_type: "percentage",
  color_code: "",
  size: "M",
  unit: "pcs",
  weight: 0.5,
  entry_by: "",
  discount_start_date: "",
  discount_end_date: "",
  is_refundable: false,
  video_link: "",
  image_link: "",
  cover_image: "",
  external_link: "",
};

const ProductEntry = () => {
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const [variantRows, setVariantRows] = useState([]);
  const [brandList, setBrandList] = useState([]);
  const [stockList, setStockList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editRowIndex, setEditRowIndex] = useState(null);
  const [editRowData, setEditRowData] = useState(null);
  const [formValues, setFormValues] = useState(initialValues);
  const [formErrors, setFormErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [productId, setProductId] = useState(null);
  const [productAdded, setProductAdded] = useState(false);

  // Function to validate form
  const validateForm = () => {
    const errors = {};

    if (!formValues.product_name) {
      errors.product_name = "Product Name is required";
    }

    if (!formValues.description) {
      errors.description = "Description is required";
    }

    if (formValues.addVariants) {
      if (!formValues.variantCount || formValues.variantCount <= 0) {
        errors.variantCount = "Number of variants must be greater than 0";
      }

      if (!formValues.price || isNaN(parseFloat(formValues.price)) || parseFloat(formValues.price) <= 0) {
        errors.price = "Price must be a positive number";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Function to generate variant data
  const generateVariants = (count, price) => {
    const rows = Array.from({ length: count }, (_, i) => ({
      ...initialValues,
      sku: `SKU-${Date.now()}-${i + 1}`,
      price: parseFloat(price).toFixed(2),
      product_id: productId,
      product_code: `PROD-${productId}-${i + 1}`,
      stock_id: 1,
      entry_by: 1,
    }));
    setVariantRows(rows);
    setSnackbarMessage(`Generated ${count} variants.`);
    setSnackbarSeverity("info");
    setSnackbarOpen(true);
  };

  const handleGetBrand = async () => {
    const response = await getBrand();
    setBrandList(response.data);
  }
  const handleGetStock = async () => {
    const response = await getStock();
    setStockList(response.data);
  }
  const handleGetCategory = async () => {
    const response = await getCategory();
    setCategoryList(response.data);
  }
  // Handle adding product
  const handleAddProduct = async (data) => {
    setIsLoading(true);
    try {
      const response = await addProduct({
        product_name: data.product_name,
        description: data.description,
        is_active: data.is_active ? 1 : 0
      });

      if (response.status === "success") {
        setProductId(response.data.id);
        setProductAdded(true);
        setSnackbarMessage("Product added successfully!");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);

        if (data.addVariants && data.variantCount > 0 && data.price > 0) {
          generateVariants(data.variantCount, data.price);
        }
      } else {
        setSnackbarMessage(response.message || "Failed to add product");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error("Error adding product:", error);
      setSnackbarMessage("Error adding product");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    handleGetBrand();
    handleGetCategory();
    handleGetStock();
  }, []);
  // Handle adding variants
  const handleAddVariants = async () => {
    if (!productId || variantRows.length === 0) return;

    setIsLoading(true);
    try {
      const variantsData = variantRows.map(variant => ({
        product_id: productId,
        type: variant.type,
        model: variant.model,
        sku: variant.sku,
        product_code: variant.product_code,
        quantity_required: variant.quantity_required,
        stock_id: variant.stock_id,
        is_active: variant.is_active ? 1 : 0,
        status: variant.status,
        discount: variant.discount,
        price: variant.price,
        vat: variant.vat,
        discount_type: variant.discount_type,
        color_code: variant.color_code,
        size: variant.size,
        unit: variant.unit,
        weight: variant.weight,
        entry_by: variant.entry_by,
        discount_start_date: variant.discount_start_date,
        discount_end_date: variant.discount_end_date,
        is_refundable: variant.is_refundable ? 1 : 0,
        video_link: variant.video_link,
        image_link: variant.image_link,
        cover_image: variant.cover_image,
        external_link: variant.external_link
      }));

      const response = await addVariant({
        product_id: productId,
        variants: variantsData
      });

      if (response.status === "success") {
        setSnackbarMessage("Variants added successfully!");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        // Reset form after successful submission
        setFormValues(initialValues);
        setVariantRows([]);
        setProductId(null);
        setProductAdded(false);
      } else {
        setSnackbarMessage(response.message || "Failed to add variants");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error("Error adding variants:", error);
      setSnackbarMessage("Error adding variants");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form submission
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      setIsLoading(true);
      try {
        await handleAddProduct(formValues);
      } catch (error) {
        console.error("Form submission failed:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  const handleEditRow = (index) => {
    setEditRowIndex(index);
    setEditRowData({ ...variantRows[index] });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (editRowIndex !== null && editRowData) {
      const updatedRows = [...variantRows];
      updatedRows[editRowIndex] = editRowData;
      setVariantRows(updatedRows);
      setEditDialogOpen(false);
      setSnackbarMessage("Variant updated successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    }
  };

  const handleDeleteRow = (index) => {
    const updatedRows = [...variantRows];
    updatedRows.splice(index, 1);
    setVariantRows(updatedRows);
    setSnackbarMessage("Variant deleted successfully!");
    setSnackbarSeverity("info");
    setSnackbarOpen(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormValues(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear errors when user types
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  return (
    <Box m="20px">
      <Typography variant="h4" gutterBottom sx={{ mb: "20px" }}>
        Create New Product
      </Typography>

      <form onSubmit={handleFormSubmit}>
        <Box
          display="grid"
          gap="20px"
          gridTemplateColumns="repeat(4, minmax(0, 1fr))"
          sx={{ "& > div": { gridColumn: isNonMobile ? undefined : "span 4" } }}
        >
          <TextField
            fullWidth
            variant="filled"
            label="Product Name"
            name="product_name"
            value={formValues.product_name}
            onChange={handleChange}
            error={Boolean(formErrors.product_name)}
            helperText={formErrors.product_name}
            sx={{ gridColumn: "span 4" }}
          />
          <TextField
            fullWidth
            variant="filled"
            label="Description"
            name="description"
            value={formValues.description}
            onChange={handleChange}
            error={Boolean(formErrors.description)}
            helperText={formErrors.description}
            multiline
            rows={3}
            sx={{ gridColumn: "span 4" }}
          />
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              name="category_id"
              label="Category"
              value={formValues.category_id}
              onChange={handleChange}
            >
              {categoryList.map((option) => (
                <MenuItem key={option.id} value={option.id}>
                  {option.category_name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              name="stock_id"
              label="Stock"
              value={formValues.stock_id}
              onChange={handleChange}
            >
              {stockList.map((option) => (
                <MenuItem key={option.id} value={option.id}>
                  {option.stock_name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

            <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              name="brand_id"
              label="Brand"
              value={formValues.brand_id}
              onChange={handleChange}
            >
              {brandList.map((option) => (
                <MenuItem key={option.id} value={option.id}>
                  {option.brand_name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <FormControlLabel
            control={
              <Checkbox
                checked={formValues.is_active}
                onChange={handleChange}
                name="is_active"
                color="primary"
              />
            }
            label="Active Product"
            sx={{ gridColumn: "span 2" }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={formValues.addVariants}
                onChange={(e) => {
                  handleChange(e);
                  if (!e.target.checked) {
                    setVariantRows([]);
                    setFormValues(prev => ({
                      ...prev,
                      variantCount: 0,
                      price: ""
                    }));
                  }
                }}
                name="addVariants"
                color="secondary"
              />
            }
            label="Add Product Variants"
            sx={{ gridColumn: "span 2" }}
          />

          {formValues.addVariants && (
            <>
              <TextField
                fullWidth
                variant="filled"
                type="number"
                label="Number of Variants to Generate"
                name="variantCount"
                value={formValues.variantCount}
                onChange={handleChange}
                error={Boolean(formErrors.variantCount)}
                helperText={formErrors.variantCount}
                sx={{ gridColumn: "span 2" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="number"
                label="Base Price for Variants"
                name="price"
                value={formValues.price}
                onChange={handleChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start">৳</InputAdornment>,
                }}
                error={Boolean(formErrors.price)}
                helperText={formErrors.price}
                sx={{ gridColumn: "span 2" }}
              />
            </>
          )}
        </Box>
        <Box display="flex" justifyContent="flex-end" mt="30px" gap="10px">
          <Button
            onClick={() => {
              setFormValues(initialValues);
              setFormErrors({});
              setVariantRows([]);
              setProductId(null);
              setProductAdded(false);
            }}
            color="info"
            variant="outlined"
            disabled={isLoading}
          >
            Reset Form
          </Button>
          <Button
            type="submit"
            color="secondary"
            variant="contained"
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : null}
          >
            {isLoading ? "Processing..." : "Submit Product"}
          </Button>
        </Box>
      </form>

      {/* Variant Preview Table */}
      {productAdded && (
        <>
          <Divider sx={{ my: 3 }} />
          <Typography variant="h5" gutterBottom sx={{ mb: "20px" }}>
            Generated Variants Preview  {productId}
            <Chip
              label={`${variantRows.length} variants`}
              color="primary"
              size="small"
              sx={{ ml: 2 }}
            />
          </Typography>

          {variantRows.length > 0 && (
            <Box display="flex" justifyContent="flex-end" mb={2}>
              <Button
                color="secondary"
                variant="contained"
                onClick={handleAddVariants}
                disabled={isLoading}
                startIcon={isLoading ? <CircularProgress size={20} /> : null}
              >
                {isLoading ? "Uploading..." : "Upload Variants"}
              </Button>
            </Box>
          )}

          <TableContainer component={Paper} elevation={3}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ "& .MuiTableCell-head": { fontWeight: "bold", backgroundColor: "#f5f5f5" } }}>
                  <TableCell>SKU</TableCell>
                  <TableCell>Price (৳)</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Discount (%)</TableCell>
                  <TableCell>VAT (%)</TableCell>
                  <TableCell>Size</TableCell>
                  <TableCell>Unit</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {variantRows.map((row, i) => (
                  <TableRow key={i} sx={{ "&:nth-of-type(odd)": { backgroundColor: "#f9f9f9" } }}>
                    <TableCell>{row.sku}</TableCell>
                    <TableCell>{row.price}</TableCell>
                    <TableCell>{row.quantity_required}</TableCell>
                    <TableCell>
                      <Chip
                        label={row.status}
                        size="small"
                        color={row.status === "available" ? "success" : "default"}
                      />
                    </TableCell>
                    <TableCell>{row.discount}</TableCell>
                    <TableCell>{row.vat}</TableCell>
                    <TableCell>{row.size}</TableCell>
                    <TableCell>{row.unit}</TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleEditRow(i)}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteRow(i)}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* Edit Variant Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Edit Variant
          <IconButton
            aria-label="close"
            onClick={() => setEditDialogOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {editRowData && (
            <Box display="grid" gap="15px" mt={2}>
              <TextField
                fullWidth
                label="SKU"
                value={editRowData.sku}
                onChange={(e) => setEditRowData({ ...editRowData, sku: e.target.value })}
                variant="outlined"
                size="small"
              />
              <TextField
                fullWidth
                label="Price"
                value={editRowData.price}
                onChange={(e) => setEditRowData({ ...editRowData, price: e.target.value })}
                variant="outlined"
                size="small"
                InputProps={{
                  startAdornment: <InputAdornment position="start">৳</InputAdornment>,
                }}
              />
              <TextField
                fullWidth
                label="Quantity"
                value={editRowData.quantity_required}
                onChange={(e) => setEditRowData({ ...editRowData, quantity_required: e.target.value })}
                variant="outlined"
                size="small"
              />
              <TextField
                fullWidth
                label="Size"
                value={editRowData.size}
                onChange={(e) => setEditRowData({ ...editRowData, size: e.target.value })}
                variant="outlined"
                size="small"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveEdit} color="primary">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for feedback */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProductEntry;
