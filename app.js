document.addEventListener('DOMContentLoaded', () => {
  const supabaseUrl = 'https://osbfjltpsyodpdkwyxiy.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zYmZqbHRwc3lvZHBka3d5eGl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwMjUwNTMsImV4cCI6MjA2NzYwMTA1M30.HCBBa3aJ7XodtMEZrDV8yiCHyKZ70_Y3yjSgo1OzgLQ';
  const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

  let currentUser = null;

  window.login = async function () {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value.trim();

    const { data: user } = await supabaseClient
      .from('users')
      .select('*')
      .eq('username', username)
      .eq('password', password)
      .single();

if (user) {
  currentUser = user;

  // 保存到 sessionStorage（供 users.html 验证用）
  sessionStorage.setItem('currentUser', JSON.stringify(currentUser));

  document.getElementById('loginPage').classList.add('hidden');
  document.getElementById('mainPage').classList.remove('hidden');

  // ✅ 如果是 admin，显示用户管理按钮
  if (currentUser.username === 'admin') {
    const btn = document.getElementById('userMgmtBtn');
    if (btn) btn.classList.remove('hidden');
  }

  loadTasks();
}

  async function loadTasks() {
    const { data: incompleteTasks } = await supabaseClient
      .from('schedules')
      .select('*')
      .eq('user_id', currentUser.id)
      .eq('is_completed', false)
      .order('created_at', { ascending: false });

    const container = document.getElementById('tasksContainer');
    container.innerHTML = '';
    incompleteTasks.forEach(task => {
      const div = document.createElement('div');
      div.className = 'task';
      div.innerHTML = `
        ${task.task}
        <span class="task-menu">
          <button onclick="completeTask('${task.id}')">完成</button>
          <button onclick="deleteTask('${task.id}')">删除</button>
        </span>`;
      container.appendChild(div);
    });

    loadCompletedTasks();
  }

  async function loadCompletedTasks() {
    const { data: completedTasks } = await supabaseClient
      .from('schedules')
      .select('*')
      .eq('user_id', currentUser.id)
      .eq('is_completed', true)
      .order('created_at', { ascending: false });

    const container = document.getElementById('completedContainer');
    container.innerHTML = '<h2>已完成任务</h2>';
    completedTasks.forEach(task => {
      const div = document.createElement('div');
      div.className = 'task';
      div.textContent = task.task;
      container.appendChild(div);
    });
  }

  window.addTask = async function () {
    const taskText = document.getElementById('newTask').value.trim();
    if (!taskText) return;

    await supabaseClient.from('schedules').insert([
      { task: taskText, is_completed: false, user_id: currentUser.id }
    ]);
    document.getElementById('newTask').value = '';
    loadTasks();
  };

  window.completeTask = async function (id) {
    await supabaseClient.from('schedules').update({ is_completed: true }).eq('id', id);
    loadTasks();
  };

  window.deleteTask = async function (id) {
    await supabaseClient.from('schedules').delete().eq('id', id);
    loadTasks();
  };

  window.showTab = function (tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active-tab'));
    document.getElementById('completedContainer').classList.add('hidden');
    document.querySelector('#tasksContainer').parentElement.querySelector('h2').innerText = '未完成任务';

    if (tab === 'completed') {
      document.getElementById('completedContainer').classList.remove('hidden');
      document.querySelectorAll('.tab-btn')[1].classList.add('active-tab');
    } else {
      document.querySelectorAll('.tab-btn')[0].classList.add('active-tab');
    }
  };

  window.logout = function() {
    currentUser = null;
    document.getElementById('mainPage').classList.add('hidden');
    document.getElementById('loginPage').classList.remove('hidden');
    document.getElementById('loginUsername').value = '';
    document.getElementById('loginPassword').value = '';
  };
}
