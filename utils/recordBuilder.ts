/**
 * Record builder utilities for assembling FAIR Digital Object records.
 *
 * Only the functions actually used by the application are kept here. A record is
 * modeled as a key/value entry list with an optional persistent identifier.
 */

/** Represents a key-value pair in the record array. */
export interface RecordEntry {
  key: string;
  value: string;
}

/** The main data structure: a persistent identifier plus the record entries. */
export interface RecordData {
  pid: string;
  record: RecordEntry[];
}

/** Creates a new empty RecordData structure. */
export const createRecordData = (pid: string = ''): RecordData => {
  return {
    pid,
    record: []
  };
};

/**
 * Adds a key-value pair to the record array.
 * @param data - The RecordData to update
 * @param key - The key for the new entry
 * @param value - The value (converted/stringified, or JSON-serialized if an object)
 * @returns A new RecordData instance with the added entry
 */
export const addRecordEntry = (data: RecordData, key: string, value: any): RecordData => {
  return {
    ...data,
    record: [
      ...data.record,
      {
        key,
        value: typeof value === 'object' ? JSON.stringify(value) : String(value)
      }
    ]
  };
};
