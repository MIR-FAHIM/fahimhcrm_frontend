import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Paper,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Chip,
  Divider,
  Badge,
  IconButton,
  InputAdornment,
  useTheme,
  useMediaQuery,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Dialog, // Added for discount dialog
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar, // Added for success message
  Alert,    // Added for success message
} from "@mui/material";
import { Add, Remove, Search, ShoppingCart, Delete, } from "@mui/icons-material";
import { getProduct, getProductWithVariants, getAllVarients, createMultipleCart, addOrder } from "../../../api/controller/admin_controller/product_controller";
import {  FilterList as FilterListIcon, Clear as ClearIcon } from '@mui/icons-material'; // Icons

// Demo data for categories and brands
const demoCategories = [
  { id: 1, name: "Software" },
  { id: 2, name: "Electronics" },
  { id: 3, name: "Office Supplies" },
  { id: 4, name: "Furniture" },
  { id: 5, name: "Books" }
];

const demoBrands = [
  { id: 1, name: "Microsoft" },
  { id: 2, name: "Apple" },
  { id: 3, name: "Samsung" },
  { id: 4, name: "Dell" },
  { id: 5, name: "HP" }
];

const POSPage = () => {
  const theme = useTheme();
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All categories");
  const [selectedBrand, setSelectedBrand] = useState("All Brands");
  const [walkInCustomer, setWalkInCustomer] = useState("Walk In Customer");
  const [discountAmount, setDiscountAmount] = useState(0); // New state for discount
  const [showDiscountDialog, setShowDiscountDialog] = useState(false); // New state for discount dialog
  const [orderSuccess, setOrderSuccess] = useState(false); // New state for success message
  const [orderMessage, setOrderMessage] = useState(""); // New state for success message text

  useEffect(() => {
    handleFetchAllProductVarients();
  }, []);

  const handleAddToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const handleFetchAllProductVarients = async () => {
    try {
      setLoading(true);
      const response = await getAllVarients();
      setProducts(response.data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromCart = (productId) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === productId);
      if (existingItem.quantity === 1) {
        return prevCart.filter(item => item.id !== productId);
      }
      return prevCart.map(item =>
        item.id === productId
          ? { ...item, quantity: item.quantity - 1 }
          : item
      );
    });
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    return Math.max(0, subtotal - discountAmount); // Ensure total doesn't go below 0
  };

  const handleApplyDiscount = () => {
    setShowDiscountDialog(true);
  };

  const handleCloseDiscountDialog = () => {
    setShowDiscountDialog(false);
  };

  const handleSaveDiscount = (amount) => {
    setDiscountAmount(parseFloat(amount) || 0); // Parse to float, default to 0 if invalid
    handleCloseDiscountDialog();
  };

  const handleClearCart = () => {
    setCart([]);
    setDiscountAmount(0);
  };

const initiateOrder = async () => {
  if (cart.length === 0) {
    setOrderSuccess(true);
    setOrderMessage("Cart is empty. Please add items to place an order.");
    return;
  }

  setLoading(true);
  try {
    // 1. Add Order First
    const orderPayload = {
      cart_id: 0, // As per your instruction, cart_id is null initially for addOrder
      customer_id: "1", // Assuming 'Walk In Customer' maps to ID 1 or another default
      address: "dhaka", // Or from a customer input field
      phone: "01782084390", // Or from a customer input field
      note: "POS order",
      order_from: "admin",
      created_by: "1", // Assuming admin user ID
      amount: calculateTotal(), // Total amount after discount
      is_cod: "1", // Cash on Delivery
      status: "1", // Placed
      isPaid: "1", // Mark as paid for COD (adjust as per payment flow)
      discount_amount: discountAmount, // Pass discount amount
    };

    const orderResponse = await addOrder(orderPayload);

    if (orderResponse.status === 'success' && orderResponse.order && orderResponse.order.id) {
      const orderId = orderResponse.order.id; // Get the order_id from the successful order response

const cartsDataForAPI = cart.map(item => ({
  product_id: item.product.id,
  varient_id: item.id,
  quantity: item.quantity,
  product_amount: item.price,
  total_amount: item.price * item.quantity,
  remark: "POS order item",
  status: "1",
  order_id: orderId, // Assign the orderId obtained from the previous step
  created_by: "1", // Assuming admin user ID
}));

// *** THE CRUCIAL CHANGE IS HERE ***
// Wrap the array of cart items inside an object with the key 'carts'
const payloadToSendToCartAPI = {
  carts: cartsDataForAPI
};

// Now pass this new object to your createMultipleCart function
const cartResponse = await createMultipleCart(payloadToSendToCartAPI);

      if (cartResponse.status === 'success') {
        setOrderSuccess(true);
        setOrderMessage("Order placed and cart items added successfully!");
        handleClearCart(); // Clear cart after successful order and cart item creation
      } else {
        // If cart creation fails, you might want to consider rolling back the order
        // or marking the order as incomplete/pending cart update.
        // For now, we'll just show an error message.
        setOrderSuccess(true);
        setOrderMessage(`Cart items creation failed: ${cartResponse.message || 'Unknown error'}. Order might be placed without linked cart items.`);
      }
    } else {
      setOrderSuccess(true);
      setOrderMessage(`Order placement failed: ${orderResponse.message || 'Unknown error'}`);
    }
  } catch (error) {
    console.error("Error initiating order:", error);
    setOrderSuccess(true);
    setOrderMessage(`Error initiating order: ${error.message || 'Network error'}`);
  } finally {
    setLoading(false);
  }
};

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.barcode && product.barcode.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "All categories" ||
                          product.category_id === parseInt(selectedCategory);
    const matchesBrand = selectedBrand === "All Brands" ||
                       (product.brand_id && product.brand_id === parseInt(selectedBrand));

    return matchesSearch && matchesCategory && matchesBrand;
  });

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
        Point of Sale System
      </Typography>

      <Grid container spacing={3}>
        {/* Left Side - Product Grid */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search by Product Name/Barcode"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setSearchTerm('')} size="small">
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mr: 2 }}
                size="small"
              />
              <Button
                variant="outlined"
                onClick={() => setShowFilters(!showFilters)}
                startIcon={<FilterListIcon />}
              >
                Filters
              </Button>
            </Box>

            {(selectedCategory !== 'All categories' || selectedBrand !== 'All Brands') && (
              <Box display="flex" gap={1} mb={2}>
                {selectedCategory !== 'All categories' && (
                  <Chip
                    label={`Category: ${demoCategories.find(c => c.id === selectedCategory)?.name}`}
                    onDelete={() => setSelectedCategory('All categories')}
                  />
                )}
                {selectedBrand !== 'All Brands' && (
                  <Chip
                    label={`Brand: ${demoBrands.find(b => b.id === selectedBrand)?.name}`}
                    onDelete={() => setSelectedBrand('All Brands')}
                  />
                )}
              </Box>
            )}

            {showFilters && (
              <Box
                display="flex"
                gap={1}
                sx={{
                  overflow: 'hidden',
                  transition: 'max-height 0.3s ease-in-out',
                  maxHeight: showFilters ? '100px' : '0px',
                }}
              >
                <FormControl sx={{ minWidth: 150 }}>
                  <InputLabel id="category-select-label" size="small">
                    Category
                  </InputLabel>
                  <Select
                    labelId="category-select-label"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    label="Category"
                    size="small"
                  >
                    <MenuItem value="All categories">All categories</MenuItem>
                    {demoCategories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl sx={{ minWidth: 150 }}>
                  <InputLabel id="brand-select-label" size="small">
                    Brand
                  </InputLabel>
                  <Select
                    labelId="brand-select-label"
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    label="Brand"
                    size="small"
                  >
                    <MenuItem value="All Brands">All Brands</MenuItem>
                    {demoBrands.map((brand) => (
                      <MenuItem key={brand.id} value={brand.id}>
                        {brand.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            )}
          </Paper>

          {loading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={2}>
              {filteredProducts.map((product) => (
                <Grid item xs={6} sm={4} md={3} key={product.id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ position: 'relative', p: 1 }}>
                      <Badge
                        badgeContent={
                          product.quantity_required > 0
                            ? `${product.quantity_required} in stock`
                            : "Sold Out"
                        }
                        color={product.quantity_required > 0 ? "success" : "error"}
                        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                        sx={{ '& .MuiBadge-badge': { top: 8, right: 8 } }}
                      >
                        <CardMedia
                          component="img"
                          height="140"
                          image={
                            product.image
                              ? product.image.startsWith('http')
                                ? product.image
                                : `https://images.unsplash.com${product.image.split('unsplash.com')[1]}`
                              : "/logo.png"
                          }
                          alt={product.product?.product_name}
                          sx={{ objectFit: 'contain', width: '100%' }}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "/placeholder-product.jpg";
                          }}
                        />
                      </Badge>
                    </Box>

                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography gutterBottom variant="subtitle2" component="div" noWrap>
                        {product.product.product_name}
                      </Typography>
                      <Typography gutterBottom variant="subtitle2" component="div" noWrap>
                        {product.product_code}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {product.product.category?.category_name}
                      </Typography>
                      <Typography variant="h6" sx={{ mt: 1 }}>
                        ৳{product.price || "0.00"}
                      </Typography>
                    </CardContent>

                    <CardActions sx={{ justifyContent: 'center', p: 2 }}>
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        onClick={() => handleAddToCart(product)}
                        disabled={product.total_stock_quantity <= 0}
                        fullWidth
                      >
                        Add to Cart
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Grid>

        {/* Right Side - Cart and Checkout */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight="bold">
                Cart
              </Typography>
              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel id="customer-select-label">Customer</InputLabel>
                <Select
                  labelId="customer-select-label"
                  value={walkInCustomer}
                  onChange={(e) => setWalkInCustomer(e.target.value)}
                  label="Customer"
                  size="small"
                >
                  <MenuItem value="Walk In Customer">Walk In Customer</MenuItem>
                  {/* Add more customer options if needed */}
                </Select>
              </FormControl>
            </Box>

            <Divider sx={{ my: 2 }} />

            {cart.length === 0 ? (
              <Box textAlign="center" p={4}>
                <Typography variant="body1" color="text.secondary">
                  Your cart is empty
                </Typography>
              </Box>
            ) : (
              <>
                {cart.map((item) => (
                  <Box key={item.id} mb={2} display="flex" alignItems="center">
                    <Box display="flex" flexGrow={1}>
                      <Typography variant="body1" sx={{ mr: 1 }}>
                        {item.product.product_name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        (x{item.quantity})
                      </Typography>
                    </Box>
                    <Typography variant="body1">
                      ৳{(item.price * item.quantity).toFixed(2)}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveFromCart(item.id)}
                      color="error"
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                ))}

                <Divider sx={{ my: 2 }} />

                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="subtitle1">Sub Total:</Typography>
                  <Typography variant="subtitle1">৳{calculateSubtotal().toFixed(2)}</Typography>
                </Box>

                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="subtitle1">Tax:</Typography>
                  <Typography variant="subtitle1">৳0.00</Typography>
                </Box>

                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="subtitle1">Shipping:</Typography>
                  <Typography variant="subtitle1">৳0.00</Typography>
                </Box>

                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="subtitle1">Discount:</Typography>
                  <Typography variant="subtitle1">৳{discountAmount.toFixed(2)}</Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box display="flex" justifyContent="space-between" mb={3}>
                  <Typography variant="h6" fontWeight="bold">Total:</Typography>
                  <Typography variant="h6" fontWeight="bold">
                    ৳{calculateTotal().toFixed(2)}
                  </Typography>
                </Box>

                <Box display="flex" justifyContent="space-between" gap={1}>
                  <Button
                    variant="outlined"
                    color="secondary"
                    fullWidth
                    sx={{ borderRadius: '8px' }}
                  >
                    Shipping
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    fullWidth
                    sx={{ borderRadius: '8px' }}
                    onClick={handleApplyDiscount} // Open discount dialog
                  >
                    Discount
                  </Button>
                </Box>

                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{
                    mt: 2,
                    borderRadius: '8px',
                    py: 1.5,
                    fontWeight: 'bold'
                  }}
                  onClick={initiateOrder} // Call the new initiateOrder function
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : "Place Order"}
                </Button>
                <Button
                    variant="outlined"
                    color="error"
                    fullWidth
                    sx={{
                      mt: 1,
                      borderRadius: '8px',
                      py: 1,
                    }}
                    onClick={handleClearCart}
                    disabled={cart.length === 0 || loading}
                  >
                    Clear Cart
                  </Button>
              </>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Discount Dialog */}
      <Dialog open={showDiscountDialog} onClose={handleCloseDiscountDialog}>
        <DialogTitle>Apply Discount</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Discount Amount"
            type="number"
            fullWidth
            variant="outlined"
            defaultValue={discountAmount}
            onChange={(e) => {
              // Store in a temporary state or directly pass to save function
              // For simplicity, we'll get value on save
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDiscountDialog}>Cancel</Button>
          <Button onClick={() => handleSaveDiscount(document.querySelector('#discount-amount-input').value)}>Apply</Button> {/* Assuming an ID for the TextField */}
        </DialogActions>
      </Dialog>
      {/* Snackbar for Success/Error Messages */}
      <Snackbar
        open={orderSuccess}
        autoHideDuration={6000}
        onClose={() => setOrderSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setOrderSuccess(false)} severity={orderMessage.includes("success") ? "success" : "error"} sx={{ width: '100%' }}>
          {orderMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default POSPage;