import { Box, Button, TextField, Checkbox, FormControlLabel, useMediaQuery } from "@mui/material";
import { Header } from "../../components";
import { Formik } from "formik";
import * as yup from "yup";
import { base_url } from "../../api/config";
import axios from "axios";

const initialValues = {
  main_cat_name: "", // Main category name
  is_active: true, // Active status (default: true)
  bn_name: "", // Bengali name
  image_url: null, // Image URL (file object)
};

const checkoutSchema = yup.object().shape({
  main_cat_name: yup.string().required("Main Category Name is required"),
  bn_name: yup.string().required("Bengali Name is required"),
  image_url: yup.mixed().required("Image is required").nullable(),
});

const AddMainCategory = () => {
  const isNonMobile = useMediaQuery("(min-width:600px)");

  const handleFormSubmit = async (values, actions) => {
    const formData = new FormData();
    formData.append("main_cat_name", values.main_cat_name);
    formData.append("is_active", values.is_active ? 1 : 0); // Send 1 or 0 for boolean values
    formData.append("bn_name", values.bn_name);
    
    if (values.image_url) {
      formData.append("image_url", values.image_url); // Append the file for image_url
    }

    try {
      const response = await axios.post(`${base_url}/api/createMainCategory`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log("Category created successfully:", response.data);
      actions.resetForm({
        values: initialValues,
      });
    } catch (error) {
      console.error("Error creating category:", error.response.data);
    }
  };

  return (
    <Box m="20px">
      <Header title="CREATE Main Category" subtitle="Add a New Main Category" />

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
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Main Category Name"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.main_cat_name}
                name="main_cat_name"
                error={touched.main_cat_name && errors.main_cat_name}
                helperText={touched.main_cat_name && errors.main_cat_name}
                sx={{
                  gridColumn: "span 4",
                }}
              />
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
                Create Main Category
              </Button>
            </Box>
          </form>
        )}
      </Formik>
    </Box>
  );
};

export default AddMainCategory;
