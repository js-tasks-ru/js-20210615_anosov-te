export default class NotificationMessage {
  static notificationElement;

  constructor(message, {duration = 2000, type = 'success'} = {}) {
    this.message = message;
    this.duration = duration;
    this.type = type;

    this.render();
  }

  render() {
    if (NotificationMessage.notificationElement) {
      NotificationMessage.notificationElement.remove();
    }

    const element = document.createElement("div");
    element.innerHTML = `
    <div class="timer"></div>
    <div class="inner-wrapper">
      <div class="notification-header">${this.type}</div>
      <div class="notification-body">
        ${this.message}
      </div>
    </div>
    `;
    element.classList.add("notification", this.type);

    this.element = element;
    NotificationMessage.notificationElement = this.element;
  }

  show(parentElement = document.body) {
    parentElement.append(this.element);
    this.startTimer(this.duration);
    setTimeout(() => {
      this.remove();
    }, this.duration);
  }

  startTimer(timeLeft) {
    setInterval(() => {
      if (timeLeft > 100) {
        timeLeft = timeLeft - 100;
        if (this.element) {
          this.element.setAttribute("style", "--value: " + timeLeft / 1000 + "s");
        }
      }
    }, 100);
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    NotificationMessage.notificationElement = null;
    this.remove();
  }
}
