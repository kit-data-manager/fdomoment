export interface RecordEntry {
    key: string;
    value: string;
}

export interface FdoRecord {
    pid: string;
    record: RecordEntry[];
}
