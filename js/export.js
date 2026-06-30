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

const printCharacter = () => {
  document.body.classList.add("printing");
  window.print();
  setTimeout(() => {
    document.body.classList.remove("printing");
  }, 100);
};