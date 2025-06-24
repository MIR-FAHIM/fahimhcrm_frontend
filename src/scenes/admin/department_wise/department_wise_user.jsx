import { useState, useEffect } from "react";
import { Box, Typography, CircularProgress, List, ListItem, ListItemText, Paper, Grid, Avatar, Divider, Card, CardContent, CardHeader, LinearProgress } from "@mui/material";
import { fetchDepartmentWiseEmp } from "../../../api/controller/admin_controller/department_controller";
import { blue, green, red, grey, purple } from "@mui/material/colors";

const DepartmentWiseEmp = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch departments and employees on component mount
  useEffect(() => {
    fetchDepartmentWiseEmpData();
  }, []);

  const fetchDepartmentWiseEmpData = async () => {
    setLoading(true);
    try {
      const response = await fetchDepartmentWiseEmp();
      setDepartments(response.data || []); // Assuming response.data contains the department list
    } catch (error) {
      console.error("Error fetching department data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Example of aggregated data, this should ideally come from your API
  const getDepartmentOverview = (departmentId) => {
    const randomData = {
      tasks: Math.floor(Math.random() * 20),
      notifications: Math.floor(Math.random() * 10),
      notes: Math.floor(Math.random() * 5),
    };
    return randomData;
  };

  return (
    <Box p={3}>
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
          <CircularProgress size={60} color="primary" />
        </Box>
      ) : (
        <Box>
        
        

          {/* Departments and Employees Section */}
          <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ color: blue[700] }}>
            Departments and Employees
          </Typography>
<Box sx={{ height: '20px' }}></Box>
          <Grid container spacing={3} sx={{ justifyContent: "center" }}>
            {departments.map((department) => (
              <Grid item key={department.id} xs={12} sm={6} md={4} lg={4}>
                <Paper sx={{
                  padding: 3,
                  backgroundColor: "#e8f5e9",
                  borderRadius: 2,
                  boxShadow: 3,
                  transition: "all 0.3s ease-in-out",
                  "&:hover": {
                    transform: "scale(1.05)",
                    boxShadow: 6,
                  },
                }}>
<Card sx={{ backgroundColor: green[50],  mb: 2 }}>
    <CardContent>
      <Typography variant="h6" fontWeight="bold" sx={{ color: green[800], mb: 1 }}>
        {department.department_name}
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Box>
            <Typography variant="subtitle2" sx={{ color: green[700] }}>
              Total Employees
            </Typography>
            <Typography variant="h6" fontWeight="bold">
              {department.employee_count}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={6}>
          <Box>
            <Typography variant="subtitle2" sx={{ color: green[700] }}>
              Total Tasks
            </Typography>
            <Typography variant="h6" fontWeight="bold">
              {department.task_count}
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </CardContent>
  </Card>

                  <Divider sx={{ marginBottom: 2 }} />

                  {/* Employee List under each department */}
                  {department.users.length > 0 ? (
                    <List sx={{ maxHeight: 300, overflowY: "auto" }}>
                      {department.users.map((employee) => (
                        <ListItem key={employee.id} sx={{ paddingY: 1, paddingX: 2 }}>
                          <Avatar sx={{ bgcolor: red[500], marginRight: 2 }} src={employee.avatar || ""}>
                            {employee.name[0]}
                          </Avatar>
                          <ListItemText
                            primary={employee.name}
                            secondary={
                              <>
                                <Typography variant="body2" color="textSecondary">
                                  Email: {employee.email}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                  Phone: {employee.phone}
                                </Typography>
                              </>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="textSecondary" align="center">
                      No employees in this department
                    </Typography>
                  )}
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default DepartmentWiseEmp;
