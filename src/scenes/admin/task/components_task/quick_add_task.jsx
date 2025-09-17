// src/components/tasks/QuickAddTask.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  Stack,
  InputAdornment,
} from "@mui/material";
import AddTaskIcon from "@mui/icons-material/PlaylistAdd";
import TitleIcon from "@mui/icons-material/Title";

// API imports (same paths you already use elsewhere)
import {
  getStatus,
  getPriority,
  getTaskType,
  addTask,
} from "../../../../api/controller/admin_controller/task_controller/task_controller";
import { assignUser } from "../../../../api/controller/admin_controller/task_controller/task_controller";

/**
 * QuickAddTask
 * Props (all optional):
 * - placeholder: string (input placeholder)
 * - defaultDepartmentId: number (fallback department id; default 1)
 * - onCreated: (task) => void   (callback after success)
 */
export default function QuickAddTask({
  placeholder = "Add a task and hit Enter…",
  defaultDepartmentId = 1,
  onCreated,
}) {
  const userID = localStorage.getItem("userId");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: "", sev: "success" });

  // default ids (fetched once)
  const [priorityId, setPriorityId] = useState(null);
  const [statusId, setStatusId] = useState(null);
  const [typeId, setTypeId] = useState(null);

  // Fetch first available priority/type/status as defaults
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [prioRes, typeRes, statusRes] = await Promise.all([
          getPriority(),
          getTaskType(),
          getStatus(),
        ]);
        if (!active) return;
        setPriorityId(prioRes?.data?.[0]?.id ?? null);
        setTypeId(typeRes?.data?.[0]?.id ?? null);
        setStatusId(statusRes?.data?.[0]?.id ?? null);
      } catch (e) {
        // Defaults will just be omitted if fetch fails
        console.error("QuickAddTask defaults fetch error:", e);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const canSubmit = useMemo(() => title.trim().length > 0 && !!userID && !loading, [title, userID, loading]);

  const submit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    try {
      // Build minimal payload with safe defaults
      const payload = {
        task_title: title.trim(),
        task_details: "",                 // defaults empty
        priority_id: priorityId ?? undefined,
        task_type_id: typeId ?? undefined,
        status_id: statusId ?? undefined,
        // optional defaults you used before:
        show_completion_percentage: 0,
        is_remind: 1,
        created_by: userID,
        department_id: defaultDepartmentId,
        // omit project fields for quick add
      };

      const res = await addTask(payload);

      // accept common success shapes
      const ok = res?.status === "success" || res?.status === 200 || res?.success === true;
      const taskId = res?.data?.id || res?.id;

      if (!ok || !taskId) {
        throw new Error(res?.message || "Failed to create task.");
      }

      // Assign to current user (as main)
      await assignUser({
        task_id: taskId,
        assigned_person: userID,
        assigned_by: userID,
        is_main: 1,
      });

      setTitle("");
      setSnack({ open: true, msg: "✅ Task created & assigned to you", sev: "success" });
      onCreated?.(res.data ?? { id: taskId, task_title: payload.task_title });
    } catch (err) {
      console.error(err);
      setSnack({ open: true, msg: err.message || "Something went wrong.", sev: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submit();
    }
  };

  return (
    <>
      <Paper
        elevation={3}
        sx={{
          p: 1,
          borderRadius: 2,
          border: (theme) => `1px solid ${theme.palette.divider}`,
          bgcolor: "background.paper",
        }}
      >
        {/* Single row that wraps on small screens */}
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          <TextField
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <TitleIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{
              flex: 1,
              minWidth: 220,
            }}
          />

          <Button
            variant="contained"
            onClick={submit}
            disabled={!canSubmit}
            startIcon={!loading && <AddTaskIcon />}
            sx={{
              flexShrink: 0,
              textTransform: "none",
              fontWeight: 700,
              px: 2.25,
              minWidth: 140,
            }}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : "Quick Task"}
          </Button>
        </Stack>
      </Paper>

      <Snackbar
        open={snack.open}
        autoHideDuration={2600}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snack.sev} sx={{ width: "100%" }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </>
  );
}
