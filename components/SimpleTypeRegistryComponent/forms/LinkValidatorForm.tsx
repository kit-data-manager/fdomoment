import React, { useState, useEffect } from "react";
import { Eye } from "lucide-react";
import { useFdoDetails } from "@/components/memento/hooks/useFdoDetails";
import type { FdoRecord } from '@/lib/database/types';

interface LinkValidatorFormProps {
  typePid: string;
  typeName: string;
  onValueChange: (value: { [key: string]: string }) => void;
}

const LinkValidatorForm = ({ typePid, typeName, onValueChange }: LinkValidatorFormProps) => {
  // typeName is displayed in the UI as read-only field
  const [allFdos, setAllFdos] = useState<FdoRecord[]>([]);
  const [selectedFdo, setSelectedFdo] = useState<FdoRecord | null>(null);
  const [hoveredPid, setHoveredPid] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchAllFdos = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/database/fdo');
        if (response.ok) {
          const data = await response.json();
          setAllFdos(data);
        }
      } catch (error) {
        console.error('Failed to fetch FDO records:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllFdos();
  }, []);

  useEffect(() => {
    if (selectedFdo) {
      onValueChange({ [typePid]: selectedFdo.pid });
    }
  }, [selectedFdo, typePid, onValueChange]);

  const renderPreviewCell = (fdo: FdoRecord) => {
    const isHovered = hoveredPid === fdo.pid;
    
    return (
      <td 
        className="relative overflow-visible"
        onMouseEnter={() => setHoveredPid(fdo.pid)}
        onMouseLeave={() => setHoveredPid(null)}
      >
        <button className="btn btn-ghost btn-xs">
          <Eye className="w-3 h-3" />
        </button>
        
        {isHovered && (
          <div className="fixed z-999 left-100 top-0 ml-2 w-[600px] max-h-[500px] overflow-hidden">
            <div className="card bg-base-100 shadow-xl border border-base-300 max-h-[500px] overflow-y-auto">
              <div className="card-body p-4">
                <h3 className="card-title text-sm mb-2 sticky top-0 bg-base-100 pb-2 border-b">
                  Full FDO Record Preview
                </h3>
                <PreviewContent pid={fdo.pid} />
              </div>
            </div>
          </div>
        )}
      </td>
    );
  };

  function PreviewContent({ pid }: { pid: string }) {
    const { fullFdo, isFdoLoading } = useFdoDetails(pid);
    
    if (isFdoLoading) {
      return (
        <div className="flex items-center justify-center p-4">
          <span className="loading loading-spinner loading-xs"></span>
          <span className="ml-2 text-xs">Loading FDO details...</span>
        </div>
      );
    }
    
    if (!fullFdo) {
      return (
        <div className="text-xs text-base-content/70 p-4">
          Unable to load FDO record
        </div>
      );
    }
    
    return (
      <table className="table table-compact">
        <thead>
          <tr>
            <th>Key</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(fullFdo.record).map(([key, value]) => {
            const displayValue = Array.isArray(value) 
              ? value.join(', ') 
              : value;
            return (
              <tr key={key}>
                <td className="text-xs font-mono text-base-content/70">
                  {key}
                </td>
                <td className="text-xs">
                  {displayValue || '-'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  }

  return (
    <div className="mt-4">
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body p-4">
          <h3 className="card-title text-sm mb-4">
            Select related FDO
          </h3>
          
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
              <div className="table-container">
                <table className="table table-compact">
                  <thead>
                    <tr>
                      <th></th>
                      <th>PID</th>
                      <th>Research Domain</th>
                      <th>FAIR Score</th>
                      <th>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allFdos.map((fdo) => (
                      <tr
                        key={fdo.pid}
                        className={`cursor-pointer hover ${selectedFdo?.pid === fdo.pid ? 'bg-primary/10' : ''}`}
                        onClick={() => setSelectedFdo(fdo)}
                      >
                        {renderPreviewCell(fdo)}
                        <td>
                          <code className="text-xs">{fdo.pid.slice(0, 8)}...</code>
                        </td>
                        <td>{fdo.researchDomain || '-'}</td>
                        <td>
                          <div className="badge badge-primary">{fdo.fairScore}%</div>
                        </td>
                        <td>
                          {new Date(fdo.createdAt).toLocaleDateString("de", {year:"2-digit",month:"2-digit", day:"2-digit"})}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {selectedFdo && (
              <div className="alert alert-info alert-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs">Selected FDO: {selectedFdo.pid}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinkValidatorForm;
