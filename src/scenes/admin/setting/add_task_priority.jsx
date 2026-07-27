import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  InputAdornment,
  Paper,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import FlagRoundedIcon from "@mui/icons-material/FlagRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import SortRoundedIcon from "@mui/icons-material/SortRounded";
import { Formik } from "formik";
import * as yup from "yup";

import {
  addTaskPriority,
  fetchTaskPriorities,
} from "../../../api/controller/admin_controller/task_controller/task_controller";

const initialValues = { priority_name: "" };

const validationSchema = yup.object().shape({
  priority_name: yup.string().trim().required("Priority name is required"),
});

const AddTaskPriority = () => {
  const theme = useTheme();
  const brand = theme.palette.blueAccent?.main ?? theme.palette.primary.main;

  const [priorities, setPriorities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [snack, setSnack] = useState({ open: false, msg: "", sev: "success" });

  const loadPriorities = async () => {
    setLoading(true);
    try {
      const response = await fetchTaskPriorities();
      setPriorities(response?.data || []);
    } catch (error) {
      console.error("Error fetching priorities:", error);
      setSnack({ open: true, msg: "Failed to load priorities.", sev: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPriorities();
  }, []);

  const filteredPriorities = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return priorities;
    return priorities.filter((priority) =>
      String(priority.priority_name || "").toLowerCase().includes(search)
    );
  }, [priorities, query]);

  const handleFormSubmit = async (values, actions) => {
    setSaving(true);
    try {
      await addTaskPriority({
        priority_name: values.priority_name.trim(),
        isActive: "1",
      });
      actions.resetForm({ values: initialValues });
      setSnack({ open: true, msg: "Priority created successfully.", sev: "success" });
      await loadPriorities();
    } catch (error) {
      console.error("Error adding priority:", error);
      setSnack({ open: true, msg: "Failed to create priority.", sev: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: theme.palette.background.default, minHeight: "100vh" }}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "stretch", md: "center" }} justifyContent="space-between" sx={{ mb: 2.5 }}>
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Avatar variant="rounded" sx={{ bgcolor: alpha(brand, 0.12), color: brand }}>
            <FlagRoundedIcon />
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ color: theme.palette.text.primary, fontWeight: 900, lineHeight: 1 }}>
              Task Priorities
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              Create and review task priority labels.
            </Typography>
          </Box>
        </Stack>
        <Chip icon={<SortRoundedIcon />} label={`${priorities.length} priorities`} sx={{ alignSelf: { xs: "flex-start", md: "center" }, fontWeight: 900, bgcolor: alpha(brand, 0.1), color: brand }} />
      </Stack>

      <Paper elevation={0} sx={{ p: 2, mb: 2.5, borderRadius: 2, bgcolor: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}` }}>
        <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleFormSubmit}>
          {({ values, errors, touched, handleBlur, handleChange, handleSubmit }) => (
            <Box component="form" onSubmit={handleSubmit}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ xs: "stretch", sm: "flex-start" }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Priority Name"
                  placeholder="Example: High, Medium, Low"
                  value={values.priority_name}
                  name="priority_name"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  error={Boolean(touched.priority_name && errors.priority_name)}
                  helperText={touched.priority_name && errors.priority_name}
                />
                <Button type="submit" variant="contained" startIcon={saving ? <CircularProgress size={16} /> : <AddRoundedIcon />} disabled={saving} sx={{ borderRadius: 2, fontWeight: 900, minWidth: 150 }}>
                  Add Priority
                </Button>
              </Stack>
            </Box>
          )}
        </Formik>
      </Paper>

      <Paper elevation={0} sx={{ borderRadius: 2, bgcolor: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}`, overflow: "hidden" }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ xs: "stretch", sm: "center" }} justifyContent="space-between" sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Box>
            <Typography variant="h6" sx={{ color: theme.palette.text.primary, fontWeight: 900 }}>
              Priority List
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              Simple list of available task priorities.
            </Typography>
          </Box>
          <TextField
            size="small"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search priority"
            sx={{ minWidth: { xs: "100%", sm: 260 } }}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon fontSize="small" /></InputAdornment> }}
          />
        </Stack>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: alpha(brand, 0.08) }}>
                <TableCell sx={{ fontWeight: 900, width: 90 }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 900 }}>Priority Name</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={2} align="center" sx={{ py: 5 }}>
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : filteredPriorities.length ? (
                filteredPriorities.map((priority) => (
                  <TableRow key={priority.id} hover>
                    <TableCell sx={{ color: theme.palette.text.secondary, fontWeight: 800 }}>#{priority.id}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Avatar variant="rounded" sx={{ width: 30, height: 30, bgcolor: alpha(brand, 0.1), color: brand }}>
                          <FlagRoundedIcon sx={{ fontSize: 18 }} />
                        </Avatar>
                        <Typography sx={{ color: theme.palette.text.primary, fontWeight: 850 }}>
                          {priority.priority_name}
                        </Typography>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} align="center" sx={{ py: 5, color: theme.palette.text.secondary }}>
                    No priorities found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Snackbar open={snack.open} autoHideDuration={2600} onClose={() => setSnack((state) => ({ ...state, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity={snack.sev} sx={{ width: "100%" }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AddTaskPriority;