/**
 * Represents a key-value pair in the record array
 */
export interface RecordEntry {
  key: string;
  value: string;
}

/**
 * The main data structure with pid and record array
 */
export interface RecordData {
  pid: string;
  record: RecordEntry[];
}

/**
 * Creates a new empty RecordData structure
 * @param pid - Optional initial pid value
 * @returns A new RecordData instance
 */
export const createRecordData = (pid: string = ''): RecordData => {
  return {
    pid,
    record: []
  };
};

/**
 * Sets the pid in the RecordData structure
 * @param data - The RecordData to update
 * @param pid - The new pid value
 * @returns A new RecordData instance with updated pid
 */
export const setPid = (data: RecordData, pid: string): RecordData => {
  return {
    ...data,
    pid
  };
};

/**
 * Adds a key-value pair to the record array
 * @param data - The RecordData to update
 * @param key - The key for the new entry
 * @param value - The value for the new entry (will be converted to string)
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

/**
 * Updates a key-value pair at a specific index in the record array
 * @param data - The RecordData to update
 * @param index - The index of the entry to update
 * @param key - The new key (or undefined to keep existing)
 * @param value - The new value (or undefined to keep existing)
 * @returns A new RecordData instance with the updated entry
 */
export const updateRecordEntry = (
  data: RecordData,
  index: number,
  key?: string,
  value?: any
): RecordData => {
  const newRecord = [...data.record];
  if (index >= 0 && index < newRecord.length) {
    newRecord[index] = {
      key: key !== undefined ? key : newRecord[index].key,
      value: value !== undefined ? String(value) : newRecord[index].value
    };
  }
  return {
    ...data,
    record: newRecord
  };
};

/**
 * Removes a key-value pair at a specific index from the record array
 * @param data - The RecordData to update
 * @param index - The index of the entry to remove
 * @returns A new RecordData instance with the entry removed
 */
export const removeRecordEntry = (data: RecordData, index: number): RecordData => {
  return {
    ...data,
    record: data.record.filter((_, i) => i !== index)
  };
};

/**
 * Clears all entries from the record array
 * @param data - The RecordData to clear
 * @returns A new RecordData instance with empty record array
 */
export const clearRecords = (data: RecordData): RecordData => {
  return {
    ...data,
    record: []
  };
};

/**
 * Gets the value for a specific key from the record array
 * @param data - The RecordData to search
 * @param key - The key to look up
 * @returns The value if found, undefined otherwise
 */
export const getRecordValue = (data: RecordData, key: string): string | undefined => {
  const entry = data.record.find(entry => entry.key === key);
  return entry?.value;
};

/**
 * Checks if a key exists in the record array
 * @param data - The RecordData to search
 * @param key - The key to check
 * @returns True if the key exists, false otherwise
 */
export const hasRecordKey = (data: RecordData, key: string): boolean => {
  return data.record.some(entry => entry.key === key);
};

/**
 * Sets multiple key-value pairs at once
 * @param data - The RecordData to update
 * @param entries - Array of key-value pairs to add
 * @returns A new RecordData instance with the entries added
 */
export const setRecordEntries = (
  data: RecordData,
  entries: Array<{ key: string; value: any }>
): RecordData => {
  return {
    ...data,
    record: entries.map(entry => ({
      key: entry.key,
      value: String(entry.value)
    }))
  };
};

/**
 * Converts RecordData to a plain object for JSON serialization
 * @param data - The RecordData to convert
 * @returns A plain object representation
 */
export const recordDataToObject = (data: RecordData): Record<string, string> => {
  const obj: Record<string, string> = {};
  data.record.forEach(entry => {
    obj[entry.key] = entry.value;
  });
  return obj;
};

/**
 * Creates RecordData from a plain object
 * @param obj - The plain object to convert
 * @param pid - Optional pid value
 * @returns A new RecordData instance
 */
export const objectToRecordData = (obj: Record<string, any>, pid: string = ''): RecordData => {
  return {
    pid,
    record: Object.entries(obj).map(([key, value]) => ({
      key,
      value: String(value)
    }))
  };
};
