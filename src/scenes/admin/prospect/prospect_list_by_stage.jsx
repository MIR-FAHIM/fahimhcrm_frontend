import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import Language from "@mui/icons-material/Language";
import LinkedIn from "@mui/icons-material/LinkedIn";
import {
  fetchAllProspectByStage,
  getProspectAllStatus,
} from "../../../api/controller/admin_controller/prospect_controller";
import {
  Box,
  CircularProgress,
  Typography,
  Card,
  CardContent,
  Link,
  Avatar,
  Button,
  useTheme,
  Tooltip,
  TextField
} from "@mui/material";
import {
  Call,
  Message,
  LocationOn,
  Email,
  AssignmentTurnedIn,
} from "@mui/icons-material";
import { base_url } from "../../../api/config/index";
import ActivityChip from "./components/activity_chips";
import { useNavigate } from "react-router-dom";
import opportunity from "../../../assets/images/opportunity.png";

const activityColors = {
  general: "#fef3c7",
  task: "#e0f2fe",
  call: "#fee2e2",
  email: "#ede9fe",
  whatsapp: "#dcfce7",
  visit: "#fce7f3",
  message: "#e2e8f0",
  meeting: "#fff7ed",
};

const ProspectListByStage = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const [prospects, setProspects] = useState({});
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const handleAddProspect = () => {
    navigate("/add-prospect");
  };

  const goProspectListView = () => {
    navigate("/prospect-list");
  };

  useEffect(() => {
    fetchProspects();
    fetchStatuses();
  }, []);

  const fetchProspects = async () => {
    try {
      const response = await fetchAllProspectByStage();
      setProspects(response.data);
    } catch (error) {
      console.error("Error fetching prospects:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatuses = async () => {
    try {
      const response = await getProspectAllStatus();
      setStatuses(response.data);
    } catch (error) {
      console.error("Error fetching statuses:", error);
    }
  };

  const filteredProspects = (stageName) => {
    return prospects[stageName]?.filter(prospect =>
      prospect.prospect_name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];
  };

  return (
    <Box sx={{ width: "100%", overflowX: "auto", padding: 2 }}>
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

        <TextField
          size="small"
          variant="outlined"
          placeholder="🔍 Search leads"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ width: 250 }}
        />

        <Button variant="contained" color="primary" onClick={handleAddProspect}>
          ➕ Add Prospect
        </Button>

        <Button variant="outlined" color="secondary" onClick={() => window.location.reload()}>
          🔄 Refresh
        </Button>

        <Button variant="contained" color="info" onClick={goProspectListView}>
          📊 Table View
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ width: "100%", overflowX: "auto" }}>
      <Box sx={{ display: "flex", gap: 2, minWidth: "max-content", pb: 2 }}>
  {statuses.map((status) => (
    <Box key={status.id} sx={{ minWidth: 300, flexShrink: 0 }}>
      <Box
        sx={{
          backgroundColor: status.color_code,
          borderRadius: 2,
          padding: 2,
          mb: 2,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          {status.stage_name} {filteredProspects(status.stage_name).length}
        </Typography>
      </Box>
      <Box
        sx={{
          backgroundColor: "#ffffff",
          borderRadius: 2,
          padding: 2,
          boxShadow: theme.shadows[2],
        }}
      >
        {filteredProspects(status.stage_name).map((prospect) => (
          <Card
            key={prospect.id}
            sx={{
              width: 280, // Set a fixed width for the card
              mb: 3,
              px: 3,
              py: 2.5,
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              boxShadow: theme.shadows[2],
              backgroundColor: "#ffffff",
              transition: "transform 0.2s, box-shadow 0.2s",
              "&:hover": {
                boxShadow: theme.shadows[5],
                transform: "scale(1.015)",
              },
            }}
          >
            <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
  <Typography variant="h6" fontWeight="bold" color="primary">
    #{prospect.id}: {prospect.prospect_name}
  </Typography>

  {prospect.is_opportunity === 1 && (
    <img
      src={opportunity} // Replace with actual image path
      alt="Opportunity"
      style={{ height: 24 }} // adjust size as needed
    />
  )}
</Box>

              <Typography variant="body1" fontWeight={500} color="text.secondary" mt={1}>
                📍 {prospect.address}
              </Typography>

              <Box mt={1} display="flex" flexDirection="column" gap={0.5}>
                {prospect.website_link && (
                  <Box display="flex" alignItems="center" gap={1}>
                    <Language fontSize="small" color="primary" />
                    <Link
                      href={prospect.website_link.startsWith('http') ? prospect.website_link : `https://${prospect.website_link}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      underline="hover"
                      variant="body2"
                      fontWeight={500}
                    >
                      {prospect.website_link}
                    </Link>
                  </Box>
                )}

                {prospect.linkedin_link && (
                  <Box display="flex" alignItems="center" gap={1}>
                    <LinkedIn fontSize="small" sx={{ color: '#0A66C2' }} />
                    <Link
                      href={prospect.linkedin_link.startsWith('http') ? prospect.linkedin_link : `https://${prospect.linkedin_link}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      underline="hover"
                      variant="body2"
                      fontWeight={500}
                    >
                      {prospect.linkedin_link}
                    </Link>
                  </Box>
                )}
              </Box>

              <Box mt={2}>
                <Typography variant="body2">
                  <strong>Industry Type:</strong>{" "}
                  {prospect.industry_type?.industry_type_name || "N/A"}
                </Typography>
                <Typography variant="body2">
                  <strong>Interested On:</strong>{" "}
                  {prospect.interested_for?.product_name || "N/A"}
                </Typography>
                <Typography variant="body2">
                  <strong>Source:</strong>{" "}
                  {prospect.information_source?.information_source_name || "N/A"}
                </Typography>
                <Typography variant="body2">
                  <strong>Zone:</strong> {prospect.zone?.zone_name || "N/A"}
                </Typography>
                <Typography variant="body2">
                  <strong>Last Activity:</strong>{" "}
                  {dayjs(prospect.last_activity).format("MMM D, YYYY") || "N/A"}
                </Typography>
                <Typography variant="body2">
                  <strong>Next Activity:</strong>{" "}
                  {dayjs(prospect.next_activity).format("MMM D, YYYY") || "N/A"}
                </Typography>
              </Box>

              <Box
                sx={{
                  backgroundColor: "#f0f4f8",
                  borderRadius: 2,
                  padding: 1.5,
                  mt: 2,
                }}
              >
                <Typography variant="caption" fontWeight="bold" color="text.secondary">
                  Initial Concern Person:
                </Typography>

                <Box display="flex" alignItems="center" mt={1}>
                  {prospect.concern_persons.length > 0 ? (
                    <>
                      <Avatar
                        src={`${base_url}/storage/${prospect.concern_persons[0]?.photo}`}
                        sx={{ width: 30, height: 30, mr: 1 }}
                      />
                      <Typography variant="body2">
                        {prospect.concern_persons[0]?.person_name}
                      </Typography>
                    </>
                  ) : (
                    <Typography variant="body2" color="text.disabled">
                      No contact person
                    </Typography>
                  )}
                </Box>
              </Box>

              <Box display="flex" flexWrap="wrap" gap={2} mt={2}>
                <ActivityChip icon={<Call fontSize="small" />} label="Calls" count={prospect.activity_summary.call} />
                <ActivityChip icon={<Message fontSize="small" />} label="Messages" count={prospect.activity_summary.whatsapp} />
                <ActivityChip icon={<LocationOn fontSize="small" />} label="Visits" count={prospect.activity_summary.visit} />
                <ActivityChip icon={<Email fontSize="small" />} label="Emails" count={prospect.activity_summary.email} />
                <ActivityChip icon={<AssignmentTurnedIn fontSize="small" />} label="Tasks" count={prospect.activity_summary.task} />
              </Box>
            </CardContent>

            <Box px={2} pb={2}>
              <Button
                variant="contained"
                fullWidth
                size="small"
                onClick={() => navigate(`/prospect-detail/${prospect.id}`)}
              >
                View Details
              </Button>
            </Box>
          </Card>
        ))}
      </Box>
    </Box>
  ))}
</Box>

        </Box>
      )}
    </Box>
  );
};

export default ProspectListByStage;
