import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// Initialize Firebase Admin SDK
admin.initializeApp();

const db = admin.firestore();
const messaging = admin.messaging();

// ============================================================================
// Cloud Function: Send push notification when event is created
// ============================================================================
export const onEventCreated = functions
  .region("us-central1")
  .firestore.document("couples/{coupleId}/events/{eventId}")
  .onCreate(async (snap, context) => {
    const event = snap.data();
    const { coupleId } = context.params;

    try {
      // Get the couple document to find the partner
      const coupleDoc = await db.collection("couples").doc(coupleId).get();

      if (!coupleDoc.exists) {
        console.error(`Couple ${coupleId} not found`);
        return;
      }

      const coupleData = coupleDoc.data();
      if (!coupleData) return;

      // Determine partner ID (the one who didn't create the event)
      const partnerId =
        coupleData.partner1Id === event.createdBy
          ? coupleData.partner2Id
          : coupleData.partner1Id;

      // Get partner's FCM token
      const partnerDoc = await db.collection("users").doc(partnerId).get();
      if (!partnerDoc.exists) {
        console.log(`Partner ${partnerId} user document not found`);
        return;
      }

      const fcmToken = partnerDoc.data()?.fcmToken;
      if (!fcmToken) {
        console.log(`No FCM token for partner ${partnerId}`);
        return;
      }

      // Send push notification
      await messaging.send({
        token: fcmToken,
        notification: {
          title: "New event added",
          body: event.title,
        },
        data: {
          eventId: context.params.eventId,
          coupleId,
          type: "event_created",
        },
      });

      console.log(`Notification sent to ${partnerId} for event ${context.params.eventId}`);
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  });

// ============================================================================
// Cloud Function: Send reminder notifications
// ============================================================================
export const sendReminderNotification = functions
  .region("us-central1")
  .pubsub.schedule("every 5 minutes")
  .onRun(async () => {
    try {
      const now = new Date();
      const fifteenMinutesFromNow = new Date(now.getTime() + 15 * 60 * 1000);

      // Query events with 15min reminder in the next 15 minutes
      const eventsQuery = await db
        .collectionGroup("events")
        .where("reminder", "==", "15min")
        .where("startTime", ">=", now)
        .where("startTime", "<=", fifteenMinutesFromNow)
        .get();

      for (const eventDoc of eventsQuery.docs) {
        const event = eventDoc.data();
        const coupleId = event.coupleId;

        // Get couple to find partner
        const coupleDoc = await db.collection("couples").doc(coupleId).get();
        if (!coupleDoc.exists) continue;

        const coupleData = coupleDoc.data();
        if (!coupleData) continue;

        // Send to both partners
        const partners = [coupleData.partner1Id, coupleData.partner2Id];

        for (const partnerId of partners) {
          const userDoc = await db.collection("users").doc(partnerId).get();
          const fcmToken = userDoc.data()?.fcmToken;

          if (!fcmToken) continue;

          await messaging.send({
            token: fcmToken,
            notification: {
              title: "Upcoming event reminder",
              body: event.title,
            },
            data: {
              eventId: eventDoc.id,
              coupleId,
              type: "reminder",
            },
          });
        }
      }

      console.log(`Sent ${eventsQuery.size} reminder notifications`);
    } catch (error) {
      console.error("Error sending reminders:", error);
    }
  });

// ============================================================================
// PAIRING SYSTEM - Cloud Functions
// ============================================================================

const INVITE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Generate a random pairing code (e.g., "ABC-DEF-GHI")
 */
function generatePairingCodeString(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 9; i++) {
    if (i === 3 || i === 6) code += "-";
    else code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Generate a pairing invite code
 * Called by: Client app when user clicks "Generate Invite"
 */
export const generatePairingInvite = functions
  .region("us-central1")
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Not authenticated"
      );
    }

    const userId = context.auth.uid;

    try {
      // Check user exists and has color selected
      const userDoc = await db.collection("users").doc(userId).get();
      if (!userDoc.exists) {
        throw new functions.https.HttpsError("not-found", "User not found");
      }

      const userData = userDoc.data();
      if (!userData?.color) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          "Color not selected. Complete color picker first."
        );
      }

      if (userData.partnerId !== null) {
        throw new functions.https.HttpsError(
          "already-exists",
          "Already paired with a partner"
        );
      }

      // Generate unique code
      let code = generatePairingCodeString();
      let attempts = 0;
      while (
        (await db.collection("pairing_codes").doc(code).get()).exists &&
        attempts < 10
      ) {
        code = generatePairingCodeString();
        attempts++;
      }

      if (attempts >= 10) {
        throw new functions.https.HttpsError(
          "internal",
          "Failed to generate unique code"
        );
      }

      // Create pairing code document
      const now = admin.firestore.Timestamp.now();
      const expiresAt = new admin.firestore.Timestamp(
        now.seconds + INVITE_EXPIRY_MS / 1000,
        now.nanoseconds
      );

      await db.collection("pairing_codes").doc(code).set({
        code,
        generatorId: userId,
        createdAt: now,
        expiresAt,
        used: false,
        acceptedBy: null,
        acceptedAt: null,
      });

      return {
        success: true,
        data: {
          code,
          expiresAt: expiresAt.toDate(),
          shareUrl: `https://couple-calendar.app/pairing/accept?code=${code}`,
        },
      };
    } catch (error: any) {
      console.error("Error generating pairing invite:", error);
      throw error instanceof functions.https.HttpsError
        ? error
        : new functions.https.HttpsError("internal", "Failed to generate invite");
    }
  });

/**
 * Validate pairing code and return partner info
 * Called by: Client app when user enters code (before confirming)
 */
export const validatePairingCode = functions
  .region("us-central1")
  .https.onCall(async (data) => {
    const { code } = data;

    if (!code || typeof code !== "string") {
      throw new functions.https.HttpsError("invalid-argument", "Code is required");
    }

    try {
      const codeDoc = await db.collection("pairing_codes").doc(code).get();

      if (!codeDoc.exists) {
        throw new functions.https.HttpsError("not-found", "Invalid code");
      }

      const codeData = codeDoc.data();
      const now = admin.firestore.Timestamp.now();

      // Check if expired
      if (codeData?.expiresAt.toMillis() < now.toMillis()) {
        throw new functions.https.HttpsError(
          "deadline-exceeded",
          "Code has expired"
        );
      }

      // Check if already used
      if (codeData?.used) {
        throw new functions.https.HttpsError("already-exists", "Code already used");
      }

      // Get generator's info
      const generatorDoc = await db
        .collection("users")
        .doc(codeData.generatorId)
        .get();
      const generatorData = generatorDoc.data();

      return {
        success: true,
        data: {
          generatorId: codeData.generatorId,
          generatorName: generatorData?.displayName || "Unknown",
          generatorColor: generatorData?.color || "#000000",
          expiresAt: codeData.expiresAt.toDate(),
          isExpired: false,
          isUsed: false,
        },
      };
    } catch (error: any) {
      console.error("Error validating pairing code:", error);
      throw error instanceof functions.https.HttpsError
        ? error
        : new functions.https.HttpsError("internal", "Validation failed");
    }
  });

/**
 * Accept pairing invite and create couple
 * Called by: Client app when user confirms pairing
 */
export const acceptPairingInvite = functions
  .region("us-central1")
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Not authenticated"
      );
    }

    const { code } = data;
    const acceptorId = context.auth.uid;

    if (!code || typeof code !== "string") {
      throw new functions.https.HttpsError("invalid-argument", "Code is required");
    }

    try {
      // Verify code exists and is valid
      const codeDoc = await db.collection("pairing_codes").doc(code).get();

      if (!codeDoc.exists) {
        throw new functions.https.HttpsError("not-found", "Invalid code");
      }

      const codeData = codeDoc.data();
      const now = admin.firestore.Timestamp.now();

      if (codeData?.expiresAt.toMillis() < now.toMillis()) {
        throw new functions.https.HttpsError(
          "deadline-exceeded",
          "Code has expired"
        );
      }

      if (codeData?.used) {
        throw new functions.https.HttpsError("already-exists", "Code already used");
      }

      const generatorId = codeData.generatorId;

      if (generatorId === acceptorId) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "Cannot pair with yourself"
        );
      }

      // Check both users don't already have partners
      const [acceptorDoc, generatorDoc] = await Promise.all([
        db.collection("users").doc(acceptorId).get(),
        db.collection("users").doc(generatorId).get(),
      ]);

      const acceptorData = acceptorDoc.data();
      const generatorData = generatorDoc.data();

      if (acceptorData?.partnerId !== null) {
        throw new functions.https.HttpsError(
          "already-exists",
          "You already have a partner"
        );
      }

      if (generatorData?.partnerId !== null) {
        throw new functions.https.HttpsError(
          "already-exists",
          "Generator already has a partner"
        );
      }

      // Create couple (use lexicographically sorted IDs)
      const coupleId = [generatorId, acceptorId].sort().join("_");
      const [partner1Id, partner2Id] = [generatorId, acceptorId].sort();

      // Create couple document
      await db.collection("couples").doc(coupleId).set({
        partner1Id,
        partner2Id,
        pairedAt: now,
        settings: {
          theme: "dark",
          language: "en",
          notificationsEnabled: true,
        },
      });

      // Update both users' partnerId
      await Promise.all([
        db.collection("users").doc(acceptorId).update({ partnerId: generatorId }),
        db.collection("users").doc(generatorId).update({ partnerId: acceptorId }),
      ]);

      // Mark code as used
      await db.collection("pairing_codes").doc(code).update({
        used: true,
        acceptedBy: acceptorId,
        acceptedAt: now,
      });

      return {
        success: true,
        data: {
          coupleId,
          partnerId: generatorId,
          partnerName: generatorData?.displayName || "Unknown",
          partnerColor: generatorData?.color || "#000000",
        },
      };
    } catch (error: any) {
      console.error("Error accepting pairing invite:", error);
      throw error instanceof functions.https.HttpsError
        ? error
        : new functions.https.HttpsError("internal", "Pairing failed");
    }
  });

/**
 * Cleanup expired pairing codes (scheduled daily)
 * Called by: Cloud Scheduler at 2 AM UTC
 */
export const cleanupExpiredPairingCodes = functions
  .region("us-central1")
  .pubsub.schedule("0 2 * * *")
  .onRun(async () => {
    try {
      const now = admin.firestore.Timestamp.now();

      // Find and delete expired codes
      const expiredQuery = await db
        .collection("pairing_codes")
        .where("expiresAt", "<", now)
        .get();

      const batch = db.batch();
      let count = 0;

      for (const doc of expiredQuery.docs) {
        batch.delete(doc.ref);
        count++;
      }

      if (count > 0) {
        await batch.commit();
        console.log(`Deleted ${count} expired pairing codes`);
      }
    } catch (error) {
      console.error("Error cleaning up expired codes:", error);
    }
  });
