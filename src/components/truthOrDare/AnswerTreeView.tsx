import React from 'react';
import { GitFork, User, CalendarBlank } from '@phosphor-icons/react';
import { AnswerNode } from '../../types/truthOrDare';

interface AnswerTreeViewProps {
  tree: AnswerNode[];
  selectedParentId: string | null;
  onSelectParent: (id: string | null) => void;
}

const TreeNodeItem: React.FC<{
  node: AnswerNode;
  selectedParentId: string | null;
  onSelectParent: (id: string | null) => void;
  depth?: number;
}> = ({ node, selectedParentId, onSelectParent, depth = 0 }) => {
  const isSelected = selectedParentId === node.id;

  return (
    <div style={{ marginLeft: depth > 0 ? '16px' : '0px', marginTop: '10px' }}>
      <div
        style={{
          padding: '10px 12px',
          backgroundColor: isSelected ? 'rgba(84, 120, 232, 0.08)' : '#FFFFFF',
          border: isSelected ? '2px solid var(--color-cobalt)' : '1px solid var(--border-light)',
          borderRadius: 'var(--radius-sm)',
          position: 'relative',
          transition: 'all 0.15s ease'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                color: 'var(--color-cobalt)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px'
              }}
            >
              <User size={12} weight="bold" />
              {node.playerName}
            </span>
            <span className="badge badge-lime" style={{ fontSize: '0.68rem', padding: '1px 5px' }}>
              Branch L{node.branchLevel}
            </span>
          </div>

          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
            <CalendarBlank size={12} />
            {new Date(node.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        <p style={{ fontSize: '0.86rem', color: 'var(--color-graphite)', margin: '4px 0 8px', lineHeight: 1.4 }}>
          {node.answerText}
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={() => onSelectParent(isSelected ? null : node.id)}
            style={{
              background: 'none',
              border: 'none',
              color: isSelected ? 'var(--color-cobalt)' : 'var(--text-muted)',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 6px',
              borderRadius: '4px'
            }}
          >
            <GitFork size={13} weight="bold" />
            <span>{isSelected ? '✓ Selected as Parent' : 'Branch off this answer'}</span>
          </button>
        </div>
      </div>

      {/* Recursive Children Branches */}
      {node.children && node.children.length > 0 && (
        <div style={{ borderLeft: '2px dashed var(--color-cobalt)', paddingLeft: '8px', marginTop: '4px' }}>
          {node.children.map(child => (
            <TreeNodeItem
              key={child.id}
              node={child}
              selectedParentId={selectedParentId}
              onSelectParent={onSelectParent}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const AnswerTreeView: React.FC<AnswerTreeViewProps> = ({
  tree,
  selectedParentId,
  onSelectParent
}) => {
  if (!tree || tree.length === 0) {
    return (
      <div
        style={{
          padding: '12px',
          textAlign: 'center',
          backgroundColor: 'var(--color-ivory)',
          borderRadius: 'var(--radius-sm)',
          border: '1px dashed var(--border-light)',
          fontSize: '0.8rem',
          color: 'var(--text-muted)'
        }}
      >
        Abhi tak is card ka koi branch answer nahi hai. Aap pehla answer branch create karenge!
      </div>
    );
  }

  return (
    <div style={{ maxHeight: '240px', overflowY: 'auto', paddingRight: '4px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
          Active Branches ({tree.length})
        </span>
        {selectedParentId && (
          <button
            type="button"
            onClick={() => onSelectParent(null)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-coral)',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Reset to Root Branch
          </button>
        )}
      </div>

      {tree.map(rootNode => (
        <TreeNodeItem
          key={rootNode.id}
          node={rootNode}
          selectedParentId={selectedParentId}
          onSelectParent={onSelectParent}
        />
      ))}
    </div>
  );
};
