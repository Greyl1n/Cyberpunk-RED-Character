// PERSISTENCE — Save/load/delete/export/import
// ============================================================

/**
 * saveCharacter(name)
 * This function takes the current state of the character from the app
 * and saves it into the browser's built-in "localStorage".
 * localStorage is like a tiny hard drive inside your web browser that
 * remembers data even if you refresh or close the page.
 */
const saveCharacter = (name) => {
  const data = getCharacterData();
  data._saveName = name;
  data._savedAt = new Date().toISOString();
  const key = `cpr_char_${name}`;
  localStorage.setItem(key, JSON.stringify(data));
  return true;
};

/**
 * loadCharacter(name)
 * This function retrieves a saved character from localStorage.
 * It uses JSON.parse() to turn the raw text back into a usable JavaScript object.
 * If it fails (or the character doesn't exist), it safely returns null.
 */
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

/**
 * deleteCharacter(name)
 * Removes a specific character's saved data from localStorage permanently.
 */
const deleteCharacter = (name) => {
  const key = `cpr_char_${name}`;
  localStorage.removeItem(key);
};

/**
 * listCharacters()
 * This function looks through everything saved in the browser's localStorage.
 * It checks if the saved item's key starts with "cpr_char_" (which means it's a character),
 * and adds it to a list so the app can display all your saved characters.
 */
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
