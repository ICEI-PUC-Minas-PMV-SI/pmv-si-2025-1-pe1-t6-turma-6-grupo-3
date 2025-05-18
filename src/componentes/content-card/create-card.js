// Função de clonagem igual à usada na página real    
function createContentCard(document, wrapper, data) {
    const t = wrapper.querySelector('#card-template').content;
    const clone = document.importNode(t, true);
    clone.querySelector('.card-title').textContent = data.name;
    clone.querySelector('.card-description').textContent = data.description;

    const tagsContainer = clone.querySelector('.tags-container');
    tagsContainer.innerHTML = '';  // limpa o template
    data.tags.forEach(tag => {
        const span = document.createElement('span');
        span.className = 'badge';
        span.textContent = tag.title;
        span.title       = tag.title;
        span.style.backgroundColor = tag.color;
        span.style.color = getContrastWCAG(tag.color.replace(/^rgb\(|\)|\s+/g, c =>
    ('0'+parseInt(c).toString(16)).slice(-2)
  )) || getContrastWCAG(tag.color.replace(/^#/,''));
        tagsContainer.appendChild(span);
    });


    clone.querySelector('.content-icon i').className = data.icon;
    return clone;
}
/**
 * Given any CSS color in hex, returns a contrasting color that
 * meets WCAG “AA” contrast (black or white).
 */
function getContrastWCAG(hex) {
  hex = hex.replace(/^#/, '');
  const r = parseInt(hex.substr(0,2),16);
  const g = parseInt(hex.substr(2,2),16);
  const b = parseInt(hex.substr(4,2),16);

  // relative luminance
  const L = 0.2126*toLinear(r) + 0.7152*toLinear(g) + 0.0722*toLinear(b);

  // per WCAG: choose black if bg is light, white if bg is dark
  return L > 0.179 ? '#000000' : '#ffffff';
}

/**
 * Convert sRGB channel to linear value
 */
function toLinear(c) {
  c = c/255;
  return c <= 0.03928 ? c/12.92 : Math.pow((c+0.055)/1.055, 2.4);
}