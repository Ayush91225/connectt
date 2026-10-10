'use client';

import React from 'react';
import MeetingRoomPage from '../[meetingId]/page';

export default function DemoRoomPage() {
  return <MeetingRoomPage demoMode={true} overrideMeetingId="demo-class" />;
}
