const EventBus = {
  handlers: {},
  $on: function (eventName, handler) {
    if (!this.handlers[eventName]) {
      this.handlers[eventName] = [];
    }
    this.handlers[eventName].push(handler);
  },
  $emit: function (eventName, ...args) {
    const handlers = this.handlers[eventName];
    if (handlers) {
      handlers.forEach(handler => handler(...args));
    }
  },
  $off: function (eventName, handler) {
    const handlers = this.handlers[eventName];
    if (handlers) {
      this.handlers[eventName] = handlers.filter(h => h !== handler);
    }
  }
};