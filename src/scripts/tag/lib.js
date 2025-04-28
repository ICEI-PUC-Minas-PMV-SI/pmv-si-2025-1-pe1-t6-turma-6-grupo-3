/* TagsInput.js: componente de tags com estilo Bootstrap */
function TagSelectorFactory(global) {  
    /**
     * @param {HTMLElement} container  Elemento que conterá o componente
     * @param {Object} options
     * @param {string[]} [options.initialTags]
     * @param {string} [options.placeholder]
     * @param {function} [options.onChange]
     */
    function TagsInput(container, options) {
      options = options || {};
      this._container   = container;
      this._tags        = [];
      this._placeholder = options.placeholder || 'Pressione Enter';
      this._onChange    = typeof options.onChange === 'function' ? options.onChange : function(){};
  
      this._injectStyles();
      this._buildDOM();
      this._attachEvents();
      this.setTags(options.initialTags || []);
    }
  
    TagsInput.prototype.getTags = function() {
      return this._tags.map(function(t){ return t.text; });
    };
  
    TagsInput.prototype.setTags = function(tagsArray) {
      var self = this;
      this._tags = tagsArray.map(function(text){
        return { text: text, color: self._randomColor() };
      });
      this._render();
      this._onChange(this.getTags());
    };
  
    TagsInput.prototype._buildDOM = function() {
      // wrapper como form-control do Bootstrap
      this._container.classList.add('position-relative');
      this._wrapper = document.createElement('div');
      this._wrapper.className = 'form-control d-flex flex-wrap align-items-center tiw-wrapper';
      this._container.appendChild(this._wrapper);
  
      // campo oculto para armazenar valor
      this._hidden = document.createElement('input');
      this._hidden.type = 'hidden';
      this._wrapper.appendChild(this._hidden);
  
      // botão concluir
      this._btnDone = document.createElement('button');
      this._btnDone.type = 'button';
      this._btnDone.textContent = 'Concluído';
      this._btnDone.className = 'btn btn-sm btn-primary tiw-done-btn';
      this._container.appendChild(this._btnDone);
    };
  
    TagsInput.prototype._attachEvents = function() {
      var self = this;
      // foco para abrir editor
      this._wrapper.addEventListener('click', function(){ self._openEditor(); });
      // concluir edição
      this._btnDone.addEventListener('click', function(){ self._closeEditor(); });
    };
  
    TagsInput.prototype._openEditor = function() {
      if (this._input) return;
      this._btnDone.style.display = 'inline-block';
      this._render();
      this._addInput();
    };
  
    TagsInput.prototype._closeEditor = function() {
      if (!this._input) return;
      this._input.remove();
      this._input = null;
      this._btnDone.style.display = 'none';
      this._render();
      this._onChange(this.getTags());
    };
  
    TagsInput.prototype._addInput = function() {
      var self = this;
      this._input = document.createElement('input');
      this._input.type = 'text';
      this._input.className = 'border-0 flex-grow-1 tiw-input';
      this._input.placeholder = this._placeholder;
      this._input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          var val = self._input.value.trim();
          if (val && !self._tags.some(function(t){ return t.text === val; })) {
            self._tags.push({ text: val, color: self._randomColor() });
            self._input.value = '';
            self._render();
          }
        }
      });
      this._wrapper.appendChild(this._input);
      this._input.focus();
    };
  
    TagsInput.prototype._render = function() {
      var self = this;
      // limpa tags (fora hidden e input)
      Array.from(this._wrapper.children).forEach(function(ch) {
        if (ch !== self._hidden && ch !== self._input) ch.remove();
      });
      // render tags
      this._tags.forEach(function(tag, idx) {
        var span = document.createElement('span');
        span.className = 'tiw-tag';
        span.style.backgroundColor = tag.color;
        span.textContent = tag.text;
        var close = document.createElement('span');
        close.className = 'tiw-remove';
        close.innerHTML = '&times;';
        close.addEventListener('click', function() {
          self._tags.splice(idx, 1);
          self._render();
        });
        span.appendChild(close);
        self._wrapper.insertBefore(span, self._input || null);
      });
      this._hidden.value = this.getTags().join(',');
    };
  
    TagsInput.prototype._randomColor = function() {
      var h = Math.floor(Math.random() * 360);
      return 'hsl(' + h + ',70%,80%)';
    };
  
    TagsInput.prototype._injectStyles = function() {
      if (TagsInput._stylesInjected) return;
      var css = '\n' +
        '.tiw-wrapper { cursor:text; padding: .25rem .5rem !important; min-height: calc(1.5em + .75rem + 2px) !important; }\n' +
        '.tiw-input { outline:none; }\n' +
        '.tiw-tag { display:inline-flex; align-items:center; position:relative; padding: .25em .75em; margin:.25em; font-size:.75rem; color:#212529; border-radius:.25rem; }\n' +
        '\n' +
        '.tiw-tag .tiw-remove { margin-left:.5em; cursor:pointer; font-weight:bold; }\n' +
        '.tiw-done-btn { position:absolute; top:.2rem; right:.2rem; display:none; }';
      var style = document.createElement('style');
      style.textContent = css;
      document.head.appendChild(style);
      TagsInput._stylesInjected = true;
    };
  
    // exporta globalmente
    global.TagsInput = TagsInput;
  
  }  

function populateMetaTags(tagsString, container) {
// limpa tudo antes
container.innerHTML = '';
    
    // quebra em array, trim e remove vazios
    const tags = tagsString
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length);
  
    tags.forEach(tag => {
      const span = document.createElement('span');
      // classes Bootstrap para badge pill
      span.className = 'badge badge-pill badge-primary mr-1 mb-1';
      span.textContent = tag;
      container.appendChild(span);
    });
  }