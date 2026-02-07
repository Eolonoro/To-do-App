import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import CalendarScreen from './CalendarScreen';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import HomeScreen from './index';
import SettingsScreen from './SettingsScreen';

const Drawer = createDrawerNavigator();

export default function Layout() {
  return (
    <ThemeProvider>
      <RootStack />
    </ThemeProvider>
  );

  function RootStack() {
    const { theme } = useTheme();

    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Drawer.Navigator
          screenOptions={{
            headerShown: false,
            drawerPosition: 'left',
            drawerType: 'slide',
          }}
          drawerContent={(props) => (
            <View style={{ flex: 1, backgroundColor: theme === 'dark' ? '#121212' : '#F2F2F2' }}>
              <DrawerContentScrollView {...props}>
                <DrawerItemList {...props} />
              </DrawerContentScrollView>
            </View>
          )}
        >
          <Drawer.Screen
            name="Home"
            component={HomeScreen}
            options={{
              title: 'Home',
            }}
          />
          <Drawer.Screen
            name="Settings"
            component={SettingsScreen}
            options={{
              title: 'Settings',
            }}
          />
          <Drawer.Screen
            name="Calendar"
            component={CalendarScreen}
            options={{
              title: 'Calendar',
            }}
          />
        </Drawer.Navigator>
      </GestureHandlerRootView>
    );
  }
}