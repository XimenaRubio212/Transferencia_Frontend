const BASE = 'http://localhost:3000';

export async function getUserByDocument(docId) {
    const res = await fetch(`${BASE}/usuarios?documento=${encodeURIComponent(docId)}`);
    if (!res.ok) throw new Error('Error fetching user');
    const users = await res.json();
    return users.length ? users[0] : null;
}
