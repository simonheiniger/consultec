'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { subscribeToAuftraege, updateAuftrag, deleteAuftrag } from '@/lib/auftraege';
import { Auftrag, AufgabeItem } from '@/lib/types';
import PdfPreview from '@/components/PdfPreview';

export default function AuftragDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [auftrag, setAuftrag] = useState<Auftrag | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingTitel, setEditingTitel] = useState(false);
  const [titelInput, setTitelInput] = useState('');
  const [neueAufgabe, setNeueAufgabe] = useState('');

  useEffect(() => {
    const unsubscribe = subscribeToAuftraege((list) => {
      const found = list.find((a) => a.id === id);
      if (found) {
        setAuftrag(found);
        setTitelInput(found.titel);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [id]);

  const toggleAufgabe = async (aufgabeId: string) => {
    if (!auftrag) return;
    const updated = auftrag.aufgaben.map((a) =>
      a.id === aufgabeId ? { ...a, erledigt: !a.erledigt } : a
    );
    const alleErledigt = updated.every((a) => a.erledigt);
    const keineErledigt = updated.every((a) => !a.erledigt);
    const neuerStatus = alleErledigt
      ? 'erledigt'
      : keineErledigt
      ? 'offen'
      : 'in_bearbeitung';

    await updateAuftrag(id, {
      aufgaben: updated,
      status: neuerStatus as Auftrag['status'],
    });
  };

  const handleStatusChange = async (status: Auftrag['status']) => {
    await updateAuftrag(id, { status });
  };

  const handleTitelSave = async () => {
    if (titelInput.trim()) {
      await updateAuftrag(id, { titel: titelInput.trim() });
    }
    setEditingTitel(false);
  };

  const handleNeueAufgabeAdd = async () => {
    if (!neueAufgabe.trim() || !auftrag) return;
    const neue: AufgabeItem = {
      id: `a${Date.now()}`,
      text: neueAufgabe.trim(),
      erledigt: false,
    };
    await updateAuftrag(id, {
      aufgaben: [...auftrag.aufgaben, neue],
    });
    setNeueAufgabe('');
  };

  const handleAufgabeDelete = async (aufgabeId: string) => {
    if (!auftrag) return;
    await updateAuftrag(id, {
      aufgaben: auftrag.aufgaben.filter((a) => a.id !== aufgabeId),
    });
  };

  const handleAuftragDelete = async () => {
    if (!auftrag) return;
    if (confirm(`Auftrag „${auftrag.titel}" wirklich löschen?`)) {
      await deleteAuftrag(id);
      router.push('/');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div className="loading-spinner" />
      </div>
    );
  }

  if (!auftrag) {
    return (
      <div className="empty-state" style={{ paddingTop: 120 }}>
        <div className="empty-state-icon">❌</div>
        <h3>Auftrag nicht gefunden</h3>
        <p>Dieser Auftrag existiert nicht oder wurde gelöscht.</p>
        <Link href="/" className="btn btn-primary">← Zurück zum Dashboard</Link>
      </div>
    );
  }

  const total = auftrag.aufgaben.length;
  const erledigtCount = auftrag.aufgaben.filter((a) => a.erledigt).length;
  const prozent = total > 0 ? Math.round((erledigtCount / total) * 100) : 0;
  const datum = new Date(auftrag.erstelltAm).toLocaleDateString('de-CH', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
  });

  return (
    <>
      <nav className="nav">
        <Link href="/" className="nav-logo">
          <div className="logo-icon">📋</div>
          Auftrags-Tracker
        </Link>
        <div className="nav-badge">🔴 Live Sync</div>
      </nav>

      <main className="main-content">
        {/* Header */}
        <div className="detail-header">
          <Link href="/" className="detail-back">
            ← Zurück
          </Link>
          <div style={{ flex: 1 }}>
            {editingTitel ? (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  className="input"
                  value={titelInput}
                  onChange={(e) => setTitelInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleTitelSave(); }}
                  autoFocus
                  style={{ fontSize: 18, fontWeight: 600 }}
                />
                <button className="btn btn-primary btn-sm" onClick={handleTitelSave}>✓</button>
                <button className="btn btn-secondary btn-sm" onClick={() => setEditingTitel(false)}>✕</button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <h1
                  className="detail-titel"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setEditingTitel(true)}
                  title="Klicken zum Bearbeiten"
                >
                  {auftrag.titel}
                </h1>
                <button
                  className="btn btn-icon btn-secondary"
                  onClick={() => setEditingTitel(true)}
                  title="Titel bearbeiten"
                  style={{ marginTop: 4 }}
                >
                  ✏️
                </button>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gap: 20, gridTemplateColumns: 'minmax(0,1fr) 280px' }}>
          {/* Hauptinhalt: Aufgaben */}
          <div>
            {/* Fortschritt */}
            <div className="card" style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontWeight: 600 }}>Fortschritt</span>
                <span style={{
                  fontSize: 22, fontWeight: 800,
                  color: prozent === 100 ? 'var(--success)' : 'var(--text-primary)'
                }}>
                  {prozent}%
                </span>
              </div>
              <div className="progress-bar" style={{ height: 10 }}>
                <div
                  className={`progress-fill ${prozent === 100 ? 'complete' : ''}`}
                  style={{ width: `${prozent}%` }}
                />
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>
                {erledigtCount} von {total} Aufgaben erledigt
              </div>
            </div>

            {/* Aufgaben-Checkliste */}
            <div className="card">
              <div style={{ fontWeight: 600, marginBottom: 16, fontSize: 15 }}>
                📋 Aufgaben ({total})
              </div>

              {auftrag.aufgaben.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                  Noch keine Aufgaben. Füge welche hinzu.
                </p>
              ) : (
                <div>
                  {auftrag.aufgaben.map((aufgabe) => (
                    <div key={aufgabe.id} className="aufgabe-item">
                      <button
                        className={`aufgabe-checkbox ${aufgabe.erledigt ? 'checked' : ''}`}
                        id={`check-${aufgabe.id}`}
                        onClick={() => toggleAufgabe(aufgabe.id)}
                        title={aufgabe.erledigt ? 'Als offen markieren' : 'Als erledigt markieren'}
                      />
                      <span className={`aufgabe-text ${aufgabe.erledigt ? 'erledigt' : ''}`}>
                        {aufgabe.text}
                      </span>
                      <button
                        className="btn btn-icon btn-danger"
                        style={{ width: 28, height: 28, fontSize: 12, opacity: 0.5 }}
                        onClick={() => handleAufgabeDelete(aufgabe.id)}
                        title="Aufgabe löschen"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Neue Aufgabe hinzufügen */}
              <div className="divider" />
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  className="input"
                  placeholder="Neue Aufgabe hinzufügen..."
                  value={neueAufgabe}
                  onChange={(e) => setNeueAufgabe(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleNeueAufgabeAdd(); }}
                  id="input-neue-aufgabe"
                />
                <button
                  className="btn btn-primary"
                  onClick={handleNeueAufgabeAdd}
                  disabled={!neueAufgabe.trim()}
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Status */}
            <div className="card">
              <div style={{ fontWeight: 600, marginBottom: 12, fontSize: 14 }}>Status</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(['offen', 'in_bearbeitung', 'erledigt'] as Auftrag['status'][]).map((s) => (
                  <button
                    key={s}
                    id={`status-${s}`}
                    className={`btn ${auftrag.status === s ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ justifyContent: 'flex-start', fontSize: 13 }}
                    onClick={() => handleStatusChange(s)}
                  >
                    {s === 'offen' && '⏳ Offen'}
                    {s === 'in_bearbeitung' && '🔧 In Bearbeitung'}
                    {s === 'erledigt' && '✅ Erledigt'}
                  </button>
                ))}
              </div>
            </div>

            {/* Info */}
            <div className="card">
              <div style={{ fontWeight: 600, marginBottom: 12, fontSize: 14 }}>Details</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 2 }}>
                {auftrag.pdfName && (
                  <div>📄 {auftrag.pdfName}</div>
                )}
                <div>📅 Erstellt: {datum}</div>
                {auftrag.deadline && (
                  <div style={{ color: 'var(--warning)' }}>⏰ Erledigung: {auftrag.deadline}</div>
                )}
                <div>🔢 {total} Aufgaben</div>
                <div>✅ {erledigtCount} erledigt</div>
              </div>
            </div>

            {/* Aktionen */}
            <div className="card">
              <div style={{ fontWeight: 600, marginBottom: 12, fontSize: 14 }}>Aktionen</div>
              <button
                className="btn btn-danger"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={handleAuftragDelete}
              >
                🗑 Auftrag löschen
              </button>
            </div>
            {/* PDF Vorschau */}
            {auftrag.pdfPreviewImage && (
              <div className="card">
                <PdfPreview imageBase64={auftrag.pdfPreviewImage} />
              </div>
            )}
          </div>
        </div>
      </main>

      <style>{`
        @media (max-width: 768px) {
          main > div:last-child {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}
