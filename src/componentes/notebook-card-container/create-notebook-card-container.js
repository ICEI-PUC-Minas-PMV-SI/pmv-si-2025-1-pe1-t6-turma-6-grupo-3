 function createCardsContainer(document, wrapper, { cards = [] }) {
    const tmpl = wrapper.querySelector('#notebook-card-container-template').content;
    const clone = document.importNode(tmpl, true);

    // cards
    const cardsSlot = clone.querySelector('[data-slot="cards-row"]');
    cards.forEach(el => cardsSlot.appendChild(el));

    return clone;
  }