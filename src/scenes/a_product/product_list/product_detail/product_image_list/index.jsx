import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, CardMedia, Button, Checkbox, FormControlLabel } from '@mui/material';
import { deleteImageById, getProductsImages } from '../../../../../api/controller/api_controller';
import axiosInstance from '../../../../../api/axiosInstance.jsx'
import { base_url } from "../../../../../api/config";

const ProductImageList = ({ productID }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [images, setImages] = useState([]);  // Initialize as an empty array
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState('');  // 'success' or 'error'
  const [copied, setCopied] = useState(null);

  const handleCopyLink = (imageUrl, imageId) => {
    const fullUrl = `${axiosInstance.defaults.baseURL}${imageUrl}`;
    navigator.clipboard.writeText(fullUrl)
      .then(() => {
        setCopied(imageId);
        setTimeout(() => setCopied(null), 1500); // Reset copied state after 1.5 seconds
      })
      .catch((err) => console.error("Failed to copy: ", err));
  };
  // Fetch images on component mount or when productID changes
  useEffect(() => {
    const fetchImages = async () => {
      try {
        // Get the images for the given productID
        const response = await getProductsImages(productID);

        // Check if response contains images in 'data.images'
        if (response && response.data && response.data.images) {
          setImages(response.data.images);  // Set images from response
        }
      } catch (error) {
        console.error('Error fetching images:', error);
        // Handle error appropriately
      }
    };

    fetchImages();  // Fetch images when component mounts or when productID changes
  }, [productID]);  // Dependency on productID ensures this runs when the productID changes

  // Handle the "is active" checkbox toggle
  const handleCheckboxChange = (imageId, isActive) => {
    const updatedImages = images.map((image) =>
      image.id === imageId ? { ...image, is_active: !isActive } : image
    );
    setImages(updatedImages);  // Update the state with new image data
  };

  // Handle the delete button click
  const handleDeleteImage = async (imageId) => {
    try {
      const response = await deleteImageById(imageId);

      if (response.status === 200) {
        setModalType('success');
        setModalMessage('Image deleted successfully!');
        // Remove deleted image from state
        setImages(images.filter(image => image.id !== imageId));  // Remove image from state
      } else {
        setModalType('error');
        setModalMessage('Failed to delete image: ' + response.message);
      }
    } catch (error) {
      setModalType('error');
      setModalMessage('An error occurred while deleting the image.');
    }
    setIsModalOpen(true);
  };

  // Handle the download button click
  const handleDownloadImage = (imageUrl) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = imageUrl.split('/').pop();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
      {images.map((image) => (
        <Card key={image.id} sx={{ width: 200, marginBottom: 2 }}>
          <CardMedia
            component="img"
            height="200"
            image={`${base_url}${image.image_url}`}
            alt={`Product image ${image.id}`}
          />
          <CardContent>
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleDownloadImage(`${base_url}${image.image_url}`)}
              sx={{ marginRight: 1 }}
            >
              Download
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => handleDeleteImage(image.id)}
              sx={{ marginRight: 1 }}
            >
              Delete
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={() => handleCopyLink(`${base_url}${image.image_url}`, image.id)}
              sx={{ marginRight: 1 }}
            >
              {copied === image.id ? "Copied!" : "Copy Link"}
            </Button>
            <FormControlLabel
              control={
                <Checkbox
                  checked={image.is_active}
                  onChange={() => handleCheckboxChange(image.id, image.is_active)}
                  name="isActive"
                  color="primary"
                />
              }
              label="Is Active"
            />
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default ProductImageList;
