import { Box, Button, TextField, useMediaQuery } from "@mui/material";
import { Header } from "../../components";
import { Formik } from "formik";
import * as yup from "yup";
import axios from "axios";
import { base_url } from "../../api/config";
const initialValues = {
  name: "", // The name field for the seller
  email: "",
  password: "",
  password_confirmation: "",
  phone: "",
};

const phoneRegExp =
  /^((\+[1-9]{1,4}[ -]?)|(\([0-9]{2,3}\)[ -]?)|([0-9]{2,4})[ -]?)*?[0-9]{3,4}[ -]?[0-9]{3,4}$/;

const checkoutSchema = yup.object().shape({
  name: yup.string().required("Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
  password_confirmation: yup
    .string()
    .oneOf([yup.ref('password'), null], "Passwords must match")
    .required("Confirm your password"),
  phone: yup
    .string()
    .matches(phoneRegExp, "Phone number is not valid")
    .required("Phone number is required"),
});

const Addclient = () => {
  const isNonMobile = useMediaQuery("(min-width:600px)");

  const handleFormSubmit = async (values, actions) => {
    // Send data to the API using Axios
    try {
      const response = await axios.post(`${base_url}/api/register`, {
        name: values.name,
        email: values.email,
        password: values.password,
        password_confirmation: values.password_confirmation,
        phone: values.phone,
      });
      
      // Handle the success response
      console.log("User created successfully:", response.data);
      
      // Optionally reset the form or show success message
      actions.resetForm({
        values: initialValues,
      });
    } catch (error) {
      // Handle error response
      console.error("Error creating user:", error.response.data);
    }
  };

  return (
    <Box m="20px">
      <Header title="CREATE Seller" subtitle="Create a New Seller Profile" />

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
                label="Name"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.name}
                name="name"
                error={touched.name && errors.name}
                helperText={touched.name && errors.name}
                sx={{
                  gridColumn: "span 4",
                }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Email"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.email}
                name="email"
                error={touched.email && errors.email}
                helperText={touched.email && errors.email}
                sx={{ gridColumn: "span 4" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="password"
                label="Password"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.password}
                name="password"
                error={touched.password && errors.password}
                helperText={touched.password && errors.password}
                sx={{ gridColumn: "span 4" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="password"
                label="Confirm Password"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.password_confirmation}
                name="password_confirmation"
                error={touched.password_confirmation && errors.password_confirmation}
                helperText={touched.password_confirmation && errors.password_confirmation}
                sx={{ gridColumn: "span 4" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Phone Number"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.phone}
                name="phone"
                error={touched.phone && errors.phone}
                helperText={touched.phone && errors.phone}
                sx={{ gridColumn: "span 4" }}
              />
            </Box>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="end"
              mt="20px"
            >
              <Button type="submit" color="secondary" variant="contained">
                Create New Seller
              </Button>
            </Box>
          </form>
        )}
      </Formik>
    </Box>
  );
};

export default Addclient;
