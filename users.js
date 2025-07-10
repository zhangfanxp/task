// Supabase 配置
const supabaseUrl = 'https://osbfjltpsyodpdkwyxiy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // 你的 anon key
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

let currentUser = null;

// 页面加载时执行
window.addEventListener('DOMContentLoaded', async () => {
  const userData = sessionStorage.getItem('currentUser');
  if (!userData) {
    alert('请先登录');
    location.href = 'index.html';
    return;
  }
  currentUser = JSON.parse(userData);

  if (currentUser.username !== 'admin') {
    alert('只有管理员可以访问此页面');
    location.href = 'index.html';
    return;
  }

  loadUsers();
});

async function loadUsers() {
  const { data, error } = await supabase.from('users').select('*');
  if (error) {
    alert('加载用户失败');
    return;
  }
  const tbody = document.getElementById('usersTableBody');
  tbody.innerHTML = '';
  data.forEach(user => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${user.id}</td>
      <td>${user.username}</td>
      <td>
        <button onclick="editUser(${user.id}, '${user.username}')">编辑</button>
        <button onclick="resetPassword(${user.id})">重置密码</button>
        <button onclick="deleteUser(${user.id})">删除</button>
      </td>`;
    tbody.appendChild(tr);
  });
}

function showAddUserForm() {
  document.getElementById('formTitle').innerText = '添加用户';
  document.getElementById('userId').value = '';
  document.getElementById('username').value = '';
  document.getElementById('password').value = '';
  document.getElementById('userForm').classList.remove('hidden');
}

function editUser(id, username) {
  document.getElementById('formTitle').innerText = '编辑用户';
  document.getElementById('userId').value = id;
  document.getElementById('username').value = username;
  document.getElementById('password').value = '';
  document.getElementById('userForm').classList.remove('hidden');
}

async function submitUserForm() {
  const id = document.getElementById('userId').value;
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  if (!username || (!id && !password)) {
    alert('请输入完整信息');
    return;
  }

  if (id) {
    // 编辑
    const updates = password ? { username, password } : { username };
    await supabase.from('users').update(updates).eq('id', id);
  } else {
    // 新增
    await supabase.from('users').insert([{ username, password }]);
  }

  hideUserForm();
  loadUsers();
}

function hideUserForm() {
  document.getElementById('userForm').classList.add('hidden');
}

async function deleteUser(id) {
  if (confirm('确认删除该用户？')) {
    await supabase.from('users').delete().eq('id', id);
    loadUsers();
  }
}

async function resetPassword(id) {
  const newPwd = prompt('请输入新密码：');
  if (newPwd) {
    await supabase.from('users').update({ password: newPwd }).eq('id', id);
    alert('密码已重置');
  }
}

function logout() {
  location.href = 'index.html';
}

