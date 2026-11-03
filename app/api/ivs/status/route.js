import { NextResponse } from 'next/server';
import { getIvsInfrastructureStatus } from '../../../../lib/awsIvs';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const status = await getIvsInfrastructureStatus();
    return NextResponse.json(status);
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      profile: process.env.AWS_PROFILE || 'HGNEW',
      region: process.env.AWS_REGION || 'ap-south-1',
      message: error.message
    }, { status: 500 });
  }
}
