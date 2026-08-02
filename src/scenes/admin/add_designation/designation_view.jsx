import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import MasterDataPage from "../setting/components/MasterDataPage";
import {
  addDesignation,
  deleteDesignation,
  fetchDesignation,
  updateDesignation,
} from "../../../api/controller/admin_controller/department_controller";

const DesignationView = () => (
  <MasterDataPage
    title="Designations"
    subtitle="Create and manage employee job titles in one simple list."
    entityLabel="Designation"
    countLabel="designations"
    listTitle="Designation List"
    listSubtitle="Job title names with edit and delete controls."
    nameField="designation_name"
    nameLabel="Designation Name"
    namePlaceholder="Example: Software Engineer, Sales Manager"
    Icon={BadgeRoundedIcon}
    fetchItems={fetchDesignation}
    addItem={addDesignation}
    updateItem={updateDesignation}
    deleteItem={deleteDesignation}
  />
);

export default DesignationView;