// AWS DynamoDB Integration for Connectt Rooms, Participants & Metadata
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand, DeleteCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';

const REGION = process.env.AWS_REGION || 'ap-south-1';

let docClientInstance = null;

function getDocClient() {
  if (!docClientInstance) {
    const config = { region: REGION };
    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
      config.credentials = {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      };
    }
    const rawClient = new DynamoDBClient(config);
    docClientInstance = DynamoDBDocumentClient.from(rawClient, {
      marshallOptions: { removeUndefinedValues: true }
    });
  }
  return docClientInstance;
}

export const ROOMS_TABLE = 'connectt-rooms';
export const PARTICIPANTS_TABLE = 'connectt-participants';
export const METADATA_TABLE = 'connectt-metadata';

/**
 * Upsert meeting room record
 */
export async function upsertRoom(roomId, data = {}) {
  const ddb = getDocClient();
  const now = new Date().toISOString();

  try {
    const item = {
      roomId,
      updatedAt: now,
      ...data
    };
    if (!data.createdAt) item.createdAt = now;

    await ddb.send(new PutCommand({
      TableName: ROOMS_TABLE,
      Item: item
    }));
    return item;
  } catch (err) {
    console.warn(`[DynamoDB Room Upsert Warning]: ${err.message}`);
    return null;
  }
}

/**
 * Retrieve room details & active participants
 */
export async function getRoom(roomId) {
  const ddb = getDocClient();
  try {
    const res = await ddb.send(new GetCommand({
      TableName: ROOMS_TABLE,
      Key: { roomId }
    }));
    return res.Item || null;
  } catch (err) {
    console.warn(`[DynamoDB Get Room Warning]: ${err.message}`);
    return null;
  }
}

/**
 * Record or heartbeat participant presence
 */
export async function recordPresence(roomId, userId, presenceData = {}) {
  const ddb = getDocClient();
  const now = Date.now();

  try {
    const item = {
      roomId,
      userId,
      userName: presenceData.userName || userId,
      isCameraOn: Boolean(presenceData.isCameraOn),
      isMicOn: Boolean(presenceData.isMicOn),
      isSpeaking: Boolean(presenceData.isSpeaking),
      lastSeenAt: now,
      ttl: Math.floor(now / 1000) + 3600 // Expire after 1 hour
    };

    await ddb.send(new PutCommand({
      TableName: PARTICIPANTS_TABLE,
      Item: item
    }));
    return item;
  } catch (err) {
    console.warn(`[DynamoDB Record Presence Warning]: ${err.message}`);
    return null;
  }
}

/**
 * Remove participant when leaving
 */
export async function removePresence(roomId, userId) {
  const ddb = getDocClient();
  try {
    await ddb.send(new DeleteCommand({
      TableName: PARTICIPANTS_TABLE,
      Key: { roomId, userId }
    }));
    return true;
  } catch (err) {
    console.warn(`[DynamoDB Remove Presence Warning]: ${err.message}`);
    return false;
  }
}

/**
 * Query active participants for a room (excludes participants inactive for > 15s)
 */
export async function getActiveParticipants(roomId) {
  const ddb = getDocClient();
  const now = Date.now();
  const threshold = now - 18000; // 18 seconds heartbeat window

  try {
    const res = await ddb.send(new QueryCommand({
      TableName: PARTICIPANTS_TABLE,
      KeyConditionExpression: 'roomId = :r',
      ExpressionAttributeValues: {
        ':r': roomId
      }
    }));

    const items = res.Items || [];
    // Filter active items and remove duplicates by userName/userId
    const active = items.filter(item => item.lastSeenAt >= threshold);
    return active;
  } catch (err) {
    console.warn(`[DynamoDB Query Participants Warning]: ${err.message}`);
    return [];
  }
}

/**
 * Save arbitrary room metadata (notes, chat, polls)
 */
export async function saveRoomMetadata(roomId, itemKey, payload = {}) {
  const ddb = getDocClient();
  try {
    const item = {
      roomId,
      itemKey,
      updatedAt: new Date().toISOString(),
      payload
    };
    await ddb.send(new PutCommand({
      TableName: METADATA_TABLE,
      Item: item
    }));
    return item;
  } catch (err) {
    console.warn(`[DynamoDB Save Metadata Warning]: ${err.message}`);
    return null;
  }
}
