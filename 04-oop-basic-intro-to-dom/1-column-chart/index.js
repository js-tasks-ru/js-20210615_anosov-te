export default class ColumnChart {
  constructor(params) {
    if (params === undefined) {
      params = {
        label: "",
        link: "",
        value: 0,
        data: [],
        formatHeading: function () {
          return 0;
        },
        chartHeight: 50
      };
    }

    this.label = params.label === undefined ? "" : params.label;
    this.value = params.value === undefined ? 0 : params.value;
    this.link = params.link === undefined ? "" : params.link;
    this.data = params.data === undefined ? [] : params.data;
    this.chartHeight = params.chartHeight === undefined ? 50 : params.chartHeight;
    this.formatHeading = params.formatHeading === undefined ? function () {
      return params.value;
    } : params.formatHeading;
    this.render();
  }

  render() {
    const element = document.createElement("div");
    element.classList.add('column-chart');
    element.setAttribute("style", "--chart-height: " + this.chartHeight);

    if (this.data.length === 0) {
      element.classList.add('column-chart_loading');
      element.innerHTML = `
          <div class="column-chart__title">
            ${this.label}
            <a class="column-chart__link" href="${this.link}">View all</a>
          </div>
          <div class="column-chart__container">
            <div data-element="header" class="column-chart__header">
              ${this.formatHeading(this.value)}
            </div>
            <div data-element="body" class="column-chart__chart">

            </div>
          </div>
      `;
    } else {
      const chartProps = this.getColumnProps(this.data);

      let charts = document.createDocumentFragment();
      for (let item of chartProps) {
        let itemDiv = document.createElement('div');
        itemDiv.setAttribute("style", "--value: " + item.value);
        itemDiv.setAttribute("data-tooltip", item.percent);
        charts.appendChild(itemDiv);
      }

      element.innerHTML = `
        <div class="column-chart__title">
          ${this.label}
          <a href="${this.link}" class="column-chart__link">View all</a>
        </div>
        <div class="column-chart__container">
          <div data-element="header" class="column-chart__header">${this.formatHeading(this.value)}</div>
          <div data-element="body" class="column-chart__chart">
          </div>
        </div>
    `;

      element.querySelector('.column-chart__chart').appendChild(charts);
    }

    this.element = element;
  }

  update(params) {
    this.data = params.data === undefined ? [] : params.data;
    this.render();
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }

  getColumnProps(data) {
    const maxValue = Math.max(...data);
    const scale = 50 / maxValue;

    return data.map(item => {
      return {
        percent: (item / maxValue * 100).toFixed(0) + '%',
        value: String(Math.floor(item * scale))
      };
    });
  }
}
