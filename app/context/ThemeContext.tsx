import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";


type Theme = 'light' | 'dark';

const colors = {
  light: {
    background: '#ffffff',
    text: '#111111',
    card: '#f2f2f2',
  },
  dark: {
    background: '#121212',
    text: '#ffffff',
    card: '#1e1e1e',
  },
};


type ThemeContextType = {
    theme: Theme;
    toggleTheme: () => void;
    colors: typeof colors.light;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({children}: {children: React.ReactNode}) {
    const [theme, setTheme] = useState<Theme>('light');

    useEffect(() => {
        const loadTheme = async() => {
            const savedTheme = await AsyncStorage.getItem('app-theme');
            if (savedTheme === 'light' || savedTheme === 'dark') {
                setTheme(savedTheme);
            }
        };
        loadTheme();
    }, []);

    const toggleTheme = async () => {
        setTheme(prev => {
            const nextTheme = prev === 'light' ? 'dark' : 'light'; 
            AsyncStorage.setItem('app-theme', nextTheme)
            return nextTheme;
        });
    };

    return (
        <ThemeContext.Provider value={{theme, toggleTheme, colors: colors[theme]}}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) {
        throw new Error('useTheme must be used inside ThemeProvider');
    }
    return ctx;
}