import Vue from 'vue/dist/vue.min';
import ajax from 'vue-h-ajax';

window.XMLHttpRequest = class {
  constructor() {
    this.listeners = {};
    this.status = 0;
  }
  send() {
    setTimeout(() => {
      this._rise('progress');
      this.status = 200;
      this.response = '';
      this._rise('load');
    }, 0);
  }
  open() { }
  abort() {
    this._rise('abort');
  }
  addEventListener(type, listener) {
    if (!this.listeners[type]) {
      this.listeners[type] = new Set();
    }

    this.listeners[type].add(listener);
  }
  setRequestHeader() { }

  _rise(type) {
    if (this.listeners[type]) {
      [...this.listeners[type]]
        .reverse()
        .forEach(listener => listener());
    }
  }
};

class XMLHttpRequest404 {
  constructor() {
    this.listeners = {};
    this.status = 0;
  }
  send() {
    setTimeout(() => {
      this._rise('progress');
      this.status = 404;
      this.response = '';
      this._rise('load');
    }, 0);
  }
  open() { }
  abort() {
    this._rise('abort');
  }
  addEventListener(type, listener) {
    if (!this.listeners[type]) {
      this.listeners[type] = new Set();
    }

    this.listeners[type].add(listener);
  }
  setRequestHeader() { }

  _rise(type) {
    if (this.listeners[type]) {
      [...this.listeners[type]]
        .reverse()
        .forEach(listener => listener());
    }
  }
}

const httpHelper = async (method, data, headers) => {
  await Vue.http[method]('/some_url', data, headers);
};

describe('router', () => {
  it('defined', () => {
    expect(ajax.install).toBeDefined();

    Vue.use(ajax);

    const app = new Vue({
      template: '<div></div>'
    });

    expect(Vue.http).toBeDefined();
    expect(app.$http).toBe(Vue.http);
    expect(app.$http.withCredentials).toBeTruthy();

    [
      'headers',
      'get',
      'post',
      'put',
      'delete',
      'stop'
    ].forEach(name => expect(app.$http[name]).toBeDefined());

    [
      'get',
      'post',
      'put',
      'delete'
    ].forEach(name => expect(app.$http[name].length).toBe(3));

    expect(app.$http.stop.length).toBe(1);
  });

  describe('get', () => {
    it('without data', () => httpHelper('get', null, null));

    it('with data', () => httpHelper('get', { param1: 'ddd' }, null));

    it('with data and headers', async () => {
      await Vue.http.get('/some_url?param2=aaa', { param1: 'ddd' }, { header1: 'value1' });
    });

    it('without data and with headers', () => httpHelper('get', null, { header1: 'value1' }));
  });

  describe('post', () => {
    it('without data', () => httpHelper('post', null, null));

    it('with data', () => httpHelper('post', new FormData(), null));

    it('with data and headers', () => httpHelper('post', { param1: 'ddd' }, { header1: 'value1' }));

    it('without data and with headers', () => httpHelper('post', null, { header1: 'value1' }));
  });

  describe('put', () => {
    it('without data', () => httpHelper('put', null, null));

    it('with data', () => httpHelper('put', { param1: 'ddd' }, null));

    it('with data and headers', () => httpHelper('put', { param1: 'ddd' }, { header1: 'value1' }));

    it('without data and with headers', () => httpHelper('put', null, { header1: 'value1' }));
  });

  describe('delete', () => {
    it('without data', () => httpHelper('delete', null, null));

    it('with data', () => httpHelper('delete', { param1: 'ddd' }, null));

    it('with data and headers', () => httpHelper('delete', { param1: 'ddd' }, { header1: 'value1' }));

    it('without data and with headers', () => httpHelper('delete', null, { header1: 'value1' }));
  });

  it('stop', async () => {
    expect.assertions(1);

    const url = '/some_url';

    try {
      const req = Vue.http.get(url);

      Vue.http.stop(url);

      await req;

      expect(false).toBeTruthy();
    } catch (e) {
      expect(true).toBeTruthy();
    }
  });

  it('reject', async () => {
    expect.assertions(1);

    window.XMLHttpRequest = XMLHttpRequest404;

    try {
      await Vue.http.get('/some_url');
      expect(false).toBeTruthy();
    } catch (e) {
      expect(true).toBeTruthy();
    }
  });
});
