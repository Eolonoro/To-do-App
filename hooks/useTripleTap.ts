import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Gesture } from "react-native-gesture-handler";
import { useTheme } from "../app/context/ThemeContext";

export default function useTripleTap() {
    const { theme } = useTheme();
    const router = useRouter();
    const tapCountRef = useRef(0);
    const tapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const tripleTabGesture = Gesture.Tap()
        .numberOfTaps(1)
        .onEnd(() => {
            tapCountRef.current += 1;

            if (tapTimerRef.current) {
                clearTimeout(tapTimerRef.current);
            }

            tapTimerRef.current = setTimeout(() => {
                tapCountRef.current = 0;
            }, 500);

            if (tapCountRef.current === 3) {
                tapCountRef.current = 0;
                router.back();
            }
        });

        useEffect(() => {
            return () => {
                if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
            };
        }, []);

    return tripleTabGesture;
}