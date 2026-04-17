import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

function generatePid(): string {
  return 'https://hdl.handle.net/' + 
    Math.random().toString(36).substring(2, 15) + 
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

let fdoRecords: Map<string, FdoRecord> = new Map();
let isInitialized = false;

async function initializeRecords() {
  if (isInitialized) return;
  
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
  
  isInitialized = true;
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

export async function GET(request: Request) {
  await initializeRecords();
  
  const url = new URL(request.url);
  const pid = url.pathname.split('/').pop();
  
  if (!pid) {
    return NextResponse.json({ error: 'PID required' }, { status: 400 });
  }
  
  const record = fdoRecords.get(pid);
  
  if (!record) {
    return NextResponse.json({ error: 'FDO record not found' }, { status: 404 });
  }
  
  return NextResponse.json(record);
}
