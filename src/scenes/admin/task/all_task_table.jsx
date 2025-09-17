import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Chip,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Button,
  useTheme,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { tokens } from "../../../theme";
import {
  getAllTask,
  getStatus,
  updateTaskStatus,
} from "../../../api/controller/admin_controller/task_controller/task_controller";
import { fetchEmployees } from "../../../api/controller/admin_controller/user_controller";
import { image_file_url } from "../../../api/config";
import TaskCardView from "./components_task/task_card_view"; 

const AllTaskTable = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const userID = localStorage.getItem("userId");
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [tasksRes, statusesRes, employeesRes] = await Promise.all([
          getAllTask(),
          getStatus(),
          fetchEmployees(),
        ]);
        const list = tasksRes?.data ?? [];
        setTasks(list);
        setFilteredTasks(list);
        setStatuses(statusesRes?.data ?? []);
        setEmployees(employeesRes?.data ?? []);
      } catch (e) {
        console.error("Error bootstrapping AllTaskTable:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleStatusFilter = (statusName = "") => {
    setSelectedStatus(statusName);
    filterTasks(statusName, selectedEmployee);
  };

  const handleEmployeeFilter = (e) => {
    const empId = e.target.value;
    setSelectedEmployee(empId);
    filterTasks(selectedStatus, empId);
  };

  const filterTasks = (statusName, empId) => {
    let next = [...tasks];
    if (statusName) {
      next = next.filter((t) => t?.status?.status_name === statusName);
    }
    if (empId) {
      next = next.filter((t) =>
        (t?.assigned_persons ?? []).some((p) => p?.assigned_person?.id === empId)
      );
    }
    setFilteredTasks(next);
  };

  const handleStatusChange = async (taskId, newStatusId) => {
    try {
      await updateTaskStatus({ task_id: taskId, status_id: newStatusId, user_id: userID });
      const newStatusObj = statuses.find((s) => s.id === newStatusId);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatusObj } : t)));
      setFilteredTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatusObj } : t)));
    } catch (e) {
      console.error("Error updating task status:", e);
    }
  };

  const goAddTask = () =>
    navigate("/add-task", { state: { project_id: 0, project_phase_id: 0 } });

  const goTaskDetails = (taskId) => navigate(`/task-details/${taskId}`);

  if (loading) {
    return (
      <Box sx={{ height: "70vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, backgroundColor: theme.palette.background.default }}>
      {/* Status filter chips */}
      <Box sx={{ display: "flex", gap: 1.25, overflowX: "auto", mb: 2 }}>
        <Chip
          label="All Tasks"
          onClick={() => handleStatusFilter("")}
          clickable
          sx={{
            backgroundColor: selectedStatus === "" ? colors.blueAccent[500] : colors.primary[700],
            color: selectedStatus === "" ? colors.primary[900] : colors.gray[100],
            "&:hover": { backgroundColor: selectedStatus === "" ? colors.blueAccent[700] : colors.primary[600] },
          }}
        />
        {statuses.map((s) => (
          <Chip
            key={s.id}
            label={s.status_name}
            onClick={() => handleStatusFilter(s.status_name)}
            clickable
            sx={{
              backgroundColor: selectedStatus === s.status_name ? colors.blueAccent[500] : colors.gray[700],
              color: selectedStatus === s.status_name ? colors.primary[900] : colors.gray[100],
              "&:hover": { backgroundColor: selectedStatus === s.status_name ? colors.blueAccent[700] : colors.primary[600] },
            }}
          />
        ))}
      </Box>

      {/* Top actions / filters */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
        }}
      >
        <FormControl sx={{ minWidth: 220 }}>
          <InputLabel sx={{ color: colors.gray[400] }}>Filter by Employee</InputLabel>
          <Select
            label="Filter by Employee"
            value={selectedEmployee}
            onChange={handleEmployeeFilter}
            sx={{ color: colors.gray[100], backgroundColor: theme.palette.background.paper }}
          >
            <MenuItem value="">
              <Typography sx={{ color: colors.gray[100] }}>All Employees</Typography>
            </MenuItem>
            {employees.map((e) => (
              <MenuItem key={e.id} value={e.id}>
                {e.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          variant="contained"
          onClick={goAddTask}
          sx={{
            borderRadius: 2,
            px: 2.5,
            backgroundColor: colors.primary[600],
            color: colors.primary[900],
            "&:hover": { backgroundColor: colors.primary[700] },
          }}
        >
          + Add Task
        </Button>
      </Box>

      {/* Cards grid fed by TaskCardView */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)", // always 4 columns

          gap: 2,
        }}
      >
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <TaskCardView
              key={task.id}
              task={task}
              statuses={statuses}
              imageBaseUrl={image_file_url}
              onDetails={goTaskDetails}
              onStatusChange={handleStatusChange}
            />
          ))
        ) : (
          <Typography sx={{ color: colors.gray[400] }}>No tasks found.</Typography>
        )}
      </Box>
    </Box>
  );
};

export default AllTaskTable;
