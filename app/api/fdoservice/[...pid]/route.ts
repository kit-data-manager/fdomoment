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
        console.log('No existing FAIR DO records found, starting fresh');
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
        console.error('Failed to forward to remote FAIR DO service:', error);
        return NextResponse.json({error: 'Failed to connect to remote FAIR DO service'}, {status: 500});
    }
}

export async function GET(
    request: Request,
    {params}: { params: Promise<{ pid?: string[] }> }
) {
    const {pid} = await params;

    if (FDO_SERVICE_MODE === 'remote') {
        if (!pid || pid.length === 0) {
            return NextResponse.json({error: 'PID required'}, {status: 400});
        }
        const decodedPid = decodeURIComponent(pid.join('/'));
        return forwardToRemoteService(decodedPid);
    }

    await initializeRecords();

    console.log('GET params:', {pid});
    console.log('GET request.url:', request.url);
    if (!pid || pid.length === 0) {
        return NextResponse.json({error: 'PID required'}, {status: 400});
    }

    const pidString = decodeURIComponent(pid.join('/'));

    let record = fdoRecords.get(pidString);

    if (!record) {
        const fullPid = `https://hdl.handle.net/${pidString}`;
        record = fdoRecords.get(fullPid);
    }

    if (!record && pidString.startsWith('https://hdl.handle.net/')) {
        const shortPid = pidString.replace('https://hdl.handle.net/', '');
        record = fdoRecords.get(shortPid);
    }

    if (!record) {
        return NextResponse.json({error: 'FAIR DO record not found'}, {status: 404});
    }

    return NextResponse.json(record);
}
