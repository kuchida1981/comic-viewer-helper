import { vi } from 'vitest';

export class LocalStorageMock {
  private store: Record<string, string>;

  constructor() {
    this.store = {};
  }

  get length(): number {
    return Object.keys(this.store).length;
  }

  clear(): void {
    this.store = {};
  }

  getItem(key: string): string | null {
    return this.store[key] || null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = String(value);
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  key(index: number): string | null {
    const keys = Object.keys(this.store);
    return keys[index] || null;
  }
}

export function setupLocalStorageMock() {
  const mock = new LocalStorageMock();
  vi.stubGlobal('localStorage', mock);
  return mock;
}
