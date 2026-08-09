// theme/index.js
import { createTheme } from "@mui/material";
import { useCallback, useEffect, useMemo, useState, createContext } from "react";

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

export const appFontFamily =
  '"Inter", "Noto Sans Bengali", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

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
      fontFamily: appFontFamily,
      htmlFontSize: 16,
      fontSize: 14,
      fontWeightLight: 300,
      fontWeightRegular: 450,
      fontWeightMedium: 600,
      fontWeightBold: 700,
      h1: { fontSize: "2.25rem", fontWeight: 750, lineHeight: 1.15, letterSpacing: 0 },
      h2: { fontSize: "2rem", fontWeight: 740, lineHeight: 1.18, letterSpacing: 0 },
      h3: { fontSize: "1.72rem", fontWeight: 720, lineHeight: 1.2, letterSpacing: 0 },
      h4: { fontSize: "1.42rem", fontWeight: 700, lineHeight: 1.25, letterSpacing: 0 },
      h5: { fontSize: "1.18rem", fontWeight: 680, lineHeight: 1.3, letterSpacing: 0 },
      h6: { fontSize: "1rem", fontWeight: 680, lineHeight: 1.35, letterSpacing: 0 },
      subtitle1: { fontSize: "0.95rem", fontWeight: 620, lineHeight: 1.45, letterSpacing: 0 },
      subtitle2: { fontSize: "0.84rem", fontWeight: 620, lineHeight: 1.45, letterSpacing: 0 },
      body1: { fontSize: "0.93rem", fontWeight: 450, lineHeight: 1.55, letterSpacing: 0 },
      body2: { fontSize: "0.84rem", fontWeight: 450, lineHeight: 1.5, letterSpacing: 0 },
      caption: { fontSize: "0.74rem", fontWeight: 560, lineHeight: 1.35, letterSpacing: 0 },
      overline: { fontSize: "0.72rem", fontWeight: 650, letterSpacing: 0, textTransform: "uppercase" },
      button: { textTransform: "none", fontSize: "0.84rem", fontWeight: 650, letterSpacing: 0 },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          "html, body, #root": {
            fontFamily: appFontFamily,
          },
          body: {
            backgroundColor: isDark ? colors.gray[900] : colors.gray[900],
            color: isDark ? colors.gray[100] : colors.gray[100],
            fontSize: 14,
            fontWeight: 450,
            textRendering: "optimizeLegibility",
            WebkitFontSmoothing: "antialiased",
            MozOsxFontSmoothing: "grayscale",
          },
          "#root": {
            backgroundColor: isDark ? colors.gray[900] : colors.gray[900],
          },
          ".dark": {
            colorScheme: "dark",
          },
        },
      },
      MuiTypography: {
        styleOverrides: {
          root: {
            letterSpacing: 0,
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderColor: isDark ? colors.gray[700] : colors.gray[700],
            fontFamily: appFontFamily,
            fontSize: "0.84rem",
            fontWeight: 450,
          },
          head: {
            color: isDark ? colors.gray[100] : colors.gray[100],
            backgroundColor: isDark ? colors.gray[800] : colors.gray[800],
            fontSize: "0.78rem",
            fontWeight: 700,
            letterSpacing: 0,
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            backgroundImage: "none",
            backgroundColor: isDark ? colors.gray[800] : colors.gray[900],
          },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            backgroundImage: "none",
            backgroundColor: isDark ? colors.gray[800] : colors.gray[900],
          },
        },
      },
      MuiPopover: {
        styleOverrides: {
          paper: {
            backgroundImage: "none",
            backgroundColor: isDark ? colors.gray[800] : colors.gray[900],
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? colors.gray[800] : colors.gray[900],
            fontFamily: appFontFamily,
            fontSize: "0.86rem",
          },
        },
      },
      MuiInputBase: {
        styleOverrides: {
          root: {
            fontFamily: appFontFamily,
            fontSize: "0.86rem",
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            fontFamily: appFontFamily,
            fontSize: "0.86rem",
            fontWeight: 600,
            letterSpacing: 0,
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            fontFamily: appFontFamily,
            fontSize: "0.86rem",
            fontWeight: 500,
          },
        },
      },
      MuiFilledInput: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? colors.gray[800] : colors.gray[800],
            fontFamily: appFontFamily,
            fontSize: "0.86rem",
            "&:hover": {
              backgroundColor: isDark ? colors.gray[700] : colors.gray[700],
            },
            "&.Mui-focused": {
              backgroundColor: isDark ? colors.gray[800] : colors.gray[800],
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            fontFamily: appFontFamily,
            fontSize: "0.84rem",
            fontWeight: 650,
            letterSpacing: 0,
          },
          containedPrimary: { boxShadow: "0 6px 14px rgba(58,134,255,0.25)" },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontFamily: appFontFamily,
            fontSize: "0.75rem",
            fontWeight: 620,
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            fontFamily: appFontFamily,
            fontSize: "0.84rem",
            fontWeight: 650,
            letterSpacing: 0,
            textTransform: "none",
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            fontFamily: appFontFamily,
            fontSize: "0.74rem",
            fontWeight: 560,
          },
        },
      },
      MuiDataGrid: {
        styleOverrides: {
          root: {
            fontFamily: appFontFamily,
            fontSize: "0.84rem",
          },
          columnHeaderTitle: {
            fontWeight: 700,
            letterSpacing: 0,
          },
          cell: {
            fontWeight: 450,
          },
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
export const ColorModeContext = createContext({
  mode: "light",
  setColorMode: () => {},
  toggleColorMode: () => {},
  preferenceLoading: false,
  setPreferenceLoading: () => {},
});

export const useMode = () => {
  const [mode, setMode] = useState(() => {
    const savedMode = localStorage.getItem("themeMode");
    return savedMode === "dark" || savedMode === "light" ? savedMode : "light";
  });
  const [preferenceLoading, setPreferenceLoading] = useState(false);

  const setColorMode = useCallback((nextMode) => {
    const normalizedMode = nextMode === "dark" ? "dark" : "light";
    setMode(normalizedMode);
    localStorage.setItem("themeMode", normalizedMode);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", mode === "dark");
    document.documentElement.setAttribute("data-theme", mode);
  }, [mode]);

  const colorMode = useMemo(
    () => ({
      mode,
      preferenceLoading,
      setPreferenceLoading,
      setColorMode,
      toggleColorMode: () => setColorMode(mode === "light" ? "dark" : "light"),
    }),
    [mode, preferenceLoading, setColorMode]
  );

  const theme = useMemo(() => createTheme(themeSettings(mode)), [mode]);
  return [theme, colorMode];
};
