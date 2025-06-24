import { Box, Button, Typography, useTheme } from "@mui/material";
import { Header } from "../../../components";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { tokens } from "../../../theme";
import { getAttendanceAdjustment, approveAdjustment } from "../../../api/controller/admin_controller/attendance_controller";

const AttendanceAdjustments = () => {
    const theme = useTheme();
    const userID = localStorage.getItem("userId");
    const colors = tokens(theme.palette.mode);
    const navigate = useNavigate();

    const [adjustments, setAdjustments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const handleApprove = async (id) => {
        const data = {
            'adjustment_id': id,
            'user_id': userID,
        }
        const response = await approveAdjustment(data);
        if (response.success === true) {
            alert(response.message);
            handleGetAdjustementslist();
        }
    };
const handleGetAdjustementslist = async ()=> {
    await   getAttendanceAdjustment()
            .then((response) => {
                if (response.status === "success") {
                    setAdjustments(response.data);
                } else {
                    setError("Failed to fetch attendance adjustments");
                }
                setLoading(false);
            })
            .catch(() => {
                setError("Error fetching data");
                setLoading(false);
            });
}


    useEffect(() => {
     handleGetAdjustementslist();
    }, []);

    const columns = [
        { field: "id", headerName: "ID", flex: 0.5, headerAlign: "center", align: "center" },
        {
            field: "user_name",
            headerName: "User",
            flex: 1.5,
            valueGetter: (params) => params.row.attendance?.user?.name || "N/A",
        },
        {
            field: "current_time",
            headerName: "Current Time",
            flex: 1.5,
            valueGetter: (params) =>
                params.row.attendance?.check_in_time
                    ? new Date(params.row.attendance?.check_in_time).toLocaleString()
                    : "N/A",
        },
        {
            field: "requested_time",
            headerName: "Requested Time",
            flex: 1.5,
            valueGetter: (params) =>
                params.row.requested_time
                    ? new Date(params.row.requested_time).toLocaleString()
                    : "N/A",
        },
        { field: "type", headerName: "Type", flex: 1 },
        { field: "note", headerName: "Note", flex: 2 },
        { field: "status", headerName: "Status", flex: 1 },
        {
            field: "view_details",
            headerName: "Actions",
            flex: 1,
            renderCell: (params) => (
                <Button
                    variant="contained"
                    color="primary"
                    sx={{
                        borderRadius: "20px",
                        textTransform: "none",
                        fontSize: "14px",
                        fontWeight: "bold",
                    }}
                    onClick={() => handleApprove(params.row.id)}
                >
                    Approve
                </Button>
            ),
        },
    ];

    if (loading)
        return (
            <Typography variant="h6" color="primary">
                Loading...
            </Typography>
        );

    if (error)
        return (
            <Typography variant="h6" color="error">
                {error}
            </Typography>
        );

    return (
        <Box m={4}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Header title="Attendance Adjustments" subtitle="Review employee requests for time adjustment" />
            </Box>

            <Box
                mt={3}
                height="75vh"
                sx={{
                    borderRadius: "10px",
                    overflow: "hidden",
                    boxShadow: 2,
                    "& .MuiDataGrid-root": { border: "none" },
                    "& .MuiDataGrid-cell": { borderBottom: "1px solid rgba(224, 224, 224, 1)" },
                    "& .MuiDataGrid-columnHeaders": {
                        backgroundColor: colors.gray[10],
                        fontSize: "16px",
                        fontWeight: "bold",
                    },
                    "& .MuiDataGrid-virtualScroller": {
                        backgroundColor: colors.primary[400],
                    },
                    "& .MuiDataGrid-footerContainer": {
                        backgroundColor: colors.gray[10],
                        borderTop: "1px solid rgba(224, 224, 224, 1)",
                    },
                    "& .MuiCheckbox-root": {
                        color: `${colors.greenAccent[200]} !important`,
                    },
                    "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
                        color: `${colors.gray[100]} !important`,
                    },
                }}
            >
                <DataGrid
                    rows={adjustments}
                    columns={columns}
                    components={{ Toolbar: GridToolbar }}
                    getRowId={(row) => row.id}
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

export default AttendanceAdjustments;
