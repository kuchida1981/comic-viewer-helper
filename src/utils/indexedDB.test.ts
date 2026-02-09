import { describe, it, expect, vi, beforeEach } from 'vitest';
import { IndexedDBWrapper } from './indexedDB';

interface MockIDBRequest {
  onsuccess: (() => void) | null;
  onerror: (() => void) | null;
  onupgradeneeded: ((ev: { oldVersion: number }) => void) | null;
  result: unknown;
}

interface MockIDBStore {
  put: (item: unknown) => { onsuccess: () => void };
  getAll: () => { onsuccess: () => void; result?: unknown };
  delete: (key: IDBValidKey) => { onsuccess: () => void };
  clear: () => { onsuccess: () => void };
  createIndex: (name: string, path: string | string[]) => void;
}

interface MockIDBDatabase {
  transaction: (store: string, mode?: string) => {
    objectStore: (name?: string) => MockIDBStore;
  };
  createObjectStore: (name: string, options?: { keyPath: string; autoIncrement?: boolean }) => MockIDBStore;
  objectStoreNames: { contains: (name: string) => boolean };
}

describe('IndexedDBWrapper', () => {
  let wrapper: IndexedDBWrapper;
  const config = {
    name: 'test-db',
    version: 1,
    stores: {
      testStore: { keyPath: 'id' }
    }
  };

  // Minimal mocks for IDB
  const mockIDB = {
    open: vi.fn()
  };

  beforeEach(() => {
    vi.stubGlobal('indexedDB', mockIDB);
    wrapper = new IndexedDBWrapper(config);
  });

  it('should attempt to open database', async () => {
    const mockRequest: MockIDBRequest = {
      onsuccess: null,
      onerror: null,
      onupgradeneeded: null,
      result: {
        transaction: vi.fn().mockReturnValue({
          objectStore: vi.fn().mockReturnValue({
            put: vi.fn().mockReturnValue({ onsuccess: null }),
            getAll: vi.fn().mockReturnValue({ onsuccess: null }),
            delete: vi.fn().mockReturnValue({ onsuccess: null }),
            clear: vi.fn().mockReturnValue({ onsuccess: null })
          })
        }),
        objectStoreNames: { contains: vi.fn().mockReturnValue(true) }
      }
    };
    mockIDB.open.mockReturnValue(mockRequest);

    const openPromise = wrapper.open();
    // Simulate success in next tick to allow promise to be returned
    setTimeout(() => {
      if (mockRequest.onsuccess) mockRequest.onsuccess();
    }, 0);
    
    const db = await openPromise;
    expect(db).toBe(mockRequest.result);
    expect(mockIDB.open).toHaveBeenCalledWith('test-db', 1);
  });

  it('should handle onupgradeneeded', async () => {
    const mockDb: MockIDBDatabase = {
      createObjectStore: vi.fn().mockReturnValue({
        createIndex: vi.fn()
      }),
      objectStoreNames: { contains: vi.fn().mockReturnValue(false) },
      transaction: vi.fn()
    };
    const mockRequest: MockIDBRequest = {
      result: mockDb,
      onupgradeneeded: null,
      onsuccess: null,
      onerror: null
    };
    mockIDB.open.mockReturnValue(mockRequest);

    const configWithIndex = {
      name: 'test-db-index',
      version: 1,
      stores: {
        testStore: { 
          keyPath: 'id',
          indexes: { name: 'name' }
        }
      }
    };
    const wrapperWithIndex = new IndexedDBWrapper(configWithIndex);
    
    wrapperWithIndex.open().catch(() => {});
    
    // Simulate upgrade
    if (mockRequest.onupgradeneeded) {
      mockRequest.onupgradeneeded({ oldVersion: 0 });
    }

    expect(mockDb.createObjectStore).toHaveBeenCalledWith('testStore', { keyPath: 'id', autoIncrement: undefined });
    const storeMock = (mockDb.createObjectStore as unknown as { mock: { results: Array<{ value: MockIDBStore }> } }).mock.results[0].value;
    expect(storeMock.createIndex).toHaveBeenCalledWith('name', 'name');
  });

  it('should handle put operation', async () => {
    const storeMock: MockIDBStore = {
      put: vi.fn().mockReturnValue({ onsuccess: vi.fn() }),
      getAll: vi.fn(),
      delete: vi.fn(),
      clear: vi.fn(),
      createIndex: vi.fn()
    };
    const dbMock: MockIDBDatabase = {
      transaction: vi.fn().mockReturnValue({
        objectStore: vi.fn().mockReturnValue(storeMock)
      }),
      createObjectStore: vi.fn(),
      objectStoreNames: { contains: vi.fn().mockReturnValue(true) }
    };

    (wrapper as unknown as { db: MockIDBDatabase }).db = dbMock;

    const requestMock = storeMock.put({ id: 1 });

    const putPromise = wrapper.put('testStore', { id: 1 });
    
    // Simulate success
    setTimeout(() => {
      (requestMock as { onsuccess: () => void }).onsuccess();
    }, 0);
    
    await putPromise;

    expect(dbMock.transaction).toHaveBeenCalledWith('testStore', 'readwrite');
    expect(storeMock.put).toHaveBeenCalledWith({ id: 1 });
  });

  it('should handle getAll operation', async () => {
    const storeMock: MockIDBStore = {
      put: vi.fn(),
      getAll: vi.fn().mockReturnValue({ onsuccess: vi.fn() }),
      delete: vi.fn(),
      clear: vi.fn(),
      createIndex: vi.fn()
    };
    const dbMock: MockIDBDatabase = {
      transaction: vi.fn().mockReturnValue({
        objectStore: vi.fn().mockReturnValue(storeMock)
      }),
      createObjectStore: vi.fn(),
      objectStoreNames: { contains: vi.fn().mockReturnValue(true) }
    };

    (wrapper as unknown as { db: MockIDBDatabase }).db = dbMock;

    const requestMock = storeMock.getAll();

    const getAllPromise = wrapper.getAll('testStore');
    (requestMock as { result: unknown }).result = [{ id: 1 }];
    setTimeout(() => {
      (requestMock as { onsuccess: () => void }).onsuccess();
    }, 0);
    const result = await getAllPromise;

    expect(result).toEqual([{ id: 1 }]);
  });

  it('should handle delete operation', async () => {
    const storeMock: MockIDBStore = {
      put: vi.fn(),
      getAll: vi.fn(),
      delete: vi.fn().mockReturnValue({ onsuccess: vi.fn() }),
      clear: vi.fn(),
      createIndex: vi.fn()
    };
    const dbMock: MockIDBDatabase = {
      transaction: vi.fn().mockReturnValue({
        objectStore: vi.fn().mockReturnValue(storeMock)
      }),
      createObjectStore: vi.fn(),
      objectStoreNames: { contains: vi.fn().mockReturnValue(true) }
    };

    (wrapper as unknown as { db: MockIDBDatabase }).db = dbMock;

    const requestMock = storeMock.delete(1);

    const deletePromise = wrapper.delete('testStore', 1);
    setTimeout(() => {
      (requestMock as { onsuccess: () => void }).onsuccess();
    }, 0);
    await deletePromise;

    expect(storeMock.delete).toHaveBeenCalledWith(1);
  });

  it('should handle clear operation', async () => {
    const storeMock: MockIDBStore = {
      put: vi.fn(),
      getAll: vi.fn(),
      delete: vi.fn(),
      clear: vi.fn().mockReturnValue({ onsuccess: vi.fn() }),
      createIndex: vi.fn()
    };
    const dbMock: MockIDBDatabase = {
      transaction: vi.fn().mockReturnValue({
        objectStore: vi.fn().mockReturnValue(storeMock)
      }),
      createObjectStore: vi.fn(),
      objectStoreNames: { contains: vi.fn().mockReturnValue(true) }
    };

    (wrapper as unknown as { db: MockIDBDatabase }).db = dbMock;

    const requestMock = storeMock.clear();

    const clearPromise = wrapper.clear('testStore');
    setTimeout(() => {
      (requestMock as { onsuccess: () => void }).onsuccess();
    }, 0);
    await clearPromise;

    expect(storeMock.clear).toHaveBeenCalled();
  });
});
