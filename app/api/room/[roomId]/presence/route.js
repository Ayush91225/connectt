import { NextResponse } from 'next/server';
import { recordPresence, removePresence, getActiveParticipants } from '../../../../../lib/dynamoDb';
import { pgRecordPresence, pgRemovePresence, pgGetActiveParticipants } from '../../../../../lib/postgres';

export const dynamic = 'force-dynamic';

export async function POST(request, { params }) {
  try {
    const { roomId } = await params;
    const body = await request.json();
    const { userId, userName, action = 'heartbeat', isCameraOn, isMicOn, isSpeaking } = body;

    if (!roomId || !userId) {
      return NextResponse.json({ error: 'roomId and userId are required' }, { status: 400 });
    }

    if (action === 'leave') {
      await Promise.allSettled([
        pgRemovePresence(roomId, userId),
        removePresence(roomId, userId)
      ]);
    } else {
      await Promise.allSettled([
        pgRecordPresence(roomId, userId, userName, isCameraOn, isMicOn, isSpeaking),
        recordPresence(roomId, userId, {
          userName,
          isCameraOn,
          isMicOn,
          isSpeaking
        })
      ]);
    }

    let activeParticipants = await pgGetActiveParticipants(roomId);
    if (!activeParticipants || activeParticipants.length === 0) {
      activeParticipants = await getActiveParticipants(roomId);
    }

    return NextResponse.json({
      success: true,
      activeParticipants: activeParticipants || [],
      participantCount: (activeParticipants || []).length
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
