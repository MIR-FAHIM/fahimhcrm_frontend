import {
  Box,
  Button,
  TextField,
  Typography,
  List,
  IconButton,
  Tooltip,
  Link as MUILink,
  Grid,
  Divider,
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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import LinkIcon from "@mui/icons-material/Link";
import FilterListIcon from "@mui/icons-material/FilterList";

import { useEffect, useMemo, useRef, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

import {
  addWorkShop,
  getAllWorkShopProject,
  deleteWorkShop,
} from "../../../../api/controller/admin_controller/task_controller/task_controller";

// --- helpers -----------------------------------------------------------------
const isValidHttpUrl = (value) => {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

// strip HTML to validate “empty” rich text (e.g., <p><br></p>)
const stripHtml = (html = "") =>
  html.replace(/<[^>]*>/g, "").replace(/&nbsp;|&#160;/g, " ").trim();

const formatDateTime = (value) => {
  try {
    return new Date(value).toLocaleString();
  } catch {
    return "";
  }
};

const EmptyState = ({ title, subtitle }) => (
  <Box textAlign="center" py={6} px={2} color="text.secondary">
    <Typography variant="h6" gutterBottom>
      {title}
    </Typography>
    <Typography variant="body2">{subtitle}</Typography>
  </Box>
);

// Quill toolbar & formats
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
const WorkShop = ({ protId }) => {
  const userID =
    typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  // form state
  const [formData, setFormData] = useState({
    title: "",
    notice: "", // HTML
    url: "",
    type: "note",
  });
  const [touched, setTouched] = useState({});

  // data state
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // ui state
  const [expandedId, setExpandedId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // filters
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortKey, setSortKey] = useState("updated_at_desc");

  const quillRef = useRef(null);

  useEffect(() => {
    loadItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [protId]);

  const loadItems = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getAllWorkShopProject(protId);
      if (res?.status === "success" && Array.isArray(res.data)) {
        setItems(res.data);
      } else {
        setError("Failed to load items.");
      }
    } catch {
      setError("Network or server error while loading items.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleNoticeChange = (html) => {
    setFormData((p) => ({ ...p, notice: html }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) errs.title = "Title is required";
    if (!stripHtml(formData.notice)) errs.notice = "Content is required";
    if (!isValidHttpUrl(formData.url)) errs.url = "Must be a valid http/https URL";
    return errs;
  };

  const errors = useMemo(validate, [formData]);
  const hasErrors = Object.keys(errors).length > 0;

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    setTouched({ title: true, notice: true, url: true });
    if (hasErrors) return;

    const fd = new FormData();
    fd.append("title", formData.title.trim());
    fd.append("content", formData.notice); // HTML
    fd.append("url", (formData.url || "").trim());
    fd.append("created_by", userID ?? "");
    fd.append("status", "1");
    fd.append("type", formData.type || "note");
    fd.append("is_active", "1");
    fd.append("project_id", String(protId ?? ""));

    setSaving(true);
    try {
      const res = await addWorkShop(fd);
      if (res?.status === "success") {
        setSnack({ open: true, message: "Saved.", severity: "success" });
        setFormData({ title: "", notice: "", url: "", type: "note" });
        setTouched({});
        // Optional: focus title after save
        setTimeout(() => {
          const el = document.querySelector('input[name="title"]');
          if (el) el.focus();
        }, 0);
        await loadItems();
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
        await loadItems();
      } else {
        setSnack({ open: true, message: "Delete failed.", severity: "error" });
      }
    } catch {
      setSnack({ open: true, message: "Delete failed.", severity: "error" });
    }
  };

  // filtered + sorted
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = items;
    if (typeFilter !== "all")
      list = list.filter((x) => (x?.type || "note") === typeFilter);
    if (q) {
      list = list.filter((n) =>
        [n?.title, n?.content, n?.url]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q))
      );
    }
    const sorter =
      {
        updated_at_desc: (a, b) =>
          new Date(b.updated_at || 0) - new Date(a.updated_at || 0),
        created_at_desc: (a, b) =>
          new Date(b.created_at || 0) - new Date(a.created_at || 0),
        title_asc: (a, b) =>
          String(a.title || "").localeCompare(String(b.title || "")),
      }[sortKey] || null;
    return sorter ? [...list].sort(sorter) : list;
  }, [query, items, typeFilter, sortKey]);

  const typeCounts = useMemo(() => {
    const counts = items.reduce((acc, cur) => {
      const t = cur?.type || "note";
      acc[t] = (acc[t] || 0) + 1;
      return acc;
    }, {});
    const all = items.length;
    return { ...counts, all };
  }, [items]);

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
      <Stack spacing={3}>
        {/* Header */}
        <Box>
          <Typography variant="h4" fontWeight={800} gutterBottom>
            Project Workshop
          </Typography>
          <Typography variant="body1" color="text.secondary">
            A focused hub for important notes, reference links, and other essentials.
          </Typography>
        </Box>

        {/* Create card */}
        <Card variant="outlined" sx={{ borderRadius: 3, overflow: "visible" }}>
          <CardHeader
            title={<Typography variant="h6" fontWeight={700}>Add an item</Typography>}
            subheader="Classify by type for easier filtering. URLs are optional."
          />
          <CardContent
            sx={{
              overflow: "visible",
              ".ql-toolbar": { position: "relative", zIndex: 10 },
              ".ql-tooltip, .ql-picker-options": { zIndex: 1300 },
            }}
          >
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Title"
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
                <Grid item xs={12} md={6}>
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

                {/* Rich text content */}
                <Grid item xs={12} md={9}>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    sx={{ mb: 0.5 }}
                  >
                    Content
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
                      style={{ minHeight: 160 }}
                    />
                  </Box>
                  {touched.notice && errors.notice && (
                    <Typography
                      variant="caption"
                      color="error"
                      sx={{ mt: 0.5, display: "block" }}
                    >
                      {errors.notice}
                    </Typography>
                  )}
                </Grid>

                <Grid item xs={12} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="type-label">Type</InputLabel>
                    <Select
                      labelId="type-label"
                      label="Type"
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                    >
                      <MenuItem value="note">Note</MenuItem>
                      <MenuItem value="link">Link</MenuItem>
                      <MenuItem value="decision">Decision</MenuItem>
                      <MenuItem value="risk">Risk</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
          <CardActions sx={{ p: 2, pt: 0, justifyContent: "space-between" }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip label={`Total: ${items.length}`} variant="outlined" />
              {protId && <Chip label={`Project #${protId}`} size="small" />}
            </Stack>
            <Button
              onClick={handleSubmit}
              variant="contained"
              startIcon={<AddIcon />}
              disabled={saving}
            >
              {saving ? "Saving…" : "Save"}
            </Button>
          </CardActions>
          {saving && <LinearProgress />}
        </Card>

        {/* Filters */}
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={5}>
                <TextField
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search title, content, or URL"
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
              <Grid item xs={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel id="type-filter">Type</InputLabel>
                  <Select
                    labelId="type-filter"
                    label="Type"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    startAdornment={
                      <InputAdornment position="start">
                        <FilterListIcon fontSize="small" />
                      </InputAdornment>
                    }
                  >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="note">Notes ({items.filter(i=> (i?.type||"note")==="note").length})</MenuItem>
                    <MenuItem value="link">Links ({items.filter(i=> (i?.type||"note")==="link").length})</MenuItem>
                    <MenuItem value="decision">Decisions ({items.filter(i=> (i?.type||"note")==="decision").length})</MenuItem>
                    <MenuItem value="risk">Risks ({items.filter(i=> (i?.type||"note")==="risk").length})</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel id="sort-key">Sort by</InputLabel>
                  <Select
                    labelId="sort-key"
                    label="Sort by"
                    value={sortKey}
                    onChange={(e) => setSortKey(e.target.value)}
                  >
                    <MenuItem value="updated_at_desc">Updated (newest)</MenuItem>
                    <MenuItem value="created_at_desc">Created (newest)</MenuItem>
                    <MenuItem value="title_asc">Title (A→Z)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* List */}
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          {loading && (
            <Box px={2} pt={2}>
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
            <EmptyState
              title="Nothing here yet"
              subtitle="Add your first item or adjust filters."
            />
          )}

          {!loading && filtered.length > 0 && (
            <List disablePadding>
              {filtered.map((item, idx) => (
                <Box key={item.id ?? idx}>
                  <Accordion
                    expanded={expandedId === item.id}
                    onChange={() =>
                      setExpandedId(expandedId === item.id ? null : item.id)
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
                        <Chip
                          size="small"
                          label={(item?.type || "note").toUpperCase()}
                          variant="outlined"
                        />
                        <Typography
                          variant="subtitle1"
                          fontWeight={700}
                          sx={{ flexGrow: 1 }}
                        >
                          {item?.title || "Untitled"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item?.updated_at
                            ? `Updated ${formatDateTime(item.updated_at)}`
                            : item?.created_at
                            ? `Created ${formatDateTime(item.created_at)}`
                            : null}
                        </Typography>
                        {item?.url && (
                          <Chip
                            label="Open"
                            size="small"
                            icon={<OpenInNewIcon fontSize="small" />}
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(
                                item.url,
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
                        Content
                      </Typography>

                      {/* Render HTML safely */}
                      <Box
                        sx={{
                          mt: 1,
                          "& img": { maxWidth: "100%", height: "auto" },
                          "& pre, & code": {
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                          },
                        }}
                        dangerouslySetInnerHTML={{
                          __html: item?.content || "",
                        }}
                      />

                      {item?.url && (
                        <MUILink
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            mt: 2,
                          }}
                        >
                          <OpenInNewIcon
                            fontSize="small"
                            style={{ marginRight: 6 }}
                          />
                          Reference Link
                        </MUILink>
                      )}

                      <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
                        <Tooltip title="Delete">
                          <IconButton
                            onClick={() => askDelete(item.id)}
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
            </List>
          )}
        </Card>

        {error && (
          <Alert severity="error" onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        {/* Delete confirmation */}
        <Dialog
          open={Boolean(confirmId)}
          onClose={() => setConfirmId(null)}
        >
          <DialogTitle>Delete item?</DialogTitle>
          <DialogContent>
            <DialogContentText>
              This cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmId(null)}>Cancel</Button>
            <Button
              color="error"
              variant="contained"
              startIcon={<DeleteIcon />}
              onClick={handleDelete}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
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

export default WorkShop;
