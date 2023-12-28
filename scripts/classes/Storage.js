class Storage {
  constructor(key) {
    this.localStorageData = JSON.parse(localStorage.getItem(key));

    if (this.localStorageData) {
      Object.assign(this, this.localStorageData);
    }

    window.addEventListener("beforeunload", this.save.bind(this, key));
  }

  save(key) {
    const { localStorageData, ...properties } = this;
    const data = JSON.stringify(properties);

    localStorage.setItem(key, data);
  }
}
