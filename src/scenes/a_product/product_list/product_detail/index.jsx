import React, { useState, useEffect } from 'react';
import { Box, Tabs, Tab, Paper } from '@mui/material';
import GeneralProductInfo from '../../add_product/general_information'; // Import GeneralProductInfo
import ProductImageList from '../../product_list/product_detail/product_image_list'; // Import ProductImageList
import VideoList from '../../product_list/product_detail/video_list'; // Import AddProductVideo
import StrategyList from '../../product_list/product_detail/product_strategy_list'; // Import AddProductStrategy
import UpdateProductPage from '../../product_list/product_detail/update_product_info'; // Import AddProductStrategy
import { useParams } from 'react-router-dom';
import { productDetail} from '../../../../api/controller/api_controller'; // Assuming productDetail is an API call function

const ProductDetailTab = () => {
  const { id } = useParams(); // Get the product ID from the URL  
  const [value, setValue] = useState(0);
  const [product, setProduct] = useState(null); 
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  useEffect(() => {
    const fetchProductDetails = async () => {
        console.log("page id is" , id);
      try {
        setLoading(true); // Set loading to true when starting the fetch
        const productData = await productDetail(id); // Fetch product details using the product ID
        
        if (productData) {
        console.log("product data" , productData);
          setProduct(productData); // Set product data only if it's valid
        } else {
          setError("Product data is incomplete.");
        }
      } catch (err) {
        setError("Error fetching product details: " + (err.message || err)); // Display the error message
      } finally {
        setLoading(false); // Stop loading after the API call finishes
      }
    };

    fetchProductDetails();
  }, [id]);

  const handleTabChange = (event, newValue) => {
    setValue(newValue);
  };

  // Render the content based on the active tab
  const renderTabContent = (index) => {
    switch (index) {
      case 0:
        return <UpdateProductPage product={product} />;
      case 1:
        return <ProductImageList productID={product?.id} />;
      case 2:
        return <VideoList videos={product?.videos || []} />;
      case 3:
        return <StrategyList strategy={product?.strategy || []}/>;
      default:
        return <GeneralProductInfo images={product?.images || []} />;
    }
  };

  // Render loading or error state
  if (loading) {
    return <Box>Loading product details...</Box>;
  }

  if (error) {
    return <Box>{error}</Box>;
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Paper square>
        <Tabs
          value={value}
          onChange={handleTabChange}
          aria-label="Product Detail Tab Bar"
          variant="fullWidth"
          sx={{
            '& .MuiTabs-indicator': {
              backgroundColor: 'blue', // Blue indicator for selected tab
            },
          }}
        >
          <Tab
            label="General Information"
            sx={{
              color: value === 0 ? 'blue' : 'inherit',
              '&.Mui-selected': { color: 'blue' },
            }}
          />
          <Tab
            label="Image"
            sx={{
              color: value === 1 ? 'blue' : 'inherit',
              '&.Mui-selected': { color: 'blue' },
            }}
          />
          <Tab
            label="Video"
            sx={{
              color: value === 2 ? 'blue' : 'inherit',
              '&.Mui-selected': { color: 'blue' },
            }}
          />
          <Tab
            label="Strategy"
            sx={{
              color: value === 3 ? 'blue' : 'inherit',
              '&.Mui-selected': { color: 'blue' },
            }}
          />
        </Tabs>
      </Paper>

      <Box sx={{ padding: 2 }}>
        {renderTabContent(value)} {/* Render the content of the active tab */}
      </Box>
    </Box>
  );
};

export default ProductDetailTab;
