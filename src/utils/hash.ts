import hash from 'hash.js';

// from https://stackoverflow.com/a/48738430
export function sha256(message: string) {
  return hash.sha256().update(message).digest('hex');
}
