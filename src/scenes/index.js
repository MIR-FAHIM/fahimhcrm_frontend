import Navbar from "./layout/navbar";
import SideBar from "./layout/sidebar";
import Dashboard from "./dashboard";
import Team from "./team";
import Invoices from "./invoices";
import Contacts from "./contacts";
import Form from "./form";
import AddCLient from "./addclient";
import Calendar from "./calendar";
import Bar from "./bar";
import Line from "./line";
import Pie from "./pie";
import Stream from "./stream";
import FAQ from "./faq";
import Geography from "./geography";
import MainCategoryList from "./a_product/main_category";
import ProductCategoryList from "./a_product/product_category";
import AllProductList from "./a_product/product_list";
import AddProductManagement from "./a_product/add_product";
import BrandList from "./a_product/brand";
import GeneralProductInfo from "./a_product/add_product/general_information";
import AddProductImages from "./a_product/add_product/product_image_add";
import AddProductVideo from "./a_product/add_product/video_link_add";
import AddProductStrategy from "./a_product/add_product/strategy_add";
import ProductDetailTab from "./a_product/product_list/product_detail";
import ProductImageList from "./a_product/product_list/product_detail/product_image_list";
import VideoList from "./a_product/product_list/product_detail/video_list";
import StrategyList from "./a_product/product_list/product_detail/product_strategy_list";
import UpdateProductPage from "./a_product/product_list/product_detail/update_product_info";
import AddMainCategory from "./add_main_category";
import AddProductCategory from "./category/add_category";
import OrderDetailsPage from "./order/order_details";
import AllOrders from "./order";
import UserDetail from "./contacts/get_user_detail";
import Withdraws from "./accounts/withdraw";
import SocialPost from "./social_media_post/social_media_post";
import AddAttribute from "./setting/add_attribute/add_attribute";
//admin start

import DepartmentView from "./admin/add_department/department_view";
import DesignationView from "./admin/add_designation/designation_view";
import RoleView from "./admin/add_role/role_view";
import EmployeesList from "./admin/employee/employee_list";
import AddEmployee from "./admin/employee/add_employee";
import Attendance from "./admin/attendance/check_in_out";
import EmployeeAttendanceReport from "./admin/attendance/employee_attendance_report";
import DepartmentWiseEmp from "./admin/department_wise/department_wise_user";
import EmpProfile from "./admin/profile/get_user_profile";
import Login from "./admin/auth/login";
import MapComponent from "./admin/map/google_map";
import ProfileComponent from "./admin/profile/profile_components/profile_components";
import MyTaskTable from "./admin/task/my-task/get_my_tasks";
import AllTaskTable from "./admin/task/all_task_table";
import AddTaskForm from "./admin/task/add_task";
import AddProject from "./admin/project/add_project";
import ProjectList from "./admin/project/project_list";
import TaskComponents from "./admin/profile/profile_components/task_components";
import LeaveManagement from "./admin/attendance/leave_management/leave_management_form";
import UserLeaveRequestsPage from "./admin/attendance/leave_management/user_leave_req_table";
import LeaveManageTable from "./admin/attendance/leave_management/admin_leave_manage_table";
import TaskDetails from "./admin/task/task_details";
import FollowUpList from "./admin/task/followup-activity/followup_list";
import ActivityList from "./admin/task/followup-activity/activity_list";
import ProspectListPage from "./admin/prospect/prospect_list";
import ProspectDetailsPage from "./admin/prospect/propect_details";
import AddProspect from "./admin/prospect/add_prospect";
import OrganizationForm from "./admin/prospect/organization_prospect_form";
import IndividualForm from "./admin/prospect/individual_propsect_form";
import ProjectPhases from "./admin/project/project_phase/project_phase";
import LogActivityList from "./admin/prospect/prospect_log_activity/fetch_prospect_log_activity";
import EffortOverview from "./admin/prospect/prospect_log_activity/calculate_effort";
import AllTaskByStatus from "./admin/task/my-task/task_by_status";
import MyTaskTabs from "./admin/task/my-task/my_task_tab";
import ProjectPhaseTask from "./admin/task/project_phase_task";
import FacebookLeadsTable from "./admin/prospect/facebook_leads";
import AddTaskPriority from "./admin/setting/add_task_priority";
import AddTaskStatus from "./admin/setting/add_task_status";
import AddTaskType from "./admin/setting/add_task_type";
import ProspectListByStage from "./admin/prospect/prospect_list_by_stage";
import ProspectReportMonthWise from "./admin/prospect/prospect_report";
import SourceWiseProspectPie from "./admin/prospect/source_wise_prospect_report";
import ClientList from "./admin/client/client_list";
import ClientDetails from "./admin/client/client_details";
import SoftwareSalePage from "./admin/client/softwaresale";
import SoftwareCard from "./admin/client/softwarecard";
import ProjectDetailsTab from "./admin/project/project_details_tab";
import ProjectTask from "./admin/project/project_tasks";
import ProjectChat from "./admin/project/project_chat";
import ConversationRoomList from "./admin/conversation/conversation_list";
import TaskCalendar from "./admin/task/task_by_calendar";
import SoftwareSell from "./admin/myzoo/software_sell";
import ContactUsLead from "./admin/prospect/contact_us_lead";
import OpportunityByStage from "./admin/opportunity/opportunity_list_by_stage";
import OpportunityDetailsPage from "./admin/opportunity/opportunity_details";
import OpportunityTabs from "./admin/opportunity/opportunity_tab";
import QuotationByProspect from "./admin/quotation/get_quotation_by_prospect";
import POSManagementForm from "./admin/quotation/create_quotation";
import ProductEntry from "./admin/sale_product/product_entry";
import ProductList from "./admin/sale_product/product_list";
import ProductDetailVariant from "./admin/sale_product/product_details";
import POSPage from "./admin/sale_product/pos_page";
import OrderList from "./admin/sale_product/order_table";
import StockList from "./admin/sale_product/product_setting/stock_list";
import MapComponentSetLocation from "./admin/prospect/form/google_map_set_location";
import MapWithMarkers from "./admin/prospect/warehouse/warehouse_map";
import AttendanceAdjustments from "./admin/attendance/attendance_adjustment";
import WarehouseForm from "./admin/prospect/warehouse/add_warehouse";
import UserFeaturePermission from "./admin/permission/show_user_feature_list_permisision";
import NotificationPage from "./admin/notification/notification_list";
import WarehouseList from "./admin/prospect/warehouse/warehouse_list";
import AddNotice from "./admin/notices/add_notice";
import WarehouseDetailsInfo from "./admin/prospect/warehouse/warehouse_details";
import UserActivityList from "./admin/user_activity_track/user_activity_track";
import OrderDetails from "./admin/sale_product/order_detail/order_details";
import ProjectListByDepartment from "./admin/project/project_by_department";
import DepartmentTask from "./admin/task/department_task";
import DailyWorkReport from "./admin/task/daily_work_report";
import WorkReportList from "./admin/task/work_report_user";
import WorkShop from "./admin/project/work_shop/work_shop"; // Import the WorkShop component
import LandingPage from "./brainwork/index"; // Import the WorkShop component
import NextFeatures from "./brainwork/what_next"; // Import the WorkShop component
import ContactUsForm from "./admin/prospect/contact_us/contact_us_form";// Import the WorkShop component
import MyWaitingTask from "./admin/task/my-task/my_waiting_task";// Import the WorkShop component
import VisitPlanner from "./admin/fieldforce/visit_plan";// Import the WorkShop component
import MyVisits from "./admin/fieldforce/my_visit_list";// Import the WorkShop component
import VisitMap from "./admin/fieldforce/visit_map";// Import the WorkShop component
import DateWiseVisit from "./admin/fieldforce/date_wise_visit";// Import the WorkShop component
import PrivacyPolicy from "./admin/setting/privacy_policy";// Import the WorkShop component



export {
  Navbar,
  SideBar,
  Dashboard,
  Team,
  Invoices,
  Contacts,
  Form,
  AddCLient,
  Calendar,
  Bar,
  Line,
  Pie,
  Stream,
  FAQ,
  Geography,
  MainCategoryList,
  ProductCategoryList,
  AllProductList,
  AddProductManagement,
  BrandList,
  GeneralProductInfo,
  AddProductImages,
  AddProductVideo,
  AddProductStrategy,
  ProductDetailTab,
  ProductImageList,
  VideoList,
  StrategyList,
  UpdateProductPage,
  AddMainCategory,
  AddProductCategory,
  AllOrders,
  OrderDetailsPage,
  UserDetail,
  Withdraws,
  SocialPost,
  AddAttribute,

  DepartmentView,
  DesignationView,
  RoleView,
  EmployeesList,
  AddEmployee,
  Attendance,
  EmployeeAttendanceReport,
  DepartmentWiseEmp,
  EmpProfile,
  Login,
  MapComponent,
  ProfileComponent,
  MyTaskTable,
  AllTaskTable,
  AddTaskForm,
  AddProject,
  ProjectList,
  TaskComponents,
  LeaveManagement,
  UserLeaveRequestsPage,
  LeaveManageTable,
  TaskDetails,
  ActivityList,
  FollowUpList,
  ProspectListPage,
  ProspectDetailsPage,
  AddProspect,
  OrganizationForm,
  IndividualForm,
  ProjectPhases,
  LogActivityList,
  EffortOverview,
  AllTaskByStatus,
  MyTaskTabs,
  ProjectPhaseTask,
  FacebookLeadsTable,
  AddTaskPriority,
  AddTaskStatus,
  AddTaskType,
  ProspectListByStage,
  ProspectReportMonthWise,
  SourceWiseProspectPie,
  ClientList,
  ClientDetails,
  SoftwareSalePage,
  SoftwareCard,
  ProjectDetailsTab,
  ProjectTask,
  ProjectChat,
  ConversationRoomList,
  TaskCalendar,
  SoftwareSell,
  ContactUsLead,
  OpportunityByStage,
  OpportunityDetailsPage,
  OpportunityTabs,
  QuotationByProspect,
  POSManagementForm,
  ProductEntry,
  ProductList,
  ProductDetailVariant,
  POSPage,
  OrderList,
  StockList,
  MapComponentSetLocation,
  MapWithMarkers,
  AttendanceAdjustments,
  WarehouseForm,
  UserFeaturePermission,
  NotificationPage,
  WarehouseList,
  AddNotice,
  WarehouseDetailsInfo,
  UserActivityList,
  OrderDetails,
  ProjectListByDepartment,
  DepartmentTask,
  DailyWorkReport,
  WorkReportList,
  WorkShop,
  LandingPage,
  NextFeatures,
  ContactUsForm,
  MyWaitingTask,
  VisitPlanner,
  MyVisits,
  VisitMap,
  DateWiseVisit,
  PrivacyPolicy,
};
