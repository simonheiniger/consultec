'use client';

import { useState, useRef } from 'react';
import { reconstructTextFromItems, parsePdfText, PdfParseResult } from '@/lib/pdf-parser';

export interface PdfImportResult extends PdfParseResult {
  filename: string;
  previewImage: string;
}

interface Props {
  onParsed: (result: PdfImportResult) => void;
}

export default function PdfImport({ onParsed }: Props) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    if (!file || file.type !== 'application/pdf') {
      setError('Bitte eine gültige PDF-Datei auswählen.');
      return;
    }
    setLoading(true);
    setError('');
    setProgress('PDF wird geladen…');

    try {
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      // ── 1. Text + Formularfelder positionsbasiert extrahieren ─────────────
      setProgress('Text wird extrahiert…');
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);

        // Normaler Text (Labels wie "Beschreibung:", "Datum:" etc.)
        const content = await page.getTextContent();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const regularItems: Array<{ str: string; transform: number[] }> = (content.items as any[])
          .filter((item) => 'str' in item && item.str?.trim())
          .map((item) => ({ str: item.str, transform: item.transform }));

        // Formularfeld-Werte (die grauen Boxen im PDF)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const annotations: any[] = await page.getAnnotations();
        const formItems: Array<{ str: string; transform: number[] }> = [];

        for (const ann of annotations) {
          if (ann.fieldType === 'Tx' && ann.fieldValue) {
            const val = String(ann.fieldValue).trim();
            if (!val) continue;

            // Rect = [x1, y1, x2, y2] in PDF-Koordinaten
            const [x1, y1, , y2] = ann.rect as number[];
            const lines = val.split('\n');
            const lineHeight = Math.max((y2 - y1) / Math.max(lines.length, 1), 10);

            lines.forEach((line, idx) => {
              if (line.trim()) {
                formItems.push({
                  str: line.trim(),
                  // Y wird von oben nach unten (höherer Y = höher auf Seite in PDF)
                  transform: [1, 0, 0, 1, x1, y2 - idx * lineHeight],
                });
              }
            });
          }
        }

        // Alle Items kombinieren und positionsbasiert rekonstruieren
        const allItems = [...regularItems, ...formItems];
        const pageText = reconstructTextFromItems(allItems);
        fullText += pageText + '\n\n';
      }

      // ── 2. Felder parsen ──────────────────────────────────────────────────
      setProgress('Aufgaben werden erkannt…');
      const parsed = parsePdfText(fullText);

      // ── 3. Erste Seite als Vorschau-Bild rendern ──────────────────────────
      setProgress('Vorschau wird erstellt…');
      let previewImage = '';
      try {
        const firstPage = await pdf.getPage(1);
        const viewport = firstPage.getViewport({ scale: 1.2 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d')!;
        await firstPage.render({ canvasContext: ctx, viewport, canvas }).promise;
        previewImage = canvas.toDataURL('image/jpeg', 0.75);
      } catch {
        // Vorschau optional – kein Fehler wenn nicht möglich
      }

      onParsed({ ...parsed, filename: file.name, previewImage });
    } catch (err) {
      console.error(err);
      setError('Fehler beim Lesen der PDF. Bitte erneut versuchen.');
    } finally {
      setLoading(false);
      setProgress('');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  return (
    <div>
      <div
        className={`pdf-dropzone ${dragOver ? 'drag-over' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        {loading ? (
          <>
            <div className="loading-spinner" style={{ margin: '0 auto 12px' }} />
            <div className="pdf-dropzone-text">{progress}</div>
          </>
        ) : (
          <>
            <span className="pdf-dropzone-icon">📄</span>
            <div className="pdf-dropzone-text">PDF hier ablegen oder klicken</div>
            <div className="pdf-dropzone-sub">
              Text wird automatisch extrahiert · Aufgaben werden erkannt
            </div>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </div>

      {error && (
        <div className="alert alert-warning" style={{ marginTop: 12 }}>
          ⚠️ {error}
        </div>
      )}

      <div className="alert alert-info" style={{ marginTop: 12 }}>
        <span>ℹ️</span>
        <span>
          Felder wie <strong>Beschreibung</strong>, <strong>Prozeduren</strong> und{' '}
          <strong>Erledigung bis</strong> werden automatisch erkannt. Titel wird aus der
          Beschreibung generiert. Danach alles editierbar.
        </span>
      </div>
    </div>
  );
}
