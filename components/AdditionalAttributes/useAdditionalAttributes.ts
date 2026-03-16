import { useState, useEffect } from 'react';
import { AdditionalAttributeRow } from './types';

export const useAdditionalAttributes = () => {
  const [rows, setRows] = useState<AdditionalAttributeRow[]>(() => {
    if (typeof window === 'undefined') {
      return [];
    }
    const stored = localStorage.getItem('additionalAttributesRows');
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('additionalAttributesRows', JSON.stringify(rows));
    }
  }, [rows]);

  const updateRows = (newRows: AdditionalAttributeRow[]) => {
    setRows(newRows);
    if (typeof window !== 'undefined') {
      localStorage.setItem('additionalAttributesRows', JSON.stringify(newRows));
    }
  };

  const handleInputChange = (index: number, field: 'key' | 'value', value: string) => {
    const newRows = [...rows];
    newRows[index][field] = value;
    updateRows(newRows);
  };

  const addRow = () => {
    updateRows([...rows, { key: '', value: '' }]);
  };

  const removeRow = (index: number) => {
    const newRows = rows.filter((_, i) => i !== index);
    updateRows(newRows);
  };

  return {
    rows,
    setRows,
    handleInputChange,
    addRow,
    removeRow
  };
};
