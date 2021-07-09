class Tooltip {
  static instance;

  constructor() {
    if (Tooltip.instance) {
      return Tooltip.instance;
    }

    Tooltip.instance = this;
  }

  pointerOver = event => {
    const element = event.target.closest('[data-tooltip]');

    if (element) {
      this.render(element.dataset.tooltip);
      this.moveTooltip(event);

      document.addEventListener('pointermove', this.pointerMove);
    }
  };

  pointerOut = () => {
    this.removeTooltip();
  };

  pointerMove = event => {
    this.moveTooltip(event);
  };

  render(tooltipText) {
    this.element = document.createElement('span');
    this.element.className = 'tooltip';
    this.element.innerHTML = tooltipText;

    document.body.append(this.element);
  }

  initialize() {
    document.addEventListener('pointerover', this.pointerOver);
    document.addEventListener('pointerout', this.pointerOut);
  }

  removeTooltip() {
    if (this.element) {
      this.element.remove();
      this.element = null;

      document.removeEventListener('pointermove', this.pointerMove);
    }
  }

  moveTooltip(event) {
    this.element.style.top = `${event.clientY + 5}px`;
    this.element.style.left = `${event.clientX + 5}px`;
  }

  destroy() {
    this.removeTooltip();
    document.removeEventListener('pointerover', this.pointerOver);
    document.removeEventListener('pointerout', this.pointerOut);
  }
}

export default Tooltip;
