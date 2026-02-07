import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Checkbox } from 'expo-checkbox';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Image, Keyboard, KeyboardAvoidingView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from './context/ThemeContext';

type ToDoType ={
  id: string;
  title: string;
  isDone: boolean;
  date: string;
  reminderStage?: 7 | 5 | 3 | null;
}

  const groupTodoByDate = (todos: ToDoType[]) => {
    const today = new Date().toISOString().split('T')[0];

    const tomorrowObj = new Date();
    tomorrowObj.setDate(tomorrowObj.getDate() + 1);
    const tomorrow = tomorrowObj.toISOString().split('T')[0];

    return {
      today: todos.filter(t => t.date === today),
      tomorrow: todos.filter(t => t.date === tomorrow),
      later: todos.filter(t => t.date > tomorrow).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    };
  };

    const getDaysLeft = (date: string) => {
    const today = new Date();
    const target = new Date(date);

    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);

    const diff =
      target.getTime() - today.getTime();

    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };


  const getReminderStage = (date: string): 7 | 5 | 3 | null => {
    const today = new Date();
    const target = new Date(date);

    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);

    const diffDays = Math.round(target.getTime() - today.getTime()) / (1000 * 60 *  60 * 24);

    if (diffDays === 7) return 7;
    if (diffDays === 5) return 5;
    if (diffDays === 3) return 3;

    return null;
  }
  

  export default function HomeScreen() {

    
    const router = useRouter();
    const {theme, toggleTheme} = useTheme()
    const styles = getStyles(theme);
    const today = new Date().toISOString().split('T')[0];
    
    
    const [todos, setTodos] = useState<ToDoType[]>([]);
    const [todoText, setTodoText] = useState<string>('');
    const [searchQery, setSearchQuery] = useState<string>('');
    const [oldTodos, setOldTodos] = useState<ToDoType[]>([]);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(today);
    const [dateObj, setDateObj] = useState(new Date());
    const [showPicker, setShowPicker] = useState(false);
    
  const swipeGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])  
    .failOffsetY([-5, 5])      
    .onEnd((event) => {
      if (event.translationX > 80) {
        setIsMenuOpen(true);
      }
      if (event.translationX < -80) {
        setIsMenuOpen(false);
      }
    });

  useEffect(() => {
    const getTodos = async() => {
        try{
          const todos = await AsyncStorage.getItem('my-todo');
          if( todos !== null ) {
            setTodos(JSON.parse(todos));
            setOldTodos(JSON.parse(todos));
          }
        }
        catch (error) {
        console.log(error);
      } 
    };
    getTodos();

  }, []);

  const addTodo = async () => {
    if (!todoText.trim()) return;

    try {
      const newTodo: ToDoType = {
        id: `${Date.now()}-${Math.random()}`,
        title: todoText,
        isDone: false,
        date: selectedDate,
        reminderStage: getReminderStage(selectedDate),
      };

      const updatedTodos = [newTodo, ...todos];
      

      setTodos(updatedTodos);
      setOldTodos(updatedTodos);
      await AsyncStorage.setItem('my-todo', JSON.stringify(updatedTodos));
      setTodoText('');
      Keyboard.dismiss();
    } catch (error) {
      console.log('Error saving todo:', error);
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      const newTodos = oldTodos.filter(todo => todo.id !== id);

      setOldTodos(newTodos);

      if (searchQery) {
        setTodos(
          newTodos.filter(todo => todo.title.toLowerCase().includes(searchQery.toLowerCase())
        )
        );
      } else {
        setTodos(newTodos);
      }
      await AsyncStorage.setItem('my-todo', JSON.stringify(newTodos));
    } catch (error) {
      console.log(error);
    }
  };


  const handleDone = async(id:string) => {
    try {
      const newTodos = todos.map((todo) => {
        if (todo.id === id) {
          todo.isDone = !todo.isDone;
        }
        return todo;
      });
      await AsyncStorage.setItem('my-todo', JSON.stringify(newTodos));
      setTodos(newTodos);
      setOldTodos(newTodos);
    } catch(error) {
      console.log(error);
    }
  };

  const onSearch = (query: string) => {
    if(query == '') {
      setTodos(oldTodos);
    } else {
      const filteredTodos = oldTodos.filter((todo) => todo.title.toLowerCase().includes(query.toLowerCase()));
      setTodos(filteredTodos);
    }
  };

  useEffect(() => {
    onSearch(searchQery);
  }, [searchQery]);

  const sortedTodos = [...todos].sort(
  (a, b) => Number(a.isDone) - Number(b.isDone)
  );

  const { 
    today: todayTodos, 
    tomorrow: tomorrowTodos, 
    later: laterTodos, 
  } = groupTodoByDate(sortedTodos);

  return (
    <GestureDetector gesture={swipeGesture}>
    <SafeAreaView style={styles.container}>
      <View style={{ flex: 1}}>
        <ScrollView contentContainerStyle={{paddingBottom: 20}}
        showsVerticalScrollIndicator={false}
        >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setIsMenuOpen(true)}>
          <Ionicons name='menu' size={24} color={'#333'} />
        </TouchableOpacity>
        <TouchableOpacity>
        <Image source={{uri: 'https://images.unsplash.com/photo-1769364323382-e2de114ab151?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'}} 
        style={{width: 40, height: 40, borderRadius: 20}} 
        />
        </TouchableOpacity>
      </View>

      <View style={styles.searchBar}>
        <Ionicons name='search' size={24} color={'#333'} />
        <TextInput 
        placeholder='Search'
        value={searchQery}
        onChangeText={(text) => setSearchQuery(text)}
        style={styles.searchInput} 
        />
        {searchQery.length > 0 && (
          <TouchableOpacity
          onPress={() => setSearchQuery('')}
          style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color={'gray'}/>
          </TouchableOpacity>
        )}
      </View>

        {todayTodos.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Today</Text>

            <FlatList
              data={todayTodos}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <ToDoItem
                  todo={item}
                  deleteTodo={deleteTodo}
                  handleTodo={handleDone}
                  styles={styles}
                />
              )}
              scrollEnabled={false}
            />
          </View>
        )}
        {tomorrowTodos.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tomorrow</Text>  
            <FlatList
              data={tomorrowTodos}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <ToDoItem
                  todo={item}
                  deleteTodo={deleteTodo}
                  handleTodo={handleDone}
                  styles={styles}
                />
              )}
              scrollEnabled={false}
            />
          </View>
        )}

        {laterTodos.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Later</Text>

            <FlatList
              data={laterTodos}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <ToDoItem
                  todo={item}
                  deleteTodo={deleteTodo}
                  handleTodo={handleDone}
                  styles={styles}
                />
              )}
              scrollEnabled={false}
            />
          </View>
        )}
        </ScrollView>
      </View>


        <View style={styles.dateSelector}>
        <TouchableOpacity style={styles.datePickerButton}
        onPress={() => setShowPicker(true)}
        >
          <Ionicons name='calendar-outline' size={24} color={theme === 'dark' ? '#FFF' : '#111'}/>
          <Text style={styles.datePickerText}>{selectedDate}</Text>
        </TouchableOpacity>
        {showPicker && (<DateTimePicker
        value={dateObj}
        mode="date"
        display="calendar"
        onChange={(event, selected) => {
          setShowPicker(false);

          if (selected) {
            setDateObj(selected);
            setSelectedDate(selected.toISOString().split('T')[0]);
          }
        }}
        />
        )}
      </View>

      <KeyboardAvoidingView style={styles.footer} behavior='padding' keyboardVerticalOffset={10}>
        <TextInput 
        placeholder='Add New ToDo'
        value={todoText} 
        onChangeText={(text)=> setTodoText(text)} 
        style={styles.newTodoInput}
        autoCorrect={false}
        />
        
      <TouchableOpacity
          style={[styles.addButton,!todoText.trim() && { opacity: 0.5 },]}
          onPress={addTodo}
          disabled={!todoText.trim()}
          >
          <Ionicons name="add" size={34} color="#fff" />
      </TouchableOpacity>
      </KeyboardAvoidingView>

      {isMenuOpen && (
        <View style={styles.sidePanel}>
            <TouchableOpacity onPress={() => setIsMenuOpen(false)}>
              <Ionicons name='menu' size={24} color={'#333'} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={() => {
                setIsMenuOpen(false);
                router.push('/SettingsScreen');
              }}>
              <Ionicons name='settings-outline'size={24} color={theme === 'dark' ? '#FFF' : '#111'}/> 
              <Text style={styles.menuText}>Settings</Text>
            </TouchableOpacity>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
              <TouchableOpacity 
              style={styles.menuItem} 
              onPress={() => {
                setIsMenuOpen(false);
                router.push('/CalendarScreen');
              }}>
              <Ionicons name='calendar-number-outline' size={24} color={theme === 'dark' ? '#FFF' : '#111'}/> 
              <Text style={styles.menuText}>Calendar</Text>
            </TouchableOpacity>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}></View>
            </View>
        </View>
      )}  
    </SafeAreaView>
    </GestureDetector>   
  );
}

const ToDoItem = ({todo, deleteTodo, handleTodo, styles,} : 
  {todo: ToDoType; deleteTodo: (id:string) => void; 
    handleTodo: (id:string) => void; 
    styles: any;
  }) => {
    const reminderStage = getReminderStage(todo.date);

    return (
          <View style={styles.todoContainer}>
            <View style={styles.todoInfoContainer}>
            <Checkbox color={'#4F46E5'} value={todo.isDone}
            onValueChange={() => handleTodo(todo.id)}/>
            <Text style={[
              styles.todoText, 
              todo.isDone && {textDecorationLine: "line-through"}]}>{todo.title}
            </Text>
            {reminderStage && !todo.isDone && (
              <View
                style={[
                  styles.reminderBadge,
                  reminderStage === 3 && styles.reminderUrgent,
                ]}
              >
                <Text style={styles.reminderText}>
                  ⏰ {reminderStage} days left
                </Text>
            </View>
          )}
            </View>

            <TouchableOpacity onPress={() => {
              deleteTodo(todo.id);
              //alert('Deleted ' + todo.id)
              }}>
            <Ionicons name='trash' size={24} color={'gray'} />
            </TouchableOpacity>
          </View>
    )
}

const getStyles = (theme: 'light' | 'dark') =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme === 'dark' ? '#121212' : '#F2F2F2',
    },
    listContainer: {
      flex: 1,
    },
    content: {
      flex: 1,
    },
    header: {
      padding: 16,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },

    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: 16,
      marginBottom: 12,
      padding: 10,
      borderRadius: 12,
      backgroundColor: theme === 'dark' ? '#1E1E1E' : '#FFFFFF',
    },

    searchInput: {
      flex: 1,
      marginLeft: 8,
      color: theme === 'dark' ? '#FFFFFF' : '#111111',
    },

    clearButton: {
      marginLeft: 6,
    },

    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      gap: 10,
    },

    newTodoInput: {
      flex: 1,
      padding: 12,
      borderRadius: 12,
      backgroundColor: theme === 'dark' ? '#1E1E1E' : '#FFFFFF',
      color: theme === 'dark' ? '#FFFFFF' : '#111111',
    },

    addButton: {
      backgroundColor: '#3B82F6',
      borderRadius: 12,
      padding: 10,
      justifyContent: 'center',
      alignItems: 'center',
    },

    sidePanel: {
      position: 'absolute',
      left: 0,
      top: 10,
      bottom: 10,
      width: 250,
      padding: 20,
      backgroundColor: theme === 'dark' ? '#1E1E1E' : '#FFFFFF',
      elevation: 6,
      borderRadius: 10,
    },

    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginTop: 20,
    },

    menuText: {
      fontSize: 16,
      color: theme === 'dark' ? '#FFFFFF' : '#111111',
    },

    todoContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginHorizontal: 16,
      marginBottom: 10,
      padding: 14,
      borderRadius: 12,
      backgroundColor: theme === 'dark' ? '#1E1E1E' : '#FFFFFF',
    },

    todoInfoContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },

    todoText: {
      color: theme === 'dark' ? '#FFFFFF' : '#111111',
      fontSize: 16,
    },
    dateSelector: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: -20,
    },
    datePickerButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingVertical: 8,
      marginHorizontal: 16,
    },

    datePickerText: {
      fontSize: 14,
      color: '#4F46E5',
      fontWeight: '500',
    },
    section: {
      marginBottom: 16,
    },

    sectionTitle: {

      fontSize: 13,
      fontWeight: '600',
      marginBottom: 6, 
      color: theme === 'dark' ? '#AAA' : '#666',
      textTransform: 'uppercase',
      marginLeft: 15,
    },
    reminderBadge: {
      marginTop: 4,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 8,
      backgroundColor: '#DBEAFE', 
      alignSelf: 'flex-start',
    },

    reminderUrgent: {
      backgroundColor: '#FECACA', 
    },

    reminderText: {
      fontSize: 11,
      fontWeight: '600',
      color: '#1E3A8A',
    },
  });