import { NextResponse } from 'next/server';
import { getOrCreateStage, createParticipantToken } from '../../../../lib/awsIvs';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const { meetingId, userName, attributes = {} } = body;

    if (!meetingId) {
      return NextResponse.json({ error: 'meetingId is required' }, { status: 400 });
    }

    const safeUserName = userName || 'Guest User';

    // 1. Get or create Stage in AWS IVS (Profile: HGNEW)
    const stageInfo = await getOrCreateStage(meetingId);

    // 2. Generate participant token with PUBLISH & SUBSCRIBE capabilities
    const tokenInfo = await createParticipantToken(stageInfo.stageArn, safeUserName, {
      meetingId,
      ...attributes
    });

    return NextResponse.json({
      success: true,
      stageArn: stageInfo.stageArn,
      stageName: stageInfo.stageName,
      isLiveAws: stageInfo.isLiveAws && tokenInfo.isLiveAws,
      accountStatus: stageInfo.accountStatus || 'verified',
      token: tokenInfo.token,
      participantId: tokenInfo.participantId,
      expirationTime: tokenInfo.expirationTime,
      profile: process.env.AWS_PROFILE || 'HGNEW',
      region: process.env.AWS_REGION || 'ap-south-1',
      warning: stageInfo.warning || tokenInfo.warning || null
    });
  } catch (error) {
    console.error('API /api/ivs/stage error:', error);
    return NextResponse.json({
      error: 'Failed to initialize AWS IVS stage',
      message: error.message
    }, { status: 500 });
  }
}
