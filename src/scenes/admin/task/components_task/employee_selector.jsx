import { Box, TextField, Autocomplete, Typography, useTheme, CircularProgress } from "@mui/material";
import { useState, useEffect } from "react";
import { tokens } from "../../../../theme"; // Assuming you have this for consistent theming
import { fetchEmployees } from "../../../../api/controller/admin_controller/user_controller"; // Your actual API call

const EmployeeSelector = ({handleAssignData, taskID}) => { // Removed 'employees' prop as it's managed by state
  const theme = useTheme();
    const userID = localStorage.getItem("userId");
  const colors = tokens(theme.palette.mode);

  // State to hold the selected employee's ID
  const [assignID, setAssignID] = useState(0); // Initialize with 0 or null for no selection

  // State to hold the list of employees fetched from the API
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [errorEmployees, setErrorEmployees] = useState(null);

  // State to hold the currently selected employee object for Autocomplete's 'value' prop
  const [selectedEmployee, setSelectedEmployee] = useState(null);
const handleAssign = (assignID) => {
 const data =  { 'task_id': taskID, 
    'assigned_person': assignID,
     'assigned_by': userID, 
     'is_main': 1 }

     handleAssignData(data);
};
  /**
   * Fetches the list of employees from the API and updates state.
   */
  const handleFetchEmployee = async () => {
    setLoadingEmployees(true);
    setErrorEmployees(null); // Clear previous errors
    try {
      const response = await fetchEmployees();
      if (response && response.data) { // Assuming response.data holds the array of employees
        setEmployees(response.data);
      } else {
        setErrorEmployees("No employee data found.");
        setEmployees([]); // Ensure employees array is empty on error
      }
    } catch (error) {
      console.error("Failed to fetch employees:", error);
      setErrorEmployees("Failed to load employees. Please try again.");
    } finally {
      setLoadingEmployees(false);
    }
  };

  useEffect(() => {
    handleFetchEmployee();
  }, []); // Empty dependency array means this runs once on component mount

  // Update selectedEmployee when assignID or employees list changes
  useEffect(() => {
    if (assignID > 0 && employees.length > 0) {
      const foundEmployee = employees.find(emp => emp.id === assignID);
      setSelectedEmployee(foundEmployee || null);
    } else {
      setSelectedEmployee(null);
    }
  }, [assignID, employees]);


  return (
    <Box m={4}>
      <Typography variant="h4" mb={3} color={colors.gray[100]}>
        Assign Employee
      </Typography>

      {loadingEmployees ? (
        <Box display="flex" alignItems="center" justifyContent="center" height="100px">
          <CircularProgress size={24} sx={{ color: colors.greenAccent[300] }} />
          <Typography color={colors.greenAccent[300]} sx={{ ml: 2 }}>Loading employees...</Typography>
        </Box>
      ) : errorEmployees ? (
        <Typography color="error" variant="body1">
          {errorEmployees}
          <Button onClick={handleFetchEmployee} sx={{ ml: 1 }} size="small" variant="outlined">Retry</Button>
        </Typography>
      ) : (
        <Autocomplete
          options={employees}
          getOptionLabel={(option) => option.name || ""} // Ensure a string is always returned
          isOptionEqualToValue={(option, value) => option.id === value.id}
          // Set the value of the Autocomplete based on the selectedEmployee state
          value={selectedEmployee}
          onChange={(event, newValue) => {
            // newValue will be the selected employee object or null
            setSelectedEmployee(newValue);
            setAssignID(newValue ? newValue.id : 0); // Update assignID state
            handleAssign(newValue.id);
            console.log("Selected Employee ID:", newValue ? newValue.id : "No selection");
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Assign To (Optional)"
              fullWidth
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: colors.blueAccent[200] },
                  '&:hover fieldset': { borderColor: colors.blueAccent[400] },
                  '&.Mui-focused fieldset': { borderColor: colors.greenAccent[500] },
                  color: colors.gray[100], // Input text color
                },
                '& .MuiInputLabel-root': { color: colors.gray[100] },
                '& .MuiInputBase-input': { color: colors.gray[100] },
                '& .MuiSvgIcon-root': { color: colors.gray[100] }, // Dropdown icon color
              }}
            />
          )}
        />
      )}

    </Box>
  );
};

export default EmployeeSelector;