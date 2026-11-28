import { describe, it, expect } from 'vitest';
import { fitGraphScale, getVisibleViewBox } from './logic';

describe('getVisibleViewBox', () => {
  const viewBox = { width: 800, height: 500 };

  it('縦横比の違う分だけ viewBox より広い範囲が見える', () => {
    expect(getVisibleViewBox({ width: 800, height: 400 }, viewBox)).toEqual({ width: 1000, height: 500 });
    expect(getVisibleViewBox({ width: 400, height: 500 }, viewBox)).toEqual({ width: 800, height: 1000 });
  });

  it('大きさのない要素では viewBox を使う', () => {
    expect(getVisibleViewBox({ width: 0, height: 0 }, viewBox)).toEqual(viewBox);
  });
});

describe('fitGraphScale', () => {
  const viewBox = { width: 800, height: 500 };

  it('収まっているときは縮小しない', () => {
    expect(fitGraphScale([], viewBox)).toBe(1);
    expect(fitGraphScale([{ x: 300, y: -200, radius: 7 }], viewBox)).toBe(1);
  });

  it('ラベルを含めて収まる倍率まで縮小する', () => {
    // 770 + label half width 30 = 800, twice the half width of the view
    expect(fitGraphScale([{ x: -770, y: 0, radius: 7 }], viewBox)).toBe(0.5);
    // 477 + radius 7 + label height 16 = 500
    expect(fitGraphScale([{ x: 0, y: 477, radius: 7 }], viewBox)).toBe(0.5);
  });

  it('最も外側のノードに合わせる', () => {
    expect(fitGraphScale([{ x: 770, y: 0, radius: 7 }, { x: 1570, y: 0, radius: 7 }], viewBox)).toBe(0.25);
  });
});
