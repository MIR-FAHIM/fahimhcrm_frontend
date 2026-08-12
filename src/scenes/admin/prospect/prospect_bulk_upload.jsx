import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  Paper,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  CheckCircleRounded,
  CloseRounded,
  CloudUploadRounded,
  DownloadRounded,
  ErrorOutlineRounded,
  HistoryRounded,
  InfoRounded,
  PreviewRounded,
  VisibilityRounded,
} from "@mui/icons-material";

import {
  confirmProspectBulkImport,
  downloadProspectBulkTemplate,
  getProspectBulkDetails,
  getProspectBulkHistory,
  previewProspectBulkImport,
} from "../../../api/controller/admin_controller/prospect_controller";

const instructionItems = [
  "Upload .xlsx or .csv file.",
  "First row must contain column headers.",
  "One row creates or updates one prospect.",
  "Minimum recommended columns are prospect_name, contact_person_name, contact_mobile, and contact_email.",
  "Contact person columns are optional.",
  "For multiple contact persons under the same prospect, repeat the same prospect_name in multiple rows.",
  "Existing prospects are matched by prospect_name and updated.",
  "Contact persons are skipped if contact_email already exists.",
  "IDs such as industry_type_id, interested_for_id, information_source_id, stage_id, priority_id, contact_designation_id, influencing_role_id, and attitude_id must already exist in backend when used.",
  "Backend now handles prospect type, client state, location fields, and default contact flags automatically.",
  "After upload, review preview errors and warnings before confirming import.",
];

const supportedColumns = [
  "prospect_key",
  "prospect_name",
  "industry_type_id",
  "interested_for_id",
  "information_source_id",
  "website_link",
  "facebook_page",
  "linkedin",
  "latitude",
  "longitude",
  "address",
  "note",
  "is_active",
  "is_opportunity",
  "status",
  "stage_id",
  "priority_id",
  "last_activity",
  "contact_person_name",
  "contact_designation_id",
  "contact_mobile",
  "contact_email",
  "contact_note",
  "influencing_role_id",
  "birth_date",
  "anniversary",
  "is_switched_job",
  "attitude_id",
];

const exampleColumns = [
  "prospect_name",
  "website_link",
  "address",
  "note",
  "status",
  "contact_person_name",
  "contact_mobile",
  "contact_email",
];

const exampleRow = [
  "ABC Company",
  "https://abc.com",
  "Dhaka",
  "Imported prospect",
  "new",
  "Mr. Rahim",
  "017xxxxxxxx",
  "rahim@example.com",
];

const pick = (source = {}, keys = [], fallback = 0) => {
  for (const key of keys) {
    if (source?.[key] !== undefined && source?.[key] !== null) return source[key];
  }
  return fallback;
};

const extractList = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.data?.history)) return response.data.history;
  if (Array.isArray(response?.data?.imports)) return response.data.imports;
  if (Array.isArray(response?.history)) return response.history;
  if (Array.isArray(response?.imports)) return response.imports;
  return [];
};

const extractDetails = (response) => response?.data || response || {};

const extractRows = (details) => {
  if (Array.isArray(details?.rows)) return details.rows;
  if (Array.isArray(details?.data?.rows)) return details.data.rows;
  if (Array.isArray(details?.details)) return details.details;
  return [];
};

const flattenMessages = (value) => {
  if (!value) return "None";
  if (Array.isArray(value)) return value.filter(Boolean).join(", ") || "None";
  if (typeof value === "object") {
    return Object.values(value).flat().filter(Boolean).join(", ") || "None";
  }
  return String(value);
};

const formatFileSize = (size = 0) => {
  if (!size) return "0 KB";
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
};

const formatDate = (value) => {
  if (!value) return "N/A";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString();
};

const getCurrentUserId = () => {
  const directId = localStorage.getItem("userId");
  if (directId) return directId;
  const storedUser = localStorage.getItem("loggedInUser") || localStorage.getItem("user");
  try {
    return storedUser ? JSON.parse(storedUser)?.id : null;
  } catch {
    return null;
  }
};

const statusColor = (status = "") => {
  const value = String(status).toLowerCase();
  if (["valid", "success", "completed", "imported"].includes(value)) return "success";
  if (["warning", "warnings", "partial"].includes(value)) return "warning";
  if (["failed", "error", "rejected"].includes(value)) return "error";
  if (["processing", "pending", "previewed"].includes(value)) return "info";
  return "default";
};

const summaryCards = (summary = {}) => [
  ["Total rows", pick(summary, ["total_rows", "total", "rows_count"])],
  ["Valid rows", pick(summary, ["valid_rows", "valid"])],
  ["Warning rows", pick(summary, ["warning_rows", "warnings", "warning"])],
  ["Failed rows", pick(summary, ["failed_rows", "failed"])],
  ["New prospects", pick(summary, ["new_prospects", "created_prospects", "new"])],
  ["Existing prospects", pick(summary, ["existing_prospects", "updated_prospects", "existing"])],
  ["Contacts to add", pick(summary, ["contacts_to_add", "new_contacts"])],
  ["Contacts to skip", pick(summary, ["contacts_to_skip", "skipped_contacts"])],
];

const PreviewRowsTable = ({ rows }) => (
  <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 520 }}>
    <Table stickyHeader size="small">
      <TableHead>
        <TableRow>
          <TableCell>Row Number</TableCell>
          <TableCell>Prospect Name</TableCell>
          <TableCell>Contact Name</TableCell>
          <TableCell>Contact Email</TableCell>
          <TableCell>Status</TableCell>
          <TableCell>Errors</TableCell>
          <TableCell>Warnings</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.length ? (
          rows.map((row, index) => (
            <TableRow key={`${row.row_number || index}-${row.raw_data?.prospect_name || index}`} hover>
              <TableCell>{row.row_number || index + 1}</TableCell>
              <TableCell>{row.raw_data?.prospect_name || "N/A"}</TableCell>
              <TableCell>{row.raw_data?.contact_person_name || "N/A"}</TableCell>
              <TableCell>{row.raw_data?.contact_email || "N/A"}</TableCell>
              <TableCell>
                <Chip size="small" color={statusColor(row.status)} label={row.status || "unknown"} />
              </TableCell>
              <TableCell sx={{ minWidth: 220 }}>{flattenMessages(row.errors)}</TableCell>
              <TableCell sx={{ minWidth: 220 }}>{flattenMessages(row.warnings)}</TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={7} align="center">
              No rows found.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  </TableContainer>
);

const ProspectBulkUpload = () => {
  const theme = useTheme();
  const fileInputRef = useRef(null);
  const brand = theme.palette.blueAccent?.main || theme.palette.primary.main;

  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState(null);
  const [history, setHistory] = useState([]);
  const [details, setDetails] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [confirmedImports, setConfirmedImports] = useState(() => new Set());
  const [snackbar, setSnackbar] = useState({ open: false, severity: "success", message: "" });

  const previewRows = useMemo(() => preview?.rows || preview?.data?.rows || [], [preview]);
  const previewSummary = useMemo(() => preview?.summary || preview?.data?.summary || {}, [preview]);
  const previewImportId = preview?.import_id || preview?.data?.import_id;
  const rowStatusCounts = useMemo(
    () =>
      previewRows.reduce(
        (counts, row) => {
          const status = String(row.status || "").toLowerCase();
          if (status === "valid") counts.valid += 1;
          if (status === "warning") counts.warning += 1;
          if (status === "failed") counts.failed += 1;
          return counts;
        },
        { valid: 0, warning: 0, failed: 0 }
      ),
    [previewRows]
  );
  const validCount = Number(pick(previewSummary, ["valid_rows", "valid"], rowStatusCounts.valid));
  const warningCount = Number(pick(previewSummary, ["warning_rows", "warnings", "warning"], rowStatusCounts.warning));
  const failedCount = Number(pick(previewSummary, ["failed_rows", "failed"], rowStatusCounts.failed));
  const canConfirm = Boolean(previewImportId) && !confirmedImports.has(previewImportId) && (validCount + warningCount > 0 || failedCount < previewRows.length);

  const showMessage = useCallback((severity, message) => {
    setSnackbar({ open: true, severity, message });
  }, []);

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const response = await getProspectBulkHistory();
      setHistory(extractList(response));
    } catch (error) {
      showMessage("error", error.message || "Failed to fetch prospect import history.");
    } finally {
      setHistoryLoading(false);
    }
  }, [showMessage]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const setSelectedFile = (selectedFile) => {
    if (!selectedFile) return;
    const lowerName = selectedFile.name.toLowerCase();
    if (!lowerName.endsWith(".xlsx") && !lowerName.endsWith(".csv")) {
      showMessage("error", "Please select a .xlsx or .csv file.");
      return;
    }
    setFile(selectedFile);
    setPreview(null);
  };

  const handleDownloadTemplate = async () => {
    setDownloadLoading(true);
    try {
      const { blob, fileName } = await downloadProspectBulkTemplate();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showMessage("success", "Template downloaded.");
    } catch (error) {
      showMessage("error", error.message || "Failed to download template.");
    } finally {
      setDownloadLoading(false);
    }
  };

  const handlePreview = async () => {
    if (!file) {
      showMessage("error", "Please select a file first.");
      return;
    }
    setPreviewLoading(true);
    try {
      const response = await previewProspectBulkImport(file, getCurrentUserId());
      setPreview(response);
      showMessage(response?.status === "error" ? "error" : "success", response?.message || "Preview generated.");
    } catch (error) {
      showMessage("error", error.message || "Failed to preview import.");
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!previewImportId) return;
    setConfirmLoading(true);
    try {
      const response = await confirmProspectBulkImport(previewImportId);
      setConfirmedImports((current) => new Set(current).add(previewImportId));
      showMessage("success", response?.message || "Prospect import confirmed.");
      await loadHistory();
    } catch (error) {
      showMessage("error", error.message || "Failed to confirm import.");
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleViewDetails = async (id) => {
    setDetailsOpen(true);
    setDetailsLoading(true);
    setDetails(null);
    try {
      const response = await getProspectBulkDetails(id);
      setDetails(extractDetails(response));
    } catch (error) {
      showMessage("error", error.message || "Failed to fetch import details.");
    } finally {
      setDetailsLoading(false);
    }
  };

  const summarySx = {
    border: `1px solid ${alpha(brand, theme.palette.mode === "dark" ? 0.22 : 0.14)}`,
    bgcolor: alpha(brand, theme.palette.mode === "dark" ? 0.08 : 0.04),
    borderRadius: 2,
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1500, mx: "auto" }}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>
            Prospect Bulk Upload
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Download a template, preview validation results, then confirm clean prospect imports.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={downloadLoading ? <CircularProgress size={18} color="inherit" /> : <DownloadRounded />}
          onClick={handleDownloadTemplate}
          disabled={downloadLoading}
          sx={{ alignSelf: { xs: "stretch", md: "center" }, textTransform: "none", fontWeight: 800 }}
        >
          Download Template
        </Button>
      </Stack>

      <Grid container spacing={2.5}>
        <Grid item xs={12} lg={5}>
          <Card variant="outlined" sx={{ height: "100%" }}>
            <CardContent>
              <Stack direction="row" spacing={1.2} alignItems="center" sx={{ mb: 1.5 }}>
                <InfoRounded color="primary" />
                <Typography variant="h6" fontWeight={800}>
                  Import Instructions
                </Typography>
              </Stack>
              <Stack spacing={1}>
                {instructionItems.map((item) => (
                  <Stack key={item} direction="row" spacing={1} alignItems="flex-start">
                    <CheckCircleRounded sx={{ fontSize: 17, mt: "2px", color: brand }} />
                    <Typography variant="body2" color="text.secondary">
                      {item}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
              <Alert severity="info" sx={{ mt: 2 }}>
                Boolean values must use 1 for Yes/True and 0 for No/False only for is_active, is_opportunity, and is_switched_job.
              </Alert>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={7}>
          <Card variant="outlined" sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" fontWeight={800} sx={{ mb: 1.5 }}>
                Example File Structure
              </Typography>
              <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 260 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      {exampleColumns.map((column) => (
                        <TableCell key={column} sx={{ whiteSpace: "nowrap", fontWeight: 800 }}>
                          {column}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow hover>
                      {exampleRow.map((value, index) => (
                        <TableCell key={`${value}-${index}`} sx={{ whiteSpace: "nowrap" }}>
                          {value}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>
                Supported Columns
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={1}>
                {supportedColumns.map((column) => (
                  <Chip key={column} size="small" variant="outlined" label={column} />
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card variant="outlined" sx={{ mt: 2.5 }}>
        <CardContent>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="stretch">
            <Paper
              variant="outlined"
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(event) => {
                event.preventDefault();
                setIsDragging(false);
                setSelectedFile(event.dataTransfer.files?.[0]);
              }}
              sx={{
                flex: 1,
                minHeight: 170,
                p: 3,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                borderStyle: "dashed",
                borderColor: isDragging ? brand : theme.palette.divider,
                bgcolor: isDragging ? alpha(brand, 0.08) : alpha(theme.palette.background.paper, 0.6),
                cursor: "pointer",
                transition: "0.2s ease",
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                hidden
                accept=".xlsx,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
                onChange={(event) => setSelectedFile(event.target.files?.[0])}
              />
              <Stack spacing={1} alignItems="center">
                <CloudUploadRounded sx={{ fontSize: 46, color: brand }} />
                <Typography fontWeight={800}>Drop your prospect file here or click to browse</Typography>
                <Typography variant="body2" color="text.secondary">
                  Accepted file types: .xlsx and .csv
                </Typography>
                {file && (
                  <Chip
                    color="primary"
                    variant="outlined"
                    label={`${file.name} - ${formatFileSize(file.size)}`}
                    sx={{ maxWidth: "100%" }}
                  />
                )}
              </Stack>
            </Paper>

            <Stack spacing={1.5} sx={{ width: { xs: "100%", md: 260 }, justifyContent: "center" }}>
              <Button
                variant="contained"
                size="large"
                startIcon={previewLoading ? <CircularProgress size={18} color="inherit" /> : <PreviewRounded />}
                onClick={handlePreview}
                disabled={!file || previewLoading}
                sx={{ textTransform: "none", fontWeight: 800 }}
              >
                Preview Import
              </Button>
              <Button
                variant="outlined"
                startIcon={<HistoryRounded />}
                onClick={loadHistory}
                disabled={historyLoading}
                sx={{ textTransform: "none", fontWeight: 800 }}
              >
                Refresh History
              </Button>
              <Typography variant="caption" color="text.secondary">
                Preview creates a temporary import. Confirm only after checking row errors and warnings.
              </Typography>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {preview && (
        <Card variant="outlined" sx={{ mt: 2.5 }}>
          {previewLoading && <LinearProgress />}
          <CardContent>
            <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1.5} sx={{ mb: 2 }}>
              <Box>
                <Typography variant="h6" fontWeight={800}>
                  Preview Result
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {preview.message || "Review rows before confirming this import."}
                </Typography>
              </Box>
              {previewImportId && (
                <Button
                  variant="contained"
                  color="success"
                  onClick={handleConfirm}
                  disabled={!canConfirm || confirmLoading}
                  startIcon={confirmLoading ? <CircularProgress size={18} color="inherit" /> : <CheckCircleRounded />}
                  sx={{ textTransform: "none", fontWeight: 800 }}
                >
                  {confirmedImports.has(previewImportId) ? "Import Confirmed" : "Confirm Import"}
                </Button>
              )}
            </Stack>

            <Grid container spacing={1.5} sx={{ mb: 2 }}>
              {summaryCards(previewSummary).map(([label, value]) => (
                <Grid item xs={6} sm={4} md={3} lg={1.5} key={label}>
                  <Paper variant="outlined" sx={{ ...summarySx, p: 1.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      {label}
                    </Typography>
                    <Typography variant="h6" fontWeight={900}>
                      {value}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            {!canConfirm && previewImportId && !confirmedImports.has(previewImportId) && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                Confirm import is disabled because there are no valid or warning rows to import.
              </Alert>
            )}

            <PreviewRowsTable rows={previewRows} />
          </CardContent>
        </Card>
      )}

      <Card variant="outlined" sx={{ mt: 2.5 }}>
        {historyLoading && <LinearProgress />}
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
            <Box>
              <Typography variant="h6" fontWeight={800}>
                Import History
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Latest prospect upload previews and confirmed imports.
              </Typography>
            </Box>
          </Stack>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>File name</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Total rows</TableCell>
                  <TableCell>Valid</TableCell>
                  <TableCell>Warnings</TableCell>
                  <TableCell>Failed</TableCell>
                  <TableCell>Imported</TableCell>
                  <TableCell>Skipped</TableCell>
                  <TableCell>Created at</TableCell>
                  <TableCell align="right">View</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {history.length ? (
                  history.map((item) => (
                    <TableRow key={item.id} hover>
                      <TableCell>{item.id}</TableCell>
                      <TableCell>{item.file_name || item.filename || "N/A"}</TableCell>
                      <TableCell>
                        <Chip size="small" color={statusColor(item.status)} label={item.status || "N/A"} />
                      </TableCell>
                      <TableCell>{pick(item, ["total_rows", "total"])}</TableCell>
                      <TableCell>{pick(item, ["valid_rows", "valid"])}</TableCell>
                      <TableCell>{pick(item, ["warning_rows", "warnings", "warning"])}</TableCell>
                      <TableCell>{pick(item, ["failed_rows", "failed"])}</TableCell>
                      <TableCell>{pick(item, ["imported_rows", "imported"])}</TableCell>
                      <TableCell>{pick(item, ["skipped_rows", "skipped"])}</TableCell>
                      <TableCell>{formatDate(item.created_at)}</TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => handleViewDetails(item.id)}>
                          <VisibilityRounded fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={11} align="center" sx={{ py: 4 }}>
                      <ErrorOutlineRounded sx={{ color: "text.secondary", mb: 1 }} />
                      <Typography color="text.secondary">No import history found.</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h6" fontWeight={800}>
              Import Details
            </Typography>
            <IconButton onClick={() => setDetailsOpen(false)}>
              <CloseRounded />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          {detailsLoading ? (
            <Stack alignItems="center" spacing={1.5} sx={{ py: 5 }}>
              <CircularProgress />
              <Typography color="text.secondary">Loading import details...</Typography>
            </Stack>
          ) : details ? (
            <Stack spacing={2}>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Chip label={`ID: ${details.id || details.import_id || "N/A"}`} />
                <Chip color={statusColor(details.status)} label={details.status || "N/A"} />
                <Chip label={`Created: ${formatDate(details.created_at)}`} />
              </Stack>
              <Divider />
              <Grid container spacing={1.5}>
                {summaryCards(details.summary || details).map(([label, value]) => (
                  <Grid item xs={6} sm={4} md={3} key={label}>
                    <Paper variant="outlined" sx={{ p: 1.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        {label}
                      </Typography>
                      <Typography fontWeight={900}>{value}</Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
              <PreviewRowsTable rows={extractRows(details)} />
            </Stack>
          ) : (
            <Alert severity="warning">No details found for this import.</Alert>
          )}
        </DialogContent>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={() => setSnackbar((current) => ({ ...current, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={() => setSnackbar((current) => ({ ...current, open: false }))}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProspectBulkUpload;
