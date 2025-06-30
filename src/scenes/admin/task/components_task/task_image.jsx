import React, { useEffect, useRef, useState } from 'react';
import {
  Box, Button, Typography, Grid, IconButton, Card, CardMedia, CardActions,
  Dialog, DialogContent, DialogTitle // Import Dialog components
} from '@mui/material';
import { AddPhotoAlternate, Delete } from '@mui/icons-material';
import { getTaskImages, addTaskImages, deleteTaskImage } from '../../../../api/controller/admin_controller/task_controller/task_controller';
import { image_file_url } from '../../../../api/config/index';
// import axios from 'axios'; // Not used in the provided snippet, can be removed if not needed elsewhere

const TaskImageGallery = ({ taskId }) => {
  const [images, setImages] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileInputRef = useRef(null);

  // State for image dialog
  const [open, setOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchTaskImages();
  }, [taskId]);

  const fetchTaskImages = async () => {
    try {
      const response = await getTaskImages(taskId);
      if (response.status === 'success') {
        setImages(response.data);
      }
    } catch (error) {
      console.error('Error fetching images:', error);
    }
  };

  const handleImageSelect = (event) => {
    setSelectedFiles(event.target.files);
  };

  const handleUpload = async () => {
    if (!selectedFiles.length) return;

    const formData = new FormData();
    for (let file of selectedFiles) {
      formData.append('images[]', file);
    }
    formData.append('task_id', taskId);

    try {
      const response = await addTaskImages(formData);
      if (response.status === 'success') {
        fetchTaskImages();
        setSelectedFiles([]);
        if (fileInputRef.current) { // Check if ref is not null
          fileInputRef.current.value = '';
        }
      }
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const handleDelete = async (imageId) => {
    try {
      await deleteTaskImage(imageId);
      fetchTaskImages();
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  // Function to open the dialog with the clicked image
  const handleImageClick = (imageFile) => {
    setSelectedImage(`${image_file_url}/${imageFile}`);
    setOpen(true);
  };

  // Function to close the dialog
  const handleClose = () => {
    setOpen(false);
    setSelectedImage(null); // Clear selected image on close
  };

  return (
    <Box mt={4}>
      <Typography variant="h6">Task Images</Typography>

      <Box display="flex" alignItems="center" mt={2} gap={2}>
        <input
          type="file"
          multiple
          hidden
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageSelect}
        />
        <Button
          variant="outlined"
          startIcon={<AddPhotoAlternate />}
          onClick={() => fileInputRef.current.click()}
        >
          Choose Images
        </Button>
        <Button variant="contained" onClick={handleUpload} disabled={selectedFiles.length === 0}>
          Upload
        </Button>
      </Box>

      {selectedFiles.length > 0 && (
        <Box mt={2}>
          <Typography variant="body2" color="text.secondary">
            {selectedFiles.length} file(s) selected for upload.
          </Typography>
        </Box>
      )}

      <Grid container spacing={2} mt={2}>
        {images.length === 0 ? (
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary">
              No images available for this task.
            </Typography>
          </Grid>
        ) : (
          images.map((img) => (
            <Grid item key={img.id} xs={6} sm={4} md={3}>
              <Card>
                <CardMedia
                  component="img"
                  height="140"
                  image={`${image_file_url}/${img.image_file}`}
                  alt="Task Image"
                  sx={{ cursor: 'pointer' }} // Indicate clickability
                  onClick={() => handleImageClick(img.image_file)} // Add onClick handler
                />
                <CardActions>
                  <IconButton onClick={() => handleDelete(img.id)} color="error">
                    <Delete />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* Image View Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Image View</DialogTitle>
        <DialogContent dividers>
          {selectedImage && (
            <Box
              component="img"
              src={selectedImage}
              alt="Larger Task Image"
              style={{ maxWidth: '100%', height: 'auto', display: 'block', margin: 'auto' }}
            />
          )}
        </DialogContent>
        <Box p={2} display="flex" justifyContent="flex-end">
          <Button onClick={handleClose} color="primary">
            Close
          </Button>
        </Box>
      </Dialog>
    </Box>
  );
};

export default TaskImageGallery;