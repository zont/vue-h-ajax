const CODE_SUCCESS = 200;
const CODE_FAIL = 300;
const requests = {};


function instanceOf(src, name) {
  try {
    return src instanceof window[name];
  } catch (e) {
    return false;
  }
}

function parseRequestData(params) {
  if (
    // ArrayBufferView
  instanceOf(params, 'Int8Array') ||
  instanceOf(params, 'Uint8Array') ||
  instanceOf(params, 'Uint8ClampedArray') ||
  instanceOf(params, 'Int16Array') ||
  instanceOf(params, 'Uint16Array') ||
  instanceOf(params, 'Int32Array') ||
  instanceOf(params, 'Uint32Array') ||
  instanceOf(params, 'Float32Array') ||
  instanceOf(params, 'Float64Array') ||
  instanceOf(params, 'DataView') ||
  // Blob
  instanceOf(params, 'Blob') ||
  // Document
  instanceOf(params, 'HTMLDocument') ||
  instanceOf(params, 'XMLDocument') ||
  // DOMString
  instanceOf(params, 'String') ||
  typeof params === 'string' ||
  // FormData
  instanceOf(params, 'FormData')
  ) {
    return params;
  }

  return JSON.stringify(params);
}

function parseResponseData(data, defaults) {
  try {
    return JSON.parse(data);
  } catch (e) {
    return defaults;
  }
}

function makeGetUrl(url, data) {
  return url + (url.indexOf('?') !== -1 ? '&' : '?') + Object.keys(data)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
    .join('&');
}

function request(method, url, data, headers, withCredentials) {
  const xhr = new XMLHttpRequest();
  xhr.withCredentials = withCredentials;

  const promise = new Promise((resolve, reject) => {
    xhr.open(method, url, true);

    Object.keys(headers).forEach(name => xhr.setRequestHeader(name, headers[name]));

    xhr.addEventListener('timeout', reject);
    xhr.addEventListener('abort', reject);
    xhr.addEventListener('error', reject);
    xhr.addEventListener('load', () => {
      requests[promise.url].splice(requests[promise.url].indexOf(promise), 1);

      if (CODE_SUCCESS <= xhr.status && xhr.status < CODE_FAIL) {
        resolve(parseResponseData(xhr.response, xhr.response));
      } else {
        reject(parseResponseData(xhr.response, xhr));
      }
    });
  });

  promise.abort = xhr.abort.bind(xhr);

  xhr.send(data);

  return promise;
}

function add(url, request) {
  request.url = url;
  requests[url] = requests[url] || [];
  requests[url].push(request);
  return request;
}


const ajax = {
  headers: {},

  withCredentials: true,

  get(url, data, headers) {
    return add(url, request(
      'GET',
      data ? makeGetUrl(url, data) : url,
      null,
      Object.assign({}, this.headers, headers),
      this.withCredentials
    ));
  },

  post(url, data, headers) {
    return add(url, request(
      'POST',
      url,
      parseRequestData(data),
      Object.assign({}, this.headers, headers),
      this.withCredentials
    ));
  },

  put(url, data, headers) {
    return add(url, request(
      'PUT',
      url,
      parseRequestData(data),
      Object.assign({}, this.headers, headers),
      this.withCredentials
    ));
  },

  patch(url, data, headers) {
    return add(url, request(
      'PATCH',
      url,
      parseRequestData(data),
      Object.assign({}, this.headers, headers),
      this.withCredentials
    ));
  },

  delete(url, data, headers) {
    return add(url, request(
      'DELETE',
      url,
      parseRequestData(data),
      Object.assign({}, this.headers, headers),
      this.withCredentials
    ));
  },

  stop(url) {
    (requests[url] || []).forEach(request => request.abort());
    requests[url] = [];
  }
};


module.exports = {
  install(Vue) {
    Vue.http = ajax;
    Object.defineProperty(Vue.prototype, '$http', {get: () => ajax});
  }
};
