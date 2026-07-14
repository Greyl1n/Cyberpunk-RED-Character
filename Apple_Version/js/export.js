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
const exportCharacter = async () => {
  if (!await customConfirm('Export character as JSON file?')) return;
  const data = getCharacterData();
  const handle = data.handle || data.name || "character";
  const name = `${handle.replace(/[^a-zA-Z0-9_-]/g, "_")}_cpr.json`;
  const jsonStr = JSON.stringify(data, null, 2);
  
  try {
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (e) {
    // Fallback for strict iOS / WebKit local file restrictions
    const fallbackDiv = document.createElement("div");
    fallbackDiv.style.cssText = "position:fixed;top:10%;left:10%;right:10%;bottom:10%;background:#111;border:2px solid #ff4040;z-index:9999;padding:20px;overflow:auto;";
    fallbackDiv.innerHTML = `
      <h3 style="color:#ff4040;margin-bottom:10px;">Export Fallback</h3>
      <p style="margin-bottom:10px;">Your browser blocked the automatic download. Copy the text below and save it as a .json file manually.</p>
      <textarea style="width:100%;height:70%;background:#000;color:#0f0;font-family:monospace;padding:10px;">${jsonStr}</textarea>
      <button style="margin-top:10px;padding:10px;background:#ff4040;color:#fff;border:none;cursor:pointer;" onclick="this.parentElement.remove()">Close</button>
    `;
    document.body.appendChild(fallbackDiv);
  }
};

/**
 * importCharacter(file)
 * Takes a file you selected from your computer, reads it as text,
 * parses it back into a JavaScript object (JSON), and loads it into the app.
 */
const importCharacter = async (file) => {
  if (!await customConfirm(`Import character from "${file.name}"? Current data will be lost.`)) return;
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