import { Box, Button, TextField, MenuItem, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchDepartment, fetchRole, fetchDesignation } from "../../../api/controller/admin_controller/department_controller";
import { registerEmployee } from "../../../api/controller/admin_controller/user_controller";

const AddEmployee = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    birthdate: "",
    role_id: "",
    department_id: "",
    designation_id: "",
    isActive: "1",
    photo: null,
    bio: "",
  });

  useEffect(() => {
    fetchDepartment().then((response) => setDepartments(response.data));
    fetchRole().then((response) => setRoles(response.data));
    fetchDesignation().then((response) => setDesignations(response.data));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, photo: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    Object.keys(formData).forEach((key) => {
      formDataToSend.append(key, formData[key]);
    });

    try {
      const response = await registerEmployee(formDataToSend);
      if (response.status === "success") {
        alert("Employee added successfully!");
        navigate("/employee-list-view");
      } else {
        alert("Failed to add employee");
      }
    } catch (error) {
      alert("Error adding employee");
    }
  };

  return (
    <Box m="20px" maxWidth="600px" mx="auto">
      <Typography variant="h4" mb={2}>Add Employee</Typography>
      <form onSubmit={handleSubmit}>
        <TextField label="Name" name="name" fullWidth margin="normal" onChange={handleChange} required />
        <TextField label="Email" name="email" fullWidth margin="normal" onChange={handleChange} required />
        <TextField label="Password" name="password" type="password" fullWidth margin="normal" onChange={handleChange} required />
        <TextField label="Phone" name="phone" fullWidth margin="normal" onChange={handleChange} required />
        <TextField label="Address" name="address" fullWidth margin="normal" onChange={handleChange} required />
        <TextField label="Birthdate" name="birthdate" type="date" fullWidth margin="normal" InputLabelProps={{ shrink: true }} onChange={handleChange} required />
        <TextField select label="Role" name="role_id" fullWidth margin="normal" onChange={handleChange} required>
          {roles.map((role) => (
            <MenuItem key={role.id} value={role.id}>{role.role_name}</MenuItem>
          ))}
        </TextField>
        <TextField select label="Department" name="department_id" fullWidth margin="normal" onChange={handleChange} required>
          {departments.map((dept) => (
            <MenuItem key={dept.id} value={dept.id}>{dept.department_name}</MenuItem>
          ))}
        </TextField>
        <TextField select label="Designation" name="designation_id" fullWidth margin="normal" onChange={handleChange} required>
          {designations.map((des) => (
            <MenuItem key={des.id} value={des.id}>{des.designation_name}</MenuItem>
          ))}
        </TextField>
       
        <TextField label="Bio" name="bio" fullWidth margin="normal" onChange={handleChange} multiline rows={3} />
        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
          Submit
        </Button>
      </form>
    </Box>
  );
};

export default AddEmployee;
