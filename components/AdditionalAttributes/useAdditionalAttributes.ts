import { useState, useEffect } from 'react';
import { AdditionalAttribute, AdditionalAttributeModuleData } from './types';

export const useAdditionalAttributes = () => {
  const [rows, setRows] = useState<AdditionalAttributeModuleData>(() => {
    if (typeof window === 'undefined') {
      return { rows: [] };
    }
    const stored = localStorage.getItem('additionalAttributes');
    const parsed = stored ? JSON.parse(stored) : { rows: [] };
    return {
      rows: Array.isArray(parsed) ? parsed : (parsed.rows || [])
    };
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('additionalAttributes', JSON.stringify(rows));
    }
  }, [rows]);

  const updateRows = (newRows: AdditionalAttributeModuleData) => {
    setRows(newRows);
    if (typeof window !== 'undefined') {
      localStorage.setItem('additionalAttributes', JSON.stringify(newRows));
    }
  };

  const handleInputChange = (index: number, field: 'key' | 'value', value: string) => {
    const newRowsData = [...(rows.rows || [])];
    newRowsData[index][field] = value;
    updateRows({ rows: newRowsData });
  };

  const addRow = () => {
    updateRows({ rows: [...(rows.rows || []), { key: '', value: '' }] });
  };

  const removeRow = (index: number) => {
    const newRowsData = (rows.rows || []).filter((_: AdditionalAttribute, i: number) => i !== index);
    updateRows({ rows: newRowsData });
  };

  return {
    rows: rows.rows || [],
    handleInputChange,
    addRow,
    removeRow
  };
};
