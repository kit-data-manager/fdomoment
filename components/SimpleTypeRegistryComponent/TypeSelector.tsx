import React, { useMemo } from "react";
import { TypeDefinition } from "@/components/SimpleTypeRegistryComponent/types";
import {Icon} from "@iconify/react";
import { TreeSelect } from "primereact/treeselect";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";

interface TypeSelectorProps {
  typeOptions: TypeDefinition[];
  selectedType: TypeDefinition | null;
  onSelect: (type: TypeDefinition) => void;
  onReset: () => void;
  onResetComplete?: () => void;
  loading?: boolean;
}

interface TreeSelectNode {
  key: string;
  label: string;
  data?: TypeDefinition;
  children?: TreeSelectNode[];
}

const TypeSelector = ({ typeOptions, selectedType, onSelect, onReset, onResetComplete, loading }: TypeSelectorProps) => {
  const treeData = useMemo(() => {
    const root: TreeSelectNode[] = [];
    const categoryMap = new Map<string, TreeSelectNode>();

    const sortedTypes = [...typeOptions].sort((a, b) =>
      (a.category || '').localeCompare(b.category || '')
    );

    sortedTypes.forEach((type) => {
      const categoryParts = (type.category || '').split('/').map(part => part.trim()).filter(Boolean);

      if (categoryParts.length === 0) {
        root.push({
          key: '',
          label: `${type.name} - ${type.description}`,
          data: type
        });
        return;
      }

      for (let i = 0; i < categoryParts.length; i++) {
        const isLastPart = i === categoryParts.length - 1;
        const currentPath = categoryParts.slice(0, i + 1).join('/');
        const parentPath = i > 0 ? categoryParts.slice(0, i).join('/') : '';

        let existingCategory = categoryMap.get(currentPath);

        if (!existingCategory) {
          existingCategory = {
            key: '',
            label: categoryParts[i],
            children: []
          };
          categoryMap.set(currentPath, existingCategory);

          if (i === 0) {
            root.push(existingCategory);
          } else {
            const parentCategory = categoryMap.get(parentPath);
            if (parentCategory) {
              parentCategory.children = parentCategory.children || [];
              parentCategory.children.push(existingCategory);
            }
          }
        }

        if (isLastPart) {
          existingCategory.children = existingCategory.children || [];
          existingCategory.children.push({
            key: '',
            label: `${type.name} - ${type.description}`,
            data: type
          });
        }
      }
    });

    const assignHierarchicalKeys = (nodes: TreeSelectNode[], prefix: string): void => {
      nodes.forEach((node, index) => {
        const newKey = prefix ? `${prefix}-${index}` : index.toString();
        node.key = newKey;

        if (node.children && node.children.length > 0) {
          assignHierarchicalKeys(node.children, newKey);
        }
      });
    };

    assignHierarchicalKeys(root, "");

    return root;
  }, [typeOptions]);

  const handleOnChange = (e: any) => {
    if (e.value) {
      const selectedNode = findNodeByKey(treeData, e.value);
      if (selectedNode && selectedNode.data) {
        onSelect(selectedNode.data);
      }
    }
  };

  const findNodeByKey = (nodes: TreeSelectNode[], key: string): TreeSelectNode | null => {
    for (const node of nodes) {
      if (node.key === key) return node;
      if (node.children) {
        const found = findNodeByKey(node.children, key);
        if (found) return found;
      }
    }
    return null;
  };

  return (
    <div className="w-full">
      {!selectedType ? (
        <fieldset className="fieldset w-full">
          {loading ? (
            <div className="flex items-center justify-center p-8 gap-3">
              <span className="loading loading-spinner loading-md"></span>
              <span className="text-sm">Loading type definitions...</span>
            </div>
          ) : (
            <TreeSelect
              value={null}
              options={treeData}
              onChange={handleOnChange}
              placeholder="Choose a type..."
              className="w-full bg-primary"
              filter
            />
          )}
        </fieldset>
      ) : (
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h4 className="font-semibold">{selectedType.name}</h4>
            <p className="text-sm text-base-content/60">{selectedType.description}</p>
            <p className="text-xs text-base-content/40 mt-1">{selectedType.pid}</p>
          </div>
          <button
            onClick={() => { onReset(); onResetComplete?.(); }}
            className="btn btn-soft btn-primary btn-sm"
            title="Change type"
          >
          <Icon icon="material-symbols-light:change-circle-outline-rounded" className="text-xl" />
          Change Type
          </button>
        </div>
      )}
    </div>
  );
};

export default TypeSelector;
