'use client';

import React from 'react';
import {
  X,
  Copy,
  Link as LinkIcon,
  Check,
  BookOpen,
  FileText as ImageIcon,
  Info
} from 'lucide-react';
import { PidComponent } from '@kit-data-manager/react-pid-component';
import type { FdoRecord } from '@/lib/database/types';
import { useTheme } from '@/context/ThemeContext';
import { useBadgeGeneration } from './hooks/useBadgeGeneration';
import { useCitationGeneration } from './hooks/useCitationGeneration';
import { useFdoDetails } from './hooks/useFdoDetails';
import { useManualFields } from './hooks/useManualFields';

interface FdoDetailPanelProps {
  fdo: FdoRecord;
  onClose: () => void;
}

export default function FdoDetailPanel({ fdo, onClose }: FdoDetailPanelProps) {
  const { darkMode } = useTheme();
  
  const [badgeStyle, setBadgeStyle] = React.useState('default');
  const [citationStyle, setCitationStyle] = React.useState<'apa' | 'ieee' | 'harvard' | 'bibtex'>('apa');
  const [customLabel, setCustomLabel] = React.useState('');
  const [customMessage, setCustomMessage] = React.useState('');
  const [customUseLogo, setCustomUseLogo] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<'details' | 'badge' | 'citation'>('details');
  const [copied, setCopied] = React.useState<'md' | 'url' | 'image' | 'citation' | null>(null);

  const { fullFdo, isFdoLoading } = useFdoDetails(fdo.pid);
  const manualFields = useManualFields({ fullFdo });
  const badgePreview = useBadgeGeneration({ fdo, badgeStyle, customLabel, customMessage, customUseLogo });
  const { citationText } = useCitationGeneration({
    fullFdo,
    citationStyle,
    manualAuthor: manualFields.manualAuthor,
    manualTitle: manualFields.manualTitle,
    manualDoi: manualFields.manualDoi,
    manualUrl: manualFields.manualUrl,
    manualVersion: manualFields.manualVersion,
    fdoPid: fdo.pid
  });

  React.useEffect(() => {
    if (badgeStyle === 'custom') {
      setCustomLabel(fdo.pid.replace(/-/g, '--'));
      setCustomMessage(`FAIR Score: ${fdo.fairScore}`);
    } else {
      setCustomLabel('');
      setCustomMessage('');
    }
  }, [badgeStyle, fdo.pid, fdo.fairScore]);

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
          <button className="btn btn-ghost btn-xs btn-square" onClick={onClose}>
            <X className="w-4 h-4"/>
          </button>
        </div>

        <div className="tabs tabs-xl">
          <a
            className={`tab ${activeTab === 'details' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            <Info className="w-4 h-4 mr-1"/>
            Core Attributes
          </a>
          <a
            className={`tab ${activeTab === 'badge' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('badge')}
          >
            <ImageIcon className="w-4 h-4 mr-1"/>
            Badge
          </a>
          <a
            className={`tab ${activeTab === 'citation' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('citation')}
          >
            <BookOpen className="w-4 h-4 mr-1"/>
            Citation
          </a>
        </div>

        <div className="mt-4">
          {activeTab === 'details' && (
            <div className="space-y-2">
              <div>
                <span className="text-xs text-base-content/50">PID</span>
                <div className="text-sm">
                  <PidComponent value={fdo.pid} emphasizeComponent={false} hideSubcomponents={true} darkMode={darkMode ? 'dark' : 'light'}/>
                </div>
              </div>
              {fdo.orcid && (
                <div>
                  <span className="text-xs text-base-content/50">ORCiD</span>
                  <div className="text-sm">
                    <PidComponent value={fdo.orcid} emphasizeComponent={false}  hideSubcomponents={true} darkMode={darkMode ? 'dark' : 'light'}/>
                  </div>
                </div>
              )}
              <div>
                <span className="text-xs text-base-content/50">Research Domain</span>
                <div className="text-sm">
                  <PidComponent value={fdo.researchDomain} emphasizeComponent={false}  hideSubcomponents={true} darkMode={darkMode ? 'dark' : 'light'}/>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'badge' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium">Badge Style:</label>
                <select
                  className="select select-compact select-bordered select-xs w-full max-w-[200px]"
                  value={badgeStyle}
                  onChange={(e) => setBadgeStyle(e.target.value)}
                >
                  <option value="default">Default (FAIR Score)</option>
                  <option value="pid-only">PID only</option>
                  <option value="custom">Custom text</option>
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

          {activeTab === 'citation' && (
            <div className="space-y-3">
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

              {isFdoLoading && (
                <div className="flex items-center justify-center p-4">
                  <span className="loading loading-spinner loading-xs"></span>
                  <span className="ml-2 text-xs">Fetching FDO details...</span>
                </div>
              )}

              {!isFdoLoading && fullFdo && (
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
                      value={manualFields.manualAuthor}
                      onChange={(e) => manualFields.setManualAuthor(e.target.value)}
                      placeholder="Author (name)"
                    />
                    <input
                      type="text"
                      className="input input-compact input-bordered input-xs w-full"
                      value={manualFields.manualTitle}
                      onChange={(e) => manualFields.setManualTitle(e.target.value)}
                      placeholder="Title"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      className="input input-compact input-bordered input-xs w-full"
                      value={manualFields.manualDoi}
                      onChange={(e) => manualFields.setManualDoi(e.target.value)}
                      placeholder="DOI"
                    />
                    <input
                      type="text"
                      className="input input-compact input-bordered input-xs w-full"
                      value={manualFields.manualVersion}
                      onChange={(e) => manualFields.setManualVersion(e.target.value)}
                      placeholder="Version"
                    />
                  </div>
                  <input
                    type="text"
                    className="input input-compact input-bordered input-xs w-full"
                    value={manualFields.manualUrl}
                    onChange={(e) => manualFields.setManualUrl(e.target.value)}
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
  );
}
