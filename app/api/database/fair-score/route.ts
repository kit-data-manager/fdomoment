import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userName, criterium, total } = body;

    if (!userName || !criterium || total === undefined) {
      return NextResponse.json(
        { error: 'userName, criterium, and total are required' },
        { status: 400 }
      );
    }

    if (!['findable', 'accessible', 'interoperable', 'reusable'].includes(criterium)) {
      return NextResponse.json(
        { error: 'criterium must be one of: findable, accessible, interoperable, reusable' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    await db.fairScore.upsertAggregation(userName, criterium, total);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error upserting fair score aggregation:', error);
    return NextResponse.json(
      { error: 'Failed to upsert fair score aggregation' },
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
      const aggregations = await db.fairScore.getAggregationsByUser(userName);
      return NextResponse.json(aggregations);
    }

    const aggregations = await db.fairScore.getAllAggregations();
    return NextResponse.json(aggregations);
  } catch (error) {
    console.error('Error fetching fair score aggregations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch fair score aggregations' },
      { status: 500 }
    );
  }
}
