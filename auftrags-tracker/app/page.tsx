'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { subscribeToAuftraege, createAuftrag, deleteAuftrag } from '@/lib/auftraege';
import { Auftrag, AufgabeItem } from '@/lib/types';
import PdfImport, { PdfImportResult } from '@/components/PdfImport';
import AuftragCard from '@/components/AuftragCard';

type FilterStatus = 'alle' | 'offen' | 'in_bearbeitung' | 'erledigt';

export default function Dashboard() {
  const [auftraege, setAuftraege] = useState<Auftrag[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>('alle');
  const [showNeuerAuftrag, setShowNeuerAuftrag] = useState(false);
  const [neuerTitel, setNeuerTitel] = useState('');
  const [neuerAufgaben, setNeuerAufgaben] = useState<string[]>(['']);
  const [pdfName, setPdfName] = useState('');
  const [pdfPreviewImage, setPdfPreviewImage] = useState('');
  const [pdfDeadline, setPdfDeadline] = useState('');
  const [creating, setCreating] = useState(false);
  const [showPdfImport, setShowPdfImport] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToAuftraege((data) => {
      setAuftraege(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const gefiltert = auftraege.filter((a) => {
    if (filter === 'alle') return true;
    return a.status === filter;
  });

  const stats = {
    alle: auftraege.length,
    offen: auftraege.filter((a) => a.status === 'offen').length,
    inBearbeitung: auftraege.filter((a) => a.status === 'in_bearbeitung').length,
    erledigt: auftraege.filter((a) => a.status === 'erledigt').length,
  };

  const handlePdfParsed = useCallback((result: PdfImportResult) => {
    setPdfName(result.filename);
    setPdfPreviewImage(result.previewImage || '');
    setPdfDeadline(result.deadline || '');
    setNeuerAufgaben(result.aufgaben.length > 0 ? result.aufgaben : ['']);
    setNeuerTitel(result.titel);
    setShowPdfImport(false);
    setShowNeuerAuftrag(true);
  }, []);

  const handleCreate = async () => {
    if (!neuerTitel.trim()) return;
    setCreating(true);
    const aufgaben: AufgabeItem[] = neuerAufgaben
      .filter((t) => t.trim())
      .map((text, i) => ({
        id: `a${Date.now()}_${i}`,
        text: text.trim(),
        erledigt: false,
      }));
    await createAuftrag({
      titel: neuerTitel.trim(),
      aufgaben,
      status: 'offen',
      erstelltAm: Date.now(),
      aktualisiertAm: Date.now(),
      pdfName: pdfName || undefined,
      pdfPreviewImage: pdfPreviewImage || undefined,
      deadline: pdfDeadline || undefined,
    });
    setCreating(false);
    setShowNeuerAuftrag(false);
    setNeuerTitel('');
    setNeuerAufgaben(['']);
    setPdfName('');
    setPdfPreviewImage('');
    setPdfDeadline('');
  };

  const addAufgabeZeile = () => setNeuerAufgaben((prev) => [...prev, '']);
  const removeAufgabeZeile = (i: number) =>
    setNeuerAufgaben((prev) => prev.filter((_, idx) => idx !== i));
  const updateAufgabe = (i: number, val: string) =>
    setNeuerAufgaben((prev) => prev.map((v, idx) => (idx === i ? val : v)));

  return (
    <>
      <nav className="nav">
        <a href="/" className="nav-logo">
          <div className="logo-icon">📋</div>
          Auftrags-Tracker
        </a>
        <div className="nav-badge">🔴 Live Sync</div>
      </nav>

      <main className="main-content">
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Meine Aufträge</h1>
            <p className="dashboard-subtitle">
              {auftraege.length} Aufträge gesamt · Echtzeit-Sync aktiv
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              className="btn btn-secondary"
              id="btn-pdf-import"
              onClick={() => setShowPdfImport(true)}
            >
              📄 PDF importieren
            </button>
            <button
              className="btn btn-primary"
              id="btn-neuer-auftrag"
              onClick={() => setShowNeuerAuftrag(true)}
            >
              + Neuer Auftrag
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-number">{stats.alle}</div>
            <div className="stat-label">Gesamt</div>
          </div>
          <div className="stat-card">
            <div className="stat-number" style={{ color: 'var(--warning)' }}>{stats.offen}</div>
            <div className="stat-label">Offen</div>
          </div>
          <div className="stat-card">
            <div className="stat-number" style={{ color: 'var(--accent-hover)' }}>{stats.inBearbeitung}</div>
            <div className="stat-label">In Arbeit</div>
          </div>
          <div className="stat-card">
            <div className="stat-number" style={{ color: 'var(--success)' }}>{stats.erledigt}</div>
            <div className="stat-label">Erledigt</div>
          </div>
        </div>

        {/* Filter */}
        <div className="filter-tabs">
          {(['alle', 'offen', 'in_bearbeitung', 'erledigt'] as FilterStatus[]).map((f) => (
            <button
              key={f}
              className={`filter-tab ${filter === f ? 'active' : ''}`}
              id={`filter-${f}`}
              onClick={() => setFilter(f)}
            >
              {f === 'alle' && 'Alle'}
              {f === 'offen' && '⏳ Offen'}
              {f === 'in_bearbeitung' && '🔧 In Arbeit'}
              {f === 'erledigt' && '✅ Erledigt'}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
            <div className="loading-spinner" />
          </div>
        ) : gefiltert.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <h3>Keine Aufträge gefunden</h3>
            <p>
              {filter === 'alle'
                ? 'Erstelle deinen ersten Auftrag oder importiere ein PDF.'
                : `Keine Aufträge mit Status „${filter}".`}
            </p>
            <button
              className="btn btn-primary"
              onClick={() => setShowNeuerAuftrag(true)}
            >
              + Neuer Auftrag
            </button>
          </div>
        ) : (
          <div className="auftraege-grid">
            {gefiltert.map((auftrag) => (
              <AuftragCard
                key={auftrag.id}
                auftrag={auftrag}
                onDelete={(id) => deleteAuftrag(id)}
              />
            ))}
          </div>
        )}
      </main>

      {/* PDF Import Modal */}
      {showPdfImport && (
        <div className="modal-overlay" onClick={() => setShowPdfImport(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">📄 PDF importieren</div>
            <PdfImport onParsed={handlePdfParsed} />
            <div style={{ marginTop: 16 }}>
              <button className="btn btn-secondary" onClick={() => setShowPdfImport(false)}>
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Neuer Auftrag Modal */}
      {showNeuerAuftrag && (
        <div
          className="modal-overlay"
          onClick={() => setShowNeuerAuftrag(false)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">
              📝 Neuer Auftrag
            </div>

            {pdfName && (
              <div className="alert alert-info" style={{ marginBottom: 16 }}>
                <span>📄</span>
                <span>Importiert aus: <strong>{pdfName}</strong></span>
              </div>
            )}

            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="label">Auftragsbezeichnung *</label>
              <input
                id="input-auftrag-titel"
                className="input"
                placeholder="z.B. Wartung Fahrzeug WK-12"
                value={neuerTitel}
                onChange={(e) => setNeuerTitel(e.target.value)}
                autoFocus
              />
            </div>

            <div className="form-group" style={{ marginBottom: 8 }}>
              <label className="label">Aufgaben / Checkliste</label>
              <div className="aufgaben-editor">
                {neuerAufgaben.map((aufgabe, i) => (
                  <div key={i} className="aufgabe-editor-row">
                    <input
                      className="input"
                      placeholder={`Aufgabe ${i + 1}`}
                      value={aufgabe}
                      onChange={(e) => updateAufgabe(i, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') addAufgabeZeile();
                      }}
                    />
                    {neuerAufgaben.length > 1 && (
                      <button
                        className="btn btn-icon btn-danger"
                        onClick={() => removeAufgabeZeile(i)}
                        title="Entfernen"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                className="btn btn-secondary btn-sm"
                style={{ marginTop: 8 }}
                onClick={addAufgabeZeile}
              >
                + Aufgabe hinzufügen
              </button>
            </div>

            <div className="divider" />

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowNeuerAuftrag(false);
                  setNeuerTitel('');
                  setNeuerAufgaben(['']);
                  setPdfName('');
                  setPdfPreviewImage('');
                  setPdfDeadline('');
                }}
              >
                Abbrechen
              </button>
              <button
                id="btn-create-auftrag"
                className="btn btn-primary"
                onClick={handleCreate}
                disabled={creating || !neuerTitel.trim()}
              >
                {creating ? '⏳ Erstelle...' : '✅ Auftrag erstellen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
