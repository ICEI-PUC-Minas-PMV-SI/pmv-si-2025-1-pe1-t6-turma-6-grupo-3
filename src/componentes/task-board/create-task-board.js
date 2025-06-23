// create-task-board.js

// === ID Generation (Unique for each new task) ===
let TASK_ID_COUNTER = 10000;
function generateTaskId() {
  return ++TASK_ID_COUNTER;
}

// === Utility: Prevent Cyclic Hierarchies ===
function isDescendant(possibleChild, possibleParent) {
  let cur = possibleChild.parentTask;
  while (cur) {
    if (cur === possibleParent) return true;
    cur = cur.parentTask;
  }
  return false;
}

function fmt(d) {
  // yyyy-mm-dd
  if (!d) return '';
  if (typeof d === 'string') return d;
  return d.toISOString().split('T')[0];
}

function debounce(fn, d)  { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), d); }; }
function throttle(fn, l)  { let p=0; return (...a) => { const n=Date.now(); if (n-p>=l) { p=n; fn(...a);} }; }

function showSubtaskPlaceholder(templateWrapper, tasksHolder, taskRow) {

  // Remove qualquer placeholder existente imediatamente
  tasksHolder.querySelectorAll('.subtask-placeholder').forEach(p => {
    p.classList.remove('show');
    p.remove();
  });

  const placeholder = document.createElement('div');
  placeholder.className = 'linha-task subtask-placeholder';
  const level = (taskRow.task.level ?? 1);
  placeholder.style.setProperty('--level', level);
  placeholder.innerHTML = `
    <div class="d-flex align-items-center">
      <button class="btn btn-outline-primary btn-sm btn-create-subtask me-2">
        <i class="bi bi-plus-circle me-1"></i> Criar subtask
      </button>
      <button class="btn btn-outline-secondary btn-sm btn-create-task">
        <i class="bi bi-plus-lg me-1"></i> Criar task
      </button>
    </div>`;
  taskRow.after(placeholder);
  requestAnimationFrame(() => placeholder.classList.add('show'));

  function focusNewTask(parentTask) {
    setTimeout(() => {
      const all = Array.from(tasksHolder.querySelectorAll('.linha-task'));
      const newest = all
        .map(el => el.task)
        .filter(t => t && t.parentTask === parentTask && !t.title)
        .pop();
      if (newest && newest.el) focusTaskTitle(newest.el);
    }, 25);
  }

  // Helper: encontra o último descendente recursivo de um parent
  function findLastDescendantIdx(parentTask, arr) {
    let idx = arr.indexOf(parentTask);
    if (idx === -1) return -1;
    let lastIdx = idx;
    for (let i = idx + 1; i < arr.length; ++i) {
      if (arr[i].parentTask === parentTask) {
        const childLast = findLastDescendantIdx(arr[i], arr);
        if (childLast > lastIdx) lastIdx = childLast;
      }
      if (arr[i].parentTask !== parentTask && arr[i].level <= parentTask.level) {
        break;
      }
    }
    return lastIdx;
  }

  // Criar SUBTASK
  placeholder.querySelector('.btn-create-subtask')
    .addEventListener('click', () => {
      if (!window.taskBoard) return;
      const { store, createAndAddTask, renderTasks } = window.taskBoard;
      const parentId = taskRow.task.id;
      const parentFromStore = parentId
        ? store.tasks.find(t => t.id === parentId) || taskRow.task
        : taskRow.task;

      // Herdar due_date do pai (opcional, comente se não quiser)
      const inheritedDue_date = parentFromStore.due_date || '';

      const newTaskData = {
        id: generateTaskId(),
        title: '',
        customClass: ['subtask'],
        parentTask: parentFromStore,
        level: (parentFromStore.level ?? 1) + 1,
        actions: parentFromStore._actions,
        due_date: inheritedDue_date,
        priority: parentFromStore.priority
      };
      const el = createTaskRow(document, templateWrapper, tasksHolder, newTaskData);
      const newTask = el.task;

      // Busca o último descendente do parent para inserir após ele
      const insertAfterIdx = findLastDescendantIdx(parentFromStore, store.tasks);
      store.tasks.splice(insertAfterIdx + 1, 0, newTask);

      store.addTask(newTask);
      renderTasks();
      focusNewTask(parentFromStore);
      placeholder.remove();
    });

  // Criar TASK IRMÃ (logo após a task atual e seus descendentes)
  placeholder.querySelector('.btn-create-task')
    .addEventListener('click', () => {
      if (!window.taskBoard) return;
      const { store, createAndAddTask, renderTasks } = window.taskBoard;
      const parentTask = taskRow.task.parentTask || null;
      const parentFromStore = parentTask && parentTask.id
        ? store.tasks.find(t => t.id === parentTask.id) || parentTask
        : parentTask;
      const newLevel = parentFromStore ? parentFromStore.level + 1 : 1;

      // Herda due_date e priority da task atual!
      const newTaskData = {
        id: generateTaskId(),
        title: '',
        actions: taskRow.task._actions,
        parentTask: parentFromStore,
        level: newLevel,
        customClass: newLevel > 1 ? ['subtask'] : [],
        due_date: taskRow.task.due_date,
        priority: taskRow.task.priority,
      };

      // Encontra o último descendente da task atual para inserir depois dele
      const insertAfterIdx = findLastDescendantIdx(taskRow.task, store.tasks);
      const el = createTaskRow(document, templateWrapper, tasksHolder, newTaskData);
      const newTask = el.task;
      store.tasks.splice(insertAfterIdx + 1, 0, newTask);

      store.addTask(newTask);
      renderTasks();
      focusNewTask(parentFromStore);
      placeholder.remove();
    });

  let inside = false;
  const set = (v) => {
    inside = v;
    if (!v) setTimeout(() => {
      if (!inside) {
        placeholder.classList.remove('show');
        placeholder.addEventListener('transitionend', () => placeholder.remove(), { once: true });
      }
    }, 120);
  };
  taskRow.addEventListener('mouseenter', () => set(true));
  taskRow.addEventListener('mouseleave', () => set(false));
  placeholder.addEventListener('mouseenter', () => set(true));
  placeholder.addEventListener('mouseleave', () => set(false));
}

function focusTaskTitle(taskRow) {
  const titleEl = taskRow.querySelector('.texto-task');
  if (!titleEl) return;
  titleEl.click();
  setTimeout(() => {
    const input = taskRow.querySelector('input.form-control');
    if (input) input.focus();
  }, 0);
}

function createTaskRow(document, wrapper, tasksHolder, {
  title = '',
  description = '',
  priority = '',
  due_date = '',
  completed = false,
  completed_at = null,
  customClass = [],
  parentTask = null,
  actions = {},
  parent_location = {},
  parent_type,
  registerTask = () => {},
  id = null,
  level = 1,
} = {}) {
  const tmplEl = wrapper.querySelector('#task-template');
  if (!tmplEl) throw new Error('Template #task-template não encontrado');

  if (completed_at && !completed) completed = true;
  if (parentTask && !customClass.includes('subtask')) {
    customClass = [...customClass, 'subtask'];
  }

  if (!id) {
    id = generateTaskId(); // Assign a unique ID if missing
  }

  const tmpl = tmplEl.content;
  const fragment = document.importNode(tmpl, true);
  const rowEl = fragment.querySelector('.linha-task');
  const cardEl = rowEl.querySelector('.task');

  const alertEl   = rowEl.querySelector('.atraso-alert');
  const checkbox  = rowEl.querySelector('.checkb');
  const titleEl   = rowEl.querySelector('.texto-task');
  const descEl    = rowEl.querySelector('.descricao-task');
  const menuBtn   = rowEl.querySelector('.btnmenu');
  const deleteBtn = rowEl.querySelector('.excluir');
  const dateBtn   = rowEl.querySelector('.due-date-container  [data-element-type="trigger"]');
  const dateInput = rowEl.querySelector('.due-date-container  [data-element-type="input"]');
  const prioBtn   = rowEl.querySelector('.priority-container  [data-element-type="trigger"]');
  const prioSel   = rowEl.querySelector('.priority-container  [data-element-type="input"]');

  rowEl.style.setProperty('--level', level);

  customClass.forEach(c => cardEl.classList.add(c));

  const task = { 
    id, 
    title, 
    description,
    completed,
    completed_at,
    priority,
    due_date,
    parentTask, 
    level, 
    parent_location,
    parent_type,
    el: rowEl, 
    _actions: actions,
  };

  function updateTitleText(val) {
    if (!val) {
      titleEl.textContent = "Clique para adicionar nome";
      titleEl.classList.add("text-muted", "fst-italic");
    } else {
      titleEl.textContent = val;
      titleEl.classList.remove("text-muted", "fst-italic");
    }
  }
  updateTitleText(title);

  descEl.textContent = description;
  checkbox.checked = completed;
  if (completed) rowEl.classList.add('checked');
  if (due_date) { 
    if (dateBtn) dateBtn.classList.add('d-none');
    if (dateInput) { dateInput.classList.remove('d-none'); dateInput.value = due_date; }
  }
  if (priority){ 
    if (prioBtn) prioBtn.classList.add('d-none');
    if (prioSel) { prioSel.classList.remove('d-none'); prioSel.value = priority; }
  }

  const sync = (field, val, act) => { 
     const patch = { [field]: val };
    task[field]=val; 
    if (field === 'title') updateTitleText(val);
    actions[act]?.(task);
    // TODO: remove this abobination in future
    console.log("task on sync", task)
    if (window.taskBoard?.store?.updateTask) window.taskBoard.store.updateTask(task, patch);
  };

  menuBtn  && (menuBtn.onclick = ()      => actions.menu?.(task));
  deleteBtn&& (deleteBtn.onclick = ()    => { actions.delete?.(task); rowEl.remove(); });

  checkbox && (checkbox.onchange = e => {
    sync('completed', e.target.checked, 'toggle');
    sync('completed_at', new Date(), 'completion');
    if (e.target.checked) {
      rowEl.classList.add('checked');
      task.completed_at = new Date().toISOString();
      rowEl.classList.remove('atrasada');
      if (alertEl) {
        alertEl.innerHTML = '';
        alertEl.classList.add('d-none');
      }
    } else {
      rowEl.classList.remove('checked');
      task.completed_at = null;
    }
  });

  // === FIX: Toggle date/priority buttons if value cleared ===
  dateBtn  && (dateBtn.onclick = ()      => { dateBtn.classList.add('d-none'); dateInput.classList.remove('d-none'); dateInput.focus(); });
  dateInput&& (dateInput.onchange= e     => {
    sync('due_date', e.target.value, 'due_date');
    if (!e.target.value) {
      dateInput.classList.add('d-none');
      dateBtn.classList.remove('d-none');
    }
  });
  prioBtn  && (prioBtn.onclick = ()      => { prioBtn.classList.add('d-none'); prioSel .classList.remove('d-none'); prioSel .focus(); });
  prioSel  && (prioSel.onchange= e       => {
    sync('priority', e.target.value, 'priority');
    if (!e.target.value) {
      prioSel.classList.add('d-none');
      prioBtn.classList.remove('d-none');
    }
  });

  const inline = (pEl, field, act) => {
    const wrap = pEl.parentElement;
    const inp  = document.createElement('input');
    inp.className = 'form-control';
    inp.value = (pEl.classList.contains('text-muted')) ? '' : pEl.textContent.trim();
    wrap.replaceChild(inp, pEl);
    inp.focus();

    let finalized = false;
    const fin = () => {
      if (finalized) return;
      finalized = true;
      const val = inp.value.trim();
      wrap.replaceChild(pEl, inp);
      sync(field, val, act);
    };
    inp.addEventListener('blur', fin);
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') fin(); });
  };
  titleEl.onclick = () => inline(titleEl,'title','titleEdit');
  descEl .onclick = () => inline(descEl ,'description','descEdit');
  rowEl.addEventListener('mouseenter',
    debounce(throttle(() => {
      if (!rowEl.classList.contains('subtask')) window.showSubtaskPlaceholder(wrapper, tasksHolder, rowEl);
    },300), 100)
  );

  rowEl.task = task;
  registerTask(task);
  return rowEl;
}

// === Recursive delete of subtasks ===
function createTaskStore(
  initialTasks = [],
  {
    onCreateTask = () => {},
    onDeleteTask = () => {},
    onUpdateTask = () => {},
  } = {}
) {
  const tasks = [];

  // Index temporário para relacionamento pai/filho
  const taskMap = {};
  initialTasks.forEach(t => {
    if (t.id) {
      taskMap[t.id] = t;
      t._pendingSubs = [];
      tasks.push(t);
    } else if (t.parentTaskId) {
      (taskMap[t.parentTaskId]?._pendingSubs || (taskMap[t.parentTaskId]._pendingSubs = [])).push(t);
    } else {
      tasks.push(t);
    }
  });
  for (const t of tasks) {
    if (t._pendingSubs) {
      t._pendingSubs.forEach(sub => {
        sub.parentTask = t;
        tasks.push(sub);
      });
      delete t._pendingSubs;
    }
  }

  // --------- UTILIDADES INTERNAS ---------

  function isDescendant(possibleChild, possibleParent) {
    let cur = possibleChild.parentTask;
    while (cur) {
      if (cur === possibleParent) return true;
      cur = cur.parentTask;
    }
    return false;
  }

  function findLastDescendantIdx(parentTask, arr) {
    let idx = arr.indexOf(parentTask);
    if (idx === -1) return -1;
    let lastIdx = idx;
    for (let i = idx + 1; i < arr.length; ++i) {
      if (arr[i].parentTask === parentTask) {
        const childLast = findLastDescendantIdx(arr[i], arr);
        if (childLast > lastIdx) lastIdx = childLast;
      }
      if (arr[i].parentTask !== parentTask && arr[i].level <= parentTask.level) {
        break;
      }
    }
    return lastIdx;
  }

  // --------- PRINCIPAIS MÉTODOS ---------

  function addTask(task) {
    tasks.push(task);
    onCreateTask(task);
  }

  function deleteTask(task) {
    // Remove recursivo (todas subtasks também)
    const subtasks = tasks.filter(t => t.parentTask === task);
    for (const sub of subtasks) deleteTask(sub);
    const idx = tasks.indexOf(task);
    if (idx !== -1) {
      tasks.splice(idx, 1);
      onDeleteTask(task);
    }
  }

  function updateTask(task, patch = {}) {
    console.log("updateTask", task, patch)
    Object.assign(task, patch);
    onUpdateTask({
      ...task,
      ...patch,
    });
  }

  /**
   * Move uma task em relação a outra
   * @param {string|number} taskId - ID da task a mover
   * @param {string|number} targetId - ID da task alvo (onde inserir)
   * @param {'before'|'after'|'child'} operation - tipo de movimentação
   */
  function moveTask(taskId, targetId, operation) {
    const task = tasks.find(t => t.id === taskId);
    const target = tasks.find(t => t.id === targetId);
    if (!task || !target || task === target) return;

    // Evita ciclo: não pode virar filho/descendente de si mesmo
    if (isDescendant(target, task)) return;

    // Remove da posição antiga
    const oldIdx = tasks.indexOf(task);
    if (oldIdx !== -1) tasks.splice(oldIdx, 1);

    let newParent = null;
    let insertIdx = 0;

    if (operation === 'child') {
      // Vira filho de target, insere após último descendente do target
      newParent = target;
      let siblings = tasks.filter(t => t.parentTask === target);
      let lastSubIdx = siblings.length
        ? tasks.indexOf(siblings[siblings.length - 1])
        : tasks.indexOf(target);
      insertIdx = lastSubIdx + 1;
    } else if (operation === 'before') {
      // Vira irmão antes do target (mesmo parent)
      newParent = target.parentTask || null;
      insertIdx = tasks.indexOf(target);
    } else if (operation === 'after') {
      // Vira irmão depois do target (após todos os descendentes do target)
      newParent = target.parentTask || null;
      let lastDescIdx = findLastDescendantIdx(target, tasks);
      insertIdx = lastDescIdx + 1;
    }

    // Atualiza parent/level recursivamente
    function reparentAndReorder(t, parent) {
      t.parentTask = parent;
      t.level = parent ? (parent.level + 1) : 1;
      onUpdateTask(t);
      let children = tasks.filter(child => child.parentTask === t);
      for (const child of children) {
        reparentAndReorder(child, t);
      }
    }
    reparentAndReorder(task, newParent);

    // Insere na nova posição
    tasks.splice(insertIdx, 0, task);
    onUpdateTask(task);
  }

  // --------- RETORNO DA STORE ---------
  return {
    tasks,
    addTask,
    deleteTask,
    updateTask,
    moveTask,
  };
}

function createTaskBoard(document, wrapper, {
  initialTasks = [],
  onCreateTask = () => {},
  onDeleteTask = () => {},
  onUpdateTask = () => {},
} = {}) {
  // 1. MONTA OS OBJETOS E GRAFO
  const allTaskObjs = [];
  const idMap = {};
  for (const t of initialTasks) {
    const obj = { ...t, parentTask: null };
    allTaskObjs.push(obj);
    if (obj.id) idMap[obj.id] = obj;
  }
  for (const t of allTaskObjs) {
    if (t.parent_id) t.parentTask = idMap[t.parent_id] || null;
  }
  function assignLevel(task) {
    if (!task.parentTask) task.level = 0;
    else {
      if (typeof task.parentTask.level !== "number") assignLevel(task.parentTask);
      task.level = task.parentTask.level + 1;
    }
  }
  allTaskObjs.forEach(assignLevel);

  // --- Board DOM
  const tmpl = wrapper.querySelector('#taskboard-template');
  if (!tmpl) throw new Error('Template #taskboard-template não encontrado');
  const board = document.importNode(tmpl.content, true).firstElementChild;
  const taskListEl = board.querySelector('.day-columns');
  const addRootTaskArea = board.querySelector('.footer-add-task-area');
  const addRootTaskBtn = board.querySelector('.btn-add-root-task');
  const navPrev = board.querySelector('.btn-nav-prev');
  const navToday = board.querySelector('.btn-nav-today');
  const navNext = board.querySelector('.btn-nav-next');
  const navNoDate = board.querySelector('.btn-nav-nodate');
  const toggleCompleted = board.querySelector('.btn-toggle-completed');

  let currentDay = 'today';
  let showCompleted = true;
  const navBtns = [navPrev, navToday, navNext, navNoDate];
  navBtns.forEach(btn => btn.classList.remove('active'));
  navToday.classList.add('active');

  // MONTA ELEMENTOS DOM PARA TODAS AS TASKS
  for (const taskData of allTaskObjs) {
    const el = createTaskRow(document, wrapper, taskListEl, {
      ...taskData,
      registerTask: () => {},
      level: taskData.level,
    });
    taskData.el = el;
  }

  // --- Store ---
  const store = createTaskStore(allTaskObjs, {
    onCreateTask,
    onDeleteTask,
    onUpdateTask,
  });

  function setActiveNav(btn) {
    navBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }

  // Navegação entre dias
  navPrev.addEventListener('click', () => { currentDay = 'anteriores'; setActiveNav(navPrev); renderTasks(); });
  navToday.addEventListener('click', () => { currentDay = 'today'; setActiveNav(navToday); renderTasks(); });
  navNext.addEventListener('click', () => { currentDay = 'tomorrow'; setActiveNav(navNext); renderTasks(); });
  navNoDate.addEventListener('click', () => { currentDay = 'semdata'; setActiveNav(navNoDate); renderTasks(); });

  toggleCompleted.addEventListener('click', () => {
    showCompleted = !showCompleted;
    toggleCompleted.textContent = showCompleted ? 'Ocultar tarefas concluídas' : 'Mostrar tarefas concluídas';
    renderTasks();
  });

  addRootTaskBtn.addEventListener('click', () => {
    document.querySelectorAll('.subtask-placeholder').forEach(p => p.remove());
    let due_date = '';
    const today = new Date();
    if (currentDay === 'today') due_date = fmt(today);
    else if (currentDay === 'tomorrow') { let d = new Date(today); d.setDate(today.getDate() + 1); due_date = fmt(d); }
    else if (currentDay === 'anteriores') { let d = new Date(today); d.setDate(today.getDate() - 1); due_date = fmt(d); }
    createAndAddTask({
      title: '',
      actions: store.tasks[0]?._actions || {},
      parentTask: null,
      customClass: [],
      level: 0,
      due_date,
    });
    renderTasks();
  });

  function showOrHideFooterAddTask() {
    if (taskListEl.querySelector('.subtask-placeholder')) {
      addRootTaskArea.style.display = 'none';
    } else {
      addRootTaskArea.style.display = '';
    }
  }

  const todayStr = fmt(new Date());

  function createAndAddTask(taskData) {
    let parentTask = taskData.parentTask;
    let level = parentTask ? (parentTask.level + 1) : 0;
    if (parentTask && parentTask.id) {
      parentTask = store.tasks.find(t => t.id === parentTask.id) || parentTask;
    }
    if (!taskData.id) taskData.id = generateTaskId();
    const el = createTaskRow(document, wrapper, {
      ...taskData,
      parentTask,
      registerTask: () => {},
      level,
    });
    const task = el.task;
    task.el = el;
    store.addTask(task);
    focusTaskTitle(el);
    return el;
  }

  window.taskBoard = {
    el: board,
    store,
    renderTasks,
    createAndAddTask,
  };

  // --- DRAG & DROP INTEGRADO ---
  function showDropPill() {
    let pill = document.querySelector('.drop-pill');
    if (!pill) {
      pill = document.createElement('div');
      pill.className = 'drop-pill';
      pill.innerHTML = '<i class="bi bi-arrow-repeat me-1"></i> Tasks serão reorganizadas com base em data e prioridade';
      document.body.appendChild(pill);
    }
    pill.classList.add('show');
    setTimeout(() => pill.classList.remove('show'), 3000);
  }

  (function enableDragAndDrop() {
    let draggingTask = null;
    board.addEventListener('dragstart', e => {
      const linha = e.target.closest('.linha-task');
      if (!linha || !linha.task) return;
      draggingTask = linha.task;
      linha.classList.add('dragging');
      e.dataTransfer.effectAllowed = "move";
    });
    board.addEventListener('dragend', e => {
      const linha = e.target.closest('.linha-task');
      if (linha) linha.classList.remove('dragging');
      draggingTask = null;
    });
    board.addEventListener('dragover', e => {
      const over = e.target.closest('.linha-task');
      if (!draggingTask) return;
      if (over && over !== draggingTask.el) {
        e.preventDefault();
        over.classList.add('drag-over');
      } else if (!over) {
        e.preventDefault();
      }
    });
    board.addEventListener('dragleave', e => {
      const over = e.target.closest('.linha-task');
      if (over) over.classList.remove('drag-over');
    });
    board.addEventListener('drop', e => {
      const targetRow = e.target.closest('.linha-task');
      document.querySelectorAll('.linha-task.drag-over').forEach(el => el.classList.remove('drag-over'));
      if (!draggingTask) return;
      if (!targetRow) {
        store.moveTask(draggingTask.id, store.tasks[0]?.id, 'before');
        setTimeout(renderTasks, 0);
        return;
      }
      const overTask = targetRow.task;
      if (draggingTask === overTask || isDescendant(overTask, draggingTask)) return;
      store.moveTask(draggingTask.id, overTask.id, 'child');
      setTimeout(renderTasks, 0);
    });
  })();

  // ===== DELEGAÇÃO DE EVENTO PARA PLACEHOLDER =====
  let mouseEnterTimer = null;
  taskListEl.addEventListener('mouseenter', function(e) {
    const rowEl = e.target.closest('.linha-task:not(.subtask-placeholder)');
    if (rowEl && taskListEl.contains(rowEl)) {
      clearTimeout(mouseEnterTimer);
      mouseEnterTimer = setTimeout(() => {
        window.showSubtaskPlaceholder(wrapper, taskListEl, rowEl);
      }, 100);
    }
  }, true);

  // --- RENDER ---
  function renderTasks() {
    document.querySelectorAll('.subtask-placeholder').forEach(p => p.remove());
    taskListEl.innerHTML = '';
    const renderedIds = new Set();

    // Tarefas atrasadas roots (em today)
    const atrasadasRoots = (currentDay === 'today')
      ? store.tasks.filter(t =>
          t.due_date && t.due_date < todayStr && !t.completed && !t.parentTask)
      : [];

    // Render atrasados em um alertBox
    let alertBox = null;
    if (atrasadasRoots.length > 0) {
      alertBox = document.createElement('div');
      alertBox.className = 'alert alert-danger mb-3 py-2';
      alertBox.innerHTML = `<strong>Tarefas atrasadas:</strong>`;
      taskListEl.appendChild(alertBox);
      atrasadasRoots.forEach(rootTask => {
        renderTaskTree(rootTask, alertBox);
      });
    }

    // Agora, renderiza as tasks roots do filtro atual, menos as atrasadas já desenhadas
    store.tasks.forEach(task => {
      if (renderedIds.has(task.id)) return;
      let show = true;
      if (!showCompleted && task.completed) show = false;
      if (!task.parentTask) {
        if (currentDay === 'anteriores') show = show && task.due_date && task.due_date < todayStr;
        else if (currentDay === 'today') show = show && task.due_date === todayStr;
        else if (currentDay === 'tomorrow') show = show && task.due_date && task.due_date > todayStr;
        else if (currentDay === 'semdata') show = show && !task.due_date;
      } else {
        show = false; // subtasks só via pai
      }
      if (show) renderTaskTree(task, taskListEl);
    });

    showOrHideFooterAddTask();

    function renderTaskTree(parentTask, container) {
      if (parentTask.parentTask) {
        parentTask.el.classList.add('subtask');
        parentTask.el.querySelector('.task')?.classList.add('subtask');
      } else {
        parentTask.el.classList.remove('subtask');
        parentTask.el.querySelector('.task')?.classList.remove('subtask');
      }
      parentTask.el.style.setProperty('--level', parentTask.level);
      if (!renderedIds.has(parentTask.id)) {
        container.appendChild(parentTask.el);
        renderedIds.add(parentTask.id);
      }
      store.tasks.forEach(sub => {
        if (sub.parentTask === parentTask && !renderedIds.has(sub.id)) {
          renderTaskTree(sub, container);
        }
      });
    }
  }

  // Observador para o footer
  const observer = new MutationObserver(() => { showOrHideFooterAddTask(); });
  observer.observe(taskListEl, { childList: true, subtree: true });

  window.destroyTaskBoard = function() { observer.disconnect(); };
  renderTasks();

  return [board, store.tasks, { el: board, store, renderTasks, createAndAddTask }];
}
