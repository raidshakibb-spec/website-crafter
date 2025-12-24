import { useState, useEffect } from 'react';
import { useLanguage } from './language-context';

const translationCache = new Map<string, string>();

export function useTranslation(text: string | null | undefined): string {
  const { language } = useLanguage();
  const [translated, setTranslated] = useState(text || '');

  useEffect(() => {
    if (!text || language === 'ar') {
      setTranslated(text || '');
      return;
    }

    // Check cache first
    if (translationCache.has(text)) {
      setTranslated(translationCache.get(text) || text);
      return;
    }

    // Fetch translation
    fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texts: [text] }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.translations && data.translations[0]) {
          translationCache.set(text, data.translations[0]);
          setTranslated(data.translations[0]);
        }
      })
      .catch(() => {
        setTranslated(text);
      });
  }, [text, language]);

  return translated;
}

export function useTranslations(texts: (string | null | undefined)[]): string[] {
  const { language } = useLanguage();
  const [translated, setTranslated] = useState<string[]>(texts.map(t => t || ''));

  useEffect(() => {
    if (language === 'ar') {
      setTranslated(texts.map(t => t || ''));
      return;
    }

    const textsToTranslate = texts.filter(t => t && !translationCache.has(t)) as string[];
    
    if (textsToTranslate.length === 0) {
      setTranslated(texts.map(t => t ? (translationCache.get(t) || t) : ''));
      return;
    }

    fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texts: textsToTranslate }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.translations) {
          textsToTranslate.forEach((text, i) => {
            translationCache.set(text, data.translations[i]);
          });
          setTranslated(texts.map(t => t ? (translationCache.get(t) || t) : ''));
        }
      })
      .catch(() => {
        setTranslated(texts.map(t => t || ''));
      });
  }, [texts.join(','), language]);

  return translated;
}
