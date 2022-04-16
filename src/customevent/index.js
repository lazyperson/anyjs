export class Custom {
  
  on (name, cb) {
    window.addEventListener(name, (e) => {
      cb(e.detail);
    });
  }
  
  emit(name, data) {
    const event = new CustomEvent(name, {
      detail: data
    });
    window.dispatchEvent(event);
  }
}
