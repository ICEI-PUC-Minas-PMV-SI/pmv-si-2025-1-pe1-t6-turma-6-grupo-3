let ec = EventCalendar.create(document.getElementById("ec"), {
  view: "dayGridMonth",
  locale: "pt-BR",
  events: [
    // your list of events
  ],
});

// If you later need to destroy the calendar then use
//EventCalendar.destroy(ec);
