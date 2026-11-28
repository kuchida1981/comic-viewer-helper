import { describe, it, expect, vi } from 'vitest';
import { createFavoritesModal, FavoritesModalProps } from './FavoritesModal';
import { createTagGraphView } from './TagGraphView';
import { RelatedWork } from '../../types';

const tag = (text: string, type: string) => ({ text, href: `/${type}/${text}`, type });
const work = (id: number): RelatedWork => ({
  title: `W${id}`, href: `/work/${id}/`, thumb: '',
  tags: [tag('fantasy', 'genre'), tag('alice', 'artist')]
});
const favorites = [work(1), work(2), { title: 'W3', href: '/work/3/', thumb: '' }];

const graphView = (el: HTMLElement) => el.querySelector('.comic-helper-tag-graph-view') as HTMLElement;
const graphIds = (el: HTMLElement) =>
  Array.from(graphView(el).querySelectorAll('.comic-helper-tag-graph-node text')).map(n => n.textContent);
const typeChip = (root: HTMLElement, text: string) =>
  Array.from(root.querySelectorAll<HTMLElement>('.comic-helper-tag-type-chip')).find(c => c.textContent === text) as HTMLElement;

function openGraph(props: Partial<FavoritesModalProps> = {}) {
  const modal = createFavoritesModal({
    favorites,
    history: [],
    pinnedTags: [],
    onRemoveFavorite: () => {},
    onRemoveHistory: () => {},
    onToggleFavorite: () => {},
    onTogglePinTag: () => {},
    onClose: () => {},
    createTagGraph: createTagGraphView,
    ...props
  });
  const buttons = modal.el.querySelectorAll<HTMLElement>('.comic-helper-favorites-view-btn');
  buttons[2].click();
  return { ...modal, buttons };
}

function spyOnGraph() {
  const setActive = vi.fn();
  const destroy = vi.fn();
  const createTagGraph: typeof createTagGraphView = (props) => ({ ...createTagGraphView(props), setActive, destroy });
  return { createTagGraph, setActive, destroy };
}

describe('FavoritesModal tag graph view', () => {
  it('グラフビューに切り替えるとグラフだけが表示される', () => {
    const { el } = openGraph();
    expect(graphView(el).style.display).toBe('');
    expect((el.querySelector('.comic-helper-favorites-list-view') as HTMLElement).style.display).toBe('none');
    expect((el.querySelector('.comic-helper-tag-cloud') as HTMLElement).style.display).toBe('none');
    expect(graphIds(el)).toEqual(['alice', 'fantasy']);
  });

  it('ノードのクリックでそのタグに絞り込んだ一覧に切り替わる', () => {
    const { el } = openGraph();
    graphView(el).querySelector('.comic-helper-tag-graph-node')!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(graphView(el).style.display).toBe('none');
    expect(el.querySelector('.comic-helper-favorites-list-view .comic-helper-tag-chip.active')!.textContent).toContain('alice');
    expect(el.querySelectorAll('.comic-helper-favorites-list-view .comic-helper-favorites-item')).toHaveLength(2);
  });

  it('種類フィルタはグラフだけに作用し、リセットできる', () => {
    const { el } = openGraph();
    typeChip(graphView(el), 'genre').click();
    expect(graphIds(el)).toEqual(['fantasy']);
    const cloud = el.querySelector('.comic-helper-tag-cloud') as HTMLElement;
    expect(cloud.querySelectorAll('.comic-helper-tag-cloud-item')).toHaveLength(2);
    (graphView(el).querySelector('.comic-helper-tag-type-reset') as HTMLElement).click();
    expect(graphIds(el)).toEqual(['alice', 'fantasy']);
  });

  it('種類が1つになるとチップを隠して絞り込みも解除する', () => {
    const modal = openGraph();
    typeChip(graphView(modal.el), 'artist').click();
    modal.updateFavorites([{ title: 'G', href: '/work/9/', thumb: '', tags: [tag('fantasy', 'genre')] }]);
    expect(graphView(modal.el).querySelector('.comic-helper-tag-type-filter')).toBeNull();
    expect(graphIds(modal.el)).toEqual(['fantasy']);
  });

  it('選択中の種類がなくなると絞り込みを解除する', () => {
    const three: RelatedWork = { title: 'X', href: '/work/8/', thumb: '', tags: [tag('g', 'genre'), tag('a', 'artist'), tag('c', 'circle')] };
    const modal = openGraph({ favorites: [three] });
    typeChip(graphView(modal.el), 'genre').click();
    modal.updateFavorites([{ ...three, tags: [tag('a', 'artist'), tag('c', 'circle')] }]);
    expect(graphIds(modal.el)).toEqual(['a', 'c']);
    expect((graphView(modal.el).querySelector('.comic-helper-tag-type-reset') as HTMLButtonElement).disabled).toBe(true);
  });

  it('グラフが画面にあるときだけアクティブにする', () => {
    const spy = spyOnGraph();
    const { el, buttons } = openGraph({ createTagGraph: spy.createTagGraph });
    expect(spy.setActive).toHaveBeenLastCalledWith(true);
    const tabs = el.querySelectorAll<HTMLElement>('.comic-helper-library-tab');
    tabs[1].click();
    expect(spy.setActive).toHaveBeenLastCalledWith(false);
    tabs[0].click();
    expect(spy.setActive).toHaveBeenLastCalledWith(true);
    buttons[0].click();
    expect(spy.setActive).toHaveBeenLastCalledWith(false);
  });

  it('destroy はグラフを破棄する', () => {
    const spy = spyOnGraph();
    openGraph({ createTagGraph: spy.createTagGraph }).destroy();
    expect(spy.destroy).toHaveBeenCalled();
  });
});
