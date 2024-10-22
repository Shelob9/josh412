import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import useLocalStorageState from "use-local-storage-state";
import usePrefersColorScheme from "use-prefers-color-scheme";

interface ThemeContextType {
  theme: string;
  switchTheme: () => void;
}

interface ThemeProviderProps {
  children: ReactNode;
  [key: string]: any;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

const ThemeProvider: React.FC<ThemeProviderProps> = ({ children, ...props }) => {
  const isSSR = typeof window === "undefined";
  const htmlTag = !isSSR && document.querySelector("html");
  const systemPrefersColorScheme = usePrefersColorScheme();
  const defaultTheme = systemPrefersColorScheme || "light";
  const [selectedTheme, setSelectedTheme] = useLocalStorageState<string | undefined>("picoColorScheme", undefined);
  const [theme, setTheme] = useState<string>("light");

  const switchTheme = () => {
    setSelectedTheme(theme === "dark" ? "light" : "dark");
  };

  const setDataThemeAttribute = (theme: string) => {
    if (htmlTag) {
      htmlTag.setAttribute("data-theme", theme);
    }
  };

  useEffect(() => {
    if (htmlTag) {
      if (selectedTheme) {
        setDataThemeAttribute(selectedTheme);
        setTheme(selectedTheme);
      } else {
        setDataThemeAttribute(defaultTheme);
        setTheme(defaultTheme);
      }
    }
  }, [htmlTag, defaultTheme, selectedTheme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        switchTheme,
        ...props,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export { ThemeProvider, useTheme };
