export default class SortableList {
  onPointerMove = ({ clientX, clientY }) => {
    this.moveDraggingAt(clientX, clientY);

    const previous = this.placeholderElement.previousElementSibling;
    const next = this.placeholderElement.nextElementSibling;

    const { firstElement, lastElement } = this.element;
    const { top: firstElementTop } = firstElement.getBoundingClientRect();
    const { lastElementBottom } = this.element.getBoundingClientRect();

    if (clientY < firstElementTop) {
      return firstElement.before(this.placeholderElement);
    }

    if (clientY > lastElementBottom) {
      return lastElement.after(this.placeholderElement);
    }

    if (previous) {
      const {top, height} = previous.getBoundingClientRect();

      if (clientY < top + height / 2) {
        return previous.before(this.placeholderElement);
      }
    }

    if (next) {
      const {top, height} = next.getBoundingClientRect();

      if (clientY > top + height / 2) {
        return next.after(this.placeholderElement);
      }
    }
  };

  onPointerUp = () => {
    this.dragStop();
  };

  constructor({ items = [] } = {}) {
    this.items = items;

    this.render();
  }

  render() {
    this.element = document.createElement('ul');
    this.element.className = 'sortable-list';

    this.items.forEach(item => item.classList.add('sortable-list__item'));
    this.element.append(...this.items);

    this.initEventListeners();
  }

  initEventListeners() {
    document.addEventListener('pointerup', this.onPointerUp);
    document.addEventListener('pointermove', this.onPointerMove);
    this.element.addEventListener('pointerdown', event => {
      this.onPointerDown(event);
    });
  }

  removeEventListeners() {
    document.removeEventListener('pointerup', this.onPointerUp);
    document.removeEventListener('pointermove', this.onPointerMove);
  }

  onPointerDown (event) {
    const element = event.target.closest('.sortable-list__item');

    if (element) {
      if (event.target.closest('[data-grab-handle]')) {
        event.preventDefault();

        this.dragStart(element, event);
      }

      if (event.target.closest('[data-delete-handle]')) {
        event.preventDefault();

        element.remove();
      }
    }
  }

  dragStart(element, {clientX, clientY}) {
    this.draggingElem = element;
    this.elementInitialIndex = [...this.element.children].indexOf(element);

    const { x, y } = element.getBoundingClientRect();
    const { offsetWidth, offsetHeight } = element;

    this.pointerShift = {
      x: clientX - x,
      y: clientY - y
    };

    this.draggingElem.style.width = `${offsetWidth}px`;
    this.draggingElem.style.height = `${offsetHeight}px`;
    this.draggingElem.classList.add('sortable-list__item_dragging');

    this.placeholderElement = this.createPlaceholderElement(offsetWidth, offsetHeight);

    this.draggingElem.after(this.placeholderElement);
    this.element.append(this.draggingElem);
    this.moveDraggingAt(clientX, clientY);
  }

  moveDraggingAt(clientX, clientY) {
    this.draggingElem.style.left = clientX - this.pointerShift.x + 'px';
    this.draggingElem.style.top = clientY - this.pointerShift.y + 'px';
  }

  dragStop() {
    const placeholderIndex = [...this.element.children].indexOf(this.placeholderElement);

    this.draggingElem.style.cssText = '';
    this.draggingElem.classList.remove('sortable-list__item_dragging');
    this.placeholderElement.replaceWith(this.draggingElem);
    this.draggingElem = null;

    if (placeholderIndex !== this.elementInitialIndex) {
      this.dispatchEvent('sortable-list-reorder', {
        from: this.elementInitialIndex,
        to: placeholderIndex
      });
    }
  }

  dispatchEvent (type, details) {
    this.element.dispatchEvent(new CustomEvent(type, {
      bubbles: true,
      details
    }));
  }

  createPlaceholderElement (width, height) {
    const element = document.createElement('li');

    element.className = 'sortable-list__placeholder';
    element.style.width = `${width}px`;
    element.style.height = `${height}px`;

    return element;
  }

  remove () {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy () {
    this.remove();
    this.removeEventListeners();
  }
}
