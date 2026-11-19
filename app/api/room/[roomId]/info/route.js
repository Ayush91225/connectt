import { NextResponse } from 'next/server';
import { getRoom, getActiveParticipants, upsertRoom } from '../../../../../lib/dynamoDb';
import { pgUpsertRoom, pgGetActiveParticipants } from '../../../../../lib/postgres';
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

    // 2. Query Postgres room or DynamoDB room
    let pgRoom = await pgUpsertRoom(roomId, 'Meeting Room', 'Host', {
      stageArn: stageInfo.stageArn,
      isLiveAws: stageInfo.isLiveAws
    });

    let room = await getRoom(roomId);
    if (!room) {
      room = await upsertRoom(roomId, {
        stageArn: stageInfo.stageArn,
        stageName: stageInfo.stageName,
        isLiveAws: stageInfo.isLiveAws
      });
    }

    // 3. Get active participants from Postgres (fast, zero cost) or DynamoDB
    let activeParticipants = await pgGetActiveParticipants(roomId);
    if (!activeParticipants || activeParticipants.length === 0) {
      activeParticipants = await getActiveParticipants(roomId);
    }

    return NextResponse.json({
      success: true,
      roomId,
      room: pgRoom || room,
      stageArn: stageInfo.stageArn,
      isLiveAws: stageInfo.isLiveAws,
      activeParticipants: activeParticipants || [],
      participantCount: (activeParticipants || []).length
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
