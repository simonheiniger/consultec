'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface Props {
  imageBase64: string;
}

export default function PdfPreview({ imageBase64 }: Props) {
  const [fullscreen, setFullscreen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!imageBase64) return null;

  return (
    <>
      <div style={{ marginTop: 4 }}>
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 10 }}>📄 PDF Vorschau</div>
        <div
          style={{
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            background: '#fff',
            maxHeight: 360,
            overflowY: 'auto',
            cursor: 'zoom-in',
          }}
          onClick={() => setFullscreen(true)}
          title="Klicken zum Vergrössern"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageBase64} alt="PDF Vorschau" style={{ width: '100%', display: 'block' }} />
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 6 }}>
          🔍 Klicken zum Vergrössern
        </div>
      </div>

      {/* Portal: rendert direkt in document.body – kein Transform-Problem */}
      {fullscreen && mounted && createPortal(
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.93)',
            backdropFilter: 'blur(12px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            cursor: 'zoom-out',
          }}
          onClick={() => setFullscreen(false)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageBase64}
            alt="PDF Vorschau"
            style={{
              maxWidth: '90vw',
              maxHeight: '92vh',
              objectFit: 'contain',
              borderRadius: 8,
              boxShadow: '0 24px 80px rgba(0,0,0,0.8)',
              cursor: 'default',
            }}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            style={{
              position: 'fixed',
              top: 20,
              right: 20,
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.25)',
              color: 'white',
              fontSize: 20,
              width: 44,
              height: 44,
              borderRadius: 10,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10000,
            }}
            onClick={() => setFullscreen(false)}
          >
            ✕
          </button>
        </div>,
        document.body
      )}
    </>
  );
}
