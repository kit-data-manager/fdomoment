import React, { useState, useEffect, useImperativeHandle, forwardRef, useCallback, useRef } from "react";
import { FdoTable } from "@/components/memento/FdoTable";
import type { FdoRecord } from '@/lib/database/types';
import type { LinkValidatorFormRef } from '../types';

interface LinkValidatorFormProps {
  typePid: string;
  typeName: string;
  onValueChange: (value: any) => void;
}

const LinkValidatorForm = forwardRef<LinkValidatorFormRef, LinkValidatorFormProps>(
  ({ typePid, typeName, onValueChange }, ref) => {
    const [allFdos, setAllFdos] = useState<FdoRecord[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedPid, setSelectedPid] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<'orcid' | 'research_domain' | 'fair_score' | 'created_at'>('created_at');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [page, setPage] = useState(1);
    const limit = 10;
    const [total, setTotal] = useState(0);

    const processSelection = useCallback(() => {
      if (selectedPid) {
        onValueChange(selectedPid);
        return selectedPid;
      }
      return null;
    }, [selectedPid, onValueChange]);

    useImperativeHandle(ref, () => ({
      acceptSelection: processSelection
    }), [processSelection]);

    const fetchAllFdos = useCallback(async (pageNum: number = page, limitNum: number = limit, sortByField: typeof sortBy = sortBy, sortOrderField: typeof sortOrder = sortOrder) => {
      setIsLoading(true);
      try {
        const url = new URL('/api/database/fdo', window.location.href);
        url.searchParams.set('page', pageNum.toString());
        url.searchParams.set('limit', limitNum.toString());
        url.searchParams.set('sortBy', sortByField);
        url.searchParams.set('sortOrder', sortOrderField);
        const response = await fetch(url.toString());
        if (response.ok) {
          const data = await response.json();
          setAllFdos(data.items || data);
          setTotal(data.total || (Array.isArray(data) ? data.length : 0));
        }
      } catch (error) {
        console.error('Failed to fetch FDO records:', error);
      } finally {
        setIsLoading(false);
      }
    }, [page, limit, sortBy, sortOrder]);

    useEffect(() => {
      fetchAllFdos();
    }, [fetchAllFdos]);

    return (
      <div className="card bg-base-100 shadow-xl border border-base-300">
        <div className="card-body p-6">
          <div className="flex items-center mb-4">
            <h3 className="text-lg font-semibold">{typeName}</h3>
          </div>
          
          <div className="text-sm text-base-content/70 mb-4">
            {typePid}
          </div>
          
          <div className="space-y-3">
            {isLoading && (
              <div className="flex items-center justify-center p-4">
                <span className="loading loading-spinner loading-xs"></span>
                <span className="ml-2 text-xs">Loading FDOs...</span>
              </div>
            )}

            {!isLoading && allFdos.length === 0 && (
              <div className="text-sm text-base-content/70 p-4">
                No FDO records available in the database.
              </div>
            )}

             {!isLoading && allFdos.length > 0 && (
              <div>
                <FdoTable 
                  fdos={allFdos}
                  selectedPid={selectedPid}
                  onSelectionChange={(pid) => {
                    setSelectedPid(pid);
                  }}
                  formMode={true}
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  page={page}
                  limit={limit}
                  total={total}
                  onSort={(field) => {
                    const newSortOrder = sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc';
                    setSortBy(field);
                    setSortOrder(newSortOrder);
                    setPage(1);
                    fetchAllFdos(1, limit, field, newSortOrder);
                  }}
                  onPageChange={(pageNum) => {
                    setPage(pageNum);
                    fetchAllFdos(pageNum, limit, sortBy, sortOrder);
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

LinkValidatorForm.displayName = "LinkValidatorForm";

export default LinkValidatorForm;
