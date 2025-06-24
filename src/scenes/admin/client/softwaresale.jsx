import React, { useState } from "react";
import { Box, Typography, Grid, TextField, InputAdornment, Button } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import SoftwareCard from "./softwarecard"; // Make sure this is the correct path

const softwareList = [
  {
    id: 1,
    title: "PayStation HRM",
    image: "https://images.unsplash.com/photo-1583508915901-b5f84c1dcde1?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Replace with the actual URL
    author: "PayTech Inc.",
    promo: "Simplify your HR and project management with an all-in-one dashboard.",
    version: "PHP 8.x, MySQL 5.x - 8.x",
    framework: "Laravel",
    fileTypes: ["JS", "HTML", "CSS", "PHP", "SQL"],
    price: "৳35000",
    rating: 4.5,
    reviews: "1.4K",
    sales: "23.7K",
    updated: "22 Apr 25",
    trustedBy: "23,000",
  },
  {
    id: 2,
    title: "ShopMate POS",
    image: "https://images.unsplash.com/photo-1583508915901-b5f84c1dcde1?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Replace with the actual URL
    author: "RetailSoft Ltd.",
    promo: "Streamline your retail operations with our smart POS system.",
    version: "PHP 8.x, MySQL 8",
    framework: "Laravel",
    fileTypes: ["JS", "HTML", "CSS", "PHP", "SQL"],
    price: "৳55000",
    rating: 4.2,
    reviews: "980",
    sales: "15.4K",
    updated: "15 Mar 25",
    trustedBy: "18,000",
  },
  {
    id: 3,
    title: "EduTrack LMS",
    image: "https://images.unsplash.com/photo-1583508915901-b5f84c1dcde1?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Replace with the actual URL
    author: "EduSuite",
    promo: "Manage your learning environment effortlessly from one place.",
    version: "PHP 8.x, MySQL 5.7",
    framework: "Laravel",
    fileTypes: ["JS", "HTML", "CSS", "PHP", "SQL"],
    price: "৳45000",
    rating: 4.8,
    reviews: "2.1K",
    sales: "19.2K",
    updated: "10 Feb 25",
    trustedBy: "20,000",
  },
];

const SoftwareSalePage = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredSoftwareList = softwareList.filter((software) =>
    software.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ px: 4, py: 6, bgcolor: "#f9f9f9" }}>
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <Typography variant="h3" gutterBottom fontWeight="bold">
          Our Software Solutions
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          Discover a range of software solutions tailored to your needs.
        </Typography>
      </Box>

      <Box sx={{ mb: 4, display: "flex", justifyContent: "center" }}>
        <TextField
          variant="outlined"
          placeholder="Search software..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ width: "60%" }}
        />
      </Box>

      <Grid container spacing={4} direction="column" alignItems="center">
        {filteredSoftwareList.map((software) => (
          <Grid item xs={12} key={software.id}>
            <SoftwareCard software={software} />
          </Grid>
        ))}
      </Grid>

      <Box sx={{ textAlign: "center", mt: 4 }}>
        <Button variant="contained" color="primary" size="large">
          Explore More Software
        </Button>
      </Box>
    </Box>
  );
};

export default SoftwareSalePage;
