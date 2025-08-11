import { parse } from 'tldts';

const MAX_LENGTH = 26;
const HEADER_HEIGHT = 32; // px
const UNDERLAP = 10; // px overlapped by card body

export const HEADER_STYLE = {
  height: HEADER_HEIGHT,
  visibleHeight: HEADER_HEIGHT - UNDERLAP,
};

export function computeDomain(data = {}) {
  let raw = (data.domain ?? '').toString().toLowerCase().trim();
  if (raw.endsWith('.')) {
    raw = raw.slice(0, -1);
  }
  const parsed = parse(raw, { allowPrivateDomains: true });
  let full = parsed.domain || raw;
  if (!full) {
    full = '(no domain)';
  }
  const truncated = truncateMiddle(full, MAX_LENGTH);
  const tld = parsed.publicSuffix ? `.${parsed.publicSuffix}` : 'root';
  return { full, truncated, tld };
}

function truncateMiddle(str, max) {
  if (str.length <= max) return str;
  const half = Math.floor((max - 1) / 2);
  return str.slice(0, half) + '…' + str.slice(str.length - half);
}
