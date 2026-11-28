import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createTagGraphView } from './TagGraphView';
import { t } from '../../i18n';
import { RelatedWork } from '../../types';

const work = (...texts: string[]): RelatedWork => ({
  title: '', href: '', thumb: '',
  tags: texts.map(text => ({ text, href: '', type: text === 'a' ? 'artist' : null }))
});
const favorites = [work('a', 'b'), work('a', 'b'), work('a'), work('c')];

describe('TagGraphView', () => {
  let frames: Map<number, FrameRequestCallback>;
  let nextHandle: number;

  beforeEach(() => {
    frames = new Map();
    nextHandle = 1;
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      frames.set(nextHandle, cb);
      return nextHandle++;
    });
    vi.stubGlobal('cancelAnimationFrame', (handle: number) => { frames.delete(handle); });
  });

  afterEach(() => { vi.unstubAllGlobals(); });

  function runFrames(max = 1000): number {
    let count = 0;
    while (frames.size > 0 && count < max) {
      const [handle, cb] = Array.from(frames)[0];
      frames.delete(handle);
      cb(0);
      count++;
    }
    return count;
  }

  function setup(works: RelatedWork[] = favorites) {
    const onSelectTag = vi.fn();
    const graph = createTagGraphView({ onSelectTag });
    graph.update(works, new Set());
    const q = (selector: string) => graph.el.querySelector<HTMLElement>(selector)!;
    const nodes = () => Array.from(graph.el.querySelectorAll<SVGGElement>('.comic-helper-tag-graph-node'));
    const node = (id: string) => nodes().find(n => n.querySelector('text')!.textContent === id)!;
    const svg = graph.el.querySelector('svg')!;
    const viewport = svg.querySelector('g')!;
    return { graph, onSelectTag, q, nodes, node, svg, viewport };
  }

  const pointer = (target: EventTarget, type: string, x = 0, y = 0, button = 0) => {
    const event = new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y, button });
    target.dispatchEvent(event);
    return event;
  };
  const key = (target: EventTarget, value: string) => {
    const event = new KeyboardEvent('keydown', { key: value, bubbles: true, cancelable: true });
    target.dispatchEvent(event);
    return event;
  };
  const position = (el: Element) => el.getAttribute('transform');

  it('ノード、線、種類クラス、件数に応じた大きさを描画する', () => {
    const { nodes, node, graph } = setup();
    expect(nodes()).toHaveLength(3);
    expect(graph.el.querySelectorAll('line')).toHaveLength(1);
    expect(node('a').classList.contains('comic-helper-tag-graph-node--artist')).toBe(true);
    const radius = (id: string) => Number(node(id).querySelector('circle')!.getAttribute('r'));
    expect(radius('a')).toBeGreaterThan(radius('c'));
  });

  it('タグがなければメッセージを表示する', () => {
    const { q, nodes } = setup([]);
    expect(nodes()).toHaveLength(0);
    expect(q('.comic-helper-search-no-results').textContent).toBe(t('ui.tagCloudEmpty'));
    expect(q('.comic-helper-search-no-results').style.display).toBe('');
    expect(q('.comic-helper-tag-graph-canvas').style.display).toBe('none');
  });

  it('アクティブな間だけ動き、収束すると止まる', () => {
    const { graph, node } = setup();
    expect(frames.size).toBe(0);
    const before = position(node('a'));
    graph.setActive(true);
    graph.setActive(true);
    expect(frames.size).toBe(1);
    const count = runFrames();
    expect(count).toBeGreaterThan(1);
    expect(count).toBeLessThan(1000);
    expect(position(node('a'))).not.toBe(before);
  });

  it('非アクティブと destroy でアニメーションを止める', () => {
    const { graph } = setup();
    graph.setActive(true);
    graph.setActive(false);
    expect(frames.size).toBe(0);
    graph.setActive(true);
    graph.destroy();
    expect(frames.size).toBe(0);
  });

  it('内容が同じ更新では配置を保ち、変わる更新では残るノードの位置を引き継ぐ', () => {
    const { graph, node } = setup();
    graph.setActive(true);
    runFrames();
    const settled = position(node('a'));
    const element = node('a');

    graph.update(favorites.map(f => ({ ...f })), new Set());
    expect(node('a')).toBe(element);
    expect(frames.size).toBe(0);

    graph.update([...favorites, work('d')], new Set());
    expect(position(node('a'))).toBe(settled);
    expect(frames.size).toBe(1);
  });

  it('クリックと Enter / Space でタグを選択する', () => {
    const { node, onSelectTag } = setup();
    pointer(node('a'), 'click');
    expect(key(node('b'), 'Enter').defaultPrevented).toBe(true);
    key(node('c'), ' ');
    key(node('c'), 'Tab');
    expect(onSelectTag.mock.calls).toEqual([['a'], ['b'], ['c']]);
  });

  it('ドラッグするとノードが追従し、クリック扱いにしない', () => {
    const { graph, node, onSelectTag, viewport } = setup();
    graph.setActive(true);
    runFrames();
    expect(pointer(node('a'), 'pointerdown').defaultPrevented).toBe(true);
    pointer(window, 'pointermove', 100, 50);
    expect(position(node('a'))).toBe('translate(100 50)');
    // The simulation keeps running while dragging, and the dragged node stays put
    expect(runFrames(300)).toBe(300);
    expect(position(node('a'))).toBe('translate(100 50)');
    expect(position(viewport)).toBe('translate(0 0) scale(1)');
    pointer(window, 'pointerup');
    pointer(node('a'), 'click');
    expect(onSelectTag).not.toHaveBeenCalled();
    expect(runFrames()).toBeLessThan(1000);
  });

  it('わずかな移動はクリックとして扱う', () => {
    const { node, onSelectTag } = setup();
    pointer(node('a'), 'pointerdown');
    pointer(window, 'pointermove', 2, 1);
    pointer(window, 'pointerup');
    pointer(node('a'), 'click');
    expect(onSelectTag).toHaveBeenCalledWith('a');
  });

  it('主ボタン以外ではドラッグしない', () => {
    const { svg, viewport } = setup();
    pointer(svg, 'pointerdown', 0, 0, 2);
    pointer(window, 'pointermove', 100, 50);
    expect(position(viewport)).toBe('translate(0 0) scale(1)');
  });

  it('背景のドラッグでパンし、pointercancel で終了する', () => {
    const { svg, viewport } = setup();
    pointer(svg, 'pointerdown', 10, 10);
    pointer(window, 'pointermove', 40, 30);
    pointer(window, 'pointermove', 50, 30);
    expect(position(viewport)).toBe('translate(40 20) scale(1)');
    pointer(window, 'pointercancel');
    pointer(window, 'pointermove', 90, 90);
    expect(position(viewport)).toBe('translate(40 20) scale(1)');
  });

  it('ホイールで拡大縮小し、スクロールを止める', () => {
    const { svg, viewport, graph } = setup();
    const outer = vi.fn();
    graph.el.addEventListener('wheel', outer);
    const wheel = (deltaY: number, deltaMode = 0) => {
      const event = new WheelEvent('wheel', { deltaY, deltaMode, bubbles: true, cancelable: true });
      svg.dispatchEvent(event);
      return event;
    };
    const scale = () => Number(/scale\((.+)\)/.exec(position(viewport)!)![1]);

    expect(wheel(-100).defaultPrevented).toBe(true);
    expect(outer).not.toHaveBeenCalled();
    expect(scale()).toBeCloseTo(Math.exp(0.15));
    wheel(100);
    wheel(3, 1);
    expect(scale()).toBeCloseTo(Math.exp(-3 * 16 * 0.0015));
    wheel(100000);
    expect(scale()).toBe(0.3);
  });

  it('表示を元に戻すとズームと位置だけが初期化される', () => {
    const { svg, viewport, q, node } = setup();
    pointer(svg, 'pointerdown');
    pointer(window, 'pointermove', 30, 30);
    pointer(window, 'pointerup');
    const before = position(node('a'));
    q('.comic-helper-tag-graph-reset').click();
    expect(position(viewport)).toBe('translate(0 0) scale(1)');
    expect(position(node('a'))).toBe(before);
  });

  it('ホバーとフォーカスで隣接ノードと線を強調する', () => {
    const { node, svg, q } = setup();
    const highlighted = (id: string) => node(id).classList.contains('is-highlighted');
    for (const [enter, leave] of [['pointerenter', 'pointerleave'], ['focus', 'blur']]) {
      node('a').dispatchEvent(new Event(enter));
      expect(svg.classList.contains('has-highlight')).toBe(true);
      expect([highlighted('a'), highlighted('b'), highlighted('c')]).toEqual([true, true, false]);
      expect(q('line').classList.contains('is-highlighted')).toBe(true);
      node('a').dispatchEvent(new Event(leave));
      expect(svg.classList.contains('has-highlight')).toBe(false);
      expect(highlighted('a')).toBe(false);
    }
  });

  it('ドラッグ中はポインタが離れても強調を保つ', () => {
    const { node, svg } = setup();
    node('a').dispatchEvent(new Event('pointerenter'));
    pointer(node('a'), 'pointerdown');
    node('a').dispatchEvent(new Event('pointerleave'));
    expect(svg.classList.contains('has-highlight')).toBe(true);
    pointer(window, 'pointerup');
  });
});
