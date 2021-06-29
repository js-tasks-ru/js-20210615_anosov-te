export default class ColumnChart {
  constructor({
                data = [], label = '', link = '', value = 0, formatHeading = data => data,
                chartHeight = 50
              } = {}) {
    this.label = label;
    this.value = value;
    this.link = link;
    this.data = data;
    this.chartHeight = chartHeight;
    this.formatHeading = function (data) {
      return formatHeading(data);
    };

    this.render();
  }

  render() {
    const element = document.createElement("div");
    element.classList.add('column-chart');
    element.setAttribute("style", "--chart-height: " + this.chartHeight);

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

    const chartProps = this.getColumnProps(this.data);

    let charts = document.createDocumentFragment();
    for (let item of chartProps) {
      let itemDiv = document.createElement('div');
      itemDiv.setAttribute("style", "--value: " + item.value);
      itemDiv.setAttribute("data-tooltip", item.percent);
      charts.append(itemDiv);
    }

    element.querySelector('.column-chart__chart').append(charts);

    if (this.data.length === 0) {
      element.classList.add('column-chart_loading');
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
