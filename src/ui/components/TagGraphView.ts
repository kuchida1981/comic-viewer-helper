import { createElement } from '../utils';
import { t } from '../../i18n';
import { Tag, TagGraphViewComponent } from '../../types';
import {
  buildTagGraph,
  calculateTagCloudLevel,
  createGraphBody,
  stepTagGraph,
  toViewBoxPoint,
  zoomGraphView,
  GRAPH_ALPHA_MIN,
  GraphBody,
  GraphView,
  TagGraph
} from '../../logic';

const SVG_NS = 'http://www.w3.org/2000/svg';
const VIEW_BOX = { width: 800, height: 500 };
const DRAG_THRESHOLD = 4;
const DRAG_ALPHA = 0.3;
const UPDATE_ALPHA = 0.6;
const ZOOM_SENSITIVITY = 0.0015;
const WHEEL_LINE_HEIGHT = 16;

interface Point {
  x: number;
  y: number;
}

interface DragState {
  /** Dragged node id, or null when panning the background */
  id: string | null;
  start: Point;
  last: Point;
}

interface LinkElement {
  el: SVGLineElement;
  source: string;
  target: string;
}

function createSvgElement<K extends keyof SVGElementTagNameMap>(
  tag: K,
  attributes: Record<string, string> = {}
): SVGElementTagNameMap[K] {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [name, value] of Object.entries(attributes)) el.setAttribute(name, value);
  return el;
}

function createNodeElement(tag: Tag, count: number, radius: number): SVGGElement {
  const description = `${tag.text} (${count})`;
  const node = createSvgElement('g', {
    class: `comic-helper-tag-graph-node${tag.type ? ` comic-helper-tag-graph-node--${tag.type}` : ''}`,
    tabindex: '0',
    role: 'button',
    'aria-label': description
  });
  const title = createSvgElement('title');
  title.textContent = description;
  const label = createSvgElement('text', { y: String(radius + 12), 'text-anchor': 'middle' });
  label.textContent = tag.text;
  node.append(title, createSvgElement('circle', { r: String(radius) }), label);
  return node;
}

export function createTagGraphView({ onSelectTag }: { onSelectTag: (tagText: string) => void }): TagGraphViewComponent {
  let graph: TagGraph = { nodes: [], links: [] };
  let signature = '';
  let bodies: GraphBody[] = [];
  let alpha = 0;
  let view: GraphView = { x: 0, y: 0, scale: 1 };
  let active = false;
  let frame: number | null = null;
  let drag: DragState | null = null;
  let dragged = false;
  const nodeEls = new Map<string, SVGGElement>();
  let linkEls: LinkElement[] = [];

  const viewport = createSvgElement('g');
  const linkLayer = createSvgElement('g');
  const nodeLayer = createSvgElement('g');
  viewport.append(linkLayer, nodeLayer);
  const svg = createSvgElement('svg', {
    class: 'comic-helper-tag-graph-svg',
    viewBox: `${-VIEW_BOX.width / 2} ${-VIEW_BOX.height / 2} ${VIEW_BOX.width} ${VIEW_BOX.height}`
  });
  svg.appendChild(viewport);

  const resetBtn = createElement('button', {
    className: 'comic-helper-tag-graph-reset',
    textContent: t('ui.tagGraphResetView'),
    events: { click: () => applyView({ x: 0, y: 0, scale: 1 }) }
  });
  const canvas = createElement('div', { className: 'comic-helper-tag-graph-canvas' });
  canvas.append(svg, resetBtn);
  const emptyEl = createElement('div', {
    className: 'comic-helper-search-no-results',
    textContent: t('ui.tagCloudEmpty')
  });
  const el = createElement('div', { className: 'comic-helper-tag-graph' }, [emptyEl, canvas]);

  function applyView(next: GraphView): void {
    view = next;
    viewport.setAttribute('transform', `translate(${view.x} ${view.y}) scale(${view.scale})`);
  }

  function toPoint(client: Point): Point {
    return toViewBoxPoint(client, svg.getBoundingClientRect(), VIEW_BOX);
  }

  function renderPositions(): void {
    const byId = new Map(bodies.map(body => [body.id, body]));
    for (const body of bodies) {
      nodeEls.get(body.id)!.setAttribute('transform', `translate(${body.x} ${body.y})`);
    }
    for (const { el: line, source, target } of linkEls) {
      const a = byId.get(source)!;
      const b = byId.get(target)!;
      line.setAttribute('x1', String(a.x));
      line.setAttribute('y1', String(a.y));
      line.setAttribute('x2', String(b.x));
      line.setAttribute('y2', String(b.y));
    }
  }

  function stopAnimation(): void {
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
  }

  function startAnimation(): void {
    if (!active || frame !== null || bodies.length === 0 || alpha < GRAPH_ALPHA_MIN) return;
    frame = requestAnimationFrame(() => {
      frame = null;
      const next = stepTagGraph(bodies, graph.links, alpha);
      bodies = next.bodies;
      // Stay warm while a node is being dragged so that its neighbors keep following
      alpha = drag?.id ? Math.max(next.alpha, DRAG_ALPHA) : next.alpha;
      renderPositions();
      startAnimation();
    });
  }

  function highlight(id: string | null): void {
    const related = new Set<string>(id === null ? [] : [id]);
    for (const { el: line, source, target } of linkEls) {
      const connected = source === id || target === id;
      line.classList.toggle('is-highlighted', connected);
      if (connected) related.add(source).add(target);
    }
    for (const [nodeId, node] of nodeEls) {
      node.classList.toggle('is-highlighted', related.has(nodeId));
    }
    svg.classList.toggle('has-highlight', id !== null);
  }

  function moveNode(id: string, client: Point): void {
    const point = toPoint(client);
    const x = (point.x - view.x) / view.scale;
    const y = (point.y - view.y) / view.scale;
    bodies = bodies.map(body => body.id === id ? { ...body, x, y, fixed: true } : body);
    alpha = Math.max(alpha, DRAG_ALPHA);
    renderPositions();
    startAnimation();
  }

  function pan(from: Point, to: Point): void {
    const a = toPoint(from);
    const b = toPoint(to);
    applyView({ ...view, x: view.x + b.x - a.x, y: view.y + b.y - a.y });
  }

  function handlePointerMove(e: MouseEvent): void {
    const current = drag!;
    const client = { x: e.clientX, y: e.clientY };
    if (!dragged && Math.hypot(client.x - current.start.x, client.y - current.start.y) < DRAG_THRESHOLD) return;
    dragged = true;
    if (current.id === null) {
      pan(current.last, client);
    } else {
      moveNode(current.id, client);
    }
    current.last = client;
  }

  function endDrag(): void {
    if (!drag) return;
    drag = null;
    bodies = bodies.map(body => ({ ...body, fixed: false }));
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', releaseDrag);
    window.removeEventListener('pointercancel', releaseDrag);
    window.removeEventListener('blur', releaseDrag);
  }

  /** End a drag by user input: the highlight stays only while the pointer is still on the node */
  function releaseDrag(): void {
    const id = drag?.id;
    endDrag();
    if (id && !nodeEls.get(id)?.matches(':hover')) highlight(null);
  }

  function startDrag(e: MouseEvent, id: string | null): void {
    if (e.button !== 0) return;
    // Prevent text selection while dragging
    e.preventDefault();
    endDrag();
    const client = { x: e.clientX, y: e.clientY };
    drag = { id, start: client, last: client };
    dragged = false;
    // Hold the pressed node still so that it does not slip away from under the pointer
    bodies = bodies.map(body => body.id === id ? { ...body, fixed: true } : body);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', releaseDrag);
    window.addEventListener('pointercancel', releaseDrag);
    // The pointerup is lost when the window loses focus during a drag
    window.addEventListener('blur', releaseDrag);
  }

  svg.addEventListener('pointerdown', (e) => startDrag(e, null));
  svg.addEventListener('wheel', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const delta = e.deltaMode === WheelEvent.DOM_DELTA_LINE ? e.deltaY * WHEEL_LINE_HEIGHT : e.deltaY;
    const point = toPoint({ x: e.clientX, y: e.clientY });
    applyView(zoomGraphView(view, point, Math.exp(-delta * ZOOM_SENSITIVITY)));
  }, { passive: false });

  function bindNodeEvents(node: SVGGElement, id: string): void {
    node.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      startDrag(e, id);
    });
    node.addEventListener('click', () => {
      if (!dragged) onSelectTag(id);
    });
    node.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      e.stopPropagation();
      onSelectTag(id);
    });
    const enter = (): void => highlight(id);
    const leave = (): void => {
      if (!drag) highlight(null);
    };
    node.addEventListener('pointerenter', enter);
    node.addEventListener('focus', enter);
    node.addEventListener('pointerleave', leave);
    node.addEventListener('blur', leave);
  }

  function rebuild(): void {
    endDrag();
    stopAnimation();
    const previous = new Map(bodies.map(body => [body.id, body]));
    const counts = graph.nodes.map(({ count }) => count);
    const min = Math.min(...counts);
    const max = Math.max(...counts);

    nodeEls.clear();
    nodeLayer.replaceChildren();
    bodies = graph.nodes.map(({ tag, count }, index) => {
      const radius = 4 + calculateTagCloudLevel(count, min, max) * 3;
      const node = createNodeElement(tag, count, radius);
      bindNodeEvents(node, tag.text);
      nodeEls.set(tag.text, node);
      nodeLayer.appendChild(node);
      const kept = previous.get(tag.text);
      return kept ? { ...kept, radius } : createGraphBody(tag.text, index, radius);
    });
    linkEls = graph.links.map(({ source, target, strength }) => ({
      el: createSvgElement('line', {
        class: 'comic-helper-tag-graph-link',
        'stroke-width': String(1 + strength * 3)
      }),
      source,
      target
    }));
    linkLayer.replaceChildren(...linkEls.map(link => link.el));
    highlight(null);

    alpha = previous.size > 0 ? UPDATE_ALPHA : 1;
    emptyEl.style.display = bodies.length > 0 ? 'none' : '';
    canvas.style.display = bodies.length > 0 ? '' : 'none';
    renderPositions();
    startAnimation();
  }

  applyView(view);
  rebuild();

  return {
    el,
    update: (favorites, excludedTypes) => {
      const next = buildTagGraph(favorites, excludedTypes);
      const nextSignature = JSON.stringify([
        next.nodes.map(({ tag, count }) => [tag.text, tag.type, count]),
        next.links
      ]);
      if (nextSignature === signature) return;
      signature = nextSignature;
      graph = next;
      rebuild();
    },
    setActive: (value) => {
      active = value;
      if (active) {
        startAnimation();
      } else {
        endDrag();
        stopAnimation();
        // A hidden node never receives pointerleave
        highlight(null);
      }
    },
    destroy: () => {
      active = false;
      endDrag();
      stopAnimation();
    }
  };
}
