import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import MasterDataPage from "./components/MasterDataPage";
import { fetchDepartment } from "../../../api/controller/admin_controller/department_controller";
import {
  addTaskType,
  deleteTaskType,
  fetchTaskType,
  updateTaskType,
} from "../../../api/controller/admin_controller/task_controller/task_controller";

const getDepartmentName = (type) =>
  type?.department?.department_name ||
  type?.department_name ||
  type?.department?.name ||
  (type?.department_id ? `Department #${type.department_id}` : "No department");

const AddTaskType = () => (
  <MasterDataPage
    title="Task Types"
    subtitle="Create task categories and connect them with departments."
    entityLabel="Task Type"
    countLabel="task types"
    listTitle="Task Type List"
    listSubtitle="Type name, department, edit, and delete controls."
    nameField="type_name"
    nameLabel="Task Type Name"
    namePlaceholder="Example: Development, Support, Follow-up"
    Icon={CategoryRoundedIcon}
    fetchItems={fetchTaskType}
    addItem={addTaskType}
    updateItem={updateTaskType}
    deleteItem={deleteTaskType}
    includeDepartment
    fetchDepartments={fetchDepartment}
    getDepartmentName={getDepartmentName}
  />
);

export default AddTaskType;