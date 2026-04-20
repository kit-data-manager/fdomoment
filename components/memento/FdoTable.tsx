'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Copy, Image as ImageIcon, Link as LinkIcon, Check, BookOpen, Image, Info } from 'lucide-react';
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
  const [copied, setCopied] = useState<'md' | 'url' | 'image' | 'citation' | null>(null);
  const [customLabel, setCustomLabel] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [customUseLogo, setCustomUseLogo] = useState(true);
  const [fullFdo, setFullFdo] = useState<FdoRecord & { record: Record<string, string> } | null>(null);
  const [citationStyle, setCitationStyle] = useState<'apa' | 'ieee' | 'harvard' | 'bibtex'>('apa');
  const [citationText, setCitationText] = useState('');
  const [manualAuthor, setManualAuthor] = useState('');
  const [manualTitle, setManualTitle] = useState('');
  const [manualDoi, setManualDoi] = useState('');
  const [manualUrl, setManualUrl] = useState('');
  const [manualVersion, setManualVersion] = useState('');
  const [isCitationLoading, setIsCitationLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<'details' | 'badge' | 'citation' | null>('details');

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

  useEffect(() => {
    const fetchFullFdo = async () => {
      setIsCitationLoading(true);
      try {
        console.log("Obtaining FDO ", fdo.pid)
        const response = await fetch(`${process.env.NEXT_PUBLIC_FDO_SERVICE_ENDPOINT}/${fdo.pid}`);
        console.log("RES", response)
        if (response.ok) {
          const data = await response.json();
          const recordObj: Record<string, string> = {};
          data.record.forEach((entry: { key: string; value: string }) => {
            recordObj[entry.key] = entry.value;
          });
          setFullFdo({ ...data, record: recordObj });
        }
      } catch (error) {
        console.error('Failed to fetch full FDO:', error);
      } finally {
        setIsCitationLoading(false);
      }
    };
    fetchFullFdo();
  }, [fdo.pid]);

  useEffect(() => {
    if (fullFdo) {
      const record = fullFdo.record;
      setManualAuthor(manualAuthor || (record['0.SIMPLE/PUBLICATION_CREATOR'] || ''));
      setManualTitle(manualTitle || (record['0.SIMPLE/PUBLICATION_TITLE'] || ''));
      setManualDoi(manualDoi || (record['0.SIMPLE/DOI'] || ''));
      setManualUrl(manualUrl || (record['0.SIMPLE/DATA_OBJECT_LOCATION'] || record['0.SIMPLE/SOFTWARE_LOCATION'] || ''));
      setManualVersion(manualVersion || (record['0.SIMPLE/VERSION'] || ''));
    }
  }, [fullFdo]);

  useEffect(() => {
    const generateCitation = async () => {
      if (!fullFdo) {
        setCitationText('');
        return;
      }

      const record = fullFdo.record;

      const getAuthor = async (): Promise<string> => {
        if (manualAuthor) return manualAuthor;
        const orcid = record['0.SIMPLE/PUBLICATION_CREATOR'];
        if (orcid) {
          try {
            const response = await fetch(`https://orcid.org/${orcid.split('/').pop()}/person`);
            if (response.ok) {
              const data = await response.json();
                const firstName = data?.names?.find((n: { 'preferred-name'?: { 'given-names'?: string; 'family-name'?: string } }) => n?.['preferred-name'])?.['preferred-name']?.['given-names'] || '';
                const lastName = data?.names?.find((n: { 'preferred-name'?: { 'given-names'?: string; 'family-name'?: string } }) => n?.['preferred-name'])?.['preferred-name']?.['family-name'] || '';
              return `${firstName} ${lastName}`.trim() || orcid;
            }
          } catch (error) {
            console.error('Failed to fetch ORCID:', error);
          }
        }
        return '';
      };

      const getTitle = () => manualTitle;
      const getDoi = () => manualDoi;
      const getUrl = () => manualUrl;
      const getVersion = () => manualVersion;
      const getYear = () => {
        const date = record['0.SIMPLE/PUBLICATION_DATE'] || record['0.SIMPLE/CREATION_DATE'] || '';
        return date ? new Date(date).getFullYear().toString() : '';
      };

      const author = await getAuthor();
      const title = getTitle();
      const doi = getDoi();
      const url = getUrl();
      const version = getVersion();
      const year = getYear();
      const authors = author ? [author] : [];

      if (citationStyle === 'bibtex') {
        let citeType = 'misc';
        if (record['0.SIMPLE/DATA_OBJECT_LOCATION']) {
          citeType = 'dataset';
        } else if (record['0.SIMPLE/SOFTWARE_LOCATION']) {
          citeType = 'software';
        }

        let bibtex = `@${citeType}{${fdo.pid.split('/').pop() || 'fdo'},\n`;
        if (author) bibtex += `  author = {${author}},\n`;
        if (title) bibtex += `  title = {${title}},\n`;
        if (year) bibtex += `  year = {${year}},\n`;
        if (doi) bibtex += `  doi = {${doi}},\n`;
        if (url) bibtex += `  url = {${url}},\n`;
        if (version) bibtex += `  version = {${version}},\n`;
        bibtex += '}';
        setCitationText(bibtex);
      } else {
        let citation = '';
        const yearStr = year ? `(${year})` : '';
        const titlePart = title ? `${title}.` : '';
        const doiPart = doi ? `https://doi.org/${doi}` : url;
        const authorsStr = authors.length > 0 ? authors.join(', ') : '';

        if (citationStyle === 'apa') {
          citation = `${authorsStr} ${yearStr} ${titlePart} ${doiPart || url}`;
        } else if (citationStyle === 'ieee') {
          citation = `[1] ${authorsStr} "${titlePart}" ${yearStr}. ${doiPart || url}`;
        } else if (citationStyle === 'harvard') {
          citation = `${authorsStr} ${yearStr} ${titlePart} Available at: ${doiPart || url}`;
        }

        setCitationText(citation.trim());
      }
    };

    generateCitation();
  }, [citationStyle, fullFdo, manualAuthor, manualTitle, manualDoi, manualUrl, manualVersion, fdo.pid]);

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
          <h3 className="card-title text-sm">Selected FDO {fdo.pid}</h3>
          <button
              className="btn btn-ghost btn-xs btn-square"
              onClick={onClose}
          >
            <X className="w-4 h-4"/>
          </button>
        </div>

        <div className="space-y-3">
          <div className="accordion space-y-3">
            <div className={`accordion-item ${activeSection === 'details' ? 'accordion-open' : ''}`}>
              <summary 
                className={`accordion-content flex items-center gap-2 cursor-pointer ${activeSection === 'details' ? 'accordion-open' : ''}`}
                 onClick={() => setActiveSection(activeSection === 'details' ? null : 'details')}
              >
                <Info className="w-5 h-5 font-bold" />
                <span className="text-sm font-bold uppercase tracking-wider">Core Attributes</span>
              </summary>
              {activeSection === 'details' && (
              <div className="accordion-body mt-2 space-y-2">
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
              )}
            </div>

             <div className={`accordion-item ${activeSection === 'badge' ? 'accordion-open' : ''}`}>
              <summary 
                className={`accordion-content flex items-center gap-2 cursor-pointer ${activeSection === 'badge' ? 'accordion-open' : ''}`}
                 onClick={() => setActiveSection(activeSection === 'badge' ? null : 'badge')}
              >
                 <Image className="w-5 h-5 font-bold" />
                 <span className="text-sm font-bold uppercase tracking-wider">Badge Creation</span>
              </summary>
              {activeSection === 'badge' && (
              <div className="accordion-body mt-2 space-y-3">
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
              )}
            </div>

            <div className={`accordion-item ${activeSection === 'citation' ? 'accordion-open' : ''}`}>
              <summary 
                className={`accordion-content flex items-center gap-2 cursor-pointer ${activeSection === 'citation' ? 'accordion-open' : ''}`}
                 onClick={() => setActiveSection(activeSection === 'citation' ? null : 'citation')}
              >
                 <BookOpen className="w-5 h-5 font-bold" />
                 <span className="text-sm font-bold uppercase tracking-wider">Citation</span>
                <span className="text-xs font-medium">Citation</span>
              </summary>
              {activeSection === 'citation' && (
              <div className="accordion-body mt-2 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium">Citation Style:</label>
                  <select
                      className="select select-compact select-bordered select-xs w-full max-w-[200px]"
                      value={citationStyle}
                      onChange={(e) => setCitationStyle(e.target.value as 'apa' | 'ieee' | 'harvard' | 'bibtex')}
                  >
                    <option value="apa">APA</option>
                    <option value="ieee">IEEE</option>
                    <option value="harvard">Harvard</option>
                    <option value="bibtex">BibTeX</option>
                  </select>
                </div>

                {isCitationLoading && (
                  <div className="flex items-center justify-center p-4">
                    <span className="loading loading-spinner loading-xs"></span>
                    <span className="ml-2 text-xs">Fetching FDO details...</span>
                  </div>
                )}

                {!isCitationLoading && fullFdo && (
                  <div className="space-y-2">
                    <div className="alert alert-info alert-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-xs">Auto-generated citation. You can provide missing information manually:</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <input
                          type="text"
                          className="input input-compact input-bordered input-xs w-full"
                          value={manualAuthor}
                          onChange={(e) => setManualAuthor(e.target.value)}
                          placeholder="Author (name)"
                      />
                      <input
                          type="text"
                          className="input input-compact input-bordered input-xs w-full"
                          value={manualTitle}
                          onChange={(e) => setManualTitle(e.target.value)}
                          placeholder="Title"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                          type="text"
                          className="input input-compact input-bordered input-xs w-full"
                          value={manualDoi}
                          onChange={(e) => setManualDoi(e.target.value)}
                          placeholder="DOI"
                      />
                      <input
                          type="text"
                          className="input input-compact input-bordered input-xs w-full"
                          value={manualVersion}
                          onChange={(e) => setManualVersion(e.target.value)}
                          placeholder="Version"
                      />
                    </div>
                    <input
                        type="text"
                        className="input input-compact input-bordered input-xs w-full"
                        value={manualUrl}
                        onChange={(e) => setManualUrl(e.target.value)}
                        placeholder="URL"
                    />
                  </div>
                )}

                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-xs">Citation Output</span>
                  </label>
                  <textarea
                      className="textarea textarea-compact textarea-bordered textarea-xs w-full font-mono text-xs min-h-[150px]"
                      value={citationText}
                      readOnly
                      placeholder="Citation will appear here..."
                  />
                </div>

                <div className="flex gap-2">
                  <button
                      className="btn btn-compact btn-xs"
                       onClick={() => {
                         if (citationText) {
                           navigator.clipboard.writeText(citationText);
                           setCopied('citation');
                           setTimeout(() => setCopied(null), 2000);
                         }
                       }}
                      disabled={!citationText}
                      title="Copy citation"
                  >
                    {copied === 'citation' ? <Check className="w-3 h-3"/> : <Copy className="w-3 h-3"/>}
                    Copy Citation
                  </button>
                </div>
              </div>
              )}
            </div>
          </div>
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
