import ApartmentRoundedIcon from "@mui/icons-material/ApartmentRounded";
import MasterDataPage from "../setting/components/MasterDataPage";
import {
  addDepartment,
  deleteDepartment,
  fetchDepartment,
  updateDepartment,
} from "../../../api/controller/admin_controller/department_controller";

const DepartmentView = () => (
  <MasterDataPage
    title="Departments"
    subtitle="Create and manage organization departments."
    entityLabel="Department"
    countLabel="departments"
    listTitle="Department List"
    listSubtitle="Department names with edit and delete controls."
    nameField="department_name"
    nameLabel="Department Name"
    namePlaceholder="Example: Sales, HR, Operations"
    Icon={ApartmentRoundedIcon}
    fetchItems={fetchDepartment}
    addItem={addDepartment}
    updateItem={updateDepartment}
    deleteItem={deleteDepartment}
  />
);

export default DepartmentView;