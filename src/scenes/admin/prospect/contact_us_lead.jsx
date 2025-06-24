import { Box, Button, Typography, useTheme } from "@mui/material";
import { Header } from "../../../components";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { tokens } from "../../../theme";
import { useNavigate } from "react-router-dom";
import { getContactUsLeads } from "../../../api/controller/admin_controller/user_controller";
import { convertToPrsspect, convertContactRowStatusMultiple } from "../../../api/controller/admin_controller/prospect_controller";

const ContactUsLead = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();

  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);

  useEffect(() => {
   getContactList();
  }, []);


const getContactList = async () => {
await getContactUsLeads()
      .then((response) => {
        if (response.status === "success") {
          setLeads(response.data);
        } else {
          setError("Failed to fetch contact us leads");
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Error fetching data");
        setLoading(false);
      });
}
  const handleSelectionModelChange = (newSelectionModel) => {
    setSelectedRows(newSelectionModel);
  };

  const handleConvertToProspect = () => {
    const selectedLeads = leads.filter((lead) => selectedRows.includes(lead.id));

    const data =  selectedLeads.map((lead) => ({
        prospect_name: lead.person_name,
        is_individual: true,
        industry_type_id: 2,
        interested_for_id: 1,
        information_source_id: 3,
        stage_id: 1,
        priority_id: 2,
        status: 1,
        is_active: 1,
        website_link: "https://example.com",
        facebook_page: "https://facebook.com/ridoyfahim",
        linkedin: "https://linkedin.com/in/fahimridoy",
        zone_id: 5,
        latitude: 23.810331,
        longitude: 90.412521,
        address: "Dhaka, Bangladesh",
        note: "Prospect Added from Facebook lead form",
      }));

    const idList = {
      ids: selectedRows,
    };

    convertToPrsspect(data)
      .then((response) => {
        convertContactRowStatusMultiple(idList);
        getContactList();
        console.log("Conversion successful", response);
      })
      .catch((error) => {
        console.error("Conversion failed", error);
      });
  };

  const columns = [
    { field: "id", headerName: "ID", flex: 0.5, headerAlign: "center", align: "center" },
    { field: "person_name", headerName: "Name", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
    { field: "mobile", headerName: "Mobile", flex: 1 },
  ];

  if (loading) return <Typography variant="h6" color="primary">Loading...</Typography>;
  if (error) return <Typography variant="h6" color="error">{error}</Typography>;

  return (
    <Box m={4}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Header title="FACEBOOK LEADS" subtitle="Manage and view Facebook marketing leads" />
        <Button
          variant="contained"
          color="primary"
          onClick={handleConvertToProspect}
          disabled={selectedRows.length === 0}
        >
          Convert Selected to Prospect
        </Button>
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
          "& .MuiDataGrid-columnHeaders": { backgroundColor: colors.gray[10], fontSize: "16px", fontWeight: "bold" },
          "& .MuiDataGrid-virtualScroller": { backgroundColor: colors.primary[400] },
          "& .MuiDataGrid-footerContainer": { backgroundColor: colors.gray[10], borderTop: "1px solid rgba(224, 224, 224, 1)" },
          "& .MuiCheckbox-root": { color: `${colors.greenAccent[200]} !important` },
          "& .MuiDataGrid-toolbarContainer .MuiButton-text": { color: `${colors.gray[100]} !important` },
        }}
      >
        <DataGrid
          rows={leads}
          columns={columns}
          components={{ Toolbar: GridToolbar }}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 10,
              },
            },
          }}
          checkboxSelection
          onRowSelectionModelChange={handleSelectionModelChange}
        />
      </Box>
    </Box>
  );
};

export default ContactUsLead;
