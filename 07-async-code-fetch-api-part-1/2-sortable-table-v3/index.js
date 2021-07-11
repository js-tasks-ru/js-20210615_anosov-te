import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
  constructor(headersConfig, {
    url = '',
    data = [],
    sorted = {},
    isSortLocally = false,
    step = 20,
    start = 1,
    end = start + step
  } = {}) {
    this.url = new URL(url, BACKEND_URL);
    this.headerConfig = headersConfig;
    this.data = data;
    this.sorted = sorted;
    this.isSortLocally = isSortLocally;
    this.step = step;
    this.start = start;
    this.end = end;

    this.render();
  }

  scrollOnLoad = async () => {
    if (!this.isSortLocally
      && !this.loading
      && this.element.getBoundingClientRect() < document.documentElement.clientHeight) {
      this.loading = true;
      this.start = this.end;
      this.end = this.start + this.step;

      const data = await this.fetchData(this.sorted.id, this.sorted.order, this.start, this.end);

      this.update(data);

      this.loading = false;
    }
  };

  sortOnClick = event => {
    const column = event.target.closest('[data-sortable="true"]');

    const chooseOrder = order => {
      const orders = {
        asc: 'desc',
        desc: 'asc'
      };

      return orders[order];
    };

    if (column) {
      const {id, order} = column.dataset;
      const arrow = column.querySelector('.sortable-table__sort-arrow');
      if (!arrow) {
        column.append(this.subElements.arrow);
      }

      column.dataset.order = chooseOrder(order);

      if (this.isSortLocally) {
        this.sortOnClient(id, column.dataset.order);
      } else {
        this.sortOnServer(id, column.dataset.order, 1, 1 + this.step);
      }
    }
  };

  sortOnClient(id, order) {
    const sortedData = this.sortTable(id, order);

    this.subElements.body.innerHTML = this.getTableRows(sortedData);
  }

  async sortOnServer(id, order, start, end) {
    const data = await this.fetchData(id, order, start, end);

    this.renderData(data);
  }

  async fetchData(id, order, start = this.start, end = this.end) {
    this.element.classList.add('sortable-table_loading');

    this.url.searchParams.set('_sort', id);
    this.url.searchParams.set('_order', order);
    this.url.searchParams.set('_start', start);
    this.url.searchParams.set('_end', end);

    const data = await fetchJson(this.url);

    this.element.classList.remove('sortable-table_loading');

    return data;
  }

  getHeader() {
    return `<div data-element="header" class="sortable-table__header sortable-table__row">
      ${this.getHeaderRows()}
    </div>`;
  }

  getHeaderRows() {
    const rows = [];
    for (let header of this.headerConfig) {
      rows.push(this.buildHeaderRow(header));
    }

    return rows.join('');
  }

  buildHeaderRow({id, title, sortable}) {
    const order = this.sorted.id === id ? this.sorted.order : 'asc';

    return `
      <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}" data-order="${order}">
        <span>${title}</span>
        ${this.getArrow(id)}
        </div>`;
  }

  getArrow(id) {
    return this.sorted.id === id
      ? `<span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
        </span>`
      : '';
  }

  getBody() {
    return `
      <div data-element="body" class="sortable-table__body">
        ${this.getTableRows(this.data)}
      </div>`;
  }

  getTableRows(data) {
    return data.map(item => {
      return `
      <a href="/products/${item.id}" class="sortable-table__row">
        ${this.getTableRow(item)}
      </a>`;
    }).join('');
  }

  getTableRow(item) {
    const headerTemplates = [];
    for (let headerRow of this.headerConfig) {
      headerTemplates.push({
        id: headerRow.id,
        template: headerRow.template
      });
    }

    const row = [];
    for (let headerTemplate of headerTemplates) {
      if (headerTemplate.template) {
        row.push(headerTemplate.template(item[headerTemplate.id]));
      } else {
        row.push(`<div class="sortable-table__cell">${item[headerTemplate.id]}</div>`);
      }
    }

    return row.join('');
  }

  getTable() {
    return `
      <div class="sortable-table">
        ${this.getHeader()}
        ${this.getBody()}
      </div>`;
  }

  sort(field, order) {
    const sortedData = this.sortTable(field, order);

    this.subElements.body.innerHTML = this.getTableRows(sortedData);
  }

  sortTable(field = 'title', order = 'asc') {
    const copy = [...this.data];
    const headerColumn = this.headerConfig.find(item => item.id === field);
    const sortType = headerColumn ? headerColumn.sortType : '';
    const directions = {
      asc: 1,
      desc: -1
    };

    const direction = directions[order];

    return copy.sort((firstItem, secondItem) => {
      switch (sortType) {
      case 'string':
        return direction * firstItem[field].localeCompare(secondItem[field], ['ru', 'en'], {caseFirst: 'upper'});
      case 'number':
        return direction * (firstItem[field] - secondItem[field]);
      default:
        return direction * (firstItem[field] - secondItem[field]);
      }
    });
  }

  async render() {
    const element = document.createElement('div');

    element.innerHTML = this.getTable();

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);

    const data = await this.fetchData(this.sorted.id, this.sorted.order, this.start, this.end);
    this.renderData(data);

    this.subElements.header.addEventListener('pointerdown', this.sortOnClick);
    document.addEventListener('scroll', this.scrollOnLoad);
  }

  renderData(data) {
    if (data.length) {
      this.element.classList.remove('sortable-table_empty');
      this.subElements.body.innerHTML = this.getTableRows(data);
      this.data = data;
    } else {
      this.element.classList.add('sortable-table_empty');
    }
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((acc, item) => {
      acc[item.dataset.element] = item;
      return acc;
    }, {});
  }

  update(data) {
    const rows = document.createElement('div');

    this.data.push(...data);
    rows.innerHTML = this.getTableRows(data);

    this.subElements.body.append(...rows.childNodes);
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }

    if (this.subElements && this.subElements.header) {
      this.subElements.header.removeEventListener('pointerdown', this.sortOnClick);
    }
  }

  destroy() {
    this.remove();
    this.subElements = {};
  }
}
