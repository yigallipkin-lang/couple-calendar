import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashboardScreen from './DashboardScreen';
import PairingGenerateScreen from './PairingGenerateScreen';
import PairingAcceptScreen from './PairingAcceptScreen';
import { CalendarScreen } from './CalendarScreen';
import { EventFormScreen } from './EventFormScreen';

const Stack = createNativeStackNavigator();

export default function AppStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="PairingGenerate"
        component={PairingGenerateScreen}
      />
      <Stack.Screen
        name="PairingAccept"
        component={PairingAcceptScreen}
      />
      <Stack.Screen
        name="Calendar"
        component={CalendarScreen}
      />
      <Stack.Screen
        name="EventForm"
        component={EventFormScreen}
        options={{
          title: 'New Event',
        }}
      />
      {/* Future screens will be added here:
          - EventDetail
          - TodoLists
          - TodoDetail
          - Settings
      */}
    </Stack.Navigator>
  );
}
