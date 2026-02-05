import { vi } from 'vitest';

/**
 * Pattern A: HTMLImageElement モック
 * オプション未指定のプロパティはオブジェクトに存在しない
 */
export function createMockImage(props: {
  complete?: boolean;
  naturalWidth?: number;
  naturalHeight?: number;
  loading?: string;
  style?: Record<string, string>;
  id?: string;
  remove?: ReturnType<typeof vi.fn>;
  addEventListener?: ReturnType<typeof vi.fn>;
  removeEventListener?: ReturnType<typeof vi.fn>;
  decode?: ReturnType<typeof vi.fn>;
  getBoundingClientRect?: () => { top: number; bottom: number };
} = {}): HTMLImageElement {
  const obj: Record<string, unknown> = {};
  if ('complete' in props) obj.complete = props.complete;
  if ('naturalWidth' in props) obj.naturalWidth = props.naturalWidth;
  if ('naturalHeight' in props) obj.naturalHeight = props.naturalHeight;
  if ('loading' in props) obj.loading = props.loading;
  if ('style' in props) obj.style = props.style;
  if ('id' in props) obj.id = props.id;
  if ('remove' in props) obj.remove = props.remove;
  if ('addEventListener' in props) obj.addEventListener = props.addEventListener;
  if ('removeEventListener' in props) obj.removeEventListener = props.removeEventListener;
  if ('decode' in props) obj.decode = props.decode;
  if ('getBoundingClientRect' in props) obj.getBoundingClientRect = props.getBoundingClientRect;
  return obj as unknown as HTMLImageElement;
}

/**
 * Pattern B: MouseEvent モック
 * 戻り値にモック参照を同伴する
 */
export function createMockMouseEvent(props: {
  target: EventTarget;
  ctrlKey?: boolean;
  metaKey?: boolean;
} = { target: {} as EventTarget }) {
  const stopImmediatePropagation = vi.fn();
  const preventDefault = vi.fn();
  const event = {
    target: props.target,
    ctrlKey: props.ctrlKey ?? false,
    metaKey: props.metaKey ?? false,
    stopImmediatePropagation,
    preventDefault,
  } as unknown as MouseEvent;
  return { event, stopImmediatePropagation, preventDefault };
}

/**
 * 配列を NodeListOf<T> にキャストするヘルパー
 */
export function asNodeList<T extends Node>(arr: T[]): NodeListOf<T> {
  return arr as unknown as NodeListOf<T>;
}

/**
 * window.location を Object.defineProperty で標準的にモックする
 */
export function setupLocationMock(href = 'http://localhost/'): void {
  Object.defineProperty(window, 'location', {
    value: { href },
    writable: true,
    configurable: true,
  });
}