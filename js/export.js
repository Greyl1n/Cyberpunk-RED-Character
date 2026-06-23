function exportCharacter() {
  if (!confirm('Export character as JSON file?')) return;
  var data = getCharacterData();
  var handle = data.handle || data.name || "character";
  var name = handle.replace(/[^a-zA-Z0-9_-]/g, "_") + "_cpr.json";
  var blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  var url = URL.createObjectURL(blob);
  var a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function importCharacter(file) {
  if (!confirm('Import character from "' + file.name + '"? Current data will be lost.')) return;
  var reader = new FileReader();
  reader.onload = function(e) {
    try {
      var data = JSON.parse(e.target.result);
      if (!data.stats) {
        alert("Invalid character data: missing stats");
        return;
      }
      loadCharacterData(data);
      alert("Character imported successfully!");
    } catch(err) {
      alert("Failed to import character: " + err.message);
    }
  };
  reader.readAsText(file);
}

function printCharacter() {
  document.body.classList.add("printing");
  window.print();
  setTimeout(function() { document.body.classList.remove("printing"); }, 100);
}
