import { useState, useEffect } from "react";
import { 
  Box, Button, TextField, Checkbox, FormControlLabel, useMediaQuery, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper 
} from "@mui/material";
import { Header } from "../../../components";
import { Formik } from "formik";
import * as yup from "yup";

// Make sure you import the correct add and fetch functions
import { addTaskPriority, fetchTaskPriorities } from "../../../api/controller/admin_controller/task_controller/task_controller";

const initialValues = {
  priority_name: "", // Priority Name
  isActive: true,    // Active status (default: true)
};

const checkoutSchema = yup.object().shape({
  priority_name: yup.string().required("Priority Name is required"),
  isActive: yup.boolean().required("Active status is required"),
});

const AddTaskPriority = () => {
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const [priorities, setPriorities] = useState([]);

  // Fetch priorities on component mount
  useEffect(() => {
    loadPriorities();
  }, []);

  // Function to fetch priority list
  const loadPriorities = async () => {
    try {
      const response = await fetchTaskPriorities();
      setPriorities(response.data || []);
    } catch (error) {
      console.error("Error fetching priorities:", error);
    }
  };

  const handleFormSubmit = async (values, actions) => {
    try {
      await addTaskPriority({
        priority_name: values.priority_name,
        isActive: values.isActive ? "1" : "0",
      });

      actions.resetForm({ values: initialValues });
      loadPriorities(); // Refresh list after adding priority
    } catch (error) {
      console.error("Error adding priority:", error);
    }
  };

  return (
    <Box m="20px">
      <Header title="CREATE Priority" subtitle="Add a New Priority" />

      {/* Form for Adding Priority */}
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
                label="Priority Name"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.priority_name}
                name="priority_name"
                error={touched.priority_name && errors.priority_name}
                helperText={touched.priority_name && errors.priority_name}
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
                Create Priority
              </Button>
            </Box>
          </form>
        )}
      </Formik>

      {/* Priority List Table */}
      <Box mt="40px">
        <Header title="Priority List" subtitle="Manage Priorities" />
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Priority Name</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {priorities.map((priority, index) => (
                <TableRow key={index}>
                  <TableCell>{priority.id}</TableCell>
                  <TableCell>{priority.priority_name}</TableCell>
                  <TableCell>{priority.isActive === "1" ? "Active" : "Inactive"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};

export default AddTaskPriority;
