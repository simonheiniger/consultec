// Smarter PDF-Parser für strukturierte Auftrags-Dokumente

export interface PdfParseResult {
  titel: string;
  aufgaben: string[];
  deadline?: string;
  datum?: string;
  rawText: string;
}

// Bekannte Feld-Labels in Auftrags-PDFs
const KNOWN_LABELS = [
  'Beschreibung:',
  'Datum:',
  'Prozeduren:',
  'Gewünscht Erledigung bis:',
  'Erledigung bis:',
  'Aufwand Std.:',
  'Aufwand:',
  'Bemerkungen:',
  'Bemerkung:',
  'Auftrag:',
  'Titel:',
];

/**
 * Extrahiert Text positionsbasiert aus PDF.js TextContent Items.
 * Gruppiert Items nach Y-Position (8pt Toleranz), sortiert nach X.
 */
export function reconstructTextFromItems(
  items: Array<{ str: string; transform: number[] }>
): string {
  const yMap = new Map<number, Array<{ x: number; str: string }>>();

  for (const item of items) {
    if (!item.str?.trim()) continue;
    // 8pt Gruppierung – toleriert kleine Y-Unterschiede zwischen Label und Formularfeld
    const y = Math.round(item.transform[5] / 8) * 8;
    const x = item.transform[4];
    if (!yMap.has(y)) yMap.set(y, []);
    yMap.get(y)!.push({ x, str: item.str });
  }

  // Sortiere Y absteigend (PDF-Koordinaten: oben = hoher Y-Wert)
  const sortedYs = Array.from(yMap.keys()).sort((a, b) => b - a);

  return sortedYs
    .map((y) =>
      yMap.get(y)!
        .sort((a, b) => a.x - b.x)
        .map((i) => i.str)
        .join(' ')
        .trim()
    )
    .filter((l) => l.length > 0)
    .join('\n');
}

/**
 * Extrahiert den Inhalt nach einem Label bis zum nächsten bekannten Label.
 */
function extractField(text: string, label: string): string | undefined {
  const idx = text.indexOf(label);
  if (idx === -1) return undefined;

  let after = text.substring(idx + label.length).trim();

  let nextIdx = Infinity;
  for (const l of KNOWN_LABELS) {
    if (l === label) continue;
    const i = after.indexOf(l);
    if (i !== -1 && i < nextIdx) nextIdx = i;
  }

  if (nextIdx !== Infinity) {
    after = after.substring(0, nextIdx).trim();
  }

  return after || undefined;
}

function extractFirstLine(text: string, label: string): string | undefined {
  const field = extractField(text, label);
  return field?.split('\n')[0]?.trim() || undefined;
}

/**
 * Parst den extrahierten PDF-Text und gibt strukturierte Daten zurück.
 */
export function parsePdfText(rawText: string): PdfParseResult {
  const beschreibung = extractField(rawText, 'Beschreibung:');
  const datum = extractFirstLine(rawText, 'Datum:');
  const prozeduren = extractFirstLine(rawText, 'Prozeduren:');
  const deadline =
    extractFirstLine(rawText, 'Gewünscht Erledigung bis:') ||
    extractFirstLine(rawText, 'Erledigung bis:');

  const aufgaben: string[] = [];

  if (beschreibung) {
    const lines = beschreibung
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 4 && !KNOWN_LABELS.some((lbl) => l.startsWith(lbl)));
    aufgaben.push(...lines);
  }

  if (prozeduren) {
    aufgaben.push(`Prozeduren: ${prozeduren}`);
  }

  let titel = '';
  if (aufgaben.length > 0) {
    const first = aufgaben[0];
    titel = first.length > 80 ? first.substring(0, 77) + '…' : first;
  } else if (datum) {
    titel = `Auftrag vom ${datum}`;
  } else {
    titel = 'Neuer Auftrag';
  }

  return { titel, aufgaben, deadline, datum, rawText };
}
