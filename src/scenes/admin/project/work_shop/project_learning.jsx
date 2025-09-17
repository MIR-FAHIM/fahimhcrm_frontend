import { useEffect, useMemo, useState, useRef } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  IconButton,
  Tooltip,
  Grid,
  Container,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Stack,
  Chip,
  InputAdornment,
  LinearProgress,
  Skeleton,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Link as MUILink,
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import LinkIcon from "@mui/icons-material/Link";

import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

import {
  addWorkShop,
  getAllWorkShopProject,
  deleteWorkShop,
} from "../../../../api/controller/admin_controller/task_controller/task_controller";

// --- Small helpers -----------------------------------------------------------
const isValidHttpUrl = (value) => {
  if (!value) return true; // optional
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

const stripHtml = (html = "") =>
  html.replace(/<[^>]*>/g, "").replace(/&nbsp;|&#160;/g, " ").trim();

const EmptyState = ({
  title = "No data yet",
  subtitle = "Start by adding your first Q&A.",
}) => (
  <Box textAlign="center" py={6} px={2} color="text.secondary">
    <Typography variant="h6" gutterBottom>
      {title}
    </Typography>
    <Typography variant="body2">{subtitle}</Typography>
  </Box>
);

// --- Quill toolbar -----------------------------------------------------------
const quillModules = {
  toolbar: [
    [{ font: [] }, { size: [] }],
    ["bold", "italic", "underline", "strike"],
    [{ color: [] }, { background: [] }],
    [{ header: 1 }, { header: 2 }],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ align: [] }],
    ["blockquote", "code-block"],
    ["link", "image"],
    ["clean"],
  ],
};
const quillFormats = [
  "font",
  "size",
  "bold",
  "italic",
  "underline",
  "strike",
  "color",
  "background",
  "header",
  "list",
  "align",
  "blockquote",
  "code-block",
  "link",
  "image",
];

// --- Main component ----------------------------------------------------------
const ProjectLearning = ({ protId }) => {
  const userID =
    typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  const [formData, setFormData] = useState({
    title: "",
    notice: "", // HTML
    url: "",
  });
  const [touched, setTouched] = useState({});

  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [query, setQuery] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  const [confirmId, setConfirmId] = useState(null);
  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const quillRef = useRef(null);

  useEffect(() => {
    loadNotices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [protId]);

  const loadNotices = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getAllWorkShopProject(protId);
      if (res?.status === "success" && Array.isArray(res.data)) {
        setNotices(res.data);
      } else {
        setError("Failed to load items.");
      }
    } catch {
      setError("Network or server error while loading items.");
    } finally {
      setLoading(false);
    }
  };

  // Text inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  // Quill input
  const handleNoticeChange = (html) => {
    setFormData((p) => ({ ...p, notice: html }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) errs.title = "Question is required";
    if (!stripHtml(formData.notice)) errs.notice = "Answer is required";
    if (!isValidHttpUrl(formData.url)) errs.url = "Must be a valid http/https URL";
    return errs;
  };

  const errors = useMemo(validate, [formData]);
  const hasErrors = Object.keys(errors).length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ title: true, notice: true, url: true });
    if (hasErrors) return;

    const formDataToSend = new FormData();
    formDataToSend.append("title", formData.title.trim());
    formDataToSend.append("content", formData.notice); // HTML saved
    formDataToSend.append("url", (formData.url || "").trim());
    if (userID) formDataToSend.append("created_by", userID);
    formDataToSend.append("status", "1");
    formDataToSend.append("type", "note");
    formDataToSend.append("is_active", "1");
    formDataToSend.append("project_id", String(protId ?? ""));

    setSaving(true);
    try {
      const res = await addWorkShop(formDataToSend);
      if (res?.status === "success") {
        setSnack({ open: true, message: "Saved Q&A.", severity: "success" });
        setFormData({ title: "", notice: "", url: "" });
        setTouched({});
        // refocus the question field
        setTimeout(() => {
          const el = document.querySelector('input[name="title"]');
          if (el) el.focus();
        }, 0);
        loadNotices();
      } else {
        setSnack({ open: true, message: "Failed to save.", severity: "error" });
      }
    } catch {
      setSnack({ open: true, message: "Error while saving.", severity: "error" });
    } finally {
      setSaving(false);
    }
  };

  const askDelete = (id) => setConfirmId(id);

  const handleDelete = async () => {
    const id = confirmId;
    if (!id) return;
    setConfirmId(null);
    try {
      const res = await deleteWorkShop({ id });
      if (res?.status === "success") {
        setSnack({ open: true, message: "Deleted.", severity: "success" });
        loadNotices();
      }
    } catch {
      setSnack({ open: true, message: "Delete failed.", severity: "error" });
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return notices;
    return notices.filter((n) =>
      [n?.title, n?.content, n?.url]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [query, notices]);

  return (
    <Container maxWidth="md" sx={{ py: { xs: 3, md: 5 } }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" fontWeight={800} gutterBottom>
            Project Learnings
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Capture questions and rich answers so future-you can be smugly efficient.
          </Typography>
        </Box>

        {/* Create form */}
        <Card variant="outlined" sx={{ borderRadius: 3, overflow: "visible" }}>
          <CardHeader
            title={<Typography variant="h6" fontWeight={700}>Add Q&A</Typography>}
            subheader="Keep it concise but informative. URLs are optional."
          />
          <CardContent
            sx={{
              // Ensure Quill dropdowns aren’t clipped
              overflow: "visible",
              ".ql-toolbar": { position: "relative", zIndex: 10 },
              ".ql-tooltip, .ql-picker-options": { zIndex: 1300 },
            }}
          >
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Grid container spacing={2}>
                <Grid item xs={12} md={7}>
                  <TextField
                    label="Question"
                    name="title"
                    fullWidth
                    value={formData.title}
                    onChange={handleChange}
                    onBlur={() => setTouched((t) => ({ ...t, title: true }))}
                    error={touched.title && Boolean(errors.title)}
                    helperText={touched.title && errors.title}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={5}>
                  <TextField
                    label="URL (optional)"
                    name="url"
                    fullWidth
                    value={formData.url}
                    onChange={handleChange}
                    onBlur={() => setTouched((t) => ({ ...t, url: true }))}
                    error={touched.url && Boolean(errors.url)}
                    helperText={touched.url && errors.url}
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LinkIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                {/* RICH TEXT ANSWER */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Answer
                  </Typography>
                  <Box
                    sx={{
                      border: (theme) => `1px solid ${theme.palette.divider}`,
                      borderRadius: 1.5,
                      "&:focus-within": {
                        borderColor: "primary.main",
                        boxShadow: (t) => `0 0 0 2px ${t.palette.primary.main}22`,
                      },
                      overflow: "hidden",
                    }}
                    onBlur={() => setTouched((t) => ({ ...t, notice: true }))}
                  >
                    <ReactQuill
                      ref={quillRef}
                      theme="snow"
                      value={formData.notice}
                      onChange={handleNoticeChange}
                      modules={quillModules}
                      formats={quillFormats}
                      style={{ minHeight: 180 }}
                    />
                  </Box>
                  {touched.notice && errors.notice && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, display: "block" }}>
                      {errors.notice}
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </Box>
          </CardContent>

          <CardActions sx={{ p: 2, pt: 0, justifyContent: "space-between" }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip label={`Total saved: ${notices.length}`} variant="outlined" />
              {protId && <Chip label={`Project #${protId}`} size="small" />}
            </Stack>
            <Button onClick={handleSubmit} variant="contained" startIcon={<AddIcon />} disabled={saving}>
              {saving ? "Saving…" : "Save Q&A"}
            </Button>
          </CardActions>
          {saving && <LinearProgress />}
        </Card>

        {/* Search & list header */}
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={7}>
                <Typography variant="h6" fontWeight={700}>
                  Saved Questions
                </Typography>
              </Grid>
              <Grid item xs={12} md={5}>
                <TextField
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search title, answer, or URL"
                  fullWidth
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          </CardContent>

          {loading && (
            <Box px={2} pb={2}>
              {[...Array(3)].map((_, i) => (
                <Box key={i}>
                  <Box sx={{ width: "100%", p: 2 }}>
                    <Skeleton variant="text" width="60%" height={28} />
                    <Skeleton variant="text" width="95%" />
                  </Box>
                  <Divider />
                </Box>
              ))}
            </Box>
          )}

          {!loading && filtered.length === 0 && (
            <EmptyState title="No matches" subtitle="Try a different search or add a new Q&A." />
          )}

          {!loading && filtered.length > 0 && (
            <Box>
              {filtered.map((notice, idx) => (
                <Box key={notice.id ?? idx}>
                  <Accordion
                    expanded={expandedId === notice.id}
                    onChange={() =>
                      setExpandedId(expandedId === notice.id ? null : notice.id)
                    }
                    sx={{ boxShadow: "none" }}
                  >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        sx={{ width: "100%", pr: 1 }}
                      >
                        <Typography
                          variant="subtitle1"
                          fontWeight={700}
                          sx={{ flexGrow: 1 }}
                        >
                          {notice?.title || "Untitled"}
                        </Typography>
                        {notice?.url && (
                          <Chip
                            label="Link"
                            size="small"
                            icon={<OpenInNewIcon fontSize="small" />}
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(
                                notice.url,
                                "_blank",
                                "noopener,noreferrer"
                              );
                            }}
                            variant="outlined"
                          />
                        )}
                      </Stack>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontStyle: "italic" }}
                      >
                        Answer
                      </Typography>

                      {/* Render saved HTML */}
                      <Box
                        sx={{
                          mt: 1,
                          "& img": { maxWidth: "100%", height: "auto" },
                          "& pre, & code": {
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                          },
                        }}
                        dangerouslySetInnerHTML={{ __html: notice?.content || "" }}
                      />

                      {notice?.url && (
                        <MUILink
                          href={notice.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ display: "inline-flex", alignItems: "center", mt: 2 }}
                        >
                          <OpenInNewIcon fontSize="small" style={{ marginRight: 6 }} />
                          Reference Link
                        </MUILink>
                      )}

                      <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
                        <Tooltip title="Delete">
                          <IconButton
                            onClick={() => askDelete(notice.id)}
                            color="error"
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </AccordionDetails>
                  </Accordion>
                  <Divider />
                </Box>
              ))}
            </Box>
          )}
        </Card>

        {error && <Alert severity="error" onClose={() => setError("")}>{error}</Alert>}

        {/* Delete confirmation dialog */}
        <Dialog open={Boolean(confirmId)} onClose={() => setConfirmId(null)}>
          <DialogTitle>Delete Q&amp;A?</DialogTitle>
          <DialogContent>
            <DialogContentText>
              This action can’t be undone. The selected Q&amp;A will be permanently removed.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmId(null)}>Cancel</Button>
            <Button color="error" variant="contained" onClick={handleDelete} startIcon={<DeleteIcon />}>
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar feedback */}
        <Snackbar
          open={snack.open}
          autoHideDuration={3000}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            elevation={6}
            variant="filled"
            severity={snack.severity}
            onClose={() => setSnack((s) => ({ ...s, open: false }))}
          >
            {snack.message}
          </Alert>
        </Snackbar>
      </Stack>
    </Container>
  );
};

export default ProjectLearning;
