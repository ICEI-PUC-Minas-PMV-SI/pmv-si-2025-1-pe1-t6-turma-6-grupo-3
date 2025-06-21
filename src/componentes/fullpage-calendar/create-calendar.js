function createFullPageCalendar(el, { events, onEventClick, onEventDrop, onDateClick }) {
  const calendar = EventCalendar.create(el, {
    view: "dayGridMonth",
    locale: "pt-BR",
    buttonText: {
      today: "Hoje",
    },
    events: events.map(convertEventDomainToLibEvent),
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

function createCalendarEvent(calendar, eventDomain) {
   const event = convertEventDomainToLibEvent(eventDomain);
   calendar.addEvent(event);
}

function updateCalendarEvent(calendar, eventDomain) {
  const {id, ...data} = convertEventDomainToLibEvent(eventDomain);
  const event = calendar.getEventById(id);
  Object.assign(event, { ...data, start: new Date(data.start), end: new Date(data.end) });
  calendar.updateEvent(event);
}

function deleteCalendarEvent(calendar, eventDomain) {
  const { id } = convertEventDomainToLibEvent(eventDomain);
  calendar.removeEventById(id);
}

// If you later need to destroy the calendar then use
//EventCalendar.destroy(ec);

function createCalendarLegend(items = []) {
  const container = document.createElement('div');
  container.style.display = 'flex';
  container.style.flexWrap = 'wrap';
  container.style.gap = '12px';
  container.style.alignItems = 'center';
  
  items.forEach(({ color, label }) => {
    const item = document.createElement('div');
    item.style.display = 'flex';
    item.style.alignItems = 'center';
    item.style.gap = '6px';

    const colorBox = document.createElement('span');
    colorBox.style.width = '16px';
    colorBox.style.height = '16px';
    colorBox.style.borderRadius = '4px';
    colorBox.style.backgroundColor = color;
    colorBox.style.display = 'inline-block';

    const labelText = document.createElement('span');
    labelText.textContent = label;
    labelText.style.fontSize = '14px';
    labelText.style.color = '#333';

    item.appendChild(colorBox);
    item.appendChild(labelText);
    container.appendChild(item);
  });

  return container;
}

function getLegendByType(type) {
  const map ={ //notebook, content, task,
    'notebook': { color: '#AB47BC', label: 'Caderno' },
    'content': { color: '#EC407A', label: 'Conteúdo' },
    'task': { color: '#66BB6A', label: 'Tarefa' },
    'raw': { color: '#FFA726', label: 'Evento' },
  }
  if (!map.hasOwnProperty(type)) {
    return map['raw']
  }

  return map[type];
}

function convertEventDomainToLibEvent(
  { 
        id,
        name, // event title
        description, // open description
        all_day, // bool
        start_date, // date
        end_date, // date
        priority, // high, medium, low
        owner, //{ name, email }
        guests, // [{ name, email }]
        parent_location, // notebook_id, content_id, task_id
        parent_type, // notebook, content, task, null
    }
){
  return {
    id,
    resourceIds: [],
    allDay: all_day,
    start: start_date,
    end: end_date,
    title: name,
    editable: false,
    startEditable: false,
    durationEditable: false,
    display: "auto",
    backgroundColor: getLegendByType(parent_type).color,
    textColor: "#ffffff",
    classNames: [parent_type],
    styles: [],
    extendedProps: {
      parent_location,
      parent_type,
      priority,
      description,
    }
  }
}