const STORAGE_KEY = "kanban-data";

export async function loadState() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : null;
}

export async function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
