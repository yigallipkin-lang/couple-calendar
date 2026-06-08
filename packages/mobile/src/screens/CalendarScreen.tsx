import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import {
  useAuthContext,
  useCoupleContext,
  useEvents,
  getCalendarDays,
  formatMonthYear,
  getNextMonth,
  getPreviousMonth,
} from '@couple-calendar/shared';
import { Ionicons } from '@expo/vector-icons';
import type { Event } from '@couple-calendar/shared';

interface CalendarScreenProps {
  navigation: any;
}

export const CalendarScreen: React.FC<CalendarScreenProps> = ({ navigation }) => {
  const { user } = useAuthContext();
  const { couple, partner, myColor } = useCoupleContext();
  const { events, loading } = useEvents(couple?.id || null);

  const [currentDate, setCurrentDate] = useState(new Date());

  if (!user || !couple || !partner) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0f172a' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#94a3b8' }}>Please complete pairing to view calendar</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0f172a' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#0ea5e9" />
        </View>
      </SafeAreaView>
    );
  }

  const calendarDays = getCalendarDays(currentDate);
  const monthYear = formatMonthYear(currentDate);
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePreviousMonth = () => {
    setCurrentDate(getPreviousMonth(currentDate));
  };

  const handleNextMonth = () => {
    setCurrentDate(getNextMonth(currentDate));
  };

  const getEventsForDay = (day: number | null): Event[] => {
    if (day === null) return [];
    const targetDate = new Date(year, month, day);
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    return events.filter((event) => {
      if (!event.startTime && !event.allDay) return false;
      if (event.allDay) return true;
      const eventStart = new Date(event.startTime!);
      const eventEnd = event.endTime ? new Date(event.endTime) : eventStart;
      return eventStart <= endOfDay && eventEnd >= startOfDay;
    });
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0f172a' }}>
      <ScrollView style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}>
        {/* Header */}
        <View style={{ marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#f1f5f9' }}>
              {monthYear}
            </Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity
                onPress={handlePreviousMonth}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  backgroundColor: '#1e293b',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Ionicons name="chevron-back" size={24} color="#94a3b8" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleNextMonth}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  backgroundColor: '#1e293b',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Ionicons name="chevron-forward" size={24} color="#94a3b8" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Week day headers */}
        <View style={{ flexDirection: 'row', marginBottom: 8, gap: 8 }}>
          {weekDays.map((day) => (
            <View key={day} style={{ flex: 1 }}>
              <Text
                style={{
                  textAlign: 'center',
                  fontSize: 12,
                  fontWeight: '600',
                  color: '#94a3b8',
                  paddingVertical: 8,
                }}
              >
                {day}
              </Text>
            </View>
          ))}
        </View>

        {/* Calendar grid */}
        <View style={{ gap: 8 }}>
          {Array.from({ length: Math.ceil(calendarDays.length / 7) }).map((_, weekIndex) => (
            <View key={`week-${weekIndex}`} style={{ flexDirection: 'row', gap: 8 }}>
              {calendarDays.slice(weekIndex * 7, (weekIndex + 1) * 7).map((day, dayIndex) => {
                const dayEvents = getEventsForDay(day);
                const isToday =
                  day &&
                  new Date(year, month, day).toDateString() === new Date().toDateString();

                return (
                  <View key={`${weekIndex}-${dayIndex}`} style={{ flex: 1 }}>
                    <TouchableOpacity
                      disabled={!day}
                      style={{
                        aspectRatio: 1,
                        padding: 8,
                        borderRadius: 8,
                        borderWidth: 1,
                        backgroundColor: day
                          ? isToday
                            ? '#0c4a6e'
                            : '#1e293b'
                          : '#0f172a',
                        borderColor: day
                          ? isToday
                            ? '#0ea5e9'
                            : '#334155'
                          : '#0f172a',
                      }}
                    >
                      {day && (
                        <>
                          <Text
                            style={{
                              fontSize: 12,
                              fontWeight: '600',
                              color: '#f1f5f9',
                              marginBottom: 4,
                            }}
                          >
                            {day}
                          </Text>
                          <View style={{ gap: 2 }}>
                            {dayEvents.slice(0, 2).map((event) => (
                              <View
                                key={event.id}
                                style={{
                                  paddingHorizontal: 4,
                                  paddingVertical: 2,
                                  borderRadius: 3,
                                  backgroundColor: event.color + '20',
                                  borderLeftWidth: 2,
                                  borderLeftColor: event.color,
                                }}
                              >
                                <Text
                                  style={{
                                    fontSize: 8,
                                    color: event.color,
                                    fontWeight: '500',
                                  }}
                                  numberOfLines={1}
                                >
                                  {event.title}
                                </Text>
                              </View>
                            ))}
                            {dayEvents.length > 2 && (
                              <Text style={{ fontSize: 8, color: '#94a3b8' }}>
                                +{dayEvents.length - 2}
                              </Text>
                            )}
                          </View>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          ))}
        </View>

        {/* Upcoming events */}
        {events.length > 0 && (
          <View style={{ marginTop: 32, marginBottom: 32 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#f1f5f9', marginBottom: 16 }}>
              Upcoming Events
            </Text>
            {events
              .filter((event) => {
                if (!event.startTime) return true;
                return new Date(event.startTime) >= new Date();
              })
              .slice(0, 5)
              .map((event) => (
                <TouchableOpacity
                  key={event.id}
                  onPress={() => navigation.navigate('EventDetail', { eventId: event.id })}
                  style={{
                    padding: 12,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: '#334155',
                    backgroundColor: '#1e293b',
                    marginBottom: 12,
                  }}
                >
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <View
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: 6,
                        backgroundColor: event.color,
                        marginTop: 4,
                      }}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: '#f1f5f9' }}>
                        {event.title}
                      </Text>
                      <Text style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
                        {event.allDay
                          ? 'All day'
                          : event.startTime
                            ? new Date(event.startTime).toLocaleDateString()
                            : 'No time'}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        onPress={() => navigation.navigate('EventForm')}
        style={{
          position: 'absolute',
          bottom: 24,
          right: 24,
          width: 60,
          height: 60,
          borderRadius: 30,
          backgroundColor: '#0ea5e9',
          justifyContent: 'center',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 5,
        }}
      >
        <Ionicons name="add" size={28} color="#f1f5f9" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};
