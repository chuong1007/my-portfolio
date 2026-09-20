import React from 'react';

/**
 * Normalizes Vietnamese text for fuzzy searching.
 * Removes accents, converts to lowercase, and handles 'đ/Đ'.
 */
export function normalizeVietnamese(text: any): string {
  if (!text || typeof text !== 'string') return '';
  return text
    .normalize('NFD') // decompose accents
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

/**
 * Parses text and converts phones, emails, and URLs into clickable React elements.
 * Maintains newlines via CSS (white-space: pre-line).
 * Prevents XSS by not using dangerouslySetInnerHTML.
 */
export function linkify(text: string): React.ReactNode[] {
  if (!text) return [];

  // Regex patterns
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/g;
  const phoneRegex = /(0[35789](?:[\s.-]*[0-9]){8})\b/g;

  // Split the text by capturing groups so we can interleave strings and elements
  // We use a combined regex to find all tokens in order
  const combinedRegex = /(https?:\/\/[^\s]+)|([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)|(0[35789](?:[\s.-]*[0-9]){8}\b)/g;

  const parts = text.split(combinedRegex);
  
  const result: React.ReactNode[] = [];
  
  parts.forEach((part, i) => {
    if (!part) return; // Ignore undefined from non-matching capture groups
    
    if (part.match(urlRegex)) {
      result.push(
        <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
          {part}
        </a>
      );
    } else if (part.match(emailRegex)) {
      result.push(
        <a key={i} href={`mailto:${part}`} className="text-blue-400 hover:underline">
          {part}
        </a>
      );
    } else if (part.match(phoneRegex)) {
      // Format as Zalo link if we want, or just tel:
      // Phone format in VN is usually 10 digits
      const cleanPhone = part.replace(/\D/g, '');
      result.push(
        <a key={i} href={`tel:${cleanPhone}`} className="text-blue-400 font-medium hover:underline">
          {part}
        </a>
      );
    } else {
      // Just normal text
      result.push(part);
    }
  });

  return result;
}
