# BrainWork CRM Frontend

Frontend for the BrainWork / Fahim HCRM application. The app is a Vite React dashboard that connects directly to backend API routes through controller files, then renders feature views under `src/scenes`.

## Tech Stack

- React 18 with Vite
- React Router DOM v6
- Material UI and MUI DataGrid
- Axios for API calls
- Formik, Yup, React Hook Form for forms
- FullCalendar, Nivo, Recharts, Google Maps, Quill, Pusher

## Project Structure

```text
src/
  api/
    axiosInstance.jsx              Shared Axios instance using base_url
    config/index.jsx               Base URL, app name, image URL, company ID, map key
    controller/                    API controller functions grouped by feature
      admin_controller/
        attendance_controller.jsx
        client_controller.jsx
        department_controller.jsx
        feature_permission_controller.jsx
        notification_controller.jsx
        opportunity_controller.jsx
        product_controller.jsx
        prospect_controller.jsx
        user_controller.jsx
        visit_controller.jsx
        leave_manage/
        project/
        report/
        task_controller/
      api_controller.jsx
      dashboard_controller.jsx
      order_controller/
      social_media_controller/
      setting_controller.jsx
      withdraw_controller.jsx

  assets/                          Images, icons, marketing screenshots
  components/                      Shared UI/chart/header components
  context/
    DataContext.jsx                Shared category/brand preload context
  scenes/
    index.js                       Barrel exports used by Router.jsx
    layout/
      sidebar/                     Sidebar navigation and route links
      navbar/                      Top navbar, task search, profile links
    provider/
      profile_context.jsx          Profile data context
    dashboard/
    admin/                         Main CRM/HRMS/admin feature pages
    a_product/                     Older product management pages
    order/
    contacts/
    setting/
  App.jsx                          Authenticated layout shell with Outlet
  Router.jsx                       Central route table
  main.jsx                         React mount and providers
  theme.js                         MUI theme tokens and color mode
```

## App Wiring

- `src/main.jsx` mounts `AppRouter` and wraps it with `ProfileProvider`.
- `src/Router.jsx` defines all application routes.
- The `/login`, `/privacy-policy`, and `/what-next` routes render outside the main dashboard shell.
- Most app pages are nested under `<Route path="/" element={<App />}>`.
- `src/App.jsx` provides the main dashboard layout: `SideBar`, `Navbar`, theme providers, `DataProvider`, and `<Outlet />`.
- `src/scenes/index.js` exports scene components so `Router.jsx` can import all pages from one place.
- `src/scenes/layout/sidebar/index.jsx` controls menu visibility using `modulePermission()` and navigates with `Item` links.

## API Integration Pattern

The current project uses direct controller functions, not Redux or RTK Query.

Typical controller pattern:

```jsx
import axiosInstance from "../../axiosInstance.jsx";

export const fetchSomething = async () => {
  try {
    const response = await axiosInstance.get("/api/some-route", {
      headers: {
        token: localStorage.getItem("authToken"),
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching something:", error);
    return [];
  }
};
```

For POST requests:

```jsx
export const addSomething = async (data) => {
  try {
    const response = await axiosInstance.post("/api/some-route", data, {
      headers: {
        token: localStorage.getItem("authToken"),
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error adding something:", error);
    throw error;
  }
};
```

Notes:

- `base_url` comes from `src/api/config/index.jsx`.
- Most secured API calls send a custom `token` header from `localStorage.authToken`.
- Login stores `authToken` and `userId`.
- Many list controllers return `[]` on failure.
- Many create/update controllers throw errors so the page can handle form errors.
- API responses are commonly checked with `res.status === "success"` and data is read from `res.data`.

## View Pattern

Feature pages usually:

- Import one or more controller functions directly.
- Load initial data in `useEffect`.
- Store API data in local `useState`.
- Show loading and error states.
- Render with MUI cards, tables, forms, chips, dialogs, or DataGrid.
- Refresh list data after create/update/delete actions.

Examples:

- Employee list: `src/scenes/admin/employee/employee_list.jsx`
- Task create form: `src/scenes/admin/task/add_task.jsx`
- Visit planner: `src/scenes/admin/fieldforce/visit_plan.jsx`
- Feature permission grid: `src/scenes/admin/permission/show_user_feature_list_permisision.jsx`

## Adding A New API And View

When a new backend route and response are provided, follow this workflow:

1. Add or update a controller function in the matching file under `src/api/controller`.
2. If needed, create a new scene under the correct feature folder in `src/scenes/admin` or another existing scene group.
3. Import controller functions into the scene and connect them with `useEffect` or event handlers.
4. Match the API response shape exactly, usually `status`, `message`, `data`, and `errors`.
5. Export the new scene from `src/scenes/index.js`.
6. Register the page in `src/Router.jsx`.
7. Add a sidebar or navbar link only if users should navigate to it directly.
8. Keep UI consistent with existing MUI patterns and local theme tokens.
9. Run a build or focused manual check after changes.

## Common Feature Areas

- HRMS: employees, departments, roles, designations, user activity
- Attendance: check-in/out, reports, leave requests, adjustments
- Tasks: task lists, add task, details, calendar, work reports
- Projects: project list, phases, team, tasks, workshop
- Leads/CRM: prospects, opportunities, Facebook leads, contact form leads, reports
- Field Force: visit planner, date-wise visits, my visits, visit map
- Warehouses: warehouse list, details, map
- Sales Product/POS: products, variants, stock, cart/order flow
- Settings: departments, roles, task priority/status/type, feature permissions

## Local Commands

```bash
npm install
npm run dev
npm run dev:landing
npm run build
npm run build:landing
npm run lint
```

## Landing Page Build

- Use `npm run dev:landing` to develop only the BrainToDo landing page.
- Use `npm run build:landing` to build the landing page for the main domain.
- Landing mode reads `.env.landing`, where `VITE_LANDING_ROOT=true` makes `/` load the landing page.
- Normal app development still uses `npm run dev`.

## Development Notes

- The app currently uses direct API controllers instead of a centralized query/mutation store.
- Keep new code close to the existing feature folder that owns the workflow.
- Use the existing `axiosInstance` and token-header convention unless the backend route is public.
- Avoid changing unrelated `dist` files during source work.
- If route visibility depends on permissions, update sidebar permission checks carefully.
