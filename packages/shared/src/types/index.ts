// ============================================================================
// USER & AUTHENTICATION
// ============================================================================

export interface User {
  id: string;
  email: string;
  displayName: string;
  color: string; // Hex color (e.g., "#FF5733")
  partnerId: string | null; // FK to partner's userId
  createdAt: Date;
  photoURL?: string;
}

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

// ============================================================================
// COUPLE
// ============================================================================

export interface Couple {
  id: string; // docId = min(userId1, userId2)
  partner1Id: string;
  partner2Id: string;
  pairedAt: Date;
  settings: CoupleSettings;
}

export interface CoupleSettings {
  theme: "dark" | "light";
  language: string; // e.g., "en"
  notificationsEnabled: boolean;
}

// ============================================================================
// EVENTS
// ============================================================================

export interface Event {
  id: string;
  coupleId: string;
  createdBy: string; // userId
  title: string;
  startTime: Date | null; // null if all-day
  endTime: Date | null; // null if all-day
  allDay: boolean;
  color: string; // Partner's color hex
  notes?: string;
  location?: string;
  reminder: ReminderType;
  checklist?: ChecklistItem[];
  updatedAt: Date;
  createdAt: Date;
}

export type ReminderType = "none" | "15min" | "1hour" | "1day" | "1week";

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface EventFormData {
  title: string;
  startTime: Date | null;
  endTime: Date | null;
  allDay: boolean;
  notes?: string;
  location?: string;
  reminder: ReminderType;
  checklist?: ChecklistItem[];
}

// ============================================================================
// TODO LISTS & ITEMS
// ============================================================================

export interface TodoList {
  id: string;
  coupleId: string;
  name: string; // e.g., "Groceries", "Chores"
  createdBy: string; // userId
  items: TodoItem[];
  updatedAt: Date;
  createdAt: Date;
}

export interface TodoItem {
  id: string;
  text: string;
  done: boolean;
  createdAt: Date;
}

// ============================================================================
// NOTIFICATIONS
// ============================================================================

export interface Notification {
  id: string;
  coupleId: string;
  userId: string; // recipient
  type: NotificationType;
  relatedId: string; // eventId or listId
  read: boolean;
  createdAt: Date;
  message: string;
}

export type NotificationType =
  | "event_created"
  | "event_updated"
  | "todo_added"
  | "todo_completed"
  | "reminder";

// ============================================================================
// PAIRING
// ============================================================================

export interface PairingCode {
  code: string;
  generatorId: string;
  createdAt: Date;
  expiresAt: Date;
  used: boolean;
  acceptedBy?: string;
  acceptedAt?: Date;
}

export type PairingError =
  | "ALREADY_PAIRED"
  | "INVALID_CODE"
  | "EXPIRED_CODE"
  | "USED_CODE"
  | "SELF_PAIRING"
  | "COLOR_NOT_SET";

// ============================================================================
// API RESPONSES
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

export interface PairingLinkData {
  code: string;
  expiresAt: Date;
  coupleId?: string;
}

export interface PairingResponse {
  coupleId: string;
  partnerId: string;
  partnerName: string;
  partnerColor: string;
}

// ============================================================================
// FIREBASE ERRORS
// ============================================================================

export interface FirebaseError {
  code: string;
  message: string;
}

// ============================================================================
// CONTEXT & STATE
// ============================================================================

export interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  clearError: () => void;
}

export interface CoupleContextType {
  couple: Couple | null;
  partner: User | null;
  myUser: User | null;
  loading: boolean;
  error: string | null;
  myColor: string;
  coupleId: string | null;
}
