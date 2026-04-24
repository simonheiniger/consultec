// Typen für die App

export interface AufgabeItem {
  id: string;
  text: string;
  erledigt: boolean;
}

export interface Auftrag {
  id: string;
  titel: string;
  beschreibung?: string;
  aufgaben: AufgabeItem[];
  status: 'offen' | 'in_bearbeitung' | 'erledigt';
  erstelltAm: number;
  aktualisiertAm: number;
  pdfName?: string;
  pdfPreviewImage?: string; // base64 JPEG erste Seite
  deadline?: string;        // z.B. "Ende Juli 2026"
}
