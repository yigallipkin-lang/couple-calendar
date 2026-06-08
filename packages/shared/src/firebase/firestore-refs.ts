// Type-safe Firestore collection references and paths
// These helpers ensure consistency across the app

export const COLLECTIONS = {
  USERS: "users",
  COUPLES: "couples",
  EVENTS: "events",
  TODO_LISTS: "todoLists",
  NOTIFICATIONS: "notifications",
} as const;

/**
 * User document path
 */
export const userDocPath = (userId: string) => `${COLLECTIONS.USERS}/${userId}`;

/**
 * Couple document path (uses lexicographically smaller userId as docId)
 */
export const coupleDocPath = (userId1: string, userId2: string) => {
  const coupleId = [userId1, userId2].sort().join("_");
  return `${COLLECTIONS.COUPLES}/${coupleId}`;
};

export const getCoupleId = (userId1: string, userId2: string) => {
  return [userId1, userId2].sort().join("_");
};

/**
 * Events subcollection for a couple
 */
export const eventsCollectionPath = (coupleId: string) =>
  `${COLLECTIONS.COUPLES}/${coupleId}/${COLLECTIONS.EVENTS}`;

export const eventDocPath = (coupleId: string, eventId: string) =>
  `${eventsCollectionPath(coupleId)}/${eventId}`;

/**
 * Todo lists subcollection for a couple
 */
export const todoListsCollectionPath = (coupleId: string) =>
  `${COLLECTIONS.COUPLES}/${coupleId}/${COLLECTIONS.TODO_LISTS}`;

export const todoListDocPath = (coupleId: string, listId: string) =>
  `${todoListsCollectionPath(coupleId)}/${listId}`;

/**
 * Notifications subcollection for a couple
 */
export const notificationsCollectionPath = (coupleId: string) =>
  `${COLLECTIONS.COUPLES}/${coupleId}/${COLLECTIONS.NOTIFICATIONS}`;

export const notificationDocPath = (coupleId: string, notificationId: string) =>
  `${notificationsCollectionPath(coupleId)}/${notificationId}`;
