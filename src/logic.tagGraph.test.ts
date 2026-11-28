import { describe, it, expect } from 'vitest';
import {
  buildTagGraph,
  createGraphBody,
  placeGraphBody,
  normalizeTagGraphNodeLimit,
  stepTagGraph,
  zoomGraphView,
  toViewBoxPoint,
  TAG_GRAPH_NODE_LIMIT,
  TAG_GRAPH_NODE_LIMIT_MIN,
  TAG_GRAPH_NODE_LIMIT_MAX,
  TAG_GRAPH_NODE_LIMIT_STEP,
  GRAPH_ALPHA_MIN,
  GRAPH_MIN_SCALE,
  GRAPH_MAX_SCALE
} from './logic';

describe('buildTagGraph', () => {
  const work = (...texts: string[]) => ({
    title: '', href: '', thumb: '',
    tags: texts.map(text => ({ text, href: '', type: text.startsWith('g') ? 'genre' : null }))
  });
  const linkKeys = (links: { source: string; target: string }[]) => links.map(l => `${l.source}-${l.target}`).sort();

  it('タグがなければ空', () => {
    expect(buildTagGraph([{ title: '', href: '', thumb: '' }])).toEqual({ nodes: [], links: [] });
  });

  it('件数降順、同数は文字列昇順で、上限までをノードにする', () => {
    const { nodes } = buildTagGraph([work('c', 'b', 'a'), work('c')], new Set(), 2);
    expect(nodes.map(n => [n.tag.text, n.count])).toEqual([['c', 2], ['a', 1]]);
  });

  it('デフォルトの上限は50件', () => {
    const texts = Array.from({ length: 51 }, (_, i) => `t${i}`);
    expect(buildTagGraph([work(...texts)]).nodes).toHaveLength(TAG_GRAPH_NODE_LIMIT);
  });

  it('1作品内の同名タグは1回と数える', () => {
    expect(buildTagGraph([work('a', 'a')]).nodes[0].count).toBe(1);
  });

  it('共起2件以上のタグだけを Jaccard 係数つきで結ぶ', () => {
    const { links } = buildTagGraph([work('a', 'b', 'c'), work('b', 'a'), work('a')]);
    expect(links).toEqual([{ source: 'a', target: 'b', strength: 2 / 3 }]);
  });

  it('両端のどちらでも上位3本に入らない線は間引く', () => {
    // Every pair co-occurs; a-d are strongly related to each other, e and f only weakly
    const strong = work('a', 'b', 'c', 'd');
    const all = work('a', 'b', 'c', 'd', 'e', 'f');
    const keys = linkKeys(buildTagGraph([strong, strong, strong, all, all]).links);
    // e-f is the strongest link of e and f; their next two go to a and b. c-e, d-e, c-f, d-f are dropped
    expect(keys).toEqual(['a-b', 'a-c', 'a-d', 'a-e', 'a-f', 'b-c', 'b-d', 'b-e', 'b-f', 'c-d', 'e-f']);
  });

  it('種類の除外は上限より先に適用する', () => {
    const { nodes } = buildTagGraph([work('x', 'g1'), work('x')], new Set([null]), 1);
    expect(nodes.map(n => n.tag.text)).toEqual(['g1']);
  });
});

describe('normalizeTagGraphNodeLimit', () => {
  it('範囲と刻みの定数が仕様どおりである', () => {
    expect(TAG_GRAPH_NODE_LIMIT_MIN).toBe(10);
    expect(TAG_GRAPH_NODE_LIMIT_MAX).toBe(100);
    expect(TAG_GRAPH_NODE_LIMIT_STEP).toBe(10);
    expect(TAG_GRAPH_NODE_LIMIT).toBe(50);
  });

  it('数値以外の値は初期値 50 にする', () => {
    for (const invalid of ['50', null, undefined, {}, NaN, Infinity, -Infinity]) {
      expect(normalizeTagGraphNodeLimit(invalid)).toBe(50);
    }
  });

  it('範囲外と刻みに合わない数値は範囲内の最も近い刻みの値にする', () => {
    expect(normalizeTagGraphNodeLimit(-10)).toBe(10);
    expect(normalizeTagGraphNodeLimit(5)).toBe(10);
    expect(normalizeTagGraphNodeLimit(14)).toBe(10);
    expect(normalizeTagGraphNodeLimit(15)).toBe(20);
    expect(normalizeTagGraphNodeLimit(73)).toBe(70);
    expect(normalizeTagGraphNodeLimit(96)).toBe(100);
    expect(normalizeTagGraphNodeLimit(150)).toBe(100);
  });
});

describe('tag graph simulation', () => {
  const body = (id: string, x: number, y: number, fixed = false) =>
    ({ id, x, y, vx: 0, vy: 0, radius: 7, fixed });
  const gap = (bodies: { x: number; y: number }[]) => Math.hypot(bodies[1].x - bodies[0].x, bodies[1].y - bodies[0].y);

  it('初期配置は決定的で重ならない', () => {
    expect(createGraphBody('a', 3, 5)).toEqual(createGraphBody('a', 3, 5));
    expect(gap([createGraphBody('a', 0, 5), createGraphBody('b', 1, 5)])).toBeGreaterThan(0);
  });

  it('近いノードは反発し、入力は変更されない', () => {
    const input = [body('a', -5, 0), body('b', 5, 0)];
    const { bodies, alpha } = stepTagGraph(input, [], 1);
    expect(gap(bodies)).toBeGreaterThan(10);
    expect(alpha).toBeLessThan(1);
    expect(input[0].x).toBe(-5);
  });

  it('完全に重なったノードも分離する', () => {
    expect(gap(stepTagGraph([body('a', 0, 0), body('b', 0, 0)], [], 1).bodies)).toBeGreaterThan(0);
    expect(gap(stepTagGraph([body('a', 0, 0), body('b', 0, 5)], [], 1).bodies)).toBeGreaterThan(5);
  });

  it('線で結ばれた離れたノードは引き合い、存在しない端点の線は無視する', () => {
    const input = [body('a', -200, 0), body('b', 200, 0)];
    const links = [{ source: 'a', target: 'b', strength: 1 }, { source: 'a', target: 'zz', strength: 1 }];
    const linked = gap(stepTagGraph(input, links, 1).bodies);
    expect(linked).toBeLessThan(gap(stepTagGraph(input, [], 1).bodies));
  });

  it('固定ノードは動かない', () => {
    const { bodies } = stepTagGraph([body('a', 50, 50, true), body('b', 55, 50)], [], 1);
    expect([bodies[0].x, bodies[0].y]).toEqual([50, 50]);
  });

  it('50ノードが収束し、表示領域に収まる', () => {
    let bodies = Array.from({ length: 50 }, (_, i) => createGraphBody(String(i), i, 10));
    let alpha = 1;
    while (alpha >= GRAPH_ALPHA_MIN) {
      ({ bodies, alpha } = stepTagGraph(bodies, [], alpha));
    }
    expect(Math.max(...bodies.map(b => Math.abs(b.x)))).toBeLessThan(400);
    expect(Math.max(...bodies.map(b => Math.abs(b.y)))).toBeLessThan(250);
    expect(Math.max(...bodies.map(b => Math.hypot(b.vx, b.vy)))).toBeLessThan(1);
  });

  it('100ノードでも収束し、表示領域に収まる', () => {
    let bodies = Array.from({ length: 100 }, (_, i) => createGraphBody(String(i), i, 10));
    let alpha = 1;
    while (alpha >= GRAPH_ALPHA_MIN) {
      ({ bodies, alpha } = stepTagGraph(bodies, [], alpha));
    }
    expect(Math.max(...bodies.map(b => Math.abs(b.x)))).toBeLessThan(400);
    expect(Math.max(...bodies.map(b => Math.abs(b.y)))).toBeLessThan(250);
    expect(Math.max(...bodies.map(b => Math.hypot(b.vx, b.vy)))).toBeLessThan(1);
  });

  it('増えるノードはつながる既存ノードの近くに、相手がなければらせん上に置く', () => {
    const previous = new Map([
      ['a', { x: 200, y: -100 }],
      ['b', { x: 240, y: -60 }]
    ]);
    const links = [
      { source: 'a', target: 'new1', strength: 0.5 },
      { source: 'new1', target: 'b', strength: 0.5 },
      { source: 'new2', target: 'missing', strength: 0.5 }
    ];

    const near = placeGraphBody('new1', 4, 7, previous, links);
    expect(near).toEqual(placeGraphBody('new1', 4, 7, previous, links));
    expect(Math.hypot(near.x - 220, near.y - (-80))).toBeGreaterThan(0);
    expect(Math.hypot(near.x - 220, near.y - (-80))).toBeLessThan(20);

    const isolated = placeGraphBody('new2', 4, 7, previous, links);
    expect(isolated).toEqual(createGraphBody('new2', 4, 7));
  });
});

describe('tag graph view transform', () => {
  it('ポインタ下の点を保って拡大する', () => {
    expect(zoomGraphView({ x: 0, y: 0, scale: 1 }, { x: 100, y: 50 }, 2)).toEqual({ x: -100, y: -50, scale: 2 });
  });

  it('拡大率は上下限に収まる', () => {
    const view = { x: 0, y: 0, scale: 1 };
    expect(zoomGraphView(view, { x: 0, y: 0 }, 100).scale).toBe(GRAPH_MAX_SCALE);
    expect(zoomGraphView(view, { x: 0, y: 0 }, 0.001).scale).toBe(GRAPH_MIN_SCALE);
  });

  it('client 座標を中央原点の viewBox 座標に変換する', () => {
    const rect = { left: 10, top: 20, width: 400, height: 250 };
    expect(toViewBoxPoint({ x: 210, y: 145 }, rect, { width: 800, height: 500 })).toEqual({ x: 0, y: 0 });
    expect(toViewBoxPoint({ x: 260, y: 145 }, rect, { width: 800, height: 500 })).toEqual({ x: 100, y: 0 });
  });

  it('大きさのない要素では等倍として扱う', () => {
    const rect = { left: 0, top: 0, width: 0, height: 0 };
    expect(toViewBoxPoint({ x: 3, y: 4 }, rect, { width: 800, height: 500 })).toEqual({ x: 3, y: 4 });
  });
});
