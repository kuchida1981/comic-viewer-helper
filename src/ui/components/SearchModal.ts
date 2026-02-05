import { createElement } from '../utils';
import { t } from '../../i18n';

export interface SearchModalProps {
  onSearch: (query: string) => void;
  onClose: () => void;
}

export interface SearchModalComponent {
  el: HTMLElement;
  input: HTMLInputElement;
}

export function createSearchModal({ onSearch, onClose }: SearchModalProps): SearchModalComponent {
  const input = createElement('input', {
    className: 'comic-helper-search-input',
    attributes: {
      type: 'text',
      placeholder: t('ui.searchPlaceholder'),
      autofocus: 'true'
    }
  }) as HTMLInputElement;

  const submitBtn = createElement('button', {
    className: 'comic-helper-search-submit',
    textContent: t('ui.search'),
    attributes: {
      type: 'submit'
    }
  });

  const handleSubmit = () => {
    const query = input.value.trim();
    if (query) onSearch(query);
  };

  const form = createElement('form', {
    className: 'comic-helper-search-form',
    events: {
      submit: (e) => {
        e.preventDefault();
        handleSubmit();
      }
    }
  }, [input, submitBtn]);

  const container = createElement('div', {
    className: 'comic-helper-search-container'
  }, [form]);

  const closeBtn = createElement('button', {
    className: 'comic-helper-modal-close',
    textContent: '×',
    title: t('ui.close'),
    events: {
      click: (e) => {
        e.preventDefault();
        onClose();
      }
    }
  });

  const title = createElement('h2', {
    className: 'comic-helper-modal-title',
    textContent: t('ui.search')
  });

  const content = createElement('div', {
    className: 'comic-helper-modal-content',
    events: {
      click: (e) => e.stopPropagation()
    }
  }, [closeBtn, title, container]);

  const overlay = createElement('div', {
    className: 'comic-helper-modal-overlay',
    events: {
      click: onClose
    }
  }, [content]);

  // Autofocus doesn't always work when dynamically added
  setTimeout(() => input.focus(), 50);

  return {
    el: overlay,
    input
  };
}
