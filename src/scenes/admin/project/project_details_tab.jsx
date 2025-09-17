import React, { useState, useEffect } from "react";
import {
    Box, Typography, Button, Card, CardContent, TextField, Dialog, DialogTitle, useTheme,
    DialogContent, DialogActions, Grid, Tooltip, Stack, Slider, Tabs, Tab, Divider, CircularProgress, CircularProgress as MuiCircularProgress,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
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
    const navigate = useNavigate();
    const [projectPercentage, setProjectPercentage] = useState(0);
    const [taskCount, setTaskCount] = useState(0);
    const { id } = useParams();
    const [activeTab, setActiveTab] = useState(0);
    const [projectDetails, setProjectDetails] = useState({});
    const [loading, setLoading] = useState(true);
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

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

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: theme.palette.background.default }}>
            {/* Left Side – Project Info */}
            <Box
                sx={{
                    width: { xs: '100%', md: 320 },
                    p: { xs: 2, md: 3 },
                    borderRight: { xs: 'none', md: `1px solid ${theme.palette.divider}` },
                    backgroundColor: theme.palette.background.paper,
                    mb: { xs: 2, md: 0 },
                }}
            >
                <Typography variant="h5" fontWeight={700} mb={3} sx={{ color: colors.gray[100] }}>
                    📁 Project Details
                </Typography>

                <Typography variant="subtitle1" fontWeight={600} sx={{ color: colors.gray[100] }}>Project Name</Typography>
                <Typography variant="body2" mb={2} sx={{ color: colors.gray[200] }}>{projectDetails.project_name} (ID: {projectDetails.id})</Typography>
                <Typography variant="subtitle1" fontWeight={600} sx={{ color: colors.gray[100] }}>Description</Typography>
                <Typography variant="body2" mb={2} sx={{ color: colors.gray[200] }}>{projectDetails.description}</Typography>
                <Typography variant="subtitle1" fontWeight={600} sx={{ color: colors.gray[100] }}>Created By</Typography>
                <Typography variant="body2" mb={2} sx={{ color: colors.gray[200] }}>{projectDetails.creator?.name}</Typography>
                <Typography variant="subtitle1" fontWeight={600} sx={{ color: colors.gray[100] }}>Created At</Typography>
                <Typography variant="body2" mb={2} sx={{ color: colors.gray[200] }}>{dayjs(projectDetails.created_at).format("MMM D, YYYY · h:mm A")}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                            <Typography variant="body2" sx={{ color: colors.gray[400] }}>
                              Department:
                            </Typography>
                            <Box
                              sx={{
                                backgroundColor: theme.palette.info.main,
                                color: theme.palette.info.contrastText,
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontWeight: 'bold',
                                fontSize: '0.875rem',
                                display: 'inline-block',
                              }}
                            >
                              {projectDetails.department.department_name || "No description available"}
                            </Box>
                          </Box>

                <Divider sx={{ my: 1 }} />
                
                {/* Completion Progress */}
                <Box mt={2} mb={2} textAlign="center">
                    <Typography variant="subtitle2" mb={1} sx={{ color: colors.gray[100] }}>Overall Project Completion</Typography>
                    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                        <CircularProgress variant="determinate" value={projectPercentage} size={80} thickness={5} sx={{ color: colors.greenAccent[500] }} />
                        <Box
                            sx={{
                                top: 0,
                                left: 0,
                                bottom: 0,
                                right: 0,
                                position: 'absolute',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Typography variant="caption" component="div" sx={{ color: colors.gray[100] }}>
                                {projectPercentage}%
                            </Typography>
                        </Box>
                    </Box>
                </Box>
                <Typography variant="body2" mb={1} sx={{ color: colors.gray[200] }}><strong>Total Tasks:</strong> {taskCount}</Typography>
                <Typography variant="body2" sx={{ color: colors.gray[200] }}><strong>Completed:</strong> 34</Typography>
                <Typography variant="body2" mb={2} sx={{ color: colors.gray[200] }}><strong>Pending:</strong> 11</Typography>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2" gutterBottom sx={{ color: colors.gray[100] }}>📊 Phase Progress Chart</Typography>
                <Box
                    sx={{
                        height: 120,
                        width: '100%',
                        backgroundColor: colors.primary[800],
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: colors.gray[400],
                        fontSize: 12
                    }}
                >
                    {/* Placeholder for chart */}
                    Chart Placeholder
                </Box>
            </Box>

            {/* Right Side – Tabs and Content */}
            <Box sx={{ flex: 1, p: 2, bgcolor: theme.palette.background.default }}>
                <Tabs value={activeTab} onChange={handleTabChange} aria-label="Project Tabs"
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