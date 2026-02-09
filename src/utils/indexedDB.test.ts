import { describe, it, expect, vi, beforeEach } from 'vitest';
import { IndexedDBWrapper } from './indexedDB';

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
    const mockRequest = {
      onsuccess: null as (() => void) | null,
      onerror: null as (() => void) | null,
      onupgradeneeded: null as ((ev: { oldVersion: number }) => void) | null,
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
      if (mockRequest.onsuccess) (mockRequest as { onsuccess: () => void }).onsuccess();
    }, 0);
    
    const db = await openPromise;
    expect(db).toBe(mockRequest.result);
    expect(mockIDB.open).toHaveBeenCalledWith('test-db', 1);
  });

  it('should handle onupgradeneeded', async () => {
    const mockDb = {
      createObjectStore: vi.fn().mockReturnValue({
        createIndex: vi.fn()
      }),
      objectStoreNames: { contains: vi.fn().mockReturnValue(false) }
    };
    const mockRequest = {
      result: mockDb,
      onupgradeneeded: null as ((ev: { oldVersion: number }) => void) | null
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
      (mockRequest as { onupgradeneeded: (ev: { oldVersion: number }) => void }).onupgradeneeded({ oldVersion: 0 });
    }

    expect(mockDb.createObjectStore).toHaveBeenCalledWith('testStore', { keyPath: 'id', autoIncrement: undefined });
    const storeMock = mockDb.createObjectStore.mock.results[0].value;
    expect(storeMock.createIndex).toHaveBeenCalledWith('name', 'name');
  });

  it('should handle put operation', async () => {
    // Manually setting internal db state for testing the put method in isolation
    (wrapper as unknown as { db: unknown }).db = {
      transaction: vi.fn().mockReturnValue({
        objectStore: vi.fn().mockReturnValue({
          put: vi.fn().mockReturnValue({ onsuccess: vi.fn() })
        })
      })
    };

    const dbMock = (wrapper as unknown as { db: unknown }).db;
    const storeMock = dbMock.transaction().objectStore();
    const requestMock = storeMock.put();

    const putPromise = wrapper.put('testStore', { id: 1 });
    
    // Simulate success
    setTimeout(() => {
      requestMock.onsuccess();
    }, 0);
    
    await putPromise;

    expect(dbMock.transaction).toHaveBeenCalledWith('testStore', 'readwrite');
    expect(storeMock.put).toHaveBeenCalledWith({ id: 1 });
  });

  it('should handle getAll operation', async () => {
    (wrapper as unknown as { db: unknown }).db = {
      transaction: vi.fn().mockReturnValue({
        objectStore: vi.fn().mockReturnValue({
          getAll: vi.fn().mockReturnValue({ onsuccess: vi.fn() })
        })
      })
    };

    const dbMock = (wrapper as unknown as { db: unknown }).db;
    const storeMock = dbMock.transaction().objectStore();
    const requestMock = storeMock.getAll();

    const getAllPromise = wrapper.getAll('testStore');
    requestMock.result = [{ id: 1 }];
    setTimeout(() => {
      requestMock.onsuccess();
    }, 0);
    const result = await getAllPromise;

    expect(result).toEqual([{ id: 1 }]);
  });

  it('should handle delete operation', async () => {
    (wrapper as unknown as { db: unknown }).db = {
      transaction: vi.fn().mockReturnValue({
        objectStore: vi.fn().mockReturnValue({
          delete: vi.fn().mockReturnValue({ onsuccess: vi.fn() })
        })
      })
    };

    const dbMock = (wrapper as unknown as { db: unknown }).db;
    const storeMock = dbMock.transaction().objectStore();
    const requestMock = storeMock.delete();

    const deletePromise = wrapper.delete('testStore', 1);
    setTimeout(() => {
      requestMock.onsuccess();
    }, 0);
    await deletePromise;

    expect(storeMock.delete).toHaveBeenCalledWith(1);
  });

  it('should handle clear operation', async () => {
    (wrapper as unknown as { db: unknown }).db = {
      transaction: vi.fn().mockReturnValue({
        objectStore: vi.fn().mockReturnValue({
          clear: vi.fn().mockReturnValue({ onsuccess: vi.fn() })
        })
      })
    };

    const dbMock = (wrapper as unknown as { db: unknown }).db;
    const storeMock = dbMock.transaction().objectStore();
    const requestMock = storeMock.clear();

    const clearPromise = wrapper.clear('testStore');
    setTimeout(() => {
      requestMock.onsuccess();
    }, 0);
    await clearPromise;

    expect(storeMock.clear).toHaveBeenCalled();
  });
});
