const FILES_KEY = 'easyshare_files';
const ACTIVITY_KEY = 'easyshare_activity';

export function getFiles() {
  try {
    const data = localStorage.getItem(FILES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveFile(fileMeta) {
  const files = getFiles();
  files.unshift(fileMeta);
  localStorage.setItem(FILES_KEY, JSON.stringify(files));
}

export function deleteFile(id) {
  const file = getFiles().find((f) => f.id === id);
  const files = getFiles().filter((f) => f.id !== id);
  localStorage.setItem(FILES_KEY, JSON.stringify(files));
  if (file) {addActivity('deleted', file.name);}
}

export function getActivity() {
  try {
    const data = localStorage.getItem(ACTIVITY_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function clearActivity() {
  localStorage.removeItem(ACTIVITY_KEY);
}

export function addActivity(action, fileName) {
  const activity = getActivity();
  const timeLabels = ['just now', '1 min ago', '5 min ago', '30 min ago'];
  const time = timeLabels[Math.floor(Math.random() * timeLabels.length)];
  const iconMap = {
    uploaded: '📤',
    downloaded: '📥',
    deleted: '🗑️',
    edited: '✏️',
    shared: '🔗',
  };
  activity.unshift({
    id: generateId(),
    action,
    file: fileName,
    time,
    icon: iconMap[action] || '📄',
  });
  if (activity.length > 50) {activity.length = 50;}
  localStorage.setItem(ACTIVITY_KEY, JSON.stringify(activity));
}

let nextId = +(localStorage.getItem('easyshare_id_counter') ?? Date.now());

export function generateId() {
  localStorage.setItem('easyshare_id_counter', String(++nextId));
  return nextId;
}
