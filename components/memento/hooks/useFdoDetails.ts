import { useState, useEffect, useRef } from 'react';
import type { FdoRecord } from '@/lib/database/types';

interface FullFdoRecord extends FdoRecord {
  record: Record<string, string | string[]>;
}

export function useFdoDetails(fdoPid: string) {
  const [fullFdo, setFullFdo] = useState<FullFdoRecord | null>(null);
  const [isFdoLoading, setIsFdoLoading] = useState(false);
  const pidRef = useRef<string | null>(null);

  useEffect(() => {
    if (fdoPid === pidRef.current) {
      return;
    }

    pidRef.current = fdoPid;
    const fetchFullFdo = async () => {
      setIsFdoLoading(true);
      try {
        const response = await fetch(`/api/fdoservice/${fdoPid}`);
        if (response.ok) {
          const data = await response.json();
          const recordObj: Record<string, string | string[]> = {};
          data.record.forEach((entry: { key: string; value: string }) => {
            if (recordObj[entry.key]) {
              if (!Array.isArray(recordObj[entry.key])) {
                recordObj[entry.key] = [recordObj[entry.key] as string];
              }
              recordObj[entry.key] = [...(recordObj[entry.key] as string[]), entry.value];
            } else {
              recordObj[entry.key] = entry.value;
            }
          });
          setFullFdo({ ...data, record: recordObj });
        }
      } catch (error) {
        console.error('Failed to fetch full FDO:', error);
      } finally {
        setIsFdoLoading(false);
      }
    };
    fetchFullFdo();
  }, [fdoPid]);

  return { fullFdo, isFdoLoading };
}
