import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pid, userName, orcid, researchDomain, fairScore } = body;

    if (!pid || !userName) {
      return NextResponse.json(
        { error: 'pid and userName are required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    await db.fdoRecord.create({
      pid,
      userName,
      orcid: orcid || '',
      researchDomain: researchDomain || '',
      fairScore: fairScore || 0,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error creating FDO record:', error);
    return NextResponse.json(
      { error: 'Failed to create FDO record' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userName = searchParams.get('userName');

    const db = await getDatabase();

    if (userName) {
      const records = await db.fdoRecord.findByUserName(userName);
      return NextResponse.json(records);
    }

    const records = await db.fdoRecord.getAll();
    return NextResponse.json(records);
  } catch (error) {
    console.error('Error fetching FDO records:', error);
    return NextResponse.json(
      { error: 'Failed to fetch FDO records' },
      { status: 500 }
    );
  }
}
