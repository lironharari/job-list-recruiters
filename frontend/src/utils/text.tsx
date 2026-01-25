import { getDocument } from 'pdfjs-dist';

export async function extractTextFromPdf(file: Blob): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await getDocument({ data: arrayBuffer }).promise;
  let text = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((item: any) => item.str).join(' ') + '\n';
    if (text.length > 8000) break;
  }
  return text.slice(0, 8000);
}
import React from 'react';

export const escapeHtml = (unsafe: string) => {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

export const markdownToHtml = (md: string) => {
  if (!md) return '';
  const lines = md.split(/\r?\n/);
  let out = '';
  let inList = false;
  for (let raw of lines) {
    const line = raw.trim();
    if (!line) {
      if (inList) {
        out += '</ul>';
        inList = false;
      }
      out += '<p></p>';
      continue;
    }
    const h = line.match(/^(#{1,3})\s+(.*)$/);
    if (h) {
      if (inList) {
        out += '</ul>';
        inList = false;
      }
      const lvl = h[1].length;
      out += `<h${lvl}>${escapeHtml(h[2])}</h${lvl}>`;
      continue;
    }
    const li = line.match(/^[-*+]\s+(.*)$/);
    if (li) {
      if (!inList) {
        out += '<ul>';
        inList = true;
      }
      out += `<li>${escapeHtml(li[1])}</li>`;
      continue;
    }

    let txt = escapeHtml(line)
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(
        /\[(.*?)\]\((https?:\/\/[^)]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
      );
    out += `<p>${txt}</p>`;
  }
  if (inList) out += '</ul>';
  return out;
};

export const markdownToPlain = (md: string) => {
  if (!md) return '';
  let s = md;
  s = s.replace(/!\[[^\]]*\]\([^)]*\)/g, '');
  s = s.replace(/\[(.*?)\]\((https?:\/\/[^)]+)\)/g, '$1');
  s = s.replace(/^#{1,6}\s*/gm, '');
  s = s.replace(/^\s*[-*+]\s+/gm, '');
  s = s.replace(/^>\s+/gm, '');
  s = s
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1');
  s = s.replace(/\r?\n+/g, ' ');
  s = s.replace(/\s+/g, ' ').trim();
  return s;
};

export const highlightText = (text: string, term: string): React.ReactNode => {
  if (!term) return text;
  const lower = text.toLowerCase();
  const t = term.toLowerCase();
  const parts: Array<React.ReactNode> = [];
  let start = 0;
  let idx = lower.indexOf(t, start);
  while (idx > -1) {
    if (idx > start) parts.push(text.slice(start, idx));
    parts.push(
      <span className="highlight" key={start + idx}>
        {text.slice(idx, idx + t.length)}
      </span>,
    );
    start = idx + t.length;
    idx = lower.indexOf(t, start);
  }
  if (start < text.length) parts.push(text.slice(start));
  return parts;
};

export default {};
