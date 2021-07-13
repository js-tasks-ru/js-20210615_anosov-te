export default class RangePicker {
  element = null;
  subElements = {};
  selectingFrom = true;
  selected = {
    from: new Date(),
    to: new Date()
  };

  constructor({
                from = new Date(),
                to = new Date()
              } = {}) {
    this.showDateFrom = new Date(from);
    this.selected = {from, to};

    this.render();
  }

  formatDate(date) {
    return date.toLocaleString('ru', {dateStyle: 'short'});
  }

  dispatchEvent() {
    this.element.dispatchEvent(new CustomEvent('date-select', {
      bubbles: true,
      detail: this.selected
    }));
  }

  onDocumentClick = event => {
    const isOpen = this.element.classList.contains('rangepicker_open');
    const isRangePicker = this.element.contains(event.target);

    if (isOpen && !isRangePicker) {
      this.element.classList.remove('rangepicker_open');
    }
  };

  getTemplate() {
    return `<div class="rangepicker">
      <div class="rangepicker__input" data-element="input">
        <span data-element="from">${this.formatDate(this.selected.from)}</span> -
        <span data-element="to">${this.formatDate(this.selected.to)}</span>
      </div>
      <div class="rangepicker__selector" data-element="selector"></div>
    </div>`;
  }

  render() {
    const element = document.createElement('div');

    element.innerHTML = this.getTemplate();

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(element);

    document.addEventListener('click', this.onDocumentClick, true);

    this.subElements.input.addEventListener('click', () => {
      this.element.classList.toggle('rangepicker_open');
      this.renderDateRangePicker();
    });

    this.subElements.selector.addEventListener('click', event => this.onSelectorClick(event));
  }

  renderDateRangePicker() {
    const showDate1 = new Date(this.showDateFrom);
    const showDate2 = new Date(this.showDateFrom);
    const {selector} = this.subElements;

    showDate2.setMonth(showDate2.getMonth() + 1);

    selector.innerHTML = `
      <div class="rangepicker__selector-arrow"></div>
      <div class="rangepicker__selector-control-left"></div>
      <div class="rangepicker__selector-control-right"></div>
      ${this.renderCalendar(showDate1)}
      ${this.renderCalendar(showDate2)}
    `;

    const controlLeft = selector.querySelector('.rangepicker__selector-control-left');
    const controlRight = selector.querySelector('.rangepicker__selector-control-right');

    controlLeft.addEventListener('click', () => {
      this.showDateFrom.setMonth(this.showDateFrom.getMonth() - 1);
      this.renderDateRangePicker();
    });

    controlRight.addEventListener('click', () => {
      this.showDateFrom.setMonth(this.showDateFrom.getMonth() + 1);
      this.renderDateRangePicker();
    });

    this.renderHighlight();
  }

  renderCalendar(showDate) {
    const date = new Date(showDate);
    const getGridStartIndex = dayIndex => {
      const index = dayIndex === 0 ? 6 : (dayIndex - 1);
      return index + 1;
    };

    date.setDate(1);

    const monthStr = date.toLocaleString('ru', {month: 'long'});

    let table = `<div class="rangepicker__calendar">
      <div class="rangepicker__month-indicator">
        <time datetime=${monthStr}>${monthStr}</time>
      </div>
      <div class="rangepicker__day-of-week">
        <div>Пн</div><div>Вт</div><div>Ср</div><div>Чт</div><div>Пт</div><div>Сб</div><div>Вс</div>
      </div>
      <div class="rangepicker__date-grid">
    `;

    table += `
      <button type="button"
        class="rangepicker__cell"
        data-value="${date.toISOString()}"
        style="--start-from: ${getGridStartIndex(date.getDay())}">
          ${date.getDate()}
      </button>`;

    date.setDate(2);

    while (date.getMonth() === showDate.getMonth()) {
      table += `
        <button type="button"
          class="rangepicker__cell"
          data-value="${date.toISOString()}">
            ${date.getDate()}
        </button>`;

      date.setDate(date.getDate() + 1);
    }

    table += '</div></div>';

    return table;
  }

  renderHighlight() {
    const {from, to} = this.selected;
    const cells = this.element.querySelectorAll('.rangepicker__cell');

    for (const cell of cells) {
      const {value} = cell.dataset;
      const cellDate = new Date(value);

      cell.classList.remove('rangepicker__selected-from');
      cell.classList.remove('rangepicker__selected-to');
      cell.classList.remove('rangepicker__selected-between');

      if (from
        && value === from.toISOString()) {
        cell.classList.add('rangepicker__selected-from');
      } else if (to
        && value === to.toISOString()) {
        cell.classList.add('rangepicker__selected-to');
      } else if (from
        && to
        && cellDate >= from
        && cellDate <= to) {
        cell.classList.add('rangepicker__selected-between');
      }
    }

    if (from) {
      const selectedFrom = this.element.querySelector(`[data-value="${from.toISOString()}"]`);
      if (selectedFrom) {
        selectedFrom.closest('.rangepicker__cell').classList.add('rangepicker__selected-from');
      }
    }

    if (to) {
      const selectedTo = this.element.querySelector(`[data-value="${to.toISOString()}"]`);
      if (selectedTo) {
        selectedTo.closest('.rangepicker__cell').classList.add('rangepicker__selected-to');
      }
    }
  }

  onCellClick(target) {
    const {value} = target.dataset;

    if (value) {
      const dateValue = new Date(value);

      if (this.selectingFrom) {
        this.selected = {
          from: dateValue,
          to: null
        };
        this.selectingFrom = false;
        this.renderHighlight();
      } else {
        if (dateValue > this.selected.from) {
          this.selected.to = dateValue;
        } else {
          this.selected.to = this.selected.from;
          this.selected.from = dateValue;
        }

        this.selectingFrom = true;
        this.renderHighlight();
      }

      if (this.selected.from && this.selected.to) {
        this.dispatchEvent();
        this.element.classList.remove('rangepicker_open');
        this.subElements.from.innerHTML = this.formatDate(this.selected.from);
        this.subElements.to.innerHTML = this.formatDate(this.selected.to);
      }
    }
  }

  getSubElements(element) {
    const subElements = {};

    const dataElements = element.querySelectorAll('[data-element]');
    for (const subElement of dataElements) {
      subElements[subElement.dataset.element] = subElement;
    }

    return subElements;
  }

  remove() {
    this.element.remove();
    document.removeEventListener('click', this.onDocumentClick, true);
  }

  onSelectorClick({target}) {
    if (target.classList.contains('rangepicker__cell')) {
      this.onCellClick(target);
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};
    this.selectingFrom = true;
    this.selected = {
      from: new Date(),
      to: new Date()
    };
  }
}
