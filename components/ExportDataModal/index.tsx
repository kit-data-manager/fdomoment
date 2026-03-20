'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { X, Code, Boxes } from 'lucide-react';
import JsonView from '@uiw/react-json-view';
import { githubLightTheme } from '@uiw/react-json-view/githubLight';
import { githubDarkTheme } from '@uiw/react-json-view/githubDark';
import {RecordData} from "@/utils/recordBuilder";
import * as Blockly from 'blockly';
import {FieldTextInput} from "blockly";

interface ExportDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  data: RecordData | null;
}

export function ExportDataModal({ isOpen, onClose, onSubmit, data }: ExportDataModalProps) {
  const [isDark, setIsDark] = useState(false);
  const [viewMode, setViewMode] = useState<'json' | 'blockly'>('json');
  const blocklyRef = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<Blockly.Workspace | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkTheme = () => {
        const html = document.documentElement;
        const isDarkTheme = html.classList.contains('dark') || 
          html.getAttribute('data-theme') === 'dark' ||
          html.getAttribute('data-theme') === 'black' ||
          html.getAttribute('data-theme') === 'night' ||
          html.getAttribute('data-theme') === 'luxury' ||
          html.getAttribute('data-theme') === 'dracula';
        setIsDark(isDarkTheme);
      };
      
      checkTheme();
      
      const observer = new MutationObserver(checkTheme);
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class', 'data-theme']
      });
      
      return () => observer.disconnect();
    }
  }, []);

  const initBlockly = useCallback(() => {
    if (!blocklyRef.current || !data) {
      return;
    }

    if (workspaceRef.current) {
      workspaceRef.current.dispose();
      workspaceRef.current = null;
    }

    Blockly.Blocks['fdo_object'] = {
      init: function() {
        this.jsonInit({
          type: 'fdo_object',
          message0: 'FAIR Digital Object',
          colour: '#4A90D9',
           previousStatement: null,
          nextStatement: 'module',
          inputsInline: true
        });
        this.appendStatementInput('module');
      }
    };

    Blockly.Blocks['core_attributes'] = {
      init: function() {
        this.jsonInit({
          type: 'core_attributes',
          message0: 'Core Attributes',
          colour: '#5C7AEA',
          previousStatement: 'module',
          nextStatement: 'module',
          inputsInline: true
        });
        this.appendStatementInput('attrs');
      }
    };

    Blockly.Blocks['data_object'] = {
      init: function() {
        this.jsonInit({
          type: 'data_object',
          message0: 'Data Object',
          colour: '#5C9D7A',
          previousStatement: 'module',
          nextStatement: 'module',
          inputsInline: true
        });
        this.appendStatementInput('attrs');
      }
    };

    Blockly.Blocks['publication'] = {
      init: function() {
        this.jsonInit({
          type: 'publication',
          message0: 'Publication',
          colour: '#D97A4A',
          previousStatement: 'module',
          nextStatement: 'module',
          inputsInline: true
        });
        this.appendStatementInput('attrs');
      }
    };

    Blockly.Blocks['software'] = {
      init: function() {
        this.jsonInit({
          type: 'software',
          message0: 'Software',
          colour: '#7A5CBD',
          previousStatement: 'module',
          nextStatement: 'module',
          inputsInline: true
        });
        this.appendStatementInput('attrs');
      }
    };

    Blockly.Blocks['typed_attributes'] = {
      init: function() {
        this.jsonInit({
          type: 'typed_attributes',
          message0: 'Typed Attributes',
          colour: '#5B9BD5',
          previousStatement: 'module',
          nextStatement: 'module',
          inputsInline: true
        });
        this.appendStatementInput('attrs');
      }
    };

    Blockly.Blocks['additional_attributes'] = {
      init: function() {
        this.jsonInit({
          type: 'additional_attributes',
          message0: 'Additional Attributes',
          colour: '#ED7D31',
          previousStatement: 'module',
          nextStatement: 'module',
          inputsInline: true
        });
        this.appendStatementInput('attrs');
      }
    };

    Blockly.Blocks['attribute'] = {
      init: function() {
        this.jsonInit({
          type: 'attribute',
          message0: '%1: %2',
          args0: [
            { type: 'field_input', name: 'NAME', text: 'attribute' },
            { type: 'input_value', name: 'VALUE' }
          ],
          colour: '#9B7AEA',
          previousStatement: null,
          nextStatement: null,
          inputsInline: true
        });
      }
    };

    Blockly.Blocks['text'] = {
      init: function() {
        this.jsonInit({
          type: 'text',
          message0: '%1',
          args0: [
            { type: 'field_input', name: 'TEXT', text: '' }
          ],
          colour: '#9B7AEA',
          output: null
        });
      }
    };

    Blockly.Blocks['list_item'] = {
      init: function() {
        this.jsonInit({
          type: 'list_item',
          message0: '%1',
          args0: [
            { type: 'field_input', name: 'TEXT', text: 'item' }
          ],
          colour: '#7A5CBD',
          previousStatement: null,
          nextStatement: null
        });
      }
    };

    Blockly.Blocks['list_container'] = {
      init: function() {
        this.jsonInit({
          type: 'list_container',
          message0: 'List',
          colour: '#7A5CBD',
          output: null
        });
        this.appendStatementInput('items');
      }
    };

    const toolbox = {
      kind: 'categoryToolbox',
      contents: [
        { kind: 'category', name: 'FDO Parts', contents: [
          { kind: 'block', type: 'fdo_object' },
          { kind: 'block', type: 'core_attributes' },
          { kind: 'block', type: 'data_object' },
          { kind: 'block', type: 'publication' }
        ]},
        { kind: 'category', name: 'Attributes', contents: [
          { kind: 'block', type: 'attribute' }
        ]}
      ]
    };

    workspaceRef.current = Blockly.inject(blocklyRef.current, {
      //toolbox: toolbox,
      grid: { spacing: 20, length: 3, colour: '#ccc', snap: true },
      zoom: { controls: true, wheel: true, startScale: 1.0, maxScale: 2, minScale: 0.5, scaleSpeed: 1.1 },
      trashcan: false,
      readOnly: true,
        move: {
            scrollbars: true,
            drag: true,
            wheel: false
        }
    });

    const recordEntries = data?.record || [];
    
    const coreAttrs: Record<string, any> = {};
    const dataObjAttrs: Record<string, any> = {};
    const softwareAttrs: Record<string, any> = {};
    const typedAttrs: Record<string, any> = {};
    const pubAttrs: Record<string, any> = {};
    const additionalAttrs: Record<string, any> = {};

    const coreKeys = ['0.SIMPLE/PROFILE', '0.SIMPLE/OWNER', '0.SIMPLE/HELMHOLTZ_RESEARCH_FIELD'];
    const dataObjectKeys = ['0.SIMPLE/DATA_OBJECT_LOCATION', '0.SIMPLE/DATA_OBJECT_LICENSE', '0.SIMPLE/MIME_TYPE'];
    const softwareKeys = ['0.SIMPLE/SOFTWARE_LOCATION', '0.SIMPLE/README_LOCATION', '0.SIMPLE/SOFTWARE_LICENSE'];
    const pubKeys = ['doi', 'publicationType', 'title', 'publicationYear', 'creators'];

    for (const entry of recordEntries) {
      const key = entry.key;
      const value = entry.value;

      let targetMap = additionalAttrs;
      if (pubKeys.includes(key)) {
          targetMap =  pubAttrs;
      } else if (coreKeys.includes(key)) {
          targetMap =  coreAttrs;
      } else  if (dataObjectKeys.includes(key)) {
          targetMap =  dataObjAttrs;
      } else  if (softwareKeys.includes(key)) {
          targetMap =  softwareAttrs;
      }else if (key.startsWith("0.SIMPLE/")) {
          targetMap = typedAttrs;
      }

      const attrKey = key.replace('0.SIMPLE/', '');
      if(targetMap[attrKey]) {
          const existingVal = targetMap[attrKey];
          if (Array.isArray(existingVal)) {
              targetMap[attrKey] = [...existingVal, value];
          } else {
              targetMap[attrKey] = [existingVal, value];
          }
      }else{
          targetMap[attrKey] = value;
      }
    }

    const blocksToAdd: { type: string; label: string; attrs: Record<string, string> }[] = [];
    
    if (Object.keys(coreAttrs).length > 0) {
      blocksToAdd.push({ type: 'core_attributes', label: 'Core Attributes', attrs: coreAttrs });
    }
    if (Object.keys(dataObjAttrs).length > 0) {
      blocksToAdd.push({ type: 'data_object', label: 'Data Object', attrs: dataObjAttrs });
    }
    if (Object.keys(softwareAttrs).length > 0) {
      blocksToAdd.push({ type: 'software', label: 'Software', attrs: softwareAttrs });
    }
    if (Object.keys(pubAttrs).length > 0) {
      blocksToAdd.push({ type: 'publication', label: 'Publication', attrs: pubAttrs });
    }
    if (Object.keys(typedAttrs).length > 0) {
      blocksToAdd.push({ type: 'typed_attributes', label: 'Typed Attributes', attrs: typedAttrs });
    }
    if (Object.keys(additionalAttrs).length > 0) {
      blocksToAdd.push({ type: 'additional_attributes', label: 'Additional Attributes', attrs: additionalAttrs });
    }

    const startX = -200;
    let currentY = -200;
    const blockHeight = 80;

    const fdoBlock = workspaceRef.current.newBlock('fdo_object') as Blockly.Block & { initSvg: () => void; render: () => void };
    fdoBlock.initSvg();
    fdoBlock.render();
    fdoBlock.moveBy(startX, currentY);
    currentY += blockHeight;

    const fdoModuleConn = fdoBlock.getInput('module')?.connection;

    let prevModuleBlock = null;

    for (const module of blocksToAdd) {
      const displayBlock = workspaceRef.current.newBlock(module.type) as Blockly.Block & { initSvg: () => void; render: () => void };
      displayBlock.initSvg();
      displayBlock.render();
      displayBlock.moveBy(startX, currentY);
      
      if (prevModuleBlock) {
        const prevBlock = prevModuleBlock as Blockly.Block;
        const nextConn = prevBlock.nextConnection;
        const dispPrevConn = displayBlock.previousConnection;
        if (nextConn && dispPrevConn) {
          nextConn.connect(dispPrevConn);
        }
      } else if (fdoModuleConn) {
        const firstPrevConn = displayBlock.previousConnection;
        if (firstPrevConn) {
          fdoModuleConn.connect(firstPrevConn);
        }
      }

      const moduleInputConn = displayBlock.getInput('attrs')?.connection;
      
      const attrKeys = Object.keys(module.attrs);
      let prevAttrBlock = null;
      
      for (let i = 0; i < attrKeys.length; i++) {
        const attrBlock = workspaceRef.current.newBlock('attribute') as Blockly.Block & {
            initSvg: () => void;
            render: () => void;
        };
        attrBlock.initSvg();
        attrBlock.render();

        const fieldName = attrBlock.getField('NAME');
        if (fieldName) {
            (fieldName as unknown as { setValue: (v: string) => void }).setValue(attrKeys[i]);
        }

        const val = module.attrs[attrKeys[i]];
        const valueInput = attrBlock.getInput('VALUE');
        
        if (Array.isArray(val)) {
          const containerBlock = workspaceRef.current.newBlock('list_container') as Blockly.Block & { initSvg: () => void; render: () => void };
          containerBlock.initSvg();
          containerBlock.render();
          
          const listInputConn = containerBlock.getInput('items')?.connection;
          
          let prevItemBlock = null;
          for (let j = 0; j < val.length; j++) {
            const itemBlock = workspaceRef.current.newBlock('list_item') as Blockly.Block & { initSvg: () => void; render: () => void };
            itemBlock.initSvg();
            itemBlock.render();
            
            const itemField = itemBlock.getField('TEXT');
            if (itemField) {
              const itemVal = String(val[j] || '');
              (itemField as unknown as { setValue: (v: string) => void }).setValue(itemVal.length > 30 ? itemVal.substring(0, 30) + '...' : itemVal);
            }
            
            if (j === 0 && listInputConn) {
              const itemPrevConn = itemBlock.previousConnection;
              if (itemPrevConn) {
                listInputConn.connect(itemPrevConn);
              }
            } else if (prevItemBlock) {
              const prev = prevItemBlock as Blockly.Block;
              const itemPrevConn = itemBlock.previousConnection;
              if (prev.nextConnection && itemPrevConn) {
                prev.nextConnection.connect(itemPrevConn);
              }
            }
            
            prevItemBlock = itemBlock;
          }
          
          if (valueInput && valueInput.connection && containerBlock.outputConnection) {
            valueInput.connection.connect(containerBlock.outputConnection);
          }
        } else {
          const textBlock = workspaceRef.current.newBlock('text') as Blockly.Block & { initSvg: () => void; render: () => void };
          textBlock.initSvg();
          textBlock.render();
          
          const textField = textBlock.getField('TEXT');
          if (textField) {
            const strVal = String(val || '');
            (textField as unknown as { setValue: (v: string) => void }).setValue(strVal.length > 40 ? strVal.substring(0, 40) + '...' : strVal);
          }
          
          if (valueInput && valueInput.connection && textBlock.outputConnection) {
            valueInput.connection.connect(textBlock.outputConnection);
          }
        }

        if (i === 0 && moduleInputConn) {
          const firstConn = attrBlock.previousConnection;
          if (firstConn) {
            moduleInputConn.connect(firstConn);
          }
        } else if (prevAttrBlock) {
          const prev = prevAttrBlock as Blockly.Block;
          const next = attrBlock.previousConnection;
          if (prev.nextConnection && next) {
            prev.nextConnection.connect(next);
          }
        }
        
        currentY += 30;
        prevAttrBlock = attrBlock;
      }
      
      currentY += blockHeight;
      prevModuleBlock = displayBlock;
    }

  }, [data]);

  useEffect(() => {
    if (viewMode === 'blockly' && isOpen) {
      setTimeout(initBlockly, 100);
    }
  }, [viewMode, isOpen, initBlockly]);

  useEffect(() => {
    return () => {
      if (workspaceRef.current) {
        workspaceRef.current.dispose();
        workspaceRef.current = null;
      }
    };
  }, []);

  const theme = isDark ? githubDarkTheme : githubLightTheme;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-base-100 rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-base-content/10">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold">Export FDO Data</h2>
            <div className="tabs tabs-sm">
              <button 
                className={`tab ${viewMode === 'json' ? 'tab-active' : ''}`}
                onClick={() => setViewMode('json')}
              >
                <Code className="w-4 h-4 mr-1" />
                JSON
              </button>
              <button 
                className={`tab ${viewMode === 'blockly' ? 'tab-active' : ''}`}
                onClick={() => setViewMode('blockly')}
              >
                <Boxes className="w-4 h-4 mr-1" />
                Blockly
              </button>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-auto p-4">
          {data ? (
            viewMode === 'json' ? (
              <JsonView
                value={data}
                style={{
                  ...theme,
                  backgroundColor: isDark ? 'rgb(13 14 16)' : 'rgb(250 250 250)',
                }}
                displayObjectSize={false}
                displayDataTypes={false}
              />
            ) : (
              <div ref={blocklyRef} className="w-full h-[600px] border border-base-300 rounded-lg" />
            )
          ) : (
            <div className="text-center text-base-content/60 py-8">
              No data to export
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-3 p-4 border-t border-base-content/10">
          <button
            onClick={onClose}
            className="btn btn-ghost"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            className="btn btn-soft btn-primary"
          >
            Export
          </button>
        </div>
      </div>
    </div>
  );
}

export default ExportDataModal;
