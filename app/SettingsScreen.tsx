import useTripleTap from "@/hooks/useTripleTap";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Switch, Text, TouchableOpacity, View, } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from './context/ThemeContext';

export default function SettingsScreen() {
    const tripleTapGesture = useTripleTap();
    const router = useRouter();
    const { theme, toggleTheme, colors } = useTheme();
    const styles = getStyles(theme);

  return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.replace('/')}>
            <Ionicons name='arrow-back' size={24} color={theme === 'dark' ? '#FFF' : '#111'}/>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.content}>
          <Text style={styles.cardTitle}>Apperance</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.label}>Dark mode</Text>
              <Switch 
                value={theme === 'dark'}
                onValueChange={toggleTheme}/>
            </View>
          </View>
          <Text style={styles.cardTitle}>Data</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.label}>Clear all todos</Text>
              <Ionicons style={styles.value} name="trash" size={24} color={'gray'} />
            </View>
          </View>

          <Text style={styles.cardTitle}>About</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.label}>Version</Text>
              <Text style={styles.value}>1.0.0</Text>
            </View>
          </View>
        </View>

        

      </SafeAreaView>
  );
}




const getStyles = (theme: 'light' | 'dark') => StyleSheet.create({
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
  content: {
    flex: 1,
    padding: 16,
    alignContent: 'center',
  },
  card: {
    backgroundColor: theme === 'dark' ? '#1E1E1E' : '#FFFFFF',
    borderRadius: 14,
    padding: 20,
    elevation: 4,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 600,
    marginBottom: 5,
    color: theme === 'dark' ? '#fff': '#111',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 15,
    color: theme === 'dark' ? '#ddd' : '#333',
    alignItems: 'center',
  },
  value: {
    color: theme === 'dark' ? '#ddd' : '#333',
    flexDirection: 'row',
  },
});