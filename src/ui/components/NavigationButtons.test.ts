import { describe, it, expect, vi } from 'vitest';
import { createNavigationButtons } from './NavigationButtons';

describe('NavigationButtons', () => {
  const mockProps = {
    onFirst: vi.fn(),
    onPrev: vi.fn(),
    onNext: vi.fn(),
    onLast: vi.fn(),
    onInfo: vi.fn(),
    onHelp: vi.fn(),
    onSearch: vi.fn(),
    onLucky: vi.fn(),
    onToggleFavorite: vi.fn(),
    onFavoritesList: vi.fn()
  };

  it('should render all buttons and handle clicks', () => {
    const { elements } = createNavigationButtons(mockProps);
    expect(elements.length).toBe(10);

    // Test a few buttons
    const luckyBtn = elements.find(el => el.id === 'comic-helper-nav-lucky') as HTMLElement;
    expect(luckyBtn).toBeDefined();
    luckyBtn.click();
    expect(mockProps.onLucky).toHaveBeenCalled();

    const searchBtn = elements.find(el => el.textContent === '🔍') as HTMLElement;
    searchBtn.click();
    expect(mockProps.onSearch).toHaveBeenCalled();
  });

  it('should update favorite and lucky loading states', () => {
    const { elements, update } = createNavigationButtons(mockProps);
    const favBtn = elements.find(el => el.id === 'comic-helper-nav-fav') as HTMLElement;
    const luckyBtn = elements.find(el => el.id === 'comic-helper-nav-lucky') as HTMLButtonElement;

    // Favorite state
    update(true, false);
    expect(favBtn.querySelector('svg')).toBeDefined();
    expect(favBtn.classList.contains('active')).toBe(true);

    update(false, false);
    expect(favBtn.querySelector('svg')).toBeDefined();
    expect(favBtn.classList.contains('inactive')).toBe(true);

    // Lucky loading state
    update(false, true);
    expect(luckyBtn.disabled).toBe(true);
    expect(luckyBtn.textContent).toBe('⏳');
    expect(luckyBtn.classList.contains('loading')).toBe(true);

    update(false, false);
    expect(luckyBtn.disabled).toBe(false);
    expect(luckyBtn.textContent).toBe('🎲');
    expect(luckyBtn.classList.contains('loading')).toBe(false);
  });
});
