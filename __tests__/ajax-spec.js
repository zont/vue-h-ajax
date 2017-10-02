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
  open() {}
  abort() {
    this._rise('abort');
  }
  addEventListener(type, listener) {
    if (!this.listeners[type]) {
      this.listeners[type] = new Set();
    }

    this.listeners[type].add(listener);
  }
  setRequestHeader() {}

  _rise(type) {
    if (this.listeners[type]) {
      [...this.listeners[type]]
        .reverse()
        .forEach(listener => listener());
    }
  }
};

class XMLHttpRequest404{
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
  open() {}
  abort() {
    this._rise('abort');
  }
  addEventListener(type, listener) {
    if (!this.listeners[type]) {
      this.listeners[type] = new Set();
    }

    this.listeners[type].add(listener);
  }
  setRequestHeader() {}

  _rise(type) {
    if (this.listeners[type]) {
      [...this.listeners[type]]
        .reverse()
        .forEach(listener => listener());
    }
  }
}


const httpHelper = (method, data, headers, done) => {
  Vue.http[method]('/some_url', data, headers)
    .then(done)
    .catch(done.fail);
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
    it('without data', done => httpHelper('get', null, null, done));

    it('with data', done => httpHelper('get', {param1: 'ddd'}, null, done));

    it('with data and headers', done => {
      Vue.http.get('/some_url?param2=aaa', {param1: 'ddd'}, {header1: 'value1'})
        .then(done)
        .catch(done.fail);
    });

    it('without data and with headers', done => httpHelper('get', null, {header1: 'value1'}, done));
  });

  describe('post', () => {
    it('without data', done => httpHelper('post', null, null, done));

    it('with data', done => httpHelper('post', new FormData(), null, done));

    it('with data and headers', done => httpHelper('post', {param1: 'ddd'}, {header1: 'value1'}, done));

    it('without data and with headers', done => httpHelper('post', null, {header1: 'value1'}, done));
  });

  describe('put', () => {
    it('without data', done => httpHelper('put', null, null, done));

    it('with data', done => httpHelper('put', {param1: 'ddd'}, null, done));

    it('with data and headers', done => httpHelper('put', {param1: 'ddd'}, {header1: 'value1'}, done));

    it('without data and with headers', done => httpHelper('put', null, {header1: 'value1'}, done));
  });

  describe('delete', () => {
    it('without data', done => httpHelper('delete', null, null, done));

    it('with data', done => httpHelper('delete', {param1: 'ddd'}, null, done));

    it('with data and headers', done => httpHelper('delete', {param1: 'ddd'}, {header1: 'value1'}, done));

    it('without data and with headers', done => httpHelper('delete', null, {header1: 'value1'}, done));
  });

  it('stop', done => {
    const url = '/some_url';

    Vue.http.get(url)
      .then(done.fail)
      .catch(done);

    Vue.http.stop('/undefined_url');

    expect(true).toBeTruthy();

    Vue.http.stop(url);
  });

  it('reject', done => {
    window.XMLHttpRequest = XMLHttpRequest404;

    Vue.http.get('/some_url')
      .then(done.fail)
      .catch(done);
  });
});
