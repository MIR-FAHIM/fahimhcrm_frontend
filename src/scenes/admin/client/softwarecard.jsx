import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Grid,
  Divider,
  CardMedia,
  Stack,
  Rating,
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

const SoftwareCard = ({ software }) => {
  return (
    <Card
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        p: 2,
        borderRadius: 2,
        boxShadow: 3,
        transition: "0.3s",
        "&:hover": { transform: "translateY(-4px)" },
      }}
    >
      {/* Image Section */}
      <CardMedia
        component="img"
        image={software.image}
        alt={software.title}
        sx={{
          width: { xs: "100%", md: 400 },
          height: { xs: 200, md: "100%" },
          objectFit: "cover",
          borderRadius: 2,
        }}
      />

      {/* Divider for Desktop */}
      <Divider
        orientation="vertical"
        flexItem
        sx={{ mx: 3, display: { xs: "none", md: "block" } }}
      />

      {/* Content Section */}
      <CardContent sx={{ flex: 1 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          {software.title}
        </Typography>
        <Typography variant="caption" color="text.secondary" gutterBottom>
          by {software.author}
        </Typography>

        <Stack spacing={1} mt={2}>
          <Typography variant="body2">
            <strong>Version:</strong> {software.version}
          </Typography>
          <Typography variant="body2">
            <strong>Framework:</strong> {software.framework}
          </Typography>

          <Box>
            <Typography variant="body2" fontWeight="bold" gutterBottom>
              File Types Included:
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {software.fileTypes.map((type, idx) => (
                <Chip key={idx} label={type} size="small" variant="outlined" />
              ))}
            </Stack>
          </Box>
        </Stack>
      </CardContent>

      {/* Right Pricing Section */}
      <Box
        sx={{
          width: { xs: "100%", md: 160 },
          mt: { xs: 3, md: 0 },
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="h6" fontWeight="bold" color="primary">
          {software.price}
        </Typography>

        <Stack spacing={0.5} alignItems="center" mt={1}>
          <Rating
            value={software.rating}
            precision={0.5}
            readOnly
            size="small"
            icon={<StarIcon fontSize="inherit" />}
            emptyIcon={<StarIcon fontSize="inherit" style={{ opacity: 0.3 }} />}
          />
          <Typography variant="caption" color="text.secondary">
            ({software.reviews} reviews)
          </Typography>
        </Stack>

        <Typography variant="caption" color="text.secondary" mt={1}>
          {software.sales} Sales
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Last updated: {software.updated}
        </Typography>

        <Stack direction="row" spacing={1} mt={2}>
          <Button variant="contained" size="small" startIcon={<ShoppingCartIcon />} sx={{ textTransform: "none" }}>
            Buy Now
          </Button>
          <Button variant="outlined" size="small" sx={{ textTransform: "none" }}>
            Preview
          </Button>
        </Stack>
      </Box>
    </Card>
  );
};

export default SoftwareCard;
