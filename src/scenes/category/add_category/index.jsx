import { Box, Button, TextField, Checkbox, FormControlLabel, useMediaQuery } from "@mui/material";
import { Header } from "../../../components";
import { Formik } from "formik";
import * as yup from "yup";
import axios from "axios";
import { base_url } from "../../../api/config";
const initialValues = {
  main_cat_id: "", // Main category ID
  product_cat_name: "", // Product category name
  bn_name: "", // Bengali name
  is_active: true, // Active status (default: true)
  image_url: null, // Image URL (file object)
  description: "", // Description of the product category
};

const checkoutSchema = yup.object().shape({
  main_cat_id: yup.string().required("Main Category ID is required"),
  product_cat_name: yup.string().required("Product Category Name is required"),
  bn_name: yup.string().required("Bengali Name is required"),
  description: yup.string().required("Description is required"),
  image_url: yup.mixed().required("Image is required").nullable(),
});

const AddProductCategory = () => {
  const isNonMobile = useMediaQuery("(min-width:600px)");

  const handleFormSubmit = async (values, actions) => {
    const formData = new FormData();
    formData.append("main_cat_id", values.main_cat_id); // Use main_cat_id instead of main_cat_name
    formData.append("product_cat_name", values.product_cat_name);
    formData.append("bn_name", values.bn_name);
    formData.append("is_active", values.is_active ? 1 : 0); // Send 1 or 0 for boolean values
    formData.append("description", values.description);

    if (values.image_url) {
      formData.append("image_url", values.image_url); // Append the file for image_url
    }

    try {
      const response = await axios.post(`${base_url}/api/createProductCategory`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log("Product category created successfully:", response.data);
      actions.resetForm({
        values: initialValues,
      });
    } catch (error) {
      console.error("Error creating product category:", error.response.data);
    }
  };

  return (
    <Box m="20px">
      <Header title="CREATE Product Category" subtitle="Add a New Product Category" />

      <Formik
        onSubmit={handleFormSubmit}
        initialValues={initialValues}
        validationSchema={checkoutSchema}
      >
        {({
          values,
          errors,
          touched,
          handleBlur,
          handleChange,
          handleSubmit,
          setFieldValue,
        }) => (
          <form onSubmit={handleSubmit}>
            <Box
              display="grid"
              gap="30px"
              gridTemplateColumns="repeat(4, minmax(0, 1fr))"
              sx={{
                "& > div": {
                  gridColumn: isNonMobile ? undefined : "span 4",
                },
              }}
            >
              {/* Main Category ID input */}
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Main Category ID"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.main_cat_id}
                name="main_cat_id"
                error={touched.main_cat_id && errors.main_cat_id}
                helperText={touched.main_cat_id && errors.main_cat_id}
                sx={{
                  gridColumn: "span 4",
                }}
              />

              {/* Product Category Name input */}
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Product Category Name"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.product_cat_name}
                name="product_cat_name"
                error={touched.product_cat_name && errors.product_cat_name}
                helperText={touched.product_cat_name && errors.product_cat_name}
                sx={{ gridColumn: "span 4" }}
              />

              {/* Bengali Name input */}
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Bengali Name"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.bn_name}
                name="bn_name"
                error={touched.bn_name && errors.bn_name}
                helperText={touched.bn_name && errors.bn_name}
                sx={{ gridColumn: "span 4" }}
              />
              
              {/* File input for image upload */}
              <Box sx={{ gridColumn: "span 4" }}>
                <input
                  type="file"
                  name="image_url"
                  onChange={(e) => setFieldValue("image_url", e.target.files[0])}
                  onBlur={handleBlur}
                  accept="image/*"
                  style={{ width: "100%", padding: "10px" }}
                />
                {touched.image_url && errors.image_url && (
                  <div style={{ color: "red", marginTop: "5px" }}>
                    {errors.image_url}
                  </div>
                )}
              </Box>

              {/* Description input */}
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Description"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.description}
                name="description"
                error={touched.description && errors.description}
                helperText={touched.description && errors.description}
                sx={{ gridColumn: "span 4" }}
              />

              {/* Checkbox for is_active */}
              <Box sx={{ gridColumn: "span 4" }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={values.is_active}
                      onChange={handleChange}
                      name="is_active"
                      color="primary"
                    />
                  }
                  label="Active Status"
                />
              </Box>
            </Box>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="end"
              mt="20px"
            >
              <Button type="submit" color="secondary" variant="contained">
                Create Product Category
              </Button>
            </Box>
          </form>
        )}
      </Formik>
    </Box>
  );
};

export default AddProductCategory;
