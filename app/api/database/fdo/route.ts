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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') as 'orcid' | 'researchDomain' | 'fairScore' | 'createdAt' | null;
    const sortOrder = searchParams.get('sortOrder') as 'asc' | 'desc' | null;

    const db = await getDatabase();

    if (userName) {
      const records = await db.fdoRecord.findByUserName(userName);
      return NextResponse.json(records);
    }

    const records = await db.fdoRecord.getAll(page, limit, sortBy || 'createdAt', sortOrder || 'desc');
    const total = await db.fdoRecord.count();
    return NextResponse.json({
      items: records,
      total: total || 0,
      page,
      limit
    });
  } catch (error) {
    console.error('Error fetching FDO records:', error);
    return NextResponse.json(
      { error: 'Failed to fetch FDO records' },
      { status: 500 }
    );
  }
}
