import useTripleTap from "@/hooks/useTripleTap";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Checkbox from "expo-checkbox";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { LayoutAnimation, Platform, StyleSheet, Text, TouchableOpacity, UIManager, View } from "react-native";
import { Calendar } from "react-native-calendars";
import { GestureDetector } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "./context/ThemeContext";


if (
    Platform.OS === 'android' &&
    UIManager.setLayoutAnimationEnabledExperimental
    ) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
    }
type ToDoType = {
    id: string;
    title: string;
    isDone: boolean;
    date: string;

}

export default function CalendarScreen() {
    const tripleTapGesture = useTripleTap();
    const router = useRouter();
    const {theme, toggleTheme, colors} = useTheme();
    const styles = getStyles(theme);
    const [todos, setTodos] = useState<ToDoType[]>([]);
    const today = new Date().toISOString().split('T')[0];
    const [selectedDate, setSelectedDate] = useState(today);


    useFocusEffect(
        useCallback(() => {
            const loadTodos = async () => {
                const storedTodos = await AsyncStorage.getItem('my-todo');
                if (storedTodos) {
                    setTodos(JSON.parse(storedTodos));
                }
            };

            loadTodos();
        }, [])
    );
    console.log('CALENDAR TODOS:', todos);


    const markedDates = todos.reduce((acc: any, todo) => {
        if (todo.date) {
            acc[todo.date] = {
                marked: true,
                dotColor: theme === 'dark' ? '#60A5FA' : '#4F46E5',
            };
        }
        return acc;
    }, {});

    const todoForSelectedDay = todos.filter(
        todo => todo.date === selectedDate)
        .sort((a, b) => Number(a.isDone) - Number(b.isDone))

    const toggleTodo = async (id: string) => {
        const updatedTodos = todos.map(todo => todo.id === id ? {...todo, isDone: !todo.isDone}
            : todo
        );

        setTodos(updatedTodos);
        await AsyncStorage.setItem('my-todo', JSON.stringify(updatedTodos));
    };

    return(

        <GestureDetector gesture={tripleTapGesture}>

            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.replace('/')}>
                        <Ionicons name='arrow-back' size={24} color={theme === 'dark' ? '#FFF' : '#111'}/>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Calendar</Text>
                    <View style={{ width: 24 }} />
                </View>
                
                <View style={styles.calendarWrapper}>
                <Calendar
                style={styles.calendar}
                markedDates={{...markedDates, [selectedDate]: {
                    selected: true,
                    selectedColor: '#4F46E5',
                }}}
                onDayPress={(day) => {
                    LayoutAnimation.configureNext(
                        LayoutAnimation.Presets.easeInEaseOut
                    );
                    setSelectedDate(day.dateString);
                }}/>
                </View>

                <View style={styles.todoSection}>
                    <Text style={styles.sectionTitle}>
                        Todo  for  {selectedDate}
                    </Text>

                    {todoForSelectedDay.length === 0 ? (
                        <Text style={styles.emptyText}> No task fo this day</Text>
                    ) : (
                        todoForSelectedDay.map(todo => (
                            <View key={todo.id} style={styles.todoItem}>
                                <View style={styles.todoRow}>
                                    <Checkbox value={todo.isDone}
                                    onValueChange={() => toggleTodo(todo.id)}
                                    color={todo.isDone ? '#4F46E5' : undefined}
                                    />
                                    <Text
                                        style={[
                                            styles.todoText,
                                            todo.isDone && styles.todoDone,
                                        ]}
                                    >
                                        {todo.title}
                                    </Text>
                                </View>
                            </View>
                        ))
                    )}

                </View>

            </SafeAreaView>
        </GestureDetector>
    )
}
const getStyles = (theme: 'light' | 'dark') => 
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme === 'dark' ? '#121212' : '#F2F2F2',
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 16,
        },
        headerTitle: {
            fontSize: 18,
            fontWeight: 600,
            color: theme === 'dark' ? '#fff': '#111',
        },
        calendar: {
            margin: 18,
            borderRadius: 12,
            color: theme === 'dark' ? '#fff': '#111',
        },
        todoSection: {
            marginTop: 20,
        },
        sectionTitle: {
            marginLeft: 8,
            fontSize: 16,
            fontWeight: '600',
            marginBottom: 10,
            color: theme === 'dark' ? '#fff' : '#111',
        },
        emptyText: {
            textAlign: 'center',
            color: theme === 'dark' ? '#aaa' : '#666',
            marginTop: 10,
        },
        todoItem: {
            backgroundColor: theme === 'dark' ? '#1E1E1E' : '#FFF',
            padding: 12,
            borderRadius: 10,
            marginBottom: 8,
        },
        todoText: {
            fontSize: 16,
            color: theme === 'dark' ? '#fff' : '#111',
        },
        todoRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
        },
        todoDone: {
            textDecorationLine: 'line-through',
            opacity: 0.5,
        },
        calendarWrapper: {
            backgroundColor: '#fff',
            borderRadius: 16,
            overflow: 'hidden',
            marginHorizontal: 20,
            marginTop: 16,
        }

    })