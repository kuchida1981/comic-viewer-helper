const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * ストローク（枠線）ベースのSVG要素を作成するヘルパー
 */
function createStrokeSvg(pathD: string, size = 18): SVGElement {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', size.toString());
  svg.setAttribute('height', size.toString());
  svg.setAttribute('fill', 'none');
  svg.style.display = 'inline-block';
  svg.style.verticalAlign = 'middle';

  const path = document.createElementNS(SVG_NS, 'path');
  path.setAttribute('d', pathD);
  path.setAttribute('stroke', 'currentColor');
  path.setAttribute('stroke-width', '2');
  path.setAttribute('stroke-linecap', 'round');
  path.setAttribute('stroke-linejoin', 'round');
  svg.appendChild(path);

  return svg;
}

/**
 * SVG要素を作成するヘルパー
 */
function createSvg(pathD: string, size = 18): SVGElement {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', size.toString());
  svg.setAttribute('height', size.toString());
  svg.setAttribute('fill', 'currentColor');
  // アイコンがベースラインに対して適切に配置されるように調整
  svg.style.display = 'inline-block';
  svg.style.verticalAlign = 'middle';

  const path = document.createElementNS(SVG_NS, 'path');
  path.setAttribute('d', pathD);
  svg.appendChild(path);

  return svg;
}

/**
 * ハートアイコン (塗りつぶし)
 */
export function createHeartFilledIcon(size = 18): SVGElement {
  // Material Design "favorite" icon path
  return createSvg('M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z', size);
}

/**
 * ピン留めアイコン (塗りつぶし) - ピン留め済み状態
 */
export function createPinFilledIcon(size = 14): SVGElement {
  // Material Design "push_pin" filled icon path
  return createSvg('M16 9V4h1c.55 0 1-.45 1-1s-.45-1-1-1H7c-.55 0-1 .45-1 1s.45 1 1 1h1v5c0 1.66-1.34 3-3 3v2h5.97v7l1 1 1-1v-7H19v-2c-1.66 0-3-1.34-3-3z', size);
}

/**
 * ピン留めアイコン (枠線) - 未ピン留め状態
 */
export function createPinOutlineIcon(size = 14): SVGElement {
  // Simple pin outline using stroke
  return createStrokeSvg('M12 3L8 10h3v7l1 1 1-1v-7h3L12 3zM9 10h6', size);
}

/**
 * ハートアイコン (枠線)
 */
export function createHeartOutlineIcon(size = 18): SVGElement {
  // Material Design "favorite_border" icon path
  return createSvg('M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z', size);
}
