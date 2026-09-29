import React from 'react';
import { useAppStore } from '../../state/store';
import { AlertCircle } from 'lucide-react';

export const ConfirmDialog: React.FC = () => {
  const { ui, closeConfirmModal } = useAppStore();
  const modal = ui.activeConfirmModal;

  if (!modal) return null;

  return (
    <div className="modal-backdrop" onClick={closeConfirmModal} role="dialog" aria-modal="true">
      <div className="modal-dialog" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
          <div style={{
            background: modal.isDanger ? 'rgba(248, 113, 113, 0.15)' : 'rgba(99, 102, 241, 0.15)',
            padding: '10px',
            borderRadius: '10px',
            color: modal.isDanger ? 'var(--status-danger)' : 'var(--accent-primary)',
          }}>
            <AlertCircle size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>{modal.title}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginTop: '6px', lineHeight: 1.5 }}>
              {modal.message}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
          <button className="btn btn-secondary" onClick={closeConfirmModal}>
            Cancel
          </button>
          <button
            className={`btn ${modal.isDanger ? 'btn-danger' : 'btn-primary'}`}
            onClick={() => {
              modal.onConfirm();
              closeConfirmModal();
            }}
          >
            {modal.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
