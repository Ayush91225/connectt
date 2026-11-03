// AWS IVS Real-Time Streaming Service integration (Region: ap-south-1)
import {
  IVSRealTimeClient,
  ListStagesCommand,
  CreateStageCommand,
  GetStageCommand,
  CreateParticipantTokenCommand
} from '@aws-sdk/client-ivs-realtime';

const AWS_REGION = process.env.AWS_REGION || 'ap-south-1';
const AWS_PROFILE = process.env.AWS_PROFILE || 'default';

let ivsClientInstance = null;
let hasLoggedVerificationNotice = false;

function getIvsClient() {
  if (!ivsClientInstance) {
    const config = {
      region: AWS_REGION
    };

    // If explicit access keys are set in environment, use them
    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
      config.credentials = {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      };
    }

    ivsClientInstance = new IVSRealTimeClient(config);
  }
  return ivsClientInstance;
}

/**
 * Creates or retrieves an existing AWS IVS Real-Time Stage for a given meeting ID
 */
export async function getOrCreateStage(meetingId = 'default-room') {
  const client = getIvsClient();
  const safeName = `connectt-${meetingId.toLowerCase().replace(/[^a-z0-9_-]/g, '-')}`.slice(0, 128);

  try {
    // 1. Check if a stage with this name already exists
    const listRes = await client.send(new ListStagesCommand({ maxResults: 50 }));
    const stages = listRes.stages || [];
    const existing = stages.find(s => s.name === safeName || (s.tags && s.tags.MeetingId === meetingId));

    if (existing && existing.arn) {
      return {
        stageArn: existing.arn,
        stageName: existing.name || safeName,
        isNew: false,
        isLiveAws: true
      };
    }

    // 2. Create new stage in AWS IVS
    const createRes = await client.send(new CreateStageCommand({
      name: safeName,
      tags: {
        MeetingId: meetingId,
        Environment: 'production',
        Platform: 'connectt.live',
        Profile: AWS_PROFILE
      }
    }));

    return {
      stageArn: createRes.stage?.arn,
      stageName: createRes.stage?.name || safeName,
      isNew: true,
      isLiveAws: true
    };
  } catch (err) {
    if (!hasLoggedVerificationNotice) {
      console.warn(`[AWS IVS API (${AWS_PROFILE})]: ${err.message} (Running in automatic fallback WebRTC mode)`);
      hasLoggedVerificationNotice = true;
    }

    // If account verification is pending in AWS Support, provide seamless graceful fallback stage ARN
    const fallbackArn = `arn:aws:ivs:${AWS_REGION}:243197392079:stage/fallback-${safeName}`;
    return {
      stageArn: fallbackArn,
      stageName: safeName,
      isNew: false,
      isLiveAws: false,
      accountStatus: err.name === 'AccessDeniedException' || err.message?.includes('pending verification')
        ? 'pending_verification'
        : 'fallback',
      warning: err.message
    };
  }
}

/**
 * Creates a participant token with PUBLISH and SUBSCRIBE capabilities
 */
export async function createParticipantToken(stageArn, userId = 'User', attributes = {}) {
  const client = getIvsClient();
  const safeUserId = (userId || 'User').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 64);

  // If this is a fallback stage (due to account verification pending), create a simulated WebRTC token
  if (!stageArn || stageArn.includes('fallback-') || stageArn.includes('mock')) {
    const mockToken = Buffer.from(JSON.stringify({
      stageArn,
      userId: safeUserId,
      capabilities: ['PUBLISH', 'SUBSCRIBE'],
      exp: Math.floor(Date.now() / 1000) + 7200,
      attributes
    })).toString('base64');

    return {
      token: `fallback.${mockToken}.sig`,
      participantId: `part_${safeUserId}_${Date.now().toString(36)}`,
      expirationTime: new Date(Date.now() + 7200 * 1000).toISOString(),
      isLiveAws: false
    };
  }

  try {
    const res = await client.send(new CreateParticipantTokenCommand({
      stageArn,
      userId: safeUserId,
      capabilities: ['PUBLISH', 'SUBSCRIBE'],
      duration: 720, // 12 hours
      attributes: {
        userName: userId,
        ...attributes
      }
    }));

    return {
      token: res.participantToken?.token,
      participantId: res.participantToken?.participantId,
      expirationTime: res.participantToken?.expirationTime?.toISOString(),
      isLiveAws: true
    };
  } catch (err) {
    if (!hasLoggedVerificationNotice) {
      console.warn(`[AWS IVS Token (${AWS_PROFILE})]: ${err.message}`);
      hasLoggedVerificationNotice = true;
    }

    const mockToken = Buffer.from(JSON.stringify({
      stageArn,
      userId: safeUserId,
      capabilities: ['PUBLISH', 'SUBSCRIBE'],
      exp: Math.floor(Date.now() / 1000) + 7200,
      attributes
    })).toString('base64');

    return {
      token: `fallback.${mockToken}.sig`,
      participantId: `part_${safeUserId}_${Date.now().toString(36)}`,
      expirationTime: new Date(Date.now() + 7200 * 1000).toISOString(),
      isLiveAws: false,
      warning: err.message
    };
  }
}

/**
 * Health check & status inspector for AWS IVS
 */
export async function getIvsInfrastructureStatus() {
  const client = getIvsClient();
  try {
    const res = await client.send(new ListStagesCommand({ maxResults: 10 }));
    return {
      status: 'healthy',
      profile: AWS_PROFILE,
      region: AWS_REGION,
      account: '099308196337',
      stageCount: (res.stages || []).length,
      stages: res.stages || [],
      isVerified: true
    };
  } catch (err) {
    const isPending = err.message?.includes('pending verification') || err.name === 'AccessDeniedException';
    return {
      status: isPending ? 'pending_verification' : 'error',
      profile: AWS_PROFILE,
      region: AWS_REGION,
      account: '099308196337',
      stageCount: 0,
      stages: [],
      isVerified: false,
      message: err.message
    };
  }
}
