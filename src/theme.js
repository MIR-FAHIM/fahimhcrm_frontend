// theme/index.js
import { createTheme } from "@mui/material";
import { useMemo, useState, createContext } from "react";

/** Color tokens */
export const tokens = (mode) => ({
  ...(mode === "dark"
    ? {
        gray: {
          100: "#F5F6FA",
          200: "#DCE0E8",
          300: "#B5BBC7",
          400: "#8D95A3",
          500: "#666F80",
          600: "#4A5160",
          700: "#343946",
          800: "#2B2D38", // paper
          900: "#1E1F25", // background
        },
        primary: {
          100: "#AECBF9",
          200: "#86ADF5",
          300: "#5E8FF1",
          400: "#3A86FF", // vivid accent
          500: "#1D4ED8", // brand
          600: "#153CA6",
        },
        /** NEW: blueAccent (cooler UI blues for chips, info, links) */
        blueAccent: {
          100: "#EAF2FF",
          200: "#CFE0FF",
          300: "#A7C6FF",
          400: "#7AADFF",
          500: "#3A86FF",
          600: "#1D4ED8",
          700: "#153CA6",
          800: "#0F2C78",
          900: "#0A1E52",
        },
        greenAccent: {
          100: "#D1F5EE",
          200: "#9DE2D0",
          300: "#6BD0B4",
          400: "#2EC4B6",
          500: "#229A8F",
        },
        orangeAccent: {
          100: "#FFE5C2",
          200: "#FFD6A5",
          300: "#FFB347",
          400: "#FF9F1C",
          500: "#E67E00",
        },
        purpleAccent: {
          100: "#E0BBF2",
          200: "#C48AE6",
          300: "#A960DB",
          400: "#9B5DE5",
          500: "#7A3DC1",
        },
        redAccent: {
          100: "#F9C5D0",
          200: "#F497A9",
          300: "#F06B88",
          400: "#EF476F",
          500: "#C0264B",
        },
      }
    : {
        gray: {
          100: "#1E1F25",
          200: "#2B2D38",
          300: "#434956",
          400: "#666F80",
          500: "#8D95A3",
          600: "#B5BBC7",
          700: "#DCE0E8",
          800: "#F5F6FA",
          900: "#FFFFFF",
        },
        primary: {
          100: "#EAF2FF",
          200: "#D4E4FF",
          300: "#AECBF9",
          400: "#86ADF5",
          500: "#3A86FF", // brand
          600: "#1D4ED8",
        },
        /** NEW: blueAccent mirrored for light mode */
        blueAccent: {
          100: "#0A1E52",
          200: "#0F2C78",
          300: "#153CA6",
          400: "#1D4ED8",
          500: "#3A86FF",
          600: "#7AADFF",
          700: "#A7C6FF",
          800: "#CFE0FF",
          900: "#EAF2FF",
        },
        greenAccent: {
          100: "#EAFBF8",
          200: "#D1F5EE",
          300: "#9DE2D0",
          400: "#6BD0B4",
          500: "#2EC4B6",
        },
        orangeAccent: {
          100: "#FFF7E6",
          200: "#FFE5C2",
          300: "#FFD6A5",
          400: "#FFB347",
          500: "#FF9F1C",
        },
        purpleAccent: {
          100: "#F5E8FF",
          200: "#E0BBF2",
          300: "#C48AE6",
          400: "#A960DB",
          500: "#9B5DE5",
        },
        redAccent: {
          100: "#FFE9ED",
          200: "#F9C5D0",
          300: "#F497A9",
          400: "#F06B88",
          500: "#EF476F",
        },
      }),
});

/** MUI theme settings */
export const themeSettings = (mode) => {
  const colors = tokens(mode);
  const isDark = mode === "dark";

  return {
    palette: {
      mode,
      primary: { main: colors.primary[500], light: colors.primary[300], dark: colors.primary[600] },
      secondary: { main: colors.greenAccent[500] },
      /** expose blueAccent as a first-class palette entry */
      blueAccent: {
        main: colors.blueAccent[500],
        light: colors.blueAccent[600],
        dark: colors.blueAccent[400],
        contrastText: isDark ? "#0B1020" : "#fff",
      },
      error: { main: colors.redAccent[400] },
      warning: { main: colors.orangeAccent[400] },
      info: { main: colors.blueAccent[500] },
      success: { main: colors.greenAccent[400] },
      text: {
        primary: isDark ? colors.gray[100] : colors.gray[100],
        secondary: isDark ? colors.gray[400] : colors.gray[500],
      },
      background: {
        default: isDark ? colors.gray[900] : colors.gray[900],
        paper: isDark ? colors.gray[800] : colors.gray[800],
      },
      divider: isDark ? colors.gray[700] : colors.gray[700],
    },
    shape: { borderRadius: 12 },
    typography: {
      fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
      h5: { fontWeight: 800 },
      button: { textTransform: "none", fontWeight: 700 },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: { borderRadius: 10 },
          containedPrimary: { boxShadow: "0 6px 14px rgba(58,134,255,0.25)" },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: { borderRadius: 16 },
        },
      },
      MuiAlert: {
        defaultProps: { variant: "filled" },
      },
    },
  };
};

/** color mode context & hook */
export const ColorModeContext = createContext({ toggleColorMode: () => {} });

export const useMode = () => {
  const [mode, setMode] = useState("light");
  const colorMode = useMemo(
    () => ({ toggleColorMode: () => setMode((p) => (p === "light" ? "dark" : "light")) }),
    []
  );
  const theme = useMemo(() => createTheme(themeSettings(mode)), [mode]);
  return [theme, colorMode];
};
