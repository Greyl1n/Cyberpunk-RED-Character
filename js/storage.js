function saveCharacter(name) {
  var data = getCharacterData();
  data._saveName = name;
  data._savedAt = new Date().toISOString();
  var key = "cpr_char_" + name;
  localStorage.setItem(key, JSON.stringify(data));
  return true;
}

function loadCharacter(name) {
  var key = "cpr_char_" + name;
  var raw = localStorage.getItem(key);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch(e) { return null; }
}

function deleteCharacter(name) {
  var key = "cpr_char_" + name;
  localStorage.removeItem(key);
}

function listCharacters() {
  var chars = [];
  for (var i = 0; i < localStorage.length; i++) {
    var key = localStorage.key(i);
    if (key.indexOf("cpr_char_") === 0) {
      chars.push(key.substring(9));
    }
  }
  chars.sort();
  return chars;
}

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
