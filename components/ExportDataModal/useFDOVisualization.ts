import { useCallback, useRef } from 'react';
import * as Blockly from 'blockly';
import { ModuleConfig, ModuleData, BlockDefinition, ModuleMapping } from './types';
import { RecordData } from '@/utils/recordBuilder';

export const MODULE_CONFIGS: Record<string, ModuleConfig> = {
  profiles: { type: 'profiles', label: 'Profiles', colour: '#9AC0CD', keys: ['0.SIMPLE/PROFILE'] },
  core: { type: 'core_attributes', label: 'Core Attributes', colour: '#5C7AEA', keys: ['0.SIMPLE/OWNER', '0.SIMPLE/HELMHOLTZ_RESEARCH_FIELD'] },
  dataObject: { type: 'data_object', label: 'Data Object', colour: '#5C9D7A', keys: ['0.SIMPLE/DATA_OBJECT_LOCATION', '0.SIMPLE/DATA_OBJECT_LICENSE', '0.SIMPLE/MIME_TYPE'] },
  software: { type: 'software', label: 'Software', colour: '#7A5CBD', keys: ['0.SIMPLE/SOFTWARE_LOCATION', '0.SIMPLE/README_LOCATION', '0.SIMPLE/SOFTWARE_LICENSE'] },
  publication: { type: 'publication', label: 'Publication', colour: '#D97A4A', keys: ['doi', 'publicationType', 'title', 'publicationYear', 'creators'] },
};

const MODULE_BLOCK_DEFS: Record<string, BlockDefinition> = {
  profiles: { type: 'profiles', message0: 'Profiles', colour: '#9AC0CD', previousStatement: 'module', nextStatement: 'module', inputsInline: true },
  core_attributes: { type: 'core_attributes', message0: 'Core Attributes', colour: '#5C7AEA', previousStatement: 'module', nextStatement: 'module', inputsInline: true },
  data_object: { type: 'data_object', message0: 'Data Object', colour: '#5C9D7A', previousStatement: 'module', nextStatement: 'module', inputsInline: true },
  software: { type: 'software', message0: 'Software', colour: '#7A5CBD', previousStatement: 'module', nextStatement: 'module', inputsInline: true },
  publication: { type: 'publication', message0: 'Publication', colour: '#D97A4A', previousStatement: 'module', nextStatement: 'module', inputsInline: true },
  typed_attributes: { type: 'typed_attributes', message0: 'Typed Attributes', colour: '#5B9BD5', previousStatement: 'module', nextStatement: 'module', inputsInline: true },
  additional_attributes: { type: 'additional_attributes', message0: 'Additional Attributes', colour: '#ED7D31', previousStatement: 'module', nextStatement: 'module', inputsInline: true },
};

export const registerBlocklyBlocks = () => {
  if (Blockly.Blocks['fdo_object']) return;

  Blockly.Blocks['fdo_object'] = {
    init: function() {
      this.jsonInit({
        type: 'fdo_object',
        message0: 'FAIR Digital Object',
        colour: '#4A90D9',
        previousStatement: null,
        nextStatement: 'module',
        inputsInline: true,
      });
      this.appendStatementInput('module');
    },
  };

  Object.values(MODULE_BLOCK_DEFS).forEach((def) => {
    Blockly.Blocks[def.type] = {
      init: function() {
        this.jsonInit(def);
        if (def.type === 'profiles') {
          this.appendStatementInput('values');
        } else {
          this.appendStatementInput('attrs');
        }
      },
    };
  });

  Blockly.Blocks['attribute'] = {
    init: function() {
      this.jsonInit({
        type: 'attribute',
        message0: '%1: %2',
        args0: [
          { type: 'field_input', name: 'NAME', text: 'attribute' },
          { type: 'input_value', name: 'VALUE' },
        ],
        colour: '#9B7AEA',
        previousStatement: null,
        nextStatement: null,
        inputsInline: true,
      });
    },
  };

  Blockly.Blocks['text'] = {
    init: function() {
      this.jsonInit({
        type: 'text',
        message0: '%1',
        args0: [{ type: 'field_input', name: 'TEXT', text: '' }],
        colour: '#9B7AEA',
        output: null,
      });
    },
  };

  Blockly.Blocks['list_item'] = {
    init: function() {
      this.jsonInit({
        type: 'list_item',
        message0: '%1',
        args0: [{ type: 'field_input', name: 'TEXT', text: 'item' }],
        colour: '#7A5CBD',
        previousStatement: null,
        nextStatement: null,
      });
    },
  };

  Blockly.Blocks['list_container'] = {
    init: function() {
      this.jsonInit({
        type: 'list_container',
        message0: 'List',
        colour: '#7A5CBD',
        output: null,
      });
      this.appendStatementInput('items');
    },
  };

  Blockly.Blocks['profile_value'] = {
    init: function() {
      this.jsonInit({
        type: 'profile_value',
        message0: '%1',
        args0: [{ type: 'field_input', name: 'TEXT', text: '' }],
        colour: '#5C7AEA',
        previousStatement: 'profileValue',
        nextStatement: 'profileValue',
        inputsInline: true,
      });
    },
  };
};

export const parseRecordData = (data: RecordData): ModuleData[] => {
  const recordEntries = data.record || [];
  const attrs: Record<string, Record<string, string | string[]>> = {
    profiles: {},
    core: {},
    dataObject: {},
    software: {},
    publication: {},
    typed: {},
    additional: {},
  };


  for (const entry of recordEntries) {
    const { key, value } = entry;
    let targetMap = attrs.additional;

    if (MODULE_CONFIGS.profiles.keys?.includes(key)) {
      targetMap = attrs.profiles;
    }else if (MODULE_CONFIGS.publication.keys?.includes(key)) {
      targetMap = attrs.publication;
    } else if (MODULE_CONFIGS.core.keys?.includes(key)) {
      targetMap = attrs.core;
    } else if (MODULE_CONFIGS.dataObject.keys?.includes(key)) {
      targetMap = attrs.dataObject;
    } else if (MODULE_CONFIGS.software.keys?.includes(key)) {
      targetMap = attrs.software;
    } else if (key.startsWith('0.SIMPLE/')) {
      targetMap = attrs.typed;
    }

    const attrKey = key;//.replace('0.SIMPLE/', '');
    if (targetMap[attrKey]) {
      const existingVal = targetMap[attrKey];
      targetMap[attrKey] = Array.isArray(existingVal) ? [...existingVal, value] : [existingVal, value];
    } else {
        targetMap[attrKey] = value;
      }
    }

  const modules: ModuleData[] = [];
  const moduleMappings: Record<string, ModuleMapping> = {
    profiles: { attrs: attrs.profiles, type: 'profiles', label: 'profiles' },
    core: { attrs: attrs.core, type: 'core_attributes', label: 'Core Attributes' },
    dataObject: { attrs: attrs.dataObject, type: 'data_object', label: 'Data Object' },
    software: { attrs: attrs.software, type: 'software', label: 'Software' },
    publication: { attrs: attrs.publication, type: 'publication', label: 'Publication' },
    typed: { attrs: attrs.typed, type: 'typed_attributes', label: 'Typed Attributes' },
    additional: { attrs: attrs.additional, type: 'additional_attributes', label: 'Additional Attributes' },
  };

  for (const [modKey, modConfig] of Object.entries(moduleMappings)) {
    const entries = Object.entries(modConfig.attrs);
    if (entries.length > 0) {
      modules.push({
        type: modConfig.type,
        label: modConfig.label,
        attributes: entries.map(([key, value]) => ({ key, value })),
      });
    }
  }

  return modules;
};

export const createProfileValueBlock = (
  workspace: Blockly.Workspace,
  value: string
): Blockly.Block & { initSvg: () => void; render: () => void } => {
  const block = workspace.newBlock('profile_value') as Blockly.Block & { initSvg: () => void; render: () => void };
  block.initSvg();
  block.render();

  const textField = block.getField('TEXT');
  if (textField) {
    (textField as unknown as { setValue: (v: string) => void }).setValue(
      value.length > 40 ? value.substring(0, 40) + '...' : value
    );
  }

  return block;
};

export const createValueBlock = (
  workspace: Blockly.Workspace,
  value: string | string[],
  isProfiles = false
): Blockly.Block & { initSvg: () => void; render: () => void } | null => {
  const values = Array.isArray(value) ? value : [value];
  
  if (isProfiles) {
    let firstBlock: Blockly.Block & { initSvg: () => void; render: () => void } | null = null;
    let prevBlock: Blockly.Block | null = null;
    
    values.forEach((val, i) => {
      const valueBlock = createProfileValueBlock(workspace, val);
      
      if (i === 0) {
        firstBlock = valueBlock;
        prevBlock = valueBlock;
      } else if (prevBlock) {
        const prev = prevBlock;
        const next = valueBlock.previousConnection;
        if (prev.nextConnection && next) prev.nextConnection.connect(next);
        prevBlock = valueBlock;
      }
    });

    return firstBlock;
  }
  
  if (values.length > 1) {
    const containerBlock = workspace.newBlock('list_container') as Blockly.Block & { initSvg: () => void; render: () => void };
    containerBlock.initSvg();
    containerBlock.render();

    const listInputConn = containerBlock.getInput('items')?.connection;
    let prevItemBlock: Blockly.Block | null = null;

    values.forEach((item, j) => {
      const itemBlock = workspace.newBlock('list_item') as Blockly.Block & { initSvg: () => void; render: () => void };
      itemBlock.initSvg();
      itemBlock.render();

      const itemField = itemBlock.getField('TEXT');
      if (itemField) {
        const itemVal = String(item || '');
        (itemField as unknown as { setValue: (v: string) => void }).setValue(
          itemVal.length > 30 ? itemVal.substring(0, 30) + '...' : itemVal
        );
      }

      if (j === 0 && listInputConn) {
        const itemPrevConn = itemBlock.previousConnection;
        if (itemPrevConn) listInputConn.connect(itemPrevConn);
      } else if (prevItemBlock) {
        const prev = prevItemBlock;
        const itemPrevConn = itemBlock.previousConnection;
        if (prev.nextConnection && itemPrevConn) prev.nextConnection.connect(itemPrevConn);
      }

      prevItemBlock = itemBlock;
    });

    return containerBlock;
  } else {
    const textBlock = workspace.newBlock('text') as Blockly.Block & { initSvg: () => void; render: () => void };
    textBlock.initSvg();
    textBlock.render();

    const textField = textBlock.getField('TEXT');
    if (textField) {
      const strVal = String(values[0] || '');
      (textField as unknown as { setValue: (v: string) => void }).setValue(
        strVal.length > 40 ? strVal.substring(0, 40) + '...' : strVal
      );
    }

    return textBlock;
  }
};

export const useFDOVisualization = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<Blockly.Workspace | null>(null);

  const renderVisualization = useCallback((data: RecordData | null) => {
    if (!containerRef.current || !data) return;

    if (workspaceRef.current) {
      workspaceRef.current.dispose();
      workspaceRef.current = null;
    }

    registerBlocklyBlocks();

    workspaceRef.current = Blockly.inject(containerRef.current, {
      grid: { spacing: 20, length: 3, colour: '#ccc', snap: true },
      zoom: { controls: true, wheel: true, startScale: 1.0, maxScale: 2, minScale: 0.5, scaleSpeed: 1.1 },
      trashcan: false,
      readOnly: true,
      move: { scrollbars: true, drag: true, wheel: false },
    });

    const modules = parseRecordData(data);

    const fdoBlock = workspaceRef.current.newBlock('fdo_object') as Blockly.Block & { initSvg: () => void; render: () => void };
    fdoBlock.initSvg();
    fdoBlock.render();

    const fdoModuleConn = fdoBlock.getInput('module')?.connection;
    let prevModuleBlock: Blockly.Block | null = null;

    modules.forEach((module) => {
      const moduleBlock = workspaceRef.current!.newBlock(module.type) as Blockly.Block & { initSvg: () => void; render: () => void };
      moduleBlock.initSvg();
      moduleBlock.render();

      if (prevModuleBlock) {
        const nextConn = prevModuleBlock.nextConnection;
        const prevConn = moduleBlock.previousConnection;
        if (nextConn && prevConn) nextConn.connect(prevConn);
      } else if (fdoModuleConn) {
        const prevConn = moduleBlock.previousConnection;
        if (prevConn) fdoModuleConn.connect(prevConn);
      }

      const isProfiles = module.type === 'profiles';
      const moduleInputConn = isProfiles 
        ? moduleBlock.getInput('values')?.connection 
        : moduleBlock.getInput('attrs')?.connection;

      if (isProfiles) {
        let prevValueBlock: Blockly.Block | null = null;
        
        module.attributes.forEach((attr, i) => {
          const values = Array.isArray(attr.value) ? attr.value : [attr.value];
          
          values.forEach((val, j) => {
            const valueBlock = createProfileValueBlock(workspaceRef.current!, val);
            
            if (i === 0 && j === 0 && moduleInputConn && valueBlock.previousConnection) {
              moduleInputConn.connect(valueBlock.previousConnection);
            } else if (prevValueBlock && valueBlock.previousConnection) {
              if (prevValueBlock.nextConnection) {
                prevValueBlock.nextConnection.connect(valueBlock.previousConnection);
              }
            }
            
            prevValueBlock = valueBlock;
          });
        });
      } else {
        let prevAttrBlock: Blockly.Block | null = null;

        module.attributes.forEach((attr, i) => {
          const attrBlock = workspaceRef.current!.newBlock('attribute') as Blockly.Block & { initSvg: () => void; render: () => void };
          attrBlock.initSvg();
          attrBlock.render();

          const nameField = attrBlock.getField('NAME');
          if (nameField) (nameField as unknown as { setValue: (v: string) => void }).setValue(attr.key);

          const valueInput = attrBlock.getInput('VALUE');
          const valueBlock = createValueBlock(workspaceRef.current!, attr.value, false);
          
          if (valueBlock) {
            valueBlock.initSvg();
            valueBlock.render();

            if (valueInput && valueInput.connection && valueBlock.outputConnection) {
              valueInput.connection.connect(valueBlock.outputConnection);
            }
          }

          if (i === 0 && moduleInputConn) {
            const firstConn = attrBlock.previousConnection;
            if (firstConn) moduleInputConn.connect(firstConn);
          } else if (prevAttrBlock) {
            const prev = prevAttrBlock;
            const next = attrBlock.previousConnection;
            if (prev.nextConnection && next) prev.nextConnection.connect(next);
          }

          prevAttrBlock = attrBlock;
        });
      }

      prevModuleBlock = moduleBlock;
    });
  }, []);

  const cleanup = useCallback(() => {
    if (workspaceRef.current) {
      workspaceRef.current.dispose();
      workspaceRef.current = null;
    }
  }, []);

  return { containerRef, workspaceRef, renderVisualization, cleanup };
};
