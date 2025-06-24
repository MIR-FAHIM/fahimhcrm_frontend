import React, { useState, useEffect } from "react";
import {
  Box,
  CircularProgress,
  Typography,
  Card,
  CardContent,
  Avatar,
  Grid,
  Button,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormControlLabel
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { tokens } from "../../../theme";
import { fetchEmployees } from "../../../api/controller/admin_controller/user_controller";
import { addProjectMembers , getProjectTeam} from "../../../api/controller/admin_controller/project/project_controller";
import { base_url } from "../../../api/config/index";

const ProjectTeam = ({projectID}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [projectId, setProjectId] = useState(1); // Use actual project ID as needed

  const handleViewDetails = (id) => {
    navigate(`/employee-profile/${id}`);
  };

  const handleToggleMember = (id) => {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((mid) => mid !== id) : [...prev, id]
    );
  };

  const handleAddMembersToProject = async () => {
    const members = selectedMembers.map((id) => ({
      employee_id: id,
      role: null // You can customize per user
    }));

    try {
      const response = await addProjectMembers({
        project_id: projectID,
        members
      });

      if (response?.status === 'success') {
        alert("Members added successfully");
        window.location.reload();
        setOpenDialog(false);
        setSelectedMembers([]);
      } else {
        alert("Failed to add members");
      }
    } catch (err) {
      alert("Error adding members");
    }
  };

  useEffect(() => {
    fetchEmployees()
      .then((response) => {
        if (response.status === "success") {
          setEmployees(response.data);
        } else {
          setError("Failed to fetch employees");
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Error fetching data");
        setLoading(false);
      });
      getProjectTeam(projectID)
      .then((response) => {
        if (response.status === "success") {
          setTeams(response.data);
        } else {
          setError("Failed to fetch teams");
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Error fetching data");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="60vh">
        <Typography variant="h6" color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box m={4}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700} color="primary">Project Team</Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="contained"
            color="primary"
            sx={{
              padding: "10px 25px",
              borderRadius: "30px",
              fontWeight: "bold",
              boxShadow: 3,
              textTransform: "none",
            }}
            onClick={() => setOpenDialog(true)}
          >
            + Add Team Members
          </Button>
       
        </Box>
      </Box>

      <Grid container spacing={3}>
        {teams.map((employee) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={employee.employee.id}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                borderRadius: 3,
                boxShadow: 4,
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 6,
                },
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar
                    src={`${base_url}/storage/${employee.employee.photo}`}
                    sx={{ width: 56, height: 56, mr: 2 }}
                  />
                  <Box>
                    <Typography variant="h6" fontWeight="bold">{employee.employee.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {employee.employee.role?.role_name || "No Role"}
                    </Typography>
                  </Box>
                </Box>

                <Box mt={2} pl={1}>
                  <Typography variant="body2" mb={0.5}>📋 Total Tasks: <strong>{employee.employee.total_tasks || 0}</strong></Typography>
                  <Typography variant="body2" mb={0.5}>⏳ Pending: <strong>{employee.employee.pending_tasks || 0}</strong></Typography>
                  <Typography variant="body2">✅ Completed: <strong>{employee.employee.completed_tasks || 0}</strong></Typography>
                </Box>
              </CardContent>

              <Box p={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  color="primary"
                  sx={{
                    borderRadius: "20px",
                    textTransform: "none",
                    fontWeight: "bold",
                  }}
                  onClick={() => handleViewDetails(employee.employee.id)}
                >
                  View Profile
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Member Selection Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth>
        <DialogTitle>Select Team Members</DialogTitle>
        <DialogContent dividers>
          {employees.map((employee) => (
            <FormControlLabel
              key={employee.id}
              control={
                <Checkbox
                  checked={selectedMembers.includes(employee.id)}
                  onChange={() => handleToggleMember(employee.id)}
                />
              }
              label={`${employee.name} (${employee.role?.role_name || "No Role"})`}
            />
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="secondary">Cancel</Button>
          <Button onClick={handleAddMembersToProject} color="primary" variant="contained">
            Add Selected
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectTeam;
