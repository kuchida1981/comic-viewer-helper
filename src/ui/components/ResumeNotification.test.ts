import { describe, it, expect, vi, afterEach } from 'vitest';
import { createResumeNotification } from './ResumeNotification';

describe('ResumeNotification', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
    document.body.innerHTML = '';
  });

  it('should call onResume and cleanup', () => {
    const onResume = vi.fn();
    const { el } = createResumeNotification({ savedIndex: 5, onResume, onSkip: vi.fn() });
    document.body.appendChild(el);
    
    const continueBtn = el.querySelector('.comic-helper-resume-continue') as HTMLElement;
    expect(continueBtn).not.toBeNull();
    continueBtn.click();
    expect(onResume).toHaveBeenCalled();
    expect(el.parentNode).toBeNull();
  });

  it('should call onSkip and cleanup', () => {
    const onSkip = vi.fn();
    const { el } = createResumeNotification({ savedIndex: 5, onResume: vi.fn(), onSkip });
    document.body.appendChild(el);

    const skipBtn = el.querySelector('.comic-helper-resume-skip') as HTMLElement;
    expect(skipBtn).not.toBeNull();
    
    skipBtn.click();
    expect(onSkip).toHaveBeenCalled();
    expect(el.parentNode).toBeNull();
  });

  it('should cleanup when close button is clicked', () => {
    const { el } = createResumeNotification({ savedIndex: 5, onResume: vi.fn(), onSkip: vi.fn() });
    document.body.appendChild(el);

    const closeBtn = el.querySelector('.comic-helper-resume-close') as HTMLElement;
    closeBtn.click();
    expect(el.parentNode).toBeNull();
  });

  it('should auto-hide after 15 seconds', () => {
    vi.useFakeTimers();
    const { el } = createResumeNotification({ savedIndex: 5, onResume: vi.fn(), onSkip: vi.fn() });
    document.body.appendChild(el);

    vi.advanceTimersByTime(15000);
    expect(el.parentNode).toBeNull();
  });
});
