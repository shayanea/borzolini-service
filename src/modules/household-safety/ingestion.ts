// Ingestion scaffold (not executed here). Provides types and helpers for allowlisted sources.
export type Species = 'dog' | 'cat' | 'bird' | 'rabbit' | 'hamster' | 'fish' | 'reptile' | 'horse' | 'other';

export interface Citation {
  title: string;
  url: string;
  org: string;
  reviewedAt?: string;
}

export interface NormalizedFoodRecord {
  canonicalName: string;
  scientificName?: string | null;
  category?: string | null;
  notesMarkdown: string;
  safetyOverall: 'safe' | 'caution' | 'avoid' | 'toxic';
  perSpecies: Array<{
    species: Species;
    safety: 'safe' | 'caution' | 'avoid' | 'toxic';
    safeAmount?: string | null;
    frequency?: string | null;
    preparation?: 'raw' | 'cooked' | 'plain' | 'seasoned' | 'unknown';
    risks?: string[];
    emergency?: boolean;
    citations: Citation[];
  }>;
  aliases?: string[];
  sourcePrimary: string;
  sourceName: string;
  lastReviewedAt?: string | null;
  license?: string | null;
  termsSnapshot?: Record<string, unknown> | null;
}

export const SOURCE_ALLOWLIST: Array<{ org: string; baseUrl: string }> = [
  { org: 'ASPCA Animal Poison Control', baseUrl: 'https://www.aspca.org' },
  { org: 'Pet Poison Helpline', baseUrl: 'https://www.petpoisonhelpline.com' },
  { org: 'FDA Center for Veterinary Medicine', baseUrl: 'https://www.fda.gov' },
  { org: 'WSAVA Global Nutrition', baseUrl: 'https://wsava.org' },
  { org: 'Merck Veterinary Manual', baseUrl: 'https://www.merckvetmanual.com' },
  { org: 'Cornell University College of Veterinary Medicine', baseUrl: 'https://www.vet.cornell.edu' },
  { org: 'UC Davis Veterinary Medicine', baseUrl: 'https://www.vetmed.ucdavis.edu' },
];


