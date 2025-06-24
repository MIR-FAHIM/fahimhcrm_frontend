import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  MenuItem,
  Typography,
  CircularProgress,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { addProject } from "../../../api/controller/admin_controller/task_controller/task_controller";
import { fetchDepartment } from "../../../api/controller/admin_controller/department_controller";

const AddProject = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [isTech, setIsTech] = useState(false);
  const [isMarketing, setIsMarketing] = useState(false);
  const [loading, setLoading] = useState(false);
  const { control, handleSubmit } = useForm();

  useEffect(() => {
    // Fetch departments for the dropdown
    fetchDepartment()
      .then((response) => setDepartments(response.data))
      .catch((error) => console.error("Error fetching departments:", error));
  }, []);

  const handleCheckboxChange = (type) => {
    if (type === "tech") {
      setIsTech(true);
      setIsMarketing(false);
    } else if (type === "marketing") {
      setIsMarketing(true);
      setIsTech(false);
    }
  };

  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append("project_name", data.project_name);
    formData.append("is_tech", isTech ? "1" : "0");
    formData.append("is_marketing", isMarketing ? "1" : "0");
    formData.append("department_id", data.department_id);
    formData.append("description", data.description);
    formData.append("created_by", "1"); // Assuming 1 is the current user's ID, modify as needed.

    setLoading(true);

    try {
      await addProject(formData);
      navigate("/project-list"); // Navigate to the projects list after successful submission.
    } catch (error) {
      console.error("Error adding project:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        maxWidth: 500,
        margin: "auto",
        backgroundColor: "#fff",
        padding: 3,
        borderRadius: "8px",
        boxShadow: 3,
      }}
    >
      <Typography variant="h5" fontWeight="bold">
        Add New Project
      </Typography>

      <Controller
        name="project_name"
        control={control}
        defaultValue=""
        render={({ field }) => <TextField {...field} label="Project Name" fullWidth required />}
      />

      <Controller
        name="description"
        control={control}
        defaultValue=""
        render={({ field }) => <TextField {...field} label="Description" fullWidth required multiline />}
      />

      <Controller
        name="department_id"
        control={control}
        defaultValue=""
        render={({ field }) => (
          <TextField {...field} label="Department" select fullWidth required>
            {departments.map((department) => (
              <MenuItem key={department.id} value={department.id}>
                {department.department_name}
              </MenuItem>
            ))}
          </TextField>
        )}
      />

      <Box sx={{ display: "flex", gap: 2 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={isTech}
              onChange={() => handleCheckboxChange("tech")}
              color="primary"
            />
          }
          label="Is Tech"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={isMarketing}
              onChange={() => handleCheckboxChange("marketing")}
              color="primary"
            />
          }
          label="Is Marketing"
        />
      </Box>

      <Button type="submit" variant="contained" color="primary" disabled={loading}>
        {loading ? <CircularProgress size={24} /> : "Create Project"}
      </Button>
    </Box>
  );
};

export default AddProject;
