import { useState, useEffect } from "react";
import { 
  Box, Button, TextField, Checkbox, FormControlLabel, useMediaQuery, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper 
} from "@mui/material";
import { Header } from "../../../components";
import { Formik } from "formik";
import * as yup from "yup";

import { addTaskType, fetchTaskType } from "../../../api/controller/admin_controller/task_controller/task_controller"; 
import { fetchDepartment } from "../../../api/controller/admin_controller/department_controller"; 

const initialValues = {
  type_name: "",
  department_id: "",
  isActive: true,
};

const checkoutSchema = yup.object().shape({
  type_name: yup.string().required("Type Name is required"),
  department_id: yup.string().required("Department selection is required"),
  isActive: yup.boolean().required("Active status is required"),
});

const AddTaskType = () => {
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const [taskTypes, setTaskTypes] = useState([]);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    loadTaskTypes();
    loadDepartments();
  }, []);

  const loadTaskTypes = async () => {
    try {
      const response = await fetchTaskType();
      setTaskTypes(response.data || []);
    } catch (error) {
      console.error("Error fetching task types:", error);
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
      await addTaskType({
        type_name: values.type_name,
        department_id: values.department_id,
        isActive: values.isActive ? "1" : "0",
      });

      actions.resetForm({ values: initialValues });
      loadTaskTypes();
    } catch (error) {
      console.error("Error adding task type:", error);
    }
  };

  return (
    <Box m="20px">
      <Header title="CREATE Task Type" subtitle="Add a New Task Type" />

      {/* Form for Adding Task Type */}
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
                label="Type Name"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.type_name}
                name="type_name"
                error={touched.type_name && Boolean(errors.type_name)}
                helperText={touched.type_name && errors.type_name}
                sx={{ gridColumn: "span 4" }}
              />

              {/* Department Selection Grid */}
              <Box sx={{ gridColumn: "span 4" }}>
                <Box display="flex" overflow="auto">
                  {departments.map((dept) => (
                    <Button
                      key={dept.id}
                      variant={values.department_id === dept.id.toString() ? "contained" : "outlined"}
                      color={values.department_id === dept.id.toString() ? "secondary" : "primary"}
                      onClick={() => setFieldValue("department_id", dept.id.toString())}
                      sx={{ m: 1 }}
                    >
                      {dept.department_name}
                    </Button>
                  ))}
                </Box>
                {touched.department_id && errors.department_id && (
                  <div style={{ color: "red", marginTop: "8px" }}>
                    {errors.department_id}
                  </div>
                )}
              </Box>

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
                Create Task Type
              </Button>
            </Box>
          </form>
        )}
      </Formik>

      {/* Task Type List Table */}
      <Box mt="40px">
        <Header title="Task Type List" subtitle="Manage Task Types" />
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Type Name</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {taskTypes.map((type, index) => (
                <TableRow key={index}>
                  <TableCell>{type.id}</TableCell>
                  <TableCell>{type.type_name}</TableCell>
                  <TableCell>{type.department_name || "-"}</TableCell>
                  <TableCell>{type.isActive === "1" ? "Active" : "Inactive"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};

export default AddTaskType;
