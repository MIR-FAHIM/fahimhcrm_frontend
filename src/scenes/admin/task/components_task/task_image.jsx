import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Skeleton,
  Snackbar,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { AddPhotoAlternateRounded, CloseRounded, DeleteRounded, ImageRounded, UploadRounded } from "@mui/icons-material";
import { addTaskImages, deleteTaskImage, getTaskImages } from "../../../../api/controller/admin_controller/task_controller/task_controller";
import { image_file_url } from "../../../../api/config/index";

const TaskImageGallery = ({ taskId }) => {
  const theme = useTheme();
  const [images, setImages] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });
  const fileInputRef = useRef(null);

  const notify = (message, severity = "success") => setSnack({ open: true, message, severity });

  const fetchTaskImages = async () => {
    setLoading(true);
    try {
      const response = await getTaskImages(taskId);
      if (response?.status === "success") setImages(response.data || []);
    } catch (error) {
      console.error("Error fetching images:", error);
      notify("Task images could not be loaded.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaskImages();
  }, [taskId]);

  const handleImageSelect = (event) => {
    setSelectedFiles(Array.from(event.target.files || []));
  };

  const handleUpload = async () => {
    if (!selectedFiles.length) return;

    const formData = new FormData();
    selectedFiles.forEach((file) => formData.append("images[]", file));
    formData.append("task_id", taskId);

    setUploading(true);
    try {
      const response = await addTaskImages(formData);
      if (response?.status === "success") {
        await fetchTaskImages();
        setSelectedFiles([]);
        if (fileInputRef.current) fileInputRef.current.value = "";
        notify("Images uploaded successfully.");
      } else {
        notify("Images could not be uploaded.", "error");
      }
    } catch (error) {
      console.error("Upload failed:", error);
      notify("Images could not be uploaded.", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (imageId) => {
    try {
      await deleteTaskImage(imageId);
      await fetchTaskImages();
      notify("Image deleted.");
    } catch (error) {
      console.error("Delete failed:", error);
      notify("Image could not be deleted.", "error");
    }
  };

  const handleImageClick = (imageFile) => {
    setSelectedImage(`${image_file_url}/${imageFile}`);
    setOpen(true);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, md: 2.5 },
        borderRadius: 2,
        bgcolor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", md: "center" }}
        spacing={2}
        sx={{ mb: 2 }}
      >
        <Stack direction="row" alignItems="center" spacing={1.25}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: alpha(theme.palette.info.main, 0.12),
              color: theme.palette.info.main,
            }}
          >
            <ImageRounded />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ color: theme.palette.text.primary, fontWeight: 900 }}>
              Task Images
            </Typography>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
              Upload supporting screenshots, documents, and visual proof
            </Typography>
          </Box>
        </Stack>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ xs: "stretch", sm: "center" }}>
          <input type="file" multiple hidden accept="image/*" ref={fileInputRef} onChange={handleImageSelect} />
          <Button
            variant="outlined"
            startIcon={<AddPhotoAlternateRounded />}
            onClick={() => fileInputRef.current?.click()}
            sx={{ borderRadius: 2 }}
          >
            Choose Images
          </Button>
          <Button
            variant="contained"
            startIcon={<UploadRounded />}
            onClick={handleUpload}
            disabled={!selectedFiles.length || uploading}
            sx={{ borderRadius: 2, fontWeight: 900 }}
          >
            {uploading ? "Uploading" : "Upload"}
          </Button>
        </Stack>
      </Stack>

      {selectedFiles.length > 0 && (
        <Chip
          size="small"
          label={`${selectedFiles.length} file${selectedFiles.length === 1 ? "" : "s"} ready to upload`}
          sx={{ mb: 2, fontWeight: 800 }}
        />
      )}

      {loading ? (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" }, gap: 1.5 }}>
          {[0, 1, 2, 3].map((item) => (
            <Skeleton key={item} variant="rounded" height={150} />
          ))}
        </Box>
      ) : images.length === 0 ? (
        <Box
          sx={{
            p: 4,
            borderRadius: 2,
            textAlign: "center",
            bgcolor: theme.palette.background.default,
            border: `1px dashed ${theme.palette.divider}`,
          }}
        >
          <ImageRounded color="disabled" />
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 1 }}>
            No images available for this task.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)", xl: "repeat(4, 1fr)" }, gap: 1.5 }}>
          {images.map((img) => (
            <Box
              key={img.id}
              sx={{
                position: "relative",
                borderRadius: 2,
                overflow: "hidden",
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: theme.palette.background.default,
                aspectRatio: "4 / 3",
              }}
            >
              <Box
                component="img"
                src={`${image_file_url}/${img.image_file}`}
                alt="Task attachment"
                onClick={() => handleImageClick(img.image_file)}
                sx={{ width: "100%", height: "100%", objectFit: "cover", cursor: "pointer", display: "block" }}
              />
              <Tooltip title="Delete image">
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleDelete(img.id)}
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    bgcolor: alpha(theme.palette.background.paper, 0.88),
                    "&:hover": { bgcolor: theme.palette.background.paper },
                  }}
                >
                  <DeleteRounded fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          ))}
        </Box>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          Image Preview
          <IconButton onClick={() => setOpen(false)}>
            <CloseRounded />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ bgcolor: theme.palette.background.default }}>
          {selectedImage && (
            <Box component="img" src={selectedImage} alt="Task attachment preview" sx={{ maxWidth: "100%", maxHeight: "72vh", display: "block", m: "auto", borderRadius: 2 }} />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} sx={{ borderRadius: 2 }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack((current) => ({ ...current, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity={snack.severity} onClose={() => setSnack((current) => ({ ...current, open: false }))} sx={{ borderRadius: 2 }}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default TaskImageGallery;