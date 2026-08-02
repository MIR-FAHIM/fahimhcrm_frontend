import FlagRoundedIcon from "@mui/icons-material/FlagRounded";
import MasterDataPage from "./components/MasterDataPage";
import {
  addTaskPriority,
  deleteTaskPriority,
  fetchTaskPriorities,
  updateTaskPriority,
} from "../../../api/controller/admin_controller/task_controller/task_controller";

const AddTaskPriority = () => (
  <MasterDataPage
    title="Task Priorities"
    subtitle="Create and manage task priority labels."
    entityLabel="Priority"
    countLabel="priorities"
    listTitle="Priority List"
    listSubtitle="Priority name, color, edit, and delete controls."
    nameField="priority_name"
    nameLabel="Priority Name"
    namePlaceholder="Example: High, Medium, Low"
    Icon={FlagRoundedIcon}
    fetchItems={fetchTaskPriorities}
    addItem={addTaskPriority}
    updateItem={updateTaskPriority}
    deleteItem={deleteTaskPriority}
    includeColor
  />
);

export default AddTaskPriority;