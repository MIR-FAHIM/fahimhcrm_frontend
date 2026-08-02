import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Paper,
  Snackbar,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  AddRounded,
  DeleteRounded,
  EditRounded,
  Inventory2Rounded,
  RefreshRounded,
  SearchRounded,
} from "@mui/icons-material";
import { Header } from "../../../components";
import { tokens } from "../../../theme";
import {
  addProductManagement,
  deleteProductManagement,
  getProduct,
  updateProductManagement,
} from "../../../api/controller/admin_controller/product_controller";

const emptyForm = {
  product_name: "",
  description: "",
  is_active: true,
};

const asList = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  return [];
};

const isActiveProduct = (product) => {
  const value = product?.is_active ?? product?.isActive ?? product?.active;
  return value === true || value === 1 || value === "1";
};

const getErrorMessage = (error, fallback) => {
  const data = error?.response?.data;
  if (data?.errors) {
    return Object.values(data.errors).flat().filter(Boolean).join(" ");
  }
  return data?.message || data?.error || error?.message || fallback;
};

const ProductManagement = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const surface = theme.palette.background.paper;
  const border = alpha(theme.palette.divider, 0.9);

  const showToast = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await getProduct();
      setProducts(asList(response));
    } catch (error) {
      showToast(getErrorMessage(error, "Failed to load products"), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return products;

    return products.filter((product) =>
      [product?.product_name, product?.description]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(search))
    );
  }, [products, query]);

  const productSummary = useMemo(() => {
    const active = products.filter(isActiveProduct).length;
    return {
      total: products.length,
      active,
      inactive: Math.max(products.length - active, 0),
    };
  }, [products]);

  const openCreateDialog = () => {
    setEditingProduct(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEditDialog = (product) => {
    setEditingProduct(product);
    setForm({
      product_name: product?.product_name || "",
      description: product?.description || "",
      is_active: isActiveProduct(product),
    });
    setDialogOpen(true);
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const buildPayload = () => ({
    product_name: form.product_name.trim(),
    description: form.description || "",
    is_active: form.is_active ? 1 : 0,
  });

  const handleSubmit = async () => {
    if (!form.product_name.trim()) {
      showToast("Product name is required", "warning");
      return;
    }

    setSaving(true);
    try {
      if (editingProduct) {
        await updateProductManagement(editingProduct.id, buildPayload());
        showToast("Product updated successfully");
      } else {
        await addProductManagement(buildPayload());
        showToast("Product added successfully");
      }
      setDialogOpen(false);
      await loadProducts();
    } catch (error) {
      showToast(
        getErrorMessage(error, editingProduct ? "Failed to update product" : "Failed to add product"),
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      await deleteProductManagement(deleteTarget.id);
      setProducts((prev) => prev.filter((product) => product.id !== deleteTarget.id));
      setDeleteTarget(null);
      showToast("Product deleted successfully");
    } catch (error) {
      showToast(getErrorMessage(error, "Failed to delete product"), "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box m={4}>
      <Box display="flex" justifyContent="space-between" alignItems="center" gap={2} flexWrap="wrap" mb={3}>
        <Header title="Product Management" subtitle="Create, update, and manage products" />
        <Stack direction="row" spacing={1}>
          <Tooltip title="Refresh products">
            <IconButton onClick={loadProducts} sx={{ border: `1px solid ${border}` }}>
              <RefreshRounded />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<AddRounded />}
            onClick={openCreateDialog}
            sx={{ borderRadius: 2, textTransform: "none", fontWeight: 800 }}
          >
            Add Product
          </Button>
        </Stack>
      </Box>

      <Paper
        elevation={0}
        sx={{
          mb: 2,
          p: 2,
          borderRadius: 2,
          border: `1px solid ${border}`,
          background: surface,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <Chip icon={<Inventory2Rounded />} label={`Total: ${productSummary.total}`} />
          <Chip color="success" label={`Active: ${productSummary.active}`} />
          <Chip variant="outlined" label={`Inactive: ${productSummary.inactive}`} />
        </Stack>
        <TextField
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search product..."
          size="small"
          sx={{ minWidth: { xs: "100%", sm: 320 } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRounded fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      <Paper
        elevation={0}
        sx={{
          borderRadius: 2,
          border: `1px solid ${border}`,
          background: surface,
          overflow: "hidden",
        }}
      >
        <TableContainer sx={{ maxHeight: "70vh" }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow
                sx={{
                  "& th": {
                    bgcolor: colors.gray[10],
                    color: theme.palette.text.primary,
                    fontWeight: 900,
                  },
                }}
              >
                <TableCell>Product Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="center">Active Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                    <CircularProgress size={28} />
                    <Typography mt={1} color="text.secondary">Loading products...</Typography>
                  </TableCell>
                </TableRow>
              ) : filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                    <Inventory2Rounded sx={{ fontSize: 42, color: "text.secondary", mb: 1 }} />
                    <Typography fontWeight={800}>No products found</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Add a product or adjust your search.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => (
                  <TableRow key={product.id} hover sx={{ "&:last-child td": { borderBottom: 0 } }}>
                    <TableCell>
                      <Typography fontWeight={900}>{product?.product_name || "Untitled product"}</Typography>
                      <Typography variant="caption" color="text.secondary">ID #{product.id}</Typography>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 520 }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {product?.description || "No description"}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        size="small"
                        label={isActiveProduct(product) ? "Active" : "Inactive"}
                        color={isActiveProduct(product) ? "success" : "default"}
                        variant={isActiveProduct(product) ? "filled" : "outlined"}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit product">
                        <IconButton onClick={() => openEditDialog(product)} color="primary">
                          <EditRounded />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete product">
                        <IconButton onClick={() => setDeleteTarget(product)} color="error">
                          <DeleteRounded />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={dialogOpen} onClose={() => !saving && setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight={900}>
          {editingProduct ? "Edit Product" : "Add Product"}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} mt={0.5}>
            <TextField
              fullWidth
              label="Product Name"
              value={form.product_name}
              onChange={(event) => handleChange("product_name", event.target.value)}
              required
            />
            <TextField
              fullWidth
              multiline
              minRows={3}
              label="Description"
              value={form.description}
              onChange={(event) => handleChange("description", event.target.value)}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={form.is_active}
                  onChange={(event) => handleChange("is_active", event.target.checked)}
                />
              }
              label="Active product"
              sx={{
                border: `1px solid ${border}`,
                borderRadius: 2,
                px: 1.5,
                py: 0.65,
                width: "fit-content",
                m: 0,
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setDialogOpen(false)} disabled={saving} sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleSubmit}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={18} /> : null}
            sx={{ textTransform: "none", fontWeight: 800 }}
          >
            {saving ? "Saving..." : editingProduct ? "Update Product" : "Add Product"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(deleteTarget)} onClose={() => !deleting && setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle fontWeight={900}>Delete Product</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{deleteTarget?.product_name}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={1}>
            If this product is already used, the backend may block this action.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteTarget(null)} disabled={deleting} sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleDelete}
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={18} /> : <DeleteRounded />}
            sx={{ textTransform: "none", fontWeight: 800 }}
          >
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProductManagement;
