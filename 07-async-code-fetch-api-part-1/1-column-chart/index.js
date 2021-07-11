import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChart {
  constructor({
    url = '',
    range = {
      from: new Date(),
      to: new Date()
    },
    label = '',
    link = '',
    formatHeading = data => data,
    chartHeight = 50
  } = {}) {
    this.label = label;
    this.link = link;
    this.chartHeight = chartHeight;
    this.formatHeading = function (data) {
      return formatHeading(data);
    };

    this.range = range;
    this.url = new URL(url, BACKEND_URL);

    this.render();
    this.update(this.range.from, this.range.to);
  }

  async fetchData(from, to) {
    this.url.searchParams.set('from', from.toISOString());
    this.url.searchParams.set('to', to.toISOString());

    return await fetchJson(this.url);
  }

  getChartValue(data) {
    return this.formatHeading(Object.values(data).reduce((accum, item) => (accum + item), 0));
  }

  getColumnProps(data) {
    const maxValue = Math.max(...Object.values(data));

    const dataEntries = Object.entries(data);

    let html = '';
    for (let entry of dataEntries) {
      const value = dataEntries[entry];
      const scale = this.chartHeight / maxValue;
      const percent = (value / maxValue * 100).toFixed(0);
      const tooltip = `<span>
        <small>${entry.toLocaleString('default', {dateStyle: 'medium'})}</small>
        <br>
        <strong>${percent}%</strong>
      </span>`;

      html = html + `<div style="--value: ${Math.floor(value * scale)}" data-tooltip="${tooltip}"></div>`;
    }

    return html;
  }

  getTemplateHtml() {
    return `
      <div class="column-chart column-chart_loading" style="--chart-height: ${this.chartHeight}">
        <div class="column-chart__title">
          ${this.label}
          <a href="${this.link}" class="column-chart__link">View all</a>
        </div>
        <div class="column-chart__container">
          <div data-element="header" class="column-chart__header"></div>
          <div data-element="body" class="column-chart__chart"></div>
        </div>
      </div>
    `;
  }

  render() {
    const element = document.createElement('div');

    element.innerHTML = this.getTemplateHtml();

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  async update(from, to) {
    const data = await this.fetchData(from, to);

    this.range.from = from;
    this.range.to = to;

    if (!data || Object.values(data).length === 0) {
      this.element.classList.add('column-chart_loading');
    }

    if (data && Object.values(data).length !== 0) {
      this.subElements.header.textContent = this.getChartValue(data);
      this.subElements.body.innerHTML = this.getColumnProps(data);
    }

    return data;
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
