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
  CircularProgress
} from "@mui/material";
import { Add, Remove, Search, ShoppingCart, Delete, } from "@mui/icons-material";
import { getProduct } from "../../../api/controller/admin_controller/product_controller";
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

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await getProduct();
        setProducts(response.data || []);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
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
    return calculateSubtotal(); // Add tax and shipping if needed
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
        endAdornment: searchTerm && ( // Clear button for search
          <InputAdornment position="end">
            <IconButton onClick={() => setSearchTerm('')} size="small">
              <ClearIcon />
            </IconButton>
          </InputAdornment>
        ),
      }}
      sx={{ mr: 2 }}
      size="small" // Make search input consistent
    />
    <Button
      variant="outlined"
      onClick={() => setShowFilters(!showFilters)}
      startIcon={<FilterListIcon />}
    >
      Filters
    </Button>
  </Box>

  {/* Display active filters as chips */}
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

  {showFilters && ( // Collapsible filter section
    <Box
      display="flex"
      gap={1}
      sx={{
        overflow: 'hidden',
        transition: 'max-height 0.3s ease-in-out',
        maxHeight: showFilters ? '100px' : '0px', // Adjust max-height as needed
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
        {/* Wrap CardMedia with Box to correctly position the Badge */}
        <Box sx={{ position: 'relative', p: 1 }}> {/* Added padding to Box */}
          <Badge
            badgeContent={
              product.total_stock_quantity > 0
                ? `${product.total_stock_quantity} in stock` // More concise
                : "Sold Out" // More concise
            }
            color={product.total_stock_quantity > 0 ? "success" : "error"}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }} // Proper badge positioning
            sx={{ '& .MuiBadge-badge': { top: 8, right: 8 } }} // Adjust badge position if needed
          >
            <CardMedia
              component="img"
              height="140"
              image={
                product.image
                  ? product.image.startsWith('http')
                    ? product.image
                    : `https://images.unsplash.com${product.image.split('unsplash.com')[1]}`
                  : "/logo.png" // Fallback if image is null/empty
              }
              alt={product.product_name}
              sx={{ objectFit: 'contain', width: '100%' }} // Ensure image fills width of Box
              onError={(e) => {
                e.currentTarget.onerror = null; // Prevent infinite loop if fallback also fails
                e.currentTarget.src = "/placeholder-product.jpg"; // Use a more robust fallback
              }}
            />
          </Badge>
        </Box>

        <CardContent sx={{ flexGrow: 1 }}> {/* flexGrow ensures content pushes actions to bottom */}
          <Typography gutterBottom variant="subtitle1" component="div" noWrap> {/* noWrap for long names */}
            {product.product_name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {demoCategories.find((c) => c.id === product.category_id)?.name || "Unknown Category"}
          </Typography>
          <Typography variant="h6" sx={{ mt: 1 }}>
            ৳{product.price?.toFixed(2) || "0.00"}
          </Typography>
        </CardContent>

        <CardActions sx={{ justifyContent: 'center', p: 2 }}> {/* Added padding for actions */}
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
                        {item.product_name}
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
                  <Typography variant="subtitle1">৳0.00</Typography>
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
                >
                  Place Order
                </Button>
              </>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default POSPage;
