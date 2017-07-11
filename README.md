# vue-h-ajax
[![npm version](https://badge.fury.io/js/vue-h-ajax.svg)](https://badge.fury.io/js/vue-h-ajax)
[![npm](https://img.shields.io/npm/l/express.svg)](http://opensource.org/licenses/MIT)
[![Build Status](https://travis-ci.org/zont/vue-h-ajax.svg?branch=master)](https://travis-ci.org/zont/vue-h-ajax)

> Edge 12+, FF 36+, Chrome 49+, or use translation from ES2105 to ES5

## Introduction

`vue-h-ajax` is the small ajax module for [Vue.js](http://vuejs.org). It deeply integrates with Vue.js core to make building Single Page Applications with Vue.js a breeze. Features include:

- Lightweight: 3.5kb of sources
- No dependencies
- try to parse data as JSON by default
- **withCredentials** by default
- **DELETE** request with body

## Setup
```bash
npm install vue-h-ajax
```

## Example
```javascript
import Vue from 'vue';
import ajax from 'vue-h-ajax';


Vue.use(ajax);


Vue.http.get('/backend/users')
  .then(users => {
    console.log(users);
  })
  .catch(e => console.error(e));

Vue.http.stop('/backend/users');


const app = new Vue({
  template: '<div class="main"></div>',
  el: '#app',
  created() {
    this.$http.post('/backend/user', {name: 'Bill'}, {'Content-Type': 'application/json'})
      .then(response => {
        console.log(response.data.id);
      })
      .catch(e => console.error(e));
  }
});
```

## API

#### withCredentials
  - type: `Boolean`. Default `true`
```javascript
import Vue from 'vue';
import ajax from 'vue-h-ajax';


Vue.use(ajax);

Vue.http.withCredentials = false;
```

#### headers
  - type: `Object`

Global headers for all requests
```javascript
import Vue from 'vue';
import ajax from 'vue-h-ajax';


Vue.use(ajax);

Vue.http.headers = {
  'Content-Type': 'application/json'
};
```

#### get(url, data, headers), post(...), put(...), delete(...)
  - returns `Promise<response>`. Response format:
  ```json
  {
    "status": Number,
    "data": Any
  }
  ```

#### stop(url)
Abort all current requests matched **url**
```javascript
import Vue from 'vue';
import ajax from 'vue-h-ajax';


Vue.use(ajax);


Vue.http.get('/backend/users');
Vue.http.get('/backend/users');
Vue.http.get('/backend/users');

Vue.http.stop('/backend/users');
```
