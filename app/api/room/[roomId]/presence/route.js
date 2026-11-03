import { NextResponse } from 'next/server';
import { recordPresence, removePresence, getActiveParticipants } from '../../../../../lib/dynamoDb';

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
      await removePresence(roomId, userId);
    } else {
      await recordPresence(roomId, userId, {
        userName,
        isCameraOn,
        isMicOn,
        isSpeaking
      });
    }

    const activeParticipants = await getActiveParticipants(roomId);

    return NextResponse.json({
      success: true,
      activeParticipants,
      participantCount: activeParticipants.length
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
