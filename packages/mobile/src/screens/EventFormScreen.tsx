import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  useAuthContext,
  useCoupleContext,
  useEvents,
} from '@couple-calendar/shared';
import { Ionicons } from '@expo/vector-icons';
import type { EventFormData, ReminderType } from '@couple-calendar/shared';

interface EventFormScreenProps {
  route?: {
    params?: {
      eventId?: string;
    };
  };
  navigation: any;
}

export const EventFormScreen: React.FC<EventFormScreenProps> = ({ route, navigation }) => {
  const { user } = useAuthContext();
  const { couple, myColor } = useCoupleContext();
  const { events, createEvent, updateEvent } = useEvents(couple?.id || null);

  const [title, setTitle] = useState('');
  const [allDay, setAllDay] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(new Date());
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [notes, setNotes] = useState('');
  const [location, setLocation] = useState('');
  const [reminder, setReminder] = useState<ReminderType>('none');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  const reminderOptions: { label: string; value: ReminderType }[] = [
    { label: 'No reminder', value: 'none' },
    { label: '15 minutes before', value: '15min' },
    { label: '1 hour before', value: '1hour' },
    { label: '1 day before', value: '1day' },
    { label: '1 week before', value: '1week' },
  ];

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      setStartTime(selectedDate);
    }
  };

  const handleStartTimeChange = (event: any, selectedDate?: Date) => {
    setShowStartTimePicker(false);
    if (selectedDate && startTime) {
      const newDate = new Date(startTime);
      newDate.setHours(selectedDate.getHours(), selectedDate.getMinutes());
      setStartTime(newDate);
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      setEndTime(selectedDate);
    }
  };

  const handleEndTimeChange = (event: any, selectedDate?: Date) => {
    setShowEndTimePicker(false);
    if (selectedDate && endTime) {
      const newDate = new Date(endTime);
      newDate.setHours(selectedDate.getHours(), selectedDate.getMinutes());
      setEndTime(newDate);
    }
  };

  const handleSubmit = async () => {
    setError(null);

    if (!title.trim()) {
      setError('Event title is required');
      return;
    }

    if (!allDay && !startTime) {
      setError('Start time is required for timed events');
      return;
    }

    setLoading(true);

    try {
      if (!user?.uid) {
        throw new Error('User not authenticated');
      }

      const eventData: EventFormData = {
        title: title.trim(),
        allDay,
        startTime: allDay ? null : startTime,
        endTime: allDay ? null : endTime,
        notes: notes.trim() || undefined,
        location: location.trim() || undefined,
        reminder,
      };

      await createEvent(eventData, user.uid, myColor);
      navigation.goBack();
    } catch (err: any) {
      setError(err.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  if (!user || !couple) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0f172a' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#94a3b8' }}>Please complete pairing first</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0f172a' }}>
      <ScrollView style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#f1f5f9' }}>New Event</Text>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              backgroundColor: '#1e293b',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Ionicons name="close" size={24} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        {error && (
          <View
            style={{
              backgroundColor: '#7f1d1d',
              borderWidth: 1,
              borderColor: '#991b1b',
              borderRadius: 8,
              padding: 12,
              marginBottom: 16,
            }}
          >
            <Text style={{ color: '#fca5a5', fontSize: 12 }}>{error}</Text>
          </View>
        )}

        {/* Title */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#cbd5e1', marginBottom: 8 }}>
            Event Title
          </Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Enter event title"
            placeholderTextColor="#64748b"
            style={{
              paddingHorizontal: 12,
              paddingVertical: 10,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: '#475569',
              backgroundColor: '#1e293b',
              color: '#f1f5f9',
              fontSize: 14,
            }}
            editable={!loading}
          />
        </View>

        {/* All Day Toggle */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
            paddingVertical: 12,
            paddingHorizontal: 12,
            backgroundColor: '#1e293b',
            borderRadius: 8,
          }}
        >
          <Text style={{ fontSize: 14, fontWeight: '500', color: '#cbd5e1' }}>
            All day event
          </Text>
          <Switch value={allDay} onValueChange={setAllDay} />
        </View>

        {/* Start Date/Time */}
        {!allDay && (
          <>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#cbd5e1', marginBottom: 8 }}>
              Start Time
            </Text>
            <TouchableOpacity
              onPress={() => setShowStartDatePicker(true)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 10,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: '#475569',
                backgroundColor: '#1e293b',
                marginBottom: 8,
              }}
            >
              <Text style={{ color: '#f1f5f9', fontSize: 14 }}>
                {startTime
                  ? startTime.toLocaleDateString()
                  : 'Select date'}
              </Text>
            </TouchableOpacity>

            {showStartDatePicker && (
              <DateTimePicker
                value={startTime || new Date()}
                mode="date"
                display="spinner"
                onChange={handleStartDateChange}
              />
            )}

            <TouchableOpacity
              onPress={() => setShowStartTimePicker(true)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 10,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: '#475569',
                backgroundColor: '#1e293b',
                marginBottom: 16,
              }}
            >
              <Text style={{ color: '#f1f5f9', fontSize: 14 }}>
                {startTime
                  ? startTime.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'Select time'}
              </Text>
            </TouchableOpacity>

            {showStartTimePicker && (
              <DateTimePicker
                value={startTime || new Date()}
                mode="time"
                display="spinner"
                onChange={handleStartTimeChange}
              />
            )}

            {/* End Date/Time */}
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#cbd5e1', marginBottom: 8 }}>
              End Time (optional)
            </Text>
            <TouchableOpacity
              onPress={() => setShowEndDatePicker(true)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 10,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: '#475569',
                backgroundColor: '#1e293b',
                marginBottom: 8,
              }}
            >
              <Text style={{ color: '#f1f5f9', fontSize: 14 }}>
                {endTime
                  ? endTime.toLocaleDateString()
                  : 'Select date'}
              </Text>
            </TouchableOpacity>

            {showEndDatePicker && (
              <DateTimePicker
                value={endTime || new Date()}
                mode="date"
                display="spinner"
                onChange={handleEndDateChange}
              />
            )}

            <TouchableOpacity
              onPress={() => setShowEndTimePicker(true)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 10,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: '#475569',
                backgroundColor: '#1e293b',
                marginBottom: 16,
              }}
            >
              <Text style={{ color: '#f1f5f9', fontSize: 14 }}>
                {endTime
                  ? endTime.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'Select time'}
              </Text>
            </TouchableOpacity>

            {showEndTimePicker && (
              <DateTimePicker
                value={endTime || new Date()}
                mode="time"
                display="spinner"
                onChange={handleEndTimeChange}
              />
            )}
          </>
        )}

        {/* Location */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#cbd5e1', marginBottom: 8 }}>
            Location (optional)
          </Text>
          <TextInput
            value={location}
            onChangeText={setLocation}
            placeholder="Enter location"
            placeholderTextColor="#64748b"
            style={{
              paddingHorizontal: 12,
              paddingVertical: 10,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: '#475569',
              backgroundColor: '#1e293b',
              color: '#f1f5f9',
              fontSize: 14,
            }}
            editable={!loading}
          />
        </View>

        {/* Notes */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#cbd5e1', marginBottom: 8 }}>
            Notes (optional)
          </Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Add notes or details"
            placeholderTextColor="#64748b"
            multiline
            numberOfLines={4}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 10,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: '#475569',
              backgroundColor: '#1e293b',
              color: '#f1f5f9',
              fontSize: 14,
              textAlignVertical: 'top',
            }}
            editable={!loading}
          />
        </View>

        {/* Reminder */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#cbd5e1', marginBottom: 8 }}>
            Reminder
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {reminderOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => setReminder(option.value)}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 6,
                  borderWidth: 1,
                  borderColor: reminder === option.value ? '#0ea5e9' : '#475569',
                  backgroundColor: reminder === option.value ? '#0c4a6e' : '#1e293b',
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '500',
                    color: reminder === option.value ? '#0ea5e9' : '#cbd5e1',
                  }}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Color indicator */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            marginBottom: 24,
            paddingVertical: 12,
            paddingHorizontal: 12,
            backgroundColor: '#1e293b',
            borderRadius: 8,
          }}
        >
          <View
            style={{
              width: 20,
              height: 20,
              borderRadius: 4,
              backgroundColor: myColor,
            }}
          />
          <Text style={{ fontSize: 12, color: '#94a3b8' }}>Event color</Text>
        </View>

        {/* Buttons */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 32 }}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            disabled={loading}
            style={{
              flex: 1,
              paddingVertical: 12,
              borderRadius: 8,
              backgroundColor: '#1e293b',
              opacity: loading ? 0.5 : 1,
            }}
          >
            <Text style={{ textAlign: 'center', color: '#cbd5e1', fontWeight: '600', fontSize: 14 }}>
              Cancel
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            style={{
              flex: 1,
              paddingVertical: 12,
              borderRadius: 8,
              backgroundColor: '#0ea5e9',
              opacity: loading ? 0.5 : 1,
            }}
          >
            {loading ? (
              <ActivityIndicator color="#f1f5f9" />
            ) : (
              <Text style={{ textAlign: 'center', color: '#f1f5f9', fontWeight: '600', fontSize: 14 }}>
                Create
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
