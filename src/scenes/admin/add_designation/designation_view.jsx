import { useState, useEffect } from "react";
import { 
  Box, Button, TextField, Checkbox, FormControlLabel, useMediaQuery, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper 
} from "@mui/material";
import { Header } from "../../../components";
import { Formik } from "formik";
import * as yup from "yup";

import { fetchDesignation, addDesignation } from "../../../api/controller/admin_controller/department_controller";

const initialValues = {
  department_name: "", // Department Name
  isActive: true, // Active status (default: true)
};

const checkoutSchema = yup.object().shape({
  department_name: yup.string().required("Department Name is required"),
  isActive: yup.boolean().required("Active status is required"),
});

const DesignationView = () => {
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const [departments, setDepartments] = useState([]);

  // Fetch departments on component mount
  useEffect(() => {
    loadDepartments();
  }, []);

  // Function to fetch department list
  const loadDepartments = async () => {
    try {
      const response = await fetchDesignation();
      setDepartments(response.data || []);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const handleFormSubmit = async (values, actions) => {
    try {
      await addDesignation({
        designation_name: values.department_name,
        isActive: values.isActive ? "1" : "0",
      });

      actions.resetForm({ values: initialValues });
      loadDepartments(); // Refresh list after adding department
    } catch (error) {
      console.error("Error adding department:", error);
    }
  };

  return (
    <Box m="20px">
      <Header title="CREATE Designation" subtitle="Add a New Designation" />

      {/* Form for Adding Department */}
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
                label="Department Name"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.department_name}
                name="department_name"
                error={touched.department_name && errors.department_name}
                helperText={touched.department_name && errors.department_name}
                sx={{ gridColumn: "span 4" }}
              />

              <Box sx={{ gridColumn: "span 4" }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={values.isActive}
                      onChange={handleChange}
                      name="isActive"
                      color="primary"
                    />
                  }
                  label="Active Status"
                />
              </Box>
            </Box>
            <Box display="flex" justifyContent="end" mt="20px">
              <Button type="submit" color="secondary" variant="contained">
                Create Designation
              </Button>
            </Box>
          </form>
        )}
      </Formik>

      {/* Department List Table */}
      <Box mt="40px">
        <Header title="Designation List" subtitle="Manage Designations" />
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Designation Name</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {departments.map((dept, index) => (
                <TableRow key={index}>
                  <TableCell>{dept.id}</TableCell>
                  <TableCell>{dept.designation_name}</TableCell>
                  <TableCell>{dept.isActive === "1" ? "Active" : "Inactive"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};

export default DesignationView;
