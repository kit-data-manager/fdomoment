import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import {FdoRecord} from "@/app/api/fdoservice/types";

const FDO_SERVICE_MODE = process.env.FDO_SERVICE_MODE || 'local';
const REMOTE_FDO_SERVICE_ENDPOINT = process.env.REMOTE_FDO_SERVICE_ENDPOINT || '';

function generatePid(): string {
  return Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
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
    console.log('No existing FAIR DO records found, starting fresh');
  }
}

async function saveRecords() {
  try {
    const dataPath = path.join(process.cwd(), 'data', 'fdos.json');
    await fs.mkdir(path.dirname(dataPath), { recursive: true });
    
    const records = Array.from(fdoRecords.values());
    
    await fs.writeFile(dataPath, JSON.stringify(records, null, 2));
  } catch (error) {
    console.error('Failed to save FAIR DO records:', error);
  }
}

async function forwardToRemoteService(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    const response = await fetch(`${REMOTE_FDO_SERVICE_ENDPOINT}/api/v1/pit/pid`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/vnd.datamanager.pid.simple+json' },
      body: JSON.stringify(body),
    });
    
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Failed to forward to remote FAIR DO service:', error);
    return NextResponse.json({ error: 'Failed to connect to remote FAIR DO service' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (FDO_SERVICE_MODE === 'remote') {
    return forwardToRemoteService(request);
  }
  
  await initializeRecords();
  
  try {
    const fdoRecord: FdoRecord = await request.json();
    console.log('User FAIR DO', fdoRecord);

    if (!fdoRecord || !Array.isArray(fdoRecord.record)) {
      return NextResponse.json({ error: 'Invalid FDO record' }, { status: 400 });
    }
    
    const pid = generatePid();
    const newRecord: FdoRecord = {
      ...fdoRecord,
      pid,
    };

    console.log('New FAIR DO', newRecord);

    fdoRecords.set(pid, newRecord);
    await saveRecords();
    
    return NextResponse.json(newRecord, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create FAIR DO record' }, { status: 500 });
  }
}
