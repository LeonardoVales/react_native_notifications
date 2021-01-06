import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import * as Permissions from 'expo-permissions';
import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Button, Platform, Alert, TextInput } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  })
})

export default function App() {

  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(false);

  const [token, setToken] = useState('');

  const notificationListener = useRef();
  const responseListener = useRef();

  async function getToken() {
    const response = await Notifications.getExpoPushTokenAsync();
    
    setToken(response.data);    
  }

  useEffect( () => {
    registerForPushNotificationsAsync().then(token => setExpoPushToken(token));

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationReceivedListener(response => {
      console.log(response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, []);

  return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'space-around',
        }}>
          <Text selectable={true} style={{alignItems: 'center'}}>Token do dispositivo: {expoPushToken}</Text>
          <View style={{ alignItems: 'center', justifyContent: 'center'}}>
            <Text>Título: {notification && notification.request.content.title}</Text>
            <Text>Mensagem: {notification && notification.request.content.body} </Text>
            <Text>Data: {notification && JSON.stringify(notification.request.content.data)}</Text>
          </View>
          
          <Button title="Enviar notificação" 
          onPress={ async () => {
            await schedulePushNotification();
          } }/>

          <Button title="Get Token" onPress={ async () => {
            await getToken();
          }} />

      <Text selectable={true} style={{alignItems: 'center'}}>{token}</Text>
    
      </View>
  );
}

async function schedulePushNotification() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Nova notificação",
      body: 'Você recebeu uma nova notificação',
      data: { data: 'goes here' },
    },

    trigger: { seconds: 2 },
  });
}

async function registerForPushNotificationsAsync() {
    let token;
    if (Constants.isDevice) {
      const { status: existingStatus } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return;
      }

      token = (await Notifications.getExpoPushTokenAsync()).data;
      // console.log(token);
    } else {
      Alert.alert('Você não está em um dispositivo físico');
    }

    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    return token;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
