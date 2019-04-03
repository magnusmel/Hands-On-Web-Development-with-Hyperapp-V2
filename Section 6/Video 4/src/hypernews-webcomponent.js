import hyperNews from './hypernews.js';

const template = document.createElement('template');
template.innerHTML = `
<style>
*, *:before, *:after {
  box-sizing: border-box;
  font-size: 16px;
  font-family: sans-serif;
}

.--small {
  font-size: 0.9rem;
}

.--light {
  color: gray;
}

.--bold {
  font-weight: bold;
}

.--block {
  display: block;
}

.--normal {
  font-size: 16px;
}

.--flex-horizontal {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  list-style: none;
  margin: 0;
  padding: 0;
  flex-grow: 1;
}

.--flex-horizontal li:not(:last-child):after {
  content: '|';
  margin: 0 .2rem;
}

.--flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.--no-underline {
  text-decoration: none;
}

shadow {
  display: inline-block;
  height: 1.1rem;
  background-color: #eee;
  margin-right: .5rem;
}

shadow.--small {
  height: 0.8rem;
}

ul.--flex-horizontal.--unbreakable li {
  white-space: nowrap;
}

a {
  color: inherit;
  text-decoration: none;
}

a:hover:not(.--no-underline) {
  text-decoration: underline;
}

nav {
  background-color: lightblue;
  color: black;
  height: 1.6rem;
}

nav .item {
  margin: 0 .1rem;
}

nav .item.--extra-margin {
  margin: 0 .5rem;
}

.logo {
  width: 1.2rem;
  height: 1.2rem;
  font-size: .9rem;
  color: white;
  border: 1px white solid;
}

content {
  display: block;
  margin: 1rem;
}

story {
  display: block;
  margin-bottom: 1rem;
}

story .--normal {
  margin: 1rem 0;
}

storyRoot {
  font-size: 24pt;
}

comment {
  display: block;
  margin-bottom: .5rem;
}

attribution {
  display: block;
  margin-bottom: .5rem;
}

article section {
  margin-bottom: 1rem;
}

comment article replies {
  display: block;
  margin-left: 0.5rem;
  border-left: 1px #ddd solid;
  padding-left: 0.5rem;
}

button.--link {
  display: inline;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 100%;
  padding: 0;
  margin: 0;
}

button.--link:hover {
  text-decoration: underline;
}

intermediate {
  display: flex;
  height: 10rem;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

error {
  max-width: 500px;
  background-color: red;
  color: white;
  padding: 1rem;
}

@keyframes pageTransition {
  from {
    opacity: 1;
    transform: rotateY(0deg);
  }

  to {
    opacity: 0;
    transform: rotateY(90deg);
  }
}

.transition {
  position: absolute;
  top: 0;
  left: 0;
  min-width: 100%;
  height: auto;
  background-color: white;
  animation: 1s pageTransition linear;
}

.spinner-container {
  justify-content: space-between;
}

.spinner-container > span {
  margin-left: 1rem;
}

/*
 * Taken from https://codepen.io/EastingAndNorthing/pen/aNWrZz from user Mark Oosting
 * Minor size and margin modifications
 */
spinner {
  display: inline-block;
  pointer-events: none;
  width: 1.5rem;
  height: 1.5rem;
  border: 0.2rem solid transparent;
  border-color: #eee;
  border-top-color: #3E67EC;
  border-radius: 50%;
  animation: loadingspin 1s linear infinite;
  margin-left: 1rem;
}

@keyframes loadingspin {
  100% {
    transform: rotate(360deg)
  }
}
</style>
<div id="app"></div>
`;

const makeScript = (src) => {
  const script = document.createElement('script');
  const loaded = new Promise((resolve, reject) => {
    script.onload = () => resolve();
    script.onerror = () => reject();
  });
  script.src = src;
  return {
    script,
    loaded,
  }
};

const makeEmitter = () => {
  let callbacks = [];

  const remove = callback => callbacks.filter(c => c !== callback);

  return {
    remove,
    add: (callback) => {
      callbacks.push(callback);
      return () => remove(callback);
    },
    trigger: (...data) => callbacks.forEach(cb => cb(...data)),
  };
};

class HyperNewsWC extends HTMLElement {
  static get observedAttributes() {
    return ['type'];
  }

  constructor() {
    super();

    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(template.content.cloneNode(true));
    this._target = shadow.querySelector('#app');
    const scripts = [
      'https://www.gstatic.com/firebasejs/6.0.0/firebase-app.js',
      'https://www.gstatic.com/firebasejs/6.0.0/firebase-database.js',
      'https://unpkg.com/page@1.11.4/page.js',
    ].map(makeScript);

    this._scriptsLoaded = Promise.all(scripts.map(s => s.loaded));
    scripts.forEach(s => shadow.appendChild(s.script));

    this.attributeChangeEmitter = makeEmitter();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    this.attributeChangeEmitter.trigger(name, oldValue, newValue);
  }

  connectedCallback() {
    this._scriptsLoaded
      .then(() => hyperNews(this._target, this.attributeChangeEmitter));
  }
}

customElements.define('hyper-news', HyperNewsWC);
