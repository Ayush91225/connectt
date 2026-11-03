import { NextResponse } from 'next/server';
import { getRoom, getActiveParticipants, upsertRoom } from '../../../../../lib/dynamoDb';
import { getOrCreateStage } from '../../../../../lib/awsIvs';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const { roomId } = await params;
    if (!roomId) {
      return NextResponse.json({ error: 'roomId is required' }, { status: 400 });
    }

    // 1. Get or create Stage
    const stageInfo = await getOrCreateStage(roomId);

    // 2. Query DynamoDB room
    let room = await getRoom(roomId);
    if (!room) {
      room = await upsertRoom(roomId, {
        stageArn: stageInfo.stageArn,
        stageName: stageInfo.stageName,
        isLiveAws: stageInfo.isLiveAws
      });
    }

    // 3. Get active participants from DynamoDB
    const activeParticipants = await getActiveParticipants(roomId);

    return NextResponse.json({
      success: true,
      roomId,
      room,
      stageArn: stageInfo.stageArn,
      isLiveAws: stageInfo.isLiveAws,
      activeParticipants,
      participantCount: activeParticipants.length
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
