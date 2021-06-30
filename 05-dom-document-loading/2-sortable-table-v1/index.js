export default class SortableTable {
  constructor(headerConfig = [], data = {}) {
    this.headerConfig = headerConfig;
    this.data = data.data;

    this.render();
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
    return `
      <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}">
        <span>${title}</span>
        <span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
        </span>
      </div>
    `;
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

  getTableRow (item) {
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
        row.push(headerTemplate.template(item(headerTemplate.id)));
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

  render() {
    const element = document.createElement('div');

    element.innerHTML = this.getTable();

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((acc, item) => {
      acc[item.dataset.element] = item;
      return acc;
    }, {});
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.subElements = {};
  }
}

