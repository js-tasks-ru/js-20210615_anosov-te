import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm {
  defaultFormData = {
    title: '',
    description: '',
    quantity: 1,
    subcategory: '',
    status: 1,
    images: [],
    price: 100,
    discount: 0
  };

  constructor(productId) {
    this.productId = productId;
  }

  onSubmit = event => {
    event.preventDefault();
    this.save();
  };

  getTemplate() {
    return `
      <div class="product-form">
      <form data-element="productForm" class="form-grid">
        <div class="form-group form-group__half_left">
          <fieldset>
            <label class="form-label">Название товара</label>
            <input required
              id="title"
              value=""
              type="text"
              name="title"
              class="form-control"
              placeholder="Название товара">
          </fieldset>
        </div>
        <div class="form-group form-group__wide">
          <label class="form-label">Описание</label>
          <textarea required
            id="description"
            class="form-control"
            name="description"
            data-element="productDescription"
            placeholder="Описание товара"></textarea>
        </div>
        <div class="form-group form-group__wide" data-element="sortable-list-container">
          <label class="form-label">Фото</label>
          <ul class="sortable-list" data-element="imageListContainer">
            ${this.getImages()}
          </ul>
          <button data-element="uploadImage" type="button" class="button-primary-outline">
            <span>Загрузить</span>
          </button>
        </div>
        <div class="form-group form-group__half_left">
          <label class="form-label">Категория</label>
            ${this.selectCategory()}
        </div>
        <div class="form-group form-group__half_left form-group__two-col">
          <fieldset>
            <label class="form-label">Цена ($)</label>
            <input required
              id="price"
              value=""
              type="number"
              name="price"
              class="form-control"
              placeholder="${this.defaultFormData.price}">
          </fieldset>
          <fieldset>
            <label class="form-label">Скидка ($)</label>
            <input required
              id="discount"
              value=""
              type="number"
              name="discount"
              class="form-control"
              placeholder="${this.defaultFormData.discount}">
          </fieldset>
        </div>
        <div class="form-group form-group__part-half">
          <label class="form-label">Количество</label>
          <input required
            id="quantity"
            value=""
            type="number"
            class="form-control"
            name="quantity"
            placeholder="${this.defaultFormData.quantity}">
        </div>
        <div class="form-group form-group__part-half">
          <label class="form-label">Статус</label>
          <select id="status" class="form-control" name="status">
            <option value="1">Активен</option>
            <option value="0">Неактивен</option>
          </select>
        </div>
        <div class="form-buttons">
          <button type="submit" name="save" class="button-primary-outline">
            ${this.productId ? "Сохранить" : "Добавить"} товар
          </button>
        </div>
      </form>
    </div>
    `;
  }

  getEmptyTemplate() {
    return `<div>
      <h1 class="page-title">Страница не найдена</h1>
      <p>Извините, данный товар не существует</p>
    </div>`;
  }

  async render() {
    const categoriesPromise = this.getCategories();

    const productPromise = this.productId
      ? await this.getProduct(this.productId)
      : [this.defaultFormData];

    const [categoriesData, productResponse] = await Promise.all([categoriesPromise, productPromise]);

    const [productData] = productResponse;

    this.formData = productData;
    this.categories = categoriesData;

    const element = document.createElement('div');

    element.innerHTML = this.formData
      ? this.getTemplate()
      : this.getEmptyTemplate();

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(element);

    this.subElements.productForm.addEventListener('submit', this.onSubmit);
    this.subElements.uploadImage.addEventListener('click', this.onImageUpload);

    this.setFormData();

    return this.element;
  }

  onImageUpload = () => {
    const fileInput = document.createElement('input');

    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = this.uploadImage(fileInput);
    document.body.appendChild(fileInput);
    fileInput.click();
  };

  async uploadImage(fileInput) {
    const [file] = fileInput.files;

    if (file) {
      const formData = new FormData();
      const {uploadImage, imageListContainer} = this.subElements;

      formData.append('image', file);

      uploadImage.classList.add('is-loading');
      uploadImage.disabled = true;

      const result = await fetchJson('https://api.imgur.com/3/image', {
        method: 'POST',
        headers: {
          Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
        },
        body: formData
      });

      imageListContainer.append(this.getImageItem(result.data.link, file.name));

      uploadImage.classList.remove('is-loading');
      uploadImage.disabled = false;

      fileInput.remove();
    }
  }

  getImageItem(url, name) {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = `
      <li class="products-edit__imagelist-item sortable-list__item">
        <span>
          <img src="./icon-grab.svg" data-grab-handle alt="grab">
          <img class="sortable-table__cell-img" alt="${escapeHtml(name)}" src="${escapeHtml(url)}">
          <span>${escapeHtml(name)}</span>
        </span>
        <button type="button">
          <img src="./icon-trash.svg" alt="delete" data-delete-handle>
        </button>
      </li>`;

    return wrapper.firstElementChild;
  }

  getImages() {
    return this.formData.images.map(item => {
      return this.getImageItem(item.url, item.source).outerHTML;
    }).join('');
  }

  async save() {
    const product = this.getFormData();

    try {
      const result = await fetchJson(`${BACKEND_URL}/api/rest/products`, {
        method: this.productId ? 'PATCH' : 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(product)
      });

      this.dispatchEvent(result.id);
    } catch (error) {
      console.error('Error occurred while saving product', error);
    }
  }

  getFormData() {
    const excludedFields = ['images'];
    const fields = Object.keys(this.defaultFormData).filter(item => !excludedFields.includes(item));
    const values = {};

    for (const field of fields) {
      values[field] = this.subElements.productForm.querySelector(`#${field}`).value;
    }

    const imagesHTMLCollection = this.subElements.imageListContainer.querySelectorAll('.sortable-table__cell-img');

    values.id = this.productId;
    values.images = [...imagesHTMLCollection].map(image => {
      return {
        url: image.src,
        source: image.alt
      };
    });

    return values;
  }

  setFormData() {
    const excludedFields = ['images'];
    const fields = Object.keys(this.defaultFormData).filter(item => !excludedFields.includes(item));

    for (const field of fields) {
      const element = this.subElements.productForm.querySelector(`#${field}`);
      element.value = this.formData[field] || this.defaultFormData[field];
    }
  }

  dispatchEvent(id) {
    const event = this.productId
      ? new CustomEvent('product-updated', {detail: id})
      : new CustomEvent('product-saved');

    this.element.dispatchEvent(event);
  }

  async getProduct(productId) {
    return await fetchJson(`${BACKEND_URL}/api/rest/products?id=${productId}`);
  }

  async getCategories() {
    return await fetchJson(`${BACKEND_URL}/api/rest/categories?_sort=weight&_refs=subcategory`);
  }

  selectCategory() {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = `<select class="form-control" id="subcategory" name="subcategory"></select>`;

    const select = wrapper.firstElementChild;

    for (const category of this.categories) {
      for (const child of category.subcategories) {
        select.append(new Option(`${category.title} > ${child.title}`, child.id));
      }
    }

    return select.outerHTML;
  }

  getSubElements(element) {
    const subElements = {};
    const elements = element.querySelectorAll('[data-element]');

    for (const item of elements) {
      subElements[item.dataset.element] = item;
    }

    return subElements;
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = null;
  }

  remove() {
    this.element.remove();
  }
}
