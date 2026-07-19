  const taskInput = document.getElementById('taskInput');
  const addBtn = document.getElementById('addBtn');
  const taskList = document.getElementById('taskList');
  const emptyState = document.getElementById('emptyState');
  const statsText = document.getElementById('statsText');
  const clearCompletedBtn = document.getElementById('clearCompleted');
  const filterBtns = document.querySelectorAll('.filter-btn');

  const STORAGE_KEY = 'taskmanager-tasks';
  let currentFilter = 'all';

  // ---------- Storage helpers ----------
  function loadTasks() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error('Failed to load tasks from localStorage:', e);
      return [];
    }
  }

  function saveTasks(tasks) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.error('Failed to save tasks to localStorage:', e);
    }
  }

  let tasks = loadTasks();

  // ---------- Rendering ----------
  function render() {
    taskList.innerHTML = '';

    const filtered = tasks.filter(t => {
      if (currentFilter === 'active') return !t.completed;
      if (currentFilter === 'completed') return t.completed;
      return true;
    });

    if (filtered.length === 0) {
      emptyState.classList.remove('hidden');
    } else {
      emptyState.classList.add('hidden');
    }

    filtered.forEach(task => {
      const li = document.createElement('li');
      li.className = 'task-item' + (task.completed ? ' completed' : '');

      const checkbox = document.createElement('button');
      checkbox.className = 'task-checkbox' + (task.completed ? ' checked' : '');
      checkbox.textContent = task.completed ? '✓' : '';
      checkbox.addEventListener('click', () => toggleTask(task.id));

      const text = document.createElement('span');
      text.className = 'task-text';
      text.textContent = task.text;

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-btn';
      deleteBtn.textContent = '✕';
      deleteBtn.addEventListener('click', () => deleteTask(task.id));

      li.appendChild(checkbox);
      li.appendChild(text);
      li.appendChild(deleteBtn);
      taskList.appendChild(li);
    });

    const activeCount = tasks.filter(t => !t.completed).length;
    const completedCount = tasks.filter(t => t.completed).length;
    statsText.textContent = `${activeCount} active, ${completedCount} completed`;
    clearCompletedBtn.style.display = completedCount > 0 ? 'inline' : 'none';
  }

  // ---------- Actions ----------
  function addTask(text) {
    const trimmed = text.trim();
    if (!trimmed) return;

    tasks.push({
      id: Date.now().toString(),
      text: trimmed,
      completed: false
    });

    saveTasks(tasks);
    render();
    taskInput.value = '';
    taskInput.focus();
  }

  function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks(tasks);
    render();
  }

  function toggleTask(id) {
    tasks = tasks.map(t =>
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    saveTasks(tasks);
    render();
  }

  function clearCompleted() {
    tasks = tasks.filter(t => !t.completed);
    saveTasks(tasks);
    render();
  }

  // ---------- Event listeners ----------
  addBtn.addEventListener('click', () => addTask(taskInput.value));
  taskInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addTask(taskInput.value);
  });

  clearCompletedBtn.addEventListener('click', clearCompleted);

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      render();
    });
  });

  // ---------- Initial render ----------
  render();
