import React, { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Paper,
    Stack,
    Tabs,
    Tab,
    Divider,
    CircularProgress,
    useTheme,
    useMediaQuery,
    Chip,
} from "@mui/material";
import { useParams } from "react-router-dom";
import dayjs from "dayjs";
import ProjectTask from "./project_tasks";
import ProjectChat from "./project_chat";
import ProjectTeam from "./project_team";
import WorkShop from "./work_shop/work_shop";
import ProjectLearning from "./work_shop/project_learning";

// APIs
import {
    getProjectDetails
} from "../../../api/controller/admin_controller/project/project_controller";

import ProjectPhases from "./project_phase/project_phase";
import { tokens } from "../../../theme";
// Components for each tab


const ProjectDetailsTab = () => {
    const [projectPercentage, setProjectPercentage] = useState(0);
    const [taskCount, setTaskCount] = useState(0);
    const { id } = useParams();
    const [activeTab, setActiveTab] = useState(0);
    const [projectDetails, setProjectDetails] = useState({});
    const [loading, setLoading] = useState(true);
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    useEffect(() => {
        fetchProjectDetails();
    }, []);

    const fetchProjectDetails = async () => {
        setLoading(true);
        try {
            const res = await getProjectDetails(id);
            setProjectDetails(res.data || {});
            setTaskCount(res.task_count || 0);
            setProjectPercentage(res.project_percentage || 0);
        } catch (error) {
            console.error("Error fetching project details:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const completionValue = Number.isFinite(projectPercentage) ? projectPercentage : 0;
    const completedCount = Math.round((taskCount * completionValue) / 100);
    const pendingCount = Math.max(taskCount - completedCount, 0);
    const projectName = projectDetails.project_name || "Untitled Project";
    const projectIdLabel = projectDetails.id ? ` (ID: ${projectDetails.id})` : "";
    const description = projectDetails.description || "No description available";
    const creatorName = projectDetails.creator?.name || "N/A";
    const createdAt = projectDetails.created_at
        ? dayjs(projectDetails.created_at).format("MMM D, YYYY · h:mm A")
        : "N/A";
    const departmentName = projectDetails.department?.department_name || "N/A";

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                gap: { xs: 2, md: 0 },
                minHeight: "100vh",
                backgroundColor: theme.palette.background.default,
            }}
        >
            {/* Left Side – Project Info */}
            <Paper
                elevation={0}
                sx={{
                    width: { xs: "100%", md: 320 },
                    p: { xs: 2, md: 3 },
                    borderRight: { xs: "none", md: `1px solid ${theme.palette.divider}` },
                    borderRadius: { xs: 2, md: 0 },
                    backgroundColor: theme.palette.background.paper,
                    mb: { xs: 1, md: 0 },
                }}
            >
                <Stack spacing={2}>
                    <Typography variant="h6" fontWeight={800} sx={{ color: colors.gray[100] }}>
                        Project Details
                    </Typography>

                    <Box>
                        <Typography variant="caption" sx={{ color: colors.gray[400] }}>
                            Project Name
                        </Typography>
                        <Typography variant="body2" sx={{ color: colors.gray[100], fontWeight: 600 }}>
                            {projectName}{projectIdLabel}
                        </Typography>
                    </Box>

                    <Box>
                        <Typography variant="caption" sx={{ color: colors.gray[400] }}>
                            Description
                        </Typography>
                        <Typography variant="body2" sx={{ color: colors.gray[200] }}>
                            {description}
                        </Typography>
                    </Box>

                    <Box>
                        <Typography variant="caption" sx={{ color: colors.gray[400] }}>
                            Created By
                        </Typography>
                        <Typography variant="body2" sx={{ color: colors.gray[200] }}>
                            {creatorName}
                        </Typography>
                    </Box>

                    <Box>
                        <Typography variant="caption" sx={{ color: colors.gray[400] }}>
                            Created At
                        </Typography>
                        <Typography variant="body2" sx={{ color: colors.gray[200] }}>
                            {createdAt}
                        </Typography>
                    </Box>

                    <Box>
                        <Typography variant="caption" sx={{ color: colors.gray[400] }}>
                            Department
                        </Typography>
                        <Box mt={0.75}>
                            <Chip
                                size="small"
                                label={departmentName}
                                sx={{
                                    bgcolor: theme.palette.info.main,
                                    color: theme.palette.info.contrastText,
                                    fontWeight: 600,
                                }}
                            />
                        </Box>
                    </Box>

                    <Divider sx={{ borderColor: colors.gray[800] }} />

                    {/* Completion Progress */}
                    <Box textAlign="center">
                        <Typography variant="subtitle2" mb={1} sx={{ color: colors.gray[100] }}>
                            Overall Project Completion
                        </Typography>
                        <Box sx={{ position: "relative", display: "inline-flex" }}>
                            <CircularProgress
                                variant="determinate"
                                value={completionValue}
                                size={84}
                                thickness={5}
                                sx={{ color: colors.greenAccent[500] }}
                            />
                            <Box
                                sx={{
                                    top: 0,
                                    left: 0,
                                    bottom: 0,
                                    right: 0,
                                    position: "absolute",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <Typography variant="caption" component="div" sx={{ color: colors.gray[100] }}>
                                    {completionValue}%
                                </Typography>
                            </Box>
                        </Box>
                    </Box>

                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(3, 1fr)", md: "repeat(2, 1fr)" },
                            gap: 1,
                        }}
                    >
                        {[
                            { label: "Total Tasks", value: taskCount },
                            { label: "Completed", value: completedCount },
                            { label: "Pending", value: pendingCount },
                        ].map((item) => (
                            <Box
                                key={item.label}
                                sx={{
                                    p: 1,
                                    borderRadius: 1.5,
                                    border: `1px solid ${colors.gray[800]}`,
                                    bgcolor: theme.palette.background.default,
                                }}
                            >
                                <Typography variant="caption" sx={{ color: colors.gray[400] }}>
                                    {item.label}
                                </Typography>
                                <Typography variant="subtitle2" sx={{ color: colors.gray[100], fontWeight: 700 }}>
                                    {item.value}
                                </Typography>
                            </Box>
                        ))}
                    </Box>

                    <Divider sx={{ borderColor: colors.gray[800] }} />

                    <Typography variant="subtitle2" sx={{ color: colors.gray[100] }}>
                        Phase Progress Chart
                    </Typography>
                    <Box
                        sx={{
                            height: 120,
                            width: "100%",
                            backgroundColor: colors.primary[800],
                            borderRadius: 1.5,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: colors.gray[400],
                            fontSize: 12,
                        }}
                    >
                        Chart Placeholder
                    </Box>
                </Stack>
            </Paper>

            {/* Right Side – Tabs and Content */}
            <Box sx={{ flex: 1, p: { xs: 1, md: 2 }, bgcolor: theme.palette.background.default, minWidth: 0 }}>
                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    aria-label="Project Tabs"
                    variant={isMobile ? "scrollable" : "standard"}
                    scrollButtons={isMobile ? "auto" : false}
                    allowScrollButtonsMobile
                    sx={{
                        "& .MuiTabs-indicator": {
                            backgroundColor: colors.blueAccent[500],
                        },
                    }}
                >
                    <Tab label="Phases" sx={{ color: colors.gray[100] }} />
                    <Tab label="Teams" sx={{ color: colors.gray[100] }} />
                    <Tab label="Project Tasks" sx={{ color: colors.gray[100] }} />
                    <Tab label="Communications" sx={{ color: colors.gray[100] }} />
                    <Tab label="Workshop" sx={{ color: colors.gray[100] }} />
                    <Tab label="Learning" sx={{ color: colors.gray[100] }} />
                </Tabs>

                <Divider sx={{ my: 2 }} />

                {/* Tab Content */}
                {activeTab === 0 && (
                    <ProjectPhases protId={id} />
                )}

                {activeTab === 1 && (
                    <ProjectTeam projectID={id} />
                )}
                {activeTab === 2 && (
                    <ProjectTask projectID={id} />
                )}
                {activeTab === 3 && (
                    <ProjectChat projectID={id} project={projectDetails} />
                )}
                {activeTab === 4 && (
                    <WorkShop protId={id} />
                )}
                {activeTab === 5 && (
                    <ProjectLearning protId={id} />
                )}
            </Box>
        </Box>
    );
};

export default ProjectDetailsTab;