import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

function generatePid(): string {
  return Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
}

interface RecordEntry {
  key: string;
  value: string;
}

interface FdoRecord {
  pid: string;
  record: RecordEntry[];
}

const fdoRecords: Map<string, FdoRecord> = new Map();

async function initializeRecords() {
  const dataPath = path.join(process.cwd(), 'data', 'fdos.json');
  
  try {
    const data = await fs.readFile(dataPath, 'utf8');
    const records = JSON.parse(data);
    if (Array.isArray(records)) {
      records.forEach((record) => {
        if (record.pid) {
          fdoRecords.set(record.pid, record);
        }
      });
    }
  } catch (error) {
    console.log('No existing FDO records found, starting fresh');
  }
}

async function saveRecords() {
  try {
    const dataPath = path.join(process.cwd(), 'data', 'fdos.json');
    await fs.mkdir(path.dirname(dataPath), { recursive: true });
    
    const records = Array.from(fdoRecords.values());
    
    await fs.writeFile(dataPath, JSON.stringify(records, null, 2));
  } catch (error) {
    console.error('Failed to save FDO records:', error);
  }
}

export async function POST(request: Request) {
  await initializeRecords();
  
  try {
    const fdoRecord: FdoRecord = await request.json();
    console.log('User FDO', fdoRecord);

    if (!fdoRecord || !Array.isArray(fdoRecord.record)) {
      return NextResponse.json({ error: 'Invalid FDO record' }, { status: 400 });
    }
    
    const pid = generatePid();
    const newRecord: FdoRecord = {
      ...fdoRecord,
      pid,
    };

    console.log('New FDO', newRecord);

    fdoRecords.set(pid, newRecord);
    await saveRecords();
    
    return NextResponse.json(newRecord, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create FDO record' }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ pid?: string }> }
) {
  await initializeRecords();
  
  const { pid } = await params;
  
  console.log('GET params:', { pid });
  console.log('GET request.url:', request.url);
  if (!pid) {
    return NextResponse.json({ error: 'PID required' }, { status: 400 });
  }
  
  let record = fdoRecords.get(pid);
  
  if (!record) {
    const fullPid = `https://hdl.handle.net/${pid}`;
    record = fdoRecords.get(fullPid);
  }
  
  if (!record && pid.startsWith('https://hdl.handle.net/')) {
    const shortPid = pid.replace('https://hdl.handle.net/', '');
    record = fdoRecords.get(shortPid);
  }
  
  if (!record) {
    return NextResponse.json({ error: 'FDO record not found' }, { status: 404 });
  }
  
  return NextResponse.json(record);
}
