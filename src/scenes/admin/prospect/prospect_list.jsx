import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Typography,
  Paper,
  TextField,
  Tooltip,
} from "@mui/material";
import dayjs from "dayjs";
import {
  Call,
  Message,
  LocationOn,
  Email,
  AssignmentTurnedIn,
} from "@mui/icons-material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import opportunity from "../../../assets/images/opportunity.png";
import {
  fetchAllProspect,
  getAllProspectStageOverview,
} from "../../../api/controller/admin_controller/prospect_controller";
import { themeSettings } from "../../../theme";

const ProspectListPage = () => {
  const navigate = useNavigate();

  const [prospects, setProspects] = useState([]);
  const [prospectAllStages, setProspectAllStage] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStageId, setSelectedStageId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const goProspectListStage = () => {
    navigate("/prospect-list-by-stage");
  };

  useEffect(() => {
    fetchAllProspect()
      .then((response) => {
        if (response.status === "success") {
          setProspects(response.data);
        } else {
          setError("Failed to fetch prospects");
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Error fetching data");
        setLoading(false);
      });

    getAllProspectStageOverview()
      .then((response) => {
        if (response.status === "success") {
          setProspectAllStage(response.data);
        } else {
          setError("Failed to fetch stages");
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Error fetching stage overview");
        setLoading(false);
      });
  }, []);

  const handleViewProspectDetails = (id) => {
    navigate(`/prospect-detail/${id}`);
  };

  const handleAddProspect = () => {
    navigate("/add-prospect");
  };

  const handleStageFilter = (stageId) => {
    setSelectedStageId((prev) => (prev === stageId ? null : stageId));
  };

  const filteredProspects = selectedStageId
    ? prospects.filter((p) => p.stage_id === selectedStageId)
    : prospects;

  const columns = [
    {
      field: "id",
      headerName: "ID",
      flex: 0.3,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <Box sx={{ p: 2 }}>
          <Typography fontWeight={600}>{params.value}</Typography>
  
          {params.row.is_opportunity === 1 && (
              <img
                src={opportunity} // Replace with actual image path
                alt="Opportunity"
                style={{ height: 24 }} // adjust size as needed
              />
            )}
        </Box>
      )
    },
    {
      field: "prospectInfo",
      headerName: "Prospect Info",
      flex: 2,
      renderCell: (params) => (
        <Box sx={{ p: 2 }}>
          <Typography fontWeight={600}>{params.row.prospect_name}</Typography>
          <Typography variant="body2" color="text.secondary">{params.row.address}</Typography>
          {params.row.website_link && (
            <Typography variant="body2" color="primary">
              <a
                href={params.row.website_link}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#1a0dab', textDecoration: 'underline' }}
              >
                {params.row.website_link}
              </a>
            </Typography>
          )}
        </Box>
      )
    },
    {
      field: "stage_name",
      headerName: "Stage",
      flex: 1.5,
      valueGetter: (params) => params.row.stage?.stage_name || "N/A",
      renderCell: (params) => (
        <Box
        sx={{
          backgroundColor: params.row.stage?.color_code || "transparent",
          width: "100%",
          p: 2,
          borderRadius: 1,
        }}
      >
        <Typography variant="body7" fontWeight={500}>{params.value}</Typography>
      </Box>
      )
    },
    {
      field: "industry_source_zone",
      headerName: "Industry / Source / Zone",
      flex: 2,
      renderCell: (params) => {
        const industry = params.row.industry_type?.industry_type_name || "N/A";
        const source = params.row.information_source?.information_source_name || "N/A";
        const zone = params.row.zone?.zone_name || "N/A";
        const product = params.row.interested_for?.product_name || "N/A";

        return (
          <Box display="flex" flexDirection="column" fontSize="0.9em" sx={{ p: 2 }}>
            <Typography><strong>Industry:</strong> {industry}</Typography>
            <Typography><strong>Source:</strong> {source}</Typography>
            <Typography><strong>Zone:</strong> {zone}</Typography>
            <Typography><strong>Interested On:</strong> {product}</Typography>
          </Box>
        );
      }
    },
    {
      field: "concernPersons",
      headerName: "Contact Persons",
      flex: 2.5,
      renderCell: (params) => {
        const persons = params.row.concern_persons || [];
        const firstPerson = persons[0];

        const tooltipContent = (
          <Box>
            {persons.map((p, i) => (
              <Typography key={i} fontSize="1.5em" py={0.5}>
                {p.person_name} ({p.mobile})
              </Typography>
            ))}
          </Box>
        );

        return (
          <Tooltip
            title={tooltipContent}
            placement="top-start"
            arrow
            enterDelay={300}
          >
            <Box sx={{ p: 2 }}>
              <Typography fontWeight={500} sx={{ cursor: 'pointer' }}>
                {firstPerson?.person_name} ({firstPerson?.mobile})
                {persons.length > 1 && (
                  <Typography variant="caption" color="text.secondary" ml={1}>
                    +{persons.length - 1} more
                  </Typography>
                )}
              </Typography>
            </Box>
          </Tooltip>
        );
      }
    },
    {
      field: "followup_activity",
      headerName: "Followup Activity",
      flex: 2.2,
      renderCell: (params) => {
        const { call = 0, whatsapp = 0, visit = 0, email = 0, task = 0 } = params.row.activity_summary || {};

        const activityItems = [
          { icon: <Call fontSize="small" color="primary" />, label: call, tooltip: "Calls" },
          { icon: <Message fontSize="small" color="primary" />, label: whatsapp, tooltip: "Messages" },
          { icon: <LocationOn fontSize="small" color="primary" />, label: visit, tooltip: "Visits" },
          { icon: <Email fontSize="small" color="primary" />, label: email, tooltip: "Emails" },
          { icon: <AssignmentTurnedIn fontSize="small" color="primary" />, label: task, tooltip: "Tasks" },
        ];

        return (
          <Box display="flex" gap={1} sx={{ p: 2 }}>
            {activityItems.map((item, i) => (
              <Tooltip title={`${item.tooltip}: ${item.label}`} key={i}>
                <Box display="flex" alignItems="center" gap={0.5}>
                  {item.icon}
                  <Typography variant="body2">{item.label}</Typography>
                </Box>
              </Tooltip>
            ))}
          </Box>
        );
      }
    },
    {
      field: "activity_date",
      headerName: "Activity Dates",
      flex: 2,
      renderCell: (params) => {
        return (
          <Box fontSize="0.9em" sx={{ p: 2 }}>
            <Typography><strong>Last:</strong> {dayjs(params.row.last_activity).format("MMM D, YYYY")}</Typography>
            <Typography><strong>Next:</strong> {dayjs(params.row.next_activity).format("MMM D, YYYY")}</Typography>
          </Box>
        );
      }
    },
    {
      field: "view_details",
      headerName: "Actions",
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ p: 2 }}>
          <Button
            variant="contained"
            color="primary"
            sx={{
              borderRadius: 20,
              textTransform: "none",
              fontSize: "14px",
              fontWeight: "bold",
              px: 2
            }}
            onClick={() => handleViewProspectDetails(params.row.id)}
          >
            View Details
          </Button>
        </Box>
      )
    }
  ];

  const getRowClassName = (params) => {
    return params.row.stage?.color_code ? `status-${params.row.stage.color_code.replace('#', '')}` : '';
  };

  if (loading) return <Typography variant="h6" color="primary">Loading...</Typography>;
  if (error) return <Typography variant="h6" color="error">{error}</Typography>;

  return (
    <Box sx={{ p: 4, backgroundColor: "#f3f4f6", minHeight: "100vh" }}>
      <Box
        display="flex"
        alignItems="center"
        flexWrap="wrap"
        gap={2}
        mb={4}
      >
        <Typography variant="h5" fontWeight={700}>
          🧭 Leads
        </Typography>

        <Button variant="contained" color="primary" onClick={handleAddProspect}>
          ➕ Add Prospect
        </Button>

        <Button variant="outlined" color="secondary" onClick={() => window.location.reload()}>
          🔄 Refresh
        </Button>

        <Button variant="contained" color="info" onClick={goProspectListStage}>
          📊 Stage View
        </Button>
      </Box>
      <Paper sx={{ p: 2, mb: 4 }}>
        <Box display="flex" gap={2} overflow="auto">
          {prospectAllStages.map((label, index) => {
            const isSelected = selectedStageId === label.id;
            return (
              <Box
                key={index}
                textAlign="center"
                minWidth={100}
                sx={{
                  cursor: "pointer",
                  px: 2,
                  py: 1.5,
                  borderRadius: 2,
                  border: `2px solid ${isSelected ? "#3b82f6" : "#e0e0e0"}`,
                  backgroundColor: isSelected ? "#dbeafe" : label.color_code,
                  boxShadow: isSelected ? 3 : 1,
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    boxShadow: 3,
                    borderColor: "#3b82f6",
                  },
                }}
                onClick={() => handleStageFilter(label.id)}
              >
                <Typography variant="h6" color={isSelected ? "primary" : "textPrimary"}>
                  {label.prospects_count}
                </Typography>
                <Typography variant="caption" color="textSecondary">{label.stage_name}</Typography>
              </Box>
            );
          })}
        </Box>

        <TextField size="small" placeholder="Search all prospects" sx={{ width: 300, mt: 2 }} />
      </Paper>

      <Box
        mt={3}
        height="75vh"
        sx={{
          borderRadius: "10px",
          overflow: "hidden",
          boxShadow: 2,
          "& .MuiDataGrid-root": { border: "none" },
          "& .MuiDataGrid-cell": { borderBottom: "1px solid rgba(224, 224, 224, 1)" },
          "& .MuiDataGrid-columnHeaders": { backgroundColor: "#e5e7eb", fontSize: "16px", fontWeight: "bold" },
          "& .MuiDataGrid-virtualScroller": { backgroundColor: "#f9fafb" },
          "& .MuiDataGrid-footerContainer": { backgroundColor: "#e5e7eb", borderTop: "1px solid rgba(224, 224, 224, 1)" },
        }}
      >
        <DataGrid
          rows={filteredProspects}
          columns={columns}
          components={{ Toolbar: GridToolbar }}
          getRowId={(row) => row.id}
          getRowClassName={getRowClassName}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 10,
              },
            },
          }}
          checkboxSelection
        />
      </Box>
    </Box>
  );
};

export default ProspectListPage;
