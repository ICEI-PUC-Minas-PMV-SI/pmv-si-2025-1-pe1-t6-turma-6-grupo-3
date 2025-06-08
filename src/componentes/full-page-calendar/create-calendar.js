function createCalendarFullPage(el, { events, onEventClick, onEventDrop, onDateClick }) {
  const calendar = EventCalendar.create(el, {
    view: "dayGridMonth",
    locale: "pt-BR",
    buttonText: {
      today: "Hoje",
    },
    events,
    eventClick: onEventClick,
    eventDrop: onEventDrop,
    dateClick: onDateClick,
    // headerToolbar: {
    //     start: 'title createEvent',
    //     center: '',
    //     end: 'today prev,next'
    // },
    // customButtons: {
    //   createEvent: {
    //       text: 'Criar',
    //       click: function() {
    //           alert('clicked the custom button!');
    //       }
    //   }
    // },
  });
  return calendar;
}


// If you later need to destroy the calendar then use
//EventCalendar.destroy(ec);
