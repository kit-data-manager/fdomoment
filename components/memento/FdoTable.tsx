'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Copy, Image as ImageIcon, Link as LinkIcon, Check } from 'lucide-react';
import { PidComponent } from '@kit-data-manager/react-pid-component';
import type { FdoRecord } from '@/lib/database/types';
import {useTheme} from "@/context/ThemeContext";

interface FdoTableProps {
  fdos: FdoRecord[];
  showColumns?: {
    orcid?: boolean;
    researchDomain?: boolean;
  };
  sortBy?: 'orcid' | 'researchDomain' | 'fairScore' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  onSort?: (field: 'orcid' | 'researchDomain' | 'fairScore' | 'createdAt') => void;
  page?: number;
  limit?: number;
  total?: number;
  onPageChange?: (page: number) => void;
  initialSelectedPid?: string | null;
}

function FdoDetailPanel({ fdo, onClose }: { fdo: FdoRecord; onClose: () => void }) {
  const { darkMode } = useTheme();
  const [badgeStyle, setBadgeStyle] = useState('default');
  const [badgePreview, setBadgePreview] = useState<string>('');
  const [copied, setCopied] = useState<'md' | 'url' | 'image' | null>(null);
  const [customLabel, setCustomLabel] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [customUseLogo, setCustomUseLogo] = useState(true);

  const badgeStyles = [
    { value: 'default', label: 'Default (FAIR Score)' },
    { value: 'pid-only', label: 'PID only' },
    { value: 'custom', label: 'Custom text' },
  ];

  useEffect(() => {
    if (badgeStyle === 'custom') {
      setCustomLabel(fdo.pid.replace(/-/g, '--'));
      setCustomMessage(`FAIR Score: ${fdo.fairScore}`);
    } else {
      setCustomLabel('');
      setCustomMessage('');
    }
  }, [badgeStyle, fdo.pid, fdo.fairScore]);

  const pidShort = fdo.pid.split('/').pop() || fdo.pid.substring(0, 12);

  const generateBadgeUrl = () => {
    const base = 'https://img.shields.io/badge';
    
    switch (badgeStyle) {
      case 'default':
        return `${base}/FAIR%20Score-${fdo.fairScore}%25-blue?logo=bookmeter`;
      case 'pid-only':
        const logoData = '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';
        return `${base}/FAIR%20DO-${encodeURIComponent(pidShort.replace(/-/g, '--'))}-blue?logo=data:image/png;base64,${logoData}`;
      case 'custom':
        const labelEncoded = encodeURIComponent(customLabel || 'custom').replace(/-/g, '%2D');
        const messageEncoded = encodeURIComponent(customMessage || 'data').replace(/-/g, '%2D');
        if (customUseLogo) {
          const logoData = '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';
          return `${base}/${labelEncoded}-${messageEncoded}-blue?logo=data:image/png;base64,${logoData}`;
        }
        return `${base}/${labelEncoded}-${messageEncoded}-blue`;
      default:
        return `${base}/FAIR%20Score-${fdo.fairScore}%25-blue?logo=bookmeter`;
    }
  };

  useEffect(() => {
    setBadgePreview(generateBadgeUrl());
  }, [badgeStyle, customLabel, customMessage, customUseLogo, fdo]);

  const copyToClipboard = async (type: 'md' | 'url' | 'image') => {
    let text = '';
    if (type === 'md') {
      const linkUrl = `https://hdl.handle.net/${fdo.pid}`;
      if (badgeStyle === 'custom') {
        text = `[![${customLabel || 'custom'}](${badgePreview})](${linkUrl})`;
      } else {
        text = `[![FAIR Score](${badgePreview})](${linkUrl})`;
      }
    } else if (type === 'url') {
      text = badgePreview;
    } else if (type === 'image') {
      const response = await fetch(badgePreview);
      const blob = await response.blob();
      const clipboardItem = new ClipboardItem({ [blob.type]: blob });
      await navigator.clipboard.write([clipboardItem]);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
      return;
    }

    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="card bg-base-100 shadow-lg h-fit">
      <div className="card-body p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="card-title text-sm">FDO Details</h3>
          <button
              className="btn btn-ghost btn-xs btn-square"
              onClick={onClose}
          >
            <X className="w-4 h-4"/>
          </button>
        </div>
        <div className="space-y-2">
          <div>
            <span className="text-xs text-base-content/50">PID</span>
            <div className="text-sm">
              <PidComponent value={fdo.pid} darkMode={darkMode ? 'dark' : 'light'}/>
            </div>
          </div>
          {fdo.orcid && (
              <div>
                <span className="text-xs text-base-content/50">ORCiD</span>
                <div className="text-sm">
                  <PidComponent value={fdo.orcid} hideSubcomponents={true} darkMode={darkMode ? 'dark' : 'light'}/>
                </div>
              </div>
          )}
          <div>
            <span className="text-xs text-base-content/50">Research Domain</span>
            <div className="text-sm">
              <PidComponent value={fdo.researchDomain} hideSubcomponents={true} darkMode={darkMode ? 'dark' : 'light'}/>
            </div>
          </div>
        </div>

        <div className="divider my-2"/>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium">Badge Style:</label>
            <select
                className="select select-compact select-bordered select-xs w-full max-w-[200px]"
                value={badgeStyle}
                onChange={(e) => setBadgeStyle(e.target.value)}
            >
              {badgeStyles.map((style) => (
                  <option key={style.value} value={style.value}>
                    {style.label}
                  </option>
              ))}
            </select>
          </div>

          {badgeStyle === 'custom' && (
              <div className="space-y-2">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-xs">Custom Label</span>
                  </label>
                  <input
                      type="text"
                      className="input input-compact input-bordered input-xs w-full"
                      value={customLabel}
                      onChange={(e) => setCustomLabel(e.target.value)}
                      placeholder="Badge label (e.g., PID)"
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-xs">Custom Message</span>
                  </label>
                  <input
                      type="text"
                      className="input input-compact input-bordered input-xs w-full"
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      placeholder="Badge message (e.g., Score: 85)"
                  />
                </div>

                <div className="form-control">
                  <label className="label cursor-pointer">
                    <span className="label-text text-xs">Use logo</span>
                    <input
                        type="checkbox"
                        className="checkbox checkbox-xs"
                        checked={customUseLogo}
                        onChange={(e) => setCustomUseLogo(e.target.checked)}
                    />
                  </label>
                </div>
              </div>
          )}

          {badgePreview && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 p-2 bg-base-200 rounded-lg">
                  <img
                      src={badgePreview}
                      alt="Badge Preview"
                      className="h-8 cursor-pointer"
                      title="Click to copy as image"
                      onClick={() => copyToClipboard('image')}
                  />
                  <span className="text-xs text-base-content/70">Preview (click to copy as image)</span>
                </div>

                <div className="flex gap-2">
                  <button
                      className="btn btn-compact btn-xs"
                      onClick={() => copyToClipboard('md')}
                      title="Copy as Markdown"
                  >
                    {copied === 'md' ? <Check className="w-3 h-3"/> : <Copy className="w-3 h-3"/>}
                    Copy Markdown
                  </button>
                  <button
                      className="btn btn-compact btn-xs"
                      onClick={() => copyToClipboard('url')}
                      title="Copy URL"
                  >
                    {copied === 'url' ? <Check className="w-3 h-3"/> : <LinkIcon className="w-3 h-3"/>}
                    Copy URL
                  </button>
                  <button
                      className="btn btn-compact btn-xs"
                      onClick={() => copyToClipboard('image')}
                      title="Copy as image"
                  >
                    {copied === 'image' ? <Check className="w-3 h-3"/> : <ImageIcon className="w-3 h-3"/>}
                    Copy Image
                  </button>
                </div>
              </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function FdoTable({ 
  fdos, 
  showColumns, 
  sortBy, 
  sortOrder, 
  onSort,
  page = 1,
  limit = 10,
  total,
  onPageChange,
  initialSelectedPid,
}: FdoTableProps) {
  const [selectedFdo, setSelectedFdo] = useState<FdoRecord | null>(null);

  useEffect(() => {
    if (initialSelectedPid && fdos.length > 0) {
      const fdo = fdos.find(f => f.pid === initialSelectedPid);
      if (fdo) {
        setSelectedFdo(fdo);
      }
    }
  }, [initialSelectedPid, fdos]);
  const showOrcid = showColumns?.orcid ?? false;
  const showResearchDomain = showColumns?.researchDomain ?? false;
  const totalPages = total ? Math.ceil(total / limit) : 1;

  if (fdos.length === 0) {
    return (
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body items-center text-center py-12">
          <h2 className="card-title text-2xl mb-4">No FDOs Yet</h2>
          <p className="text-base-content/70 mb-6">
            Nothing to see here. Create your first FDO now.
          </p>
            <Link href="/momentum" className="btn btn-primary">
              Create FDO
            </Link>
        </div>
      </div>
    );
  }

  const renderSortIndicator = (field: 'orcid' | 'researchDomain' | 'fairScore' | 'createdAt') => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? ' ↑' : ' ↓';
  };

  const handleRowClick = (fdo: FdoRecord) => {
    setSelectedFdo(prev => prev?.pid === fdo.pid ? null : fdo);
  };

  return (
    <div className="flex gap-4">
      <div className={`card bg-base-100 shadow-lg transition-all ${selectedFdo ? 'w-1/2 min-w-0 hidden md:block' : 'w-full'}`}>
        <div className="card-body">
          <h2 className="card-title mb-4">
            {showOrcid && showResearchDomain ? 'All FDOs' : 'Your FDOs'}
          </h2>
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>PID</th>
                  <th className={`cursor-pointer ${selectedFdo ? 'hidden xl:table-cell' : ''}`} onClick={() => onSort?.('researchDomain')}>
                    Research Domain{renderSortIndicator('researchDomain')}
                  </th>
                  <th className="cursor-pointer" onClick={() => onSort?.('fairScore')}>
                    FAIR Score{renderSortIndicator('fairScore')}
                  </th>
                  <th className={`cursor-pointer ${selectedFdo ? 'hidden lg:table-cell' : ''}`} onClick={() => onSort?.('createdAt')}>
                    Created{renderSortIndicator('createdAt')}
                  </th>
                  {showOrcid && (
                    <th className={`cursor-pointer ${selectedFdo ? 'hidden 2xl:table-cell' : ''}`} onClick={() => onSort?.('orcid')}>
                      ORCiD{renderSortIndicator('orcid')}
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {fdos.map((fdo) => (
                  <tr
                    key={fdo.pid}
                    className={`cursor-pointer hover ${selectedFdo?.pid === fdo.pid ? 'bg-primary/10' : ''}`}
                    onClick={() => handleRowClick(fdo)}
                  >
                    <td>
                      <code className="text-xs">{fdo.pid.slice(0, 8)}...</code>
                    </td>
                    <td className={selectedFdo ? 'hidden xl:table-cell' : ''}>{fdo.researchDomain || '-'}</td>
                    <td>
                      <div className="badge badge-primary">{fdo.fairScore}%</div>
                    </td>
                    <td className={selectedFdo ? 'hidden lg:table-cell' : ''}>{new Date(fdo.createdAt).toLocaleDateString("de",{year:"2-digit",month:"2-digit", day:"2-digit"})}</td>
                    {showOrcid && <td className={selectedFdo ? 'hidden 2xl:table-cell' : ''}>{fdo.orcid || '-'}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {total !== undefined && total > limit && (
            <div className="flex justify-center gap-2 mt-4">
              <button 
                className="btn btn-sm" 
                disabled={page === 1}
                onClick={() => onPageChange?.(page - 1)}
              >
                Previous
              </button>
              <div className="btn btn-sm disabled">
                Page {page} of {totalPages}
              </div>
              <button 
                className="btn btn-sm" 
                disabled={page === totalPages}
                onClick={() => onPageChange?.(page + 1)}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {selectedFdo && (
        <div className="w-full md:w-1/2 flex-shrink-0">
          <FdoDetailPanel
            fdo={selectedFdo}
            onClose={() => setSelectedFdo(null)}
          />
        </div>
      )}
    </div>
  );
}
