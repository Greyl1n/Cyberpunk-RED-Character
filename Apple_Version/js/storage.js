// PERSISTENCE — Save/load/delete/export/import
// ============================================================

// iOS Safari throws SecurityError when accessing localStorage on file://
let _mockStorage = {};
let _useMock = false;

try {
  localStorage.setItem('_test', '1');
  localStorage.removeItem('_test');
} catch (e) {
  _useMock = true;
  console.warn("localStorage unavailable (iOS local file). Using volatile memory.");
}

const safeSetItem = (key, val) => {
  if (_useMock) _mockStorage[key] = val;
  else localStorage.setItem(key, val);
};

const safeGetItem = (key) => {
  return _useMock ? _mockStorage[key] : localStorage.getItem(key);
};

const safeRemoveItem = (key) => {
  if (_useMock) delete _mockStorage[key];
  else localStorage.removeItem(key);
};

const safeGetKeys = () => {
  if (_useMock) return Object.keys(_mockStorage);
  let keys = [];
  for (let i = 0; i < localStorage.length; i++) {
    keys.push(localStorage.key(i));
  }
  return keys;
};

const saveCharacter = (name) => {
  try {
    const data = getCharacterData();
    data._saveName = name;
    data._savedAt = new Date().toISOString();
    const key = `cpr_char_${name}`;
    safeSetItem(key, JSON.stringify(data));
    return true;
  } catch (e) {
    alert("Failed to save character. If on iOS, use Export instead.");
    return false;
  }
};

const loadCharacter = (name) => {
  try {
    const key = `cpr_char_${name}`;
    const raw = safeGetItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
};

const deleteCharacter = (name) => {
  try {
    const key = `cpr_char_${name}`;
    safeRemoveItem(key);
  } catch (e) {}
};

const listCharacters = () => {
  try {
    const chars = [];
    const keys = safeGetKeys();
    for (const key of keys) {
      if (key.indexOf("cpr_char_") === 0) {
        chars.push(key.substring(9));
      }
    }
    chars.sort();
    return chars;
  } catch (e) {
    return [];
  }
};
