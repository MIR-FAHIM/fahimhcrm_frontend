import React, { createContext, useEffect, useState } from "react";
import { Box, CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";
import { Navbar, SideBar } from "./scenes";
import { Outlet } from "react-router-dom";
import { Provider } from 'react-redux'
import { DataProvider } from "./context/DataContext";
import { getUserModePreference } from "./api/controller/admin_controller/user_controller";
export const ToggledContext = createContext(null);

function App() {
  const [theme, colorMode] = useMode();
  const [toggled, setToggled] = useState(false);
  const values = { toggled, setToggled };
  const userID = localStorage.getItem("userId");
  const { setColorMode, setPreferenceLoading } = colorMode;

  useEffect(() => {
    let isMounted = true;

    const loadUserModePreference = async () => {
      const token = localStorage.getItem("authToken");
      if (!userID || !token) return;

      setPreferenceLoading(true);
      try {
        const response = await getUserModePreference(userID);
        if (!isMounted) return;

        const preference = response?.data?.is_dark_mode;
        const isDarkMode = preference === true || preference === 1 || preference === "1";
        setColorMode(isDarkMode ? "dark" : "light");
      } catch (error) {
        console.error("Failed to load user mode preference:", error);
      } finally {
        if (isMounted) {
          setPreferenceLoading(false);
        }
      }
    };

    loadUserModePreference();

    return () => {
      isMounted = false;
    };
  }, [userID, setColorMode, setPreferenceLoading]);

  return (
    <DataProvider>
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ToggledContext.Provider value={values}>
          <Box sx={{ display: "flex", height: "100vh", maxWidth: "100%" }}>
            <SideBar />
            <Box
              sx={{
                flexGrow: 1,
                display: "flex",
                flexDirection: "column",
                height: "100%",
                maxWidth: "100%",
              }}
            >
              <Navbar />
              <Box sx={{ overflowY: "auto", flex: 1, maxWidth: "100%" }}>
                <Outlet />
              </Box>
            </Box>
          </Box>
        </ToggledContext.Provider>
      </ThemeProvider>
    </ColorModeContext.Provider>
    </DataProvider>
  );
}

export default App;
