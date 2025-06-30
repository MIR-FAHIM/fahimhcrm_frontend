import {
  Box, Button, TextField, Typography, MenuItem, List,
  ListItem, ListItemText, Divider, Grid, Checkbox, FormControlLabel,
  IconButton, Tooltip
} from "@mui/material";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'; // For checked state
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'; // For unchecked state
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { useEffect, useState } from "react";
import { addNotices, fetchNotices, updateNotice, deleteNotice } from "../../../api/controller/admin_controller/report/report_controller";

const AddNotice = () => {
  const userID = localStorage.getItem("userId");
  const [formData, setFormData] = useState({
    title: "",
    notice: "",
    created_by: "",
    type: "",
    is_active: false, // Changed to boolean
    highlight: false, // Changed to boolean
    color_code: "#FFFFFF", // Default color
    start_date: "",
    end_date: "",
  });

  const [notices, setNotices] = useState([]);

  // Define your 4 specific hex colors
  const hexColors = [
    { value: "#FFDDC1", label: "Peach" },
    { value: "#D1E7DD", label: "Mint Green" },
    { value: "#E0BBE4", label: "Lavender" },
    { value: "#ADD8E6", label: "Light Blue" },
  ];

  useEffect(() => {
    loadNotices();
  }, []);

  const loadNotices = async () => {
    try {
      const res = await fetchNotices();
      if (res?.status === "success") {
        setNotices(res.data);
      }
    } catch (error) {
      console.error("Failed to load notices:", error);
    }
  };
  const handleDelete = async (d) => {
    const data = {
      'id': d
    };
    try {

      const res = await deleteNotice(data);
      if (res?.status === "success") {
        loadNotices();
      }
    } catch (error) {
      console.error("Failed to delete notices:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    Object.keys(formData).forEach((key) => {
      formDataToSend.append(key, formData[key]);
    });

    try {
      const response = await addNotices(formDataToSend);
      if (response.status === "success") {
        alert("Notice added successfully!");
        setFormData({
          title: "",
          notice: "",
          created_by: userID,
          type: "",
          is_active: false,
          highlight: false,
          color_code: "#FFFFFF",
          start_date: "",
          end_date: "",
        });
        loadNotices();
      } else {
        alert("Failed to add notice");
      }
    } catch (error) {
      alert("Error adding notice");
    }
  };

  return (
    <Box m={3}>
      <Typography variant="h4" mb={2}>Add Notice</Typography>

      <form onSubmit={handleSubmit}>
        {/* Notice Title */}
        <TextField
          label="Notice Title"
          name="title"
          fullWidth
          margin="normal"
          onChange={handleChange}
          value={formData.title}
          required
          sx={{
            '& .MuiInputBase-input': {
              fontSize: '1.5rem', // Larger font for title
              fontWeight: 'bold',
            },
            '& .MuiInputLabel-root': {
              fontSize: '1.2rem',
              fontWeight: 'bold',
            },
          }}
        />

        {/* Notice Content */}
        <TextField
          label="Notice Details"
          name="notice"
          fullWidth
          margin="normal"
          onChange={handleChange}
          value={formData.notice}
          multiline
          rows={6} // Increased rows for more space
          required
          sx={{
            '& .MuiInputBase-input': {
              lineHeight: 1.5, // Better line spacing
            },
          }}
        />

        <Grid container spacing={2} sx={{ mt: 2 }}> {/* Using Grid for rows and reduced spacing */}



          {/* Type */}
          <Grid item xs={12} sm={6}>
            <TextField label="Type" name="type" fullWidth onChange={handleChange} value={formData.type} size="small" />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              label="Color Code"
              name="color_code"
              fullWidth
              onChange={handleChange}
              value={formData.color_code}
              size="small"
            >
              {hexColors.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ width: 20, height: 20, backgroundColor: option.value, border: '1px solid #ccc', mr: 1 }} />
                    {option.label} ({option.value})
                  </Box>
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          {/* Is Active */}
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Checkbox
                  icon={<RadioButtonUncheckedIcon />}
                  checkedIcon={<CheckCircleOutlineIcon />}
                  checked={formData.is_active}
                  onChange={handleChange}
                  name="is_active"
                />
              }
              label="Is Active"
            />
          </Grid>

          {/* Highlight */}
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Checkbox
                  icon={<RadioButtonUncheckedIcon />}
                  checkedIcon={<CheckCircleOutlineIcon />}
                  checked={formData.highlight}
                  onChange={handleChange}
                  name="highlight"
                />
              }
              label="Highlight"
            />
          </Grid>




          {/* Start Date */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Start Date"
              name="start_date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              onChange={handleChange}
              value={formData.start_date}
              size="small"
            />
          </Grid>

          {/* End Date */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="End Date"
              name="end_date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              onChange={handleChange}
              value={formData.end_date}
              size="small"
            />
          </Grid>
        </Grid>

        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 3 }}>
          Submit Notice
        </Button>
      </form>

      <Box mt={5}>
        <Typography variant="h5" gutterBottom>Notices List</Typography>
        {notices.length === 0 ? (
          <Typography>No notices found.</Typography>
        ) : (
          <List>
            {notices.map((notice, idx) => (
              <Box key={idx} display="flex" alignItems="center" justifyContent="space-between" p={1} borderBottom="1px solid #ddd">
                <Box flexGrow={1}>
                  <Typography variant="subtitle1" color="primary">{notice.title}</Typography>
                  <Typography variant="body2">{notice.notice}</Typography>
                  <Typography variant="caption" color="textSecondary">
                    From: {notice.start_date} To: {notice.end_date}
                  </Typography>
                </Box>

                <Box display="flex" alignItems="center" gap={1}>
                  {notice.is_active == 1 ? (
                    <Tooltip title="Active">
                      <CheckCircleIcon color="success" />
                    </Tooltip>
                  ) : (
                    <Tooltip title="Inactive">
                      <CancelIcon color="error" />
                    </Tooltip>
                  )}

                  <Tooltip title="Delete">
                    <IconButton onClick={() => handleDelete(notice.id)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            ))}
          </List>
        )}
      </Box>
    </Box>
  );
};

export default AddNotice;