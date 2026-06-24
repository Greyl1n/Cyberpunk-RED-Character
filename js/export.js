function buildCharList() {
  var list = document.getElementById("charList");
  list.innerHTML = "";
  var chars = listCharacters();
  if (chars.length === 0) {
    list.innerHTML = '<div style="padding:0.5rem;opacity:0.6">No saved characters</div>';
    return;
  }
  for (var i = 0; i < chars.length; i++) {
    (function(name) {
      var div = document.createElement("div");
      div.className = "char-list-item";
      div.textContent = name;
      div.onclick = function() {
        document.getElementById("charSaveName").value = name;
      };
      list.appendChild(div);
    })(chars[i]);
  }
}
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