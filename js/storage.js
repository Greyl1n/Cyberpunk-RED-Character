// PERSISTENCE — Save/load/delete/export/import
// ============================================================
const saveCharacter = (name) => {
  const data = getCharacterData();
  data._saveName = name;
  data._savedAt = new Date().toISOString();
  const key = `cpr_char_${name}`;
  localStorage.setItem(key, JSON.stringify(data));
  return true;
};

const loadCharacter = (name) => {
  const key = `cpr_char_${name}`;
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
};

const deleteCharacter = (name) => {
  const key = `cpr_char_${name}`;
  localStorage.removeItem(key);
};

const listCharacters = () => {
  const chars = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.indexOf("cpr_char_") === 0) {
      chars.push(key.substring(9));
    }
  }
  chars.sort();
  return chars;
};
