'use client';

import Link from 'next/link';
import { Auftrag } from '@/lib/types';

interface Props {
  auftrag: Auftrag;
  onDelete: (id: string) => void;
}

export default function AuftragCard({ auftrag, onDelete }: Props) {
  const total = auftrag.aufgaben.length;
  const erledigt = auftrag.aufgaben.filter((a) => a.erledigt).length;
  const prozent = total > 0 ? Math.round((erledigt / total) * 100) : 0;

  const datum = new Date(auftrag.erstelltAm).toLocaleDateString('de-CH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const statusClass =
    auftrag.status === 'erledigt'
      ? 'erledigt'
      : auftrag.status === 'in_bearbeitung'
      ? 'in-bearbeitung'
      : '';

  return (
    <div style={{ position: 'relative' }}>
      <Link href={`/auftrag/${auftrag.id}`} className={`auftrag-card ${statusClass}`}>
        <div className="auftrag-card-header">
          <div className="auftrag-card-titel">{auftrag.titel}</div>
          <span
            className={`badge badge-${
              auftrag.status === 'in_bearbeitung' ? 'in-bearbeitung' : auftrag.status
            }`}
          >
            {auftrag.status === 'offen' && '⏳ Offen'}
            {auftrag.status === 'in_bearbeitung' && '🔧 In Arbeit'}
            {auftrag.status === 'erledigt' && '✅ Erledigt'}
          </span>
        </div>

        {auftrag.pdfName && (
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
            📄 {auftrag.pdfName}
          </div>
        )}

        {total > 0 && (
          <div className="auftrag-card-progress">
            <div className="progress-label">
              <span>{erledigt} / {total} Aufgaben</span>
              <span style={{ color: prozent === 100 ? 'var(--success)' : 'inherit' }}>
                {prozent}%
              </span>
            </div>
            <div className="progress-bar">
              <div
                className={`progress-fill ${prozent === 100 ? 'complete' : ''}`}
                style={{ width: `${prozent}%` }}
              />
            </div>
          </div>
        )}

        <div className="auftrag-card-meta">
          <span>📅 {datum}</span>
          {total > 0 && (
            <span>{total} Aufgaben</span>
          )}
        </div>
      </Link>

      {/* Delete Button */}
      <button
        className="btn btn-icon btn-danger"
        style={{ position: 'absolute', top: 12, right: 12, opacity: 0.6, zIndex: 10 }}
        title="Auftrag löschen"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (confirm(`Auftrag „${auftrag.titel}" wirklich löschen?`)) {
            onDelete(auftrag.id);
          }
        }}
      >
        🗑
      </button>
    </div>
  );
}
