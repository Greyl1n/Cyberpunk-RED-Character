// EXPORT/IMPORT AND PRINTING
// ============================================================

/**
 * buildCharList()
 * Grabs the list of all saved characters from localStorage (using listCharacters)
 * and builds HTML buttons for each one so you can click to select them in the Save/Load menu.
 */
const buildCharList = () => {
  const list = document.getElementById("charList");
  list.innerHTML = "";
  const chars = listCharacters();
  if (chars.length === 0) {
    list.innerHTML = '<div style="padding:0.5rem;opacity:0.6">No saved characters</div>';
    return;
  }
  for (const name of chars) {
    const div = document.createElement("div");
    div.className = "char-list-item";
    div.textContent = name;
    div.onclick = () => {
      document.getElementById("charSaveName").value = name;
    };
    list.appendChild(div);
  }
};

/**
 * exportCharacter()
 * Takes your character's data, converts it to JSON text, and tricks the browser
 * into downloading it as a `.json` file by creating an invisible link and clicking it.
 */
const exportCharacter = () => {
  if (!confirm('Export character as JSON file?')) return;
  const data = getCharacterData();
  const handle = data.handle || data.name || "character";
  const name = `${handle.replace(/[^a-zA-Z0-9_-]/g, "_")}_cpr.json`;
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * importCharacter(file)
 * Takes a file you selected from your computer, reads it as text,
 * parses it back into a JavaScript object (JSON), and loads it into the app.
 */
const importCharacter = (file) => {
  if (!confirm(`Import character from "${file.name}"? Current data will be lost.`)) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (!data.stats) {
        alert("Invalid character data: missing stats");
        return;
      }
      loadCharacterData(data);
      alert("Character imported successfully!");
    } catch (err) {
      alert(`Failed to import character: ${err.message}`);
    }
  };
  reader.readAsText(file);
};

/**
 * printCharacter()
 * Prepares the page for printing by adding a CSS class `printing`, which triggers
 * the @media print rules in our CSS to hide buttons and reorder tabs.
 * It then opens the browser's print dialog, and removes the class shortly after.
 */
const printCharacter = () => {
  document.body.classList.add("printing");
  window.print();
  setTimeout(() => {
    document.body.classList.remove("printing");
  }, 100);
};