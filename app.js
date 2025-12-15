// ===== State =====
let tasks = JSON.parse(localStorage.getItem("focusflow-tasks")) || [];

let timer = {
  running: false,
  timeLeft: 0,
  interval: null,
  currentTaskId: null
};

// ===== DOM =====
const form = document.getElementById("task-form");
const input = document.getElementById("task-title");
const minutesInput = document.getElementById("task-minutes");
const list = document.getElementById("task-list");
const timerDisplay = document.getElementById("timer-display");
const startBtn = document.getElementById("start-btn");

// ===== Persistence =====
function saveTasks() {
  localStorage.setItem("focusflow-tasks", JSON.stringify(tasks));
}

// ===== Utilities =====
function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

// ===== Timer Logic =====
function startTimer() {
  if (timer.running || timer.currentTaskId === null) return;

  timer.running = true;
  startBtn.textContent = "Stop";

  timer.interval = setInterval(() => {
    const task = tasks.find(t => t.id === timer.currentTaskId);
    if (!task) return;

    timer.timeLeft--;
    task.remaining = timer.timeLeft;
    timerDisplay.textContent = formatTime(timer.timeLeft);

    if (timer.timeLeft <= 0) {
      completeSession(task);
    }
  }, 1000);
}

function stopTimer() {
  timer.running = false;
  clearInterval(timer.interval);
  startBtn.textContent = "Start";
}

function completeSession(task) {
  stopTimer();
  task.sessions++;
  task.remaining = task.duration;
  timer.timeLeft = task.remaining;
  saveTasks();
  renderTasks();
  timerDisplay.textContent = formatTime(timer.timeLeft);
}

// ===== Render =====
function renderTasks() {
  list.innerHTML = "";

  tasks.forEach(task => {
    const li = document.createElement("li");
    if (task.id === timer.currentTaskId) li.classList.add("active");

    const info = document.createElement("div");
    info.className = "task-info";
    info.innerHTML = `
      <strong>${task.title}</strong><br>
      <span class="session-count">${task.sessions} sessions</span>
    `;

    const focusBtn = document.createElement("button");
    focusBtn.textContent = "Focus";
    focusBtn.className = "select-btn";
    focusBtn.addEventListener("click", () => {
      if (timer.running) stopTimer();
      timer.currentTaskId = task.id;
      timer.timeLeft = task.remaining;
      timerDisplay.textContent = formatTime(timer.timeLeft);
      renderTasks();
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "✕";
    deleteBtn.className = "delete-btn";
    deleteBtn.addEventListener("click", () => {
      if (task.id === timer.currentTaskId) stopTimer();
      tasks = tasks.filter(t => t.id !== task.id);
      saveTasks();
      renderTasks();
      timerDisplay.textContent = "00:00";
    });

    li.append(info, focusBtn, deleteBtn);
    list.appendChild(li);
  });
}

// ===== Events =====
form.addEventListener("submit", e => {
  e.preventDefault();

  const minutes = Number(minutesInput.value);

  tasks.push({
    id: Date.now(),
    title: input.value.trim(),
    sessions: 0,
    duration: minutes * 60,
    remaining: minutes * 60
  });

  saveTasks();
  renderTasks();
  form.reset();
});

startBtn.addEventListener("click", () => {
  timer.running ? stopTimer() : startTimer();
});

// ===== Init =====
renderTasks();
