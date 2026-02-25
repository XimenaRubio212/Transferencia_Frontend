// API wrapper for tasks
const BASE = 'http://localhost:3000';

export async function getTasksByUser(userId) {
  const res = await fetch(`${BASE}/tasks?userId=${userId}`);
  if (!res.ok) throw new Error('Error fetching tasks');
  return res.json();
}

export async function createTask(task) {
  const res = await fetch(`${BASE}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(task)
  });
  if (!res.ok) throw new Error('Error creating task');
  return res.json();
}

export async function deleteTask(id) {
  const res = await fetch(`${BASE}/tasks/${id}`, { method: 'DELETE' });
  return res.ok;
}

export async function updateTask(id, data) {
  const res = await fetch(`${BASE}/tasks/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Error updating task');
  return res.json();
}
