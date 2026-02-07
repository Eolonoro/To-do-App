import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export async function registerForNotifications() {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
        alert('Permission for notifications not granted');
        return false;
    } 

    if(Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('deafult', {
            name: 'deafult',
            importance: Notifications.AndroidImportance.HIGH,
            sound: 'default',
            vibrationPattern: [0, 250, 250, 250],
        });
    }
    return true;
}

export async function scheduleTodoNotifications(
    todoId: string,
    title: string,
    dueDate: string
) {
    const due = new Date(dueDate);

    const daysBefore = [7, 5, 3];
    const notificationsIds: string[] = [];

    for (const days of daysBefore) {
        const triggerDate = new Date(due);
        triggerDate.setDate(triggerDate.getDate() - days);

        if (triggerDate > new Date()) {
            const id = await Notifications.scheduleNotificationAsync({
                content: {
                    title: 'Todo reminder',
                    body: `"${title}" - ${days} days left`,
                    sound: 'default',
                },
                trigger: {
                    date: triggerDate,
                },
            });
            
            notificationsIds.push(id);
        }
    }
    return notificationsIds;
}