import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import App from "./App";


import {
  Dashboard,
  Team,
  Invoices,
  Contacts,
  Form,
  Bar,
  Line,
  Pie,
  FAQ,
  AddCLient,
  Geography,
  Calendar,
  Stream,
  MainCategoryList,
  ProductCategoryList,
  AllProductList,
  AddProductManagement,
  BrandList,
  ProductDetailTab,
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
  MyTaskTable,
  AllTaskTable,
  AddTaskForm,
  AddProject,
  ProjectList,
  LeaveManagement,
  UserLeaveRequestsPage,
  LeaveManageTable,
  TaskDetails,
  ProspectListPage,
  ProspectDetailsPage,
  AddProspect,
  ProjectPhases,
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
  ProjectDetailsTab,
  ProjectTask,
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
} from "./scenes";

const AppRouter = () => {
  return (
    // <Router basename="/hcrm">
 <Router >
     
      <Routes>
      <Route path="/login" element={<Login />}></Route>
        <Route path="/" element={<App />}>
          <Route path="/" element={<Dashboard />} />
          
          <Route path="/team" element={<Team />} />
          <Route path="/add-task" element={<AddTaskForm />} />
          <Route path="/my-task" element={<MyTaskTable />} />
          <Route path="/all-task" element={<AllTaskTable />} />
          <Route path="/google-map" element={<MapComponent />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/form" element={<Form />} />
          <Route path="/addClient" element={<AddCLient />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/bar" element={<Bar />} />
          <Route path="/pie" element={<Pie />} />
          <Route path="/stream" element={<Stream />} />
          <Route path="/main_category" element={<MainCategoryList />} />
          <Route path="/all_product_list" element={<AllProductList />} />
          <Route path="/product_category" element={<ProductCategoryList />} />
          <Route path="/add_product" element={<AddProductManagement />} />
          <Route path="/brand_list" element={<BrandList />} />
          <Route path="/product-details/:id" element={<ProductDetailTab />} />
          <Route path="/line" element={<Line />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/geography" element={<Geography />} />
          <Route path="/add-main-category" element={<AddMainCategory />} />
          <Route path="/add-product-category" element={<AddProductCategory />} />
          <Route path="/all-orders" element={<AllOrders />} />
          <Route path="/order-details/:id" element={<OrderDetailsPage />} />
          <Route path="/user-details/:id" element={<UserDetail />} />
          <Route path="/withdraw" element={<Withdraws />} />
          <Route path="/social-post" element={<SocialPost />} />
          <Route path="/add-attribute" element={<AddAttribute />} />

        
          <Route path="/department-view" element={<DepartmentView />} />
          <Route path="/designation-view" element={<DesignationView />} />
          <Route path="/role-view" element={<RoleView />} />
          <Route path="/employee-list-view" element={<EmployeesList />} />
          <Route path="/add-employee" element={<AddEmployee />} />
          <Route path="/check-in-out" element={<Attendance />} />
          <Route path="/employee-attendance-report" element={<EmployeeAttendanceReport />} />
          <Route path="/department-wise-emp" element={<DepartmentWiseEmp />} />
          <Route path="/employee-profile/:id" element={<EmpProfile />} />
          <Route path="/add-project" element={<AddProject />} />
          <Route path="/project-list" element={<ProjectList />} />
          <Route path="/leave-manage-form" element={<LeaveManagement />} />
          <Route path="/user-leave-request" element={<UserLeaveRequestsPage />} />
          <Route path="/admin-leave-manage" element={<LeaveManageTable />} />
          <Route path="/task-details/:id" element={<TaskDetails />} />
          <Route path="/prospect-list" element={<ProspectListPage />} />
          <Route path="/prospect-detail/:id" element={<ProspectDetailsPage />} />
          <Route path="/add-prospect" element={<AddProspect />} />
          <Route path="/project-detail/:id" element={<ProjectPhases />} />
          <Route path="/effort-calculation" element={<EffortOverview />} />
          <Route path="/task-by-status" element={<AllTaskByStatus />} />
          <Route path="/my-task-tab" element={<MyTaskTabs />} />
          <Route path="/project-phase-task/:id" element={<ProjectPhaseTask />} />
          <Route path="/facebook-leads" element={<FacebookLeadsTable />} />
          <Route path="/task-priority" element={<AddTaskPriority />} />
          <Route path="/task-status" element={<AddTaskStatus />} />
          <Route path="/task-type" element={<AddTaskType />} />
          <Route path="/prospect-list-by-stage" element={<ProspectListByStage />} />
          <Route path="/prospect-report-monthwise" element={<ProspectReportMonthWise />} />
          <Route path="/source-wise-prospect-report" element={<SourceWiseProspectPie />} />
          <Route path="/client-list" element={<ClientList />} />
          <Route path="/client-details/:id" element={<ClientDetails />} />
          <Route path="/software-sale" element={<SoftwareSalePage />} />
          <Route path="/project-detail-tab/:id" element={<ProjectDetailsTab />} />
          <Route path="/project-tasks" element={<ProjectTask />} />
          <Route path="/conversation-room-list" element={<ConversationRoomList />} />
          <Route path="/task-by-calendar" element={<TaskCalendar />} />
          <Route path="/software-offer" element={<SoftwareSell />} />
          <Route path="/contact-us" element={<ContactUsLead />} />
          <Route path="/opportunity-by-stage" element={<OpportunityByStage />} />
          <Route path="/opportunity-detail/:id" element={<OpportunityDetailsPage />} />
          <Route path="/opportunity-tabs/:id" element={<OpportunityTabs />} />
          <Route path="/get-quotation-prospect/:id" element={<QuotationByProspect />} />
          <Route path="/create-quotation/:id" element={<POSManagementForm />} />
          <Route path="/product-entry" element={<ProductEntry />} />
          <Route path="/product-list" element={<ProductList />} />
          <Route path="/product-details-variant/:id" element={<ProductDetailVariant />} />
          <Route path="/pos-page" element={<POSPage />} />
          <Route path="/all-order" element={<OrderList />} />
          <Route path="/all-stock" element={<StockList />} />
          <Route path="/googlemap-set/:id/:latitude/:longitude" element={<MapComponentSetLocation />} />
          <Route path="/map-markers" element={<MapWithMarkers />} />
          <Route path="/attendance-adjustment" element={<AttendanceAdjustments />} />
          <Route path="/add-warehouse" element={<WarehouseForm />} />
          <Route path="/user-feature-permission" element={<UserFeaturePermission />} />
          <Route path="/notification-page" element={<NotificationPage />} />
          <Route path="/warehouse-list" element={<WarehouseList />} />
          <Route path="/add-notices" element={<AddNotice />} />
        
        </Route>
      </Routes>
    </Router>
  );
};

export default AppRouter;
