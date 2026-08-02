import AdminPanelSettingsRoundedIcon from "@mui/icons-material/AdminPanelSettingsRounded";
import MasterDataPage from "../setting/components/MasterDataPage";
import {
  addRole,
  deleteRole,
  fetchRole,
  updateRole,
} from "../../../api/controller/admin_controller/department_controller";

const RoleView = () => (
  <MasterDataPage
    title="Roles"
    subtitle="Create application roles for users and permission assignment."
    entityLabel="Role"
    countLabel="roles"
    listTitle="Role List"
    listSubtitle="Clean role names with edit and delete controls."
    nameField="role_name"
    nameLabel="Role Name"
    namePlaceholder="Example: Admin, Manager, Employee"
    Icon={AdminPanelSettingsRoundedIcon}
    fetchItems={fetchRole}
    addItem={addRole}
    updateItem={updateRole}
    deleteItem={deleteRole}
  />
);

export default RoleView;