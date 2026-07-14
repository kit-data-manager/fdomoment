import {NextResponse} from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import {FdoRecord} from "@/app/api/fdoservice/types";

const FDO_SERVICE_MODE = process.env.FDO_SERVICE_MODE || 'local';
const REMOTE_FDO_SERVICE_ENDPOINT = process.env.REMOTE_FDO_SERVICE_ENDPOINT || '';

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

async function forwardToRemoteService(pid: string): Promise<NextResponse> {
    try {
        const response = await fetch(`${REMOTE_FDO_SERVICE_ENDPOINT}/api/v1/pit/pid/${pid}`, {
            method: 'GET',
            headers: {'Accept': 'application/vnd.datamanager.pid.simple+json'},
        });

        const data = await response.json();
        return NextResponse.json(data, {status: response.status});
    } catch (error) {
        console.error('Failed to forward to remote FDO service:', error);
        return NextResponse.json({error: 'Failed to connect to remote FDO service'}, {status: 500});
    }
}

export async function GET(
    request: Request,
    {params}: { params: Promise<{ pid?: string }> }
) {
    const {pid} = await params;

    if (FDO_SERVICE_MODE === 'remote') {
        if (!pid) {
            return NextResponse.json({error: 'PID required'}, {status: 400});
        }
        return forwardToRemoteService(pid);
    }

    await initializeRecords();

    console.log('GET params:', {pid});
    console.log('GET request.url:', request.url);
    if (!pid) {
        return NextResponse.json({error: 'PID required'}, {status: 400});
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
        return NextResponse.json({error: 'FDO record not found'}, {status: 404});
    }

    return NextResponse.json(record);
}
