// 任务管理模块
let tasks = [];
let editingTaskId = null;

const taskInput = document.getElementById('task-input');
const addTaskBtn = document.getElementById('add-task-btn');
const taskList = document.getElementById('task-list');
const taskCount = document.getElementById('task-count');

function renderTasks() {
  taskList.innerHTML = '';
  let completed = 0;
  tasks.forEach((task, idx) => {
    const li = document.createElement('li');
    li.className = 'task-item' + (task.completed ? ' completed' : '');
    li.innerHTML = `
      <span>${task.text}</span>
      <div class="task-actions">
        <button onclick="toggleTask(${idx})" title="完成/未完成"><i class="fa fa-check-circle"></i></button>
        <button onclick="editTask(${idx})" title="编辑"><i class="fa fa-edit"></i></button>
        <button onclick="deleteTask(${idx})" title="删除"><i class="fa fa-trash"></i></button>
      </div>
    `;
    taskList.appendChild(li);
    if (task.completed) completed++;
  });
  taskCount.textContent = `已完成 ${completed} / 总计 ${tasks.length}`;
}

addTaskBtn.onclick = () => {
  const val = taskInput.value.trim();
  if (!val) return;
  if (editingTaskId !== null) {
    tasks[editingTaskId].text = val;
    editingTaskId = null;
    addTaskBtn.textContent = '添加任务';
  } else {
    tasks.push({ text: val, completed: false });
  }
  taskInput.value = '';
  renderTasks();
};

taskInput.onkeydown = e => {
  if (e.key === 'Enter') addTaskBtn.onclick();
};

window.toggleTask = idx => {
  tasks[idx].completed = !tasks[idx].completed;
  renderTasks();
};
window.editTask = idx => {
  taskInput.value = tasks[idx].text;
  editingTaskId = idx;
  addTaskBtn.textContent = '保存';
};
window.deleteTask = idx => {
  tasks.splice(idx, 1);
  renderTasks();
};

// 番茄钟模块
let mode = 'focus'; // focus or break
let timer = 30 * 60;
let timerInterval = null;
let pomodoroCount = 0;
let totalFocusSeconds = 0;

const timerDisplay = document.getElementById('timer-display');
const modeIndicator = document.getElementById('mode-indicator');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');
const pomodoroCountEl = document.getElementById('pomodoro-count');
const focusTimeEl = document.getElementById('focus-time');

function updateTimerDisplay() {
  const min = String(Math.floor(timer / 60)).padStart(2, '0');
  const sec = String(timer % 60).padStart(2, '0');
  timerDisplay.textContent = `${min}:${sec}`;
  modeIndicator.textContent = mode === 'focus' ? '专注中' : '休息中';
  modeIndicator.className = mode === 'focus' ? 'focus' : 'break';
}

function startTimer() {
  if (timerInterval) return;
  timerInterval = setInterval(() => {
    if (timer > 0) {
      timer--;
      if (mode === 'focus') totalFocusSeconds++;
      updateTimerDisplay();
    } else {
      clearInterval(timerInterval);
      timerInterval = null;
      if (mode === 'focus') {
        pomodoroCount++;
        pomodoroCountEl.textContent = pomodoroCount;
        switchMode('break');
      } else {
        switchMode('focus');
      }
    }
    focusTimeEl.textContent = `${Math.floor(totalFocusSeconds/60)} 分钟`;
  }, 1000);
}

function pauseTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}

function resetTimer() {
  pauseTimer();
  timer = mode === 'focus' ? 30 * 60 : 5 * 60;
  updateTimerDisplay();
}

function switchMode(newMode) {
  mode = newMode;
  timer = mode === 'focus' ? 30 * 60 : 5 * 60;
  updateTimerDisplay();
}

startBtn.onclick = startTimer;
pauseBtn.onclick = pauseTimer;
resetBtn.onclick = resetTimer;

updateTimerDisplay();

// 数据统计模块
const todayTaskEl = document.getElementById('today-task');
function updateStats() {
  todayTaskEl.textContent = tasks.filter(t => t.completed).length;
}

// 监听任务变化，更新统计
const origRenderTasks = renderTasks;
renderTasks = function() {
  origRenderTasks();
  updateStats();
};
renderTasks();
