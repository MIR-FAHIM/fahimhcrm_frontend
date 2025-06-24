import { useState, useEffect } from "react";
import { 
  Box, Button, TextField, Checkbox, FormControlLabel, useMediaQuery,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Grid, Card, CardActionArea, Typography 
} from "@mui/material";
import { Header } from "../../../components";
import { Formik } from "formik";
import * as yup from "yup";

import { addTaskStatus, fetchTaskStatus } from "../../../api/controller/admin_controller/task_controller/task_controller"; 
import { fetchDepartment } from "../../../api/controller/admin_controller/department_controller"; 

const initialValues = {
  status_name: "",   // Status Name
  isActive: true,    // Active status (default: true)
  department_id: "", // Department ID (required)
};

const checkoutSchema = yup.object().shape({
  status_name: yup.string().required("Status Name is required"),
  isActive: yup.boolean().required("Active status is required"),
  department_id: yup.string().required("Department selection is required"),
});

const AddTaskStatus = () => {
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const [statuses, setStatuses] = useState([]);
  const [departments, setDepartments] = useState([]);

  // Fetch statuses and departments on component mount
  useEffect(() => {
    loadStatuses();
    loadDepartments();
  }, []);

  const loadStatuses = async () => {
    try {
      const response = await fetchTaskStatus();
      setStatuses(response.data || []);
    } catch (error) {
      console.error("Error fetching statuses:", error);
    }
  };

  const loadDepartments = async () => {
    try {
      const response = await fetchDepartment();
      setDepartments(response.data || []);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const handleFormSubmit = async (values, actions) => {
    try {
      await addTaskStatus({
        status_name: values.status_name,
        department_id: values.department_id,
        isActive: values.isActive ? "1" : "0",
      });

      actions.resetForm({ values: initialValues });
      loadStatuses(); // Refresh after adding
    } catch (error) {
      console.error("Error adding task status:", error);
    }
  };

  return (
    <Box m="20px">
      <Header title="CREATE Task Status" subtitle="Add a New Task Status" />

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
                label="Status Name"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.status_name}
                name="status_name"
                error={touched.status_name && Boolean(errors.status_name)}
                helperText={touched.status_name && errors.status_name}
                sx={{ gridColumn: "span 4" }}
              />

              {/* Department Selection */}
              <Box sx={{ gridColumn: "span 4" }}>
                <Typography variant="h6" mb={2}>Select Department</Typography>
                <Grid container spacing={2}>
                  {departments.map((dept) => (
                    <Grid item key={dept.id}>
                      <Card
                        sx={{
                          backgroundColor: values.department_id === String(dept.id) ? "#1976d2" : "#f5f5f5",
                          color: values.department_id === String(dept.id) ? "#fff" : "#000",
                          border: "1px solid",
                          borderColor: values.department_id === String(dept.id) ? "#1976d2" : "#ccc",
                          minWidth: 150,
                          textAlign: "center",
                        }}
                      >
                        <CardActionArea onClick={() => setFieldValue("department_id", String(dept.id))}>
                          <Box p={2}>
                            <Typography>{dept.department_name}</Typography>
                          </Box>
                        </CardActionArea>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
                {touched.department_id && errors.department_id && (
                  <Typography color="error" variant="caption">
                    {errors.department_id}
                  </Typography>
                )}
              </Box>

              {/* Active Checkbox */}
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
                Create Task Status
              </Button>
            </Box>
          </form>
        )}
      </Formik>

      {/* Task Status List */}
      <Box mt="40px">
        <Header title="Task Status List" subtitle="Manage Task Statuses" />
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Status Name</TableCell>
                <TableCell>Department ID</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {statuses.map((status, index) => (
                <TableRow key={index}>
                  <TableCell>{status.id}</TableCell>
                  <TableCell>{status.status_name}</TableCell>
                  <TableCell>{status.department_id}</TableCell>
                  <TableCell>{status.isActive === "1" ? "Active" : "Inactive"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};

export default AddTaskStatus;
