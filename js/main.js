// ============================================================
// INIT — Bootstrap and event binding
// ============================================================
function init() {
  initState();
  initRoleSelect();
  renderStats();
  renderSkills();
  renderHealth();
  renderHumanity();
  renderWeapons();
  renderArmor();
  renderCyberware();
  renderGear();
  renderAmmoTracker();
  initLifepath();
  initAddButtons();
  initTabs();
  initWelcome();
  initCharManager();
  initTheme();
  initExportImport();
  initNewChar();
  initPrint();
  initSkillSearch();
  setDefaultValues();
}

function initTabs() {
  var buttons = document.querySelectorAll(".tab-btn");
  for (var i = 0; i < buttons.length; i++) {
    (function(btn) {
      btn.onclick = function() {
        var tabId = this.dataset.tab;
        var allPanels = document.querySelectorAll(".tab-panel");
        for (var j = 0; j < allPanels.length; j++) {
          allPanels[j].classList.remove("active");
        }
        var allBtns = document.querySelectorAll(".tab-btn");
        for (var j = 0; j < allBtns.length; j++) {
          allBtns[j].classList.remove("active");
        }
        document.getElementById(tabId).classList.add("active");
        this.classList.add("active");
        state.currentTab = tabId;
      };
    })(buttons[i]);
  }
}

function initWelcome() {
  var overlay = document.getElementById("welcomeOverlay");
  var startBtn = document.getElementById("welcomeStartBtn");
  function dismissWelcome() {
    overlay.style.display = "none";
    overlay.classList.add("hidden");
  }
  function onTap(e) {
    if (e.target === overlay || startBtn.contains(e.target)) {
      dismissWelcome();
      e.preventDefault();
    }
  }
  overlay.addEventListener("click", onTap);
  overlay.addEventListener("touchend", onTap, { passive: false });
  startBtn.addEventListener("click", dismissWelcome);
  startBtn.addEventListener("touchend", function(e) { e.preventDefault(); dismissWelcome(); }, { passive: false });
}

function initCharManager() {
  var modal = document.getElementById("characterModal");
  var openBtn = document.getElementById("charactersBtn");
  var closeBtn = document.getElementById("charCloseBtn");
  var saveBtn = document.getElementById("charSaveBtn");
  var loadBtn = document.getElementById("charLoadBtn");
  var delBtn = document.getElementById("charDeleteBtn");
  var newBtn = document.getElementById("charNewBtn");
  var nameInput = document.getElementById("charSaveName");

  openBtn.onclick = function() {
    buildCharList();
    modal.classList.add("active");
    modal.style.display = "flex";
  };
  closeBtn.onclick = function() {
    modal.classList.remove("active");
    modal.style.display = "none";
  };
  window.onclick = function(e) {
    if (e.target === modal) {
      modal.classList.remove("active");
      modal.style.display = "none";
    }
  };
  saveBtn.onclick = function() {
    var name = nameInput.value.trim();
    if (!name) { alert("Enter a name to save."); return; }
    var exists = listCharacters().indexOf(name) !== -1;
    if (exists && !confirm('Overwrite existing character "' + name + '"?')) return;
    saveCharacter(name);
    buildCharList();
    alert("Character saved as \"" + name + "\"");
  };
  loadBtn.onclick = function() {
    var name = nameInput.value.trim();
    if (!name) { alert("Select or enter a character name to load."); return; }
    var data = loadCharacter(name);
    if (!data) { alert("Character \"" + name + "\" not found."); return; }
    if (!confirm('Load "' + name + '"? Current character data will be lost.')) return;
    loadCharacterData(data);
    modal.classList.remove("active");
    modal.style.display = "none";
    alert("Character \"" + name + "\" loaded!");
  };
  delBtn.onclick = function() {
    var name = nameInput.value.trim();
    if (!name) { alert("Select a character to delete."); return; }
    if (!confirm("Delete \"" + name + "\"? This cannot be undone.")) return;
    deleteCharacter(name);
    buildCharList();
    nameInput.value = "";
    alert("Character deleted.");
  };
  newBtn.onclick = function() {
    if (!confirm("Create a new character? Current data will be lost.")) return;
    resetCharacter();
    modal.classList.remove("active");
    modal.style.display = "none";
    document.getElementById("char_handle").focus();
  };
}

function initTheme() {
  var toggle = document.getElementById("themeToggle");
  var theme = document.getElementById("theme");
  var current = localStorage.getItem("cpr_theme") || "light";
  theme.href = "css/theme-" + current + ".css";
  toggle.onclick = function() {
    var cur = theme.href.indexOf("theme-light") !== -1 ? "light" : "dark";
    var next = cur === "light" ? "dark" : "light";
    theme.href = "css/theme-" + next + ".css";
    localStorage.setItem("cpr_theme", next);
  };
}

function initExportImport() {
  document.getElementById("exportBtn").onclick = exportCharacter;
  document.getElementById("importBtn").onclick = function() {
    document.getElementById("importFile").click();
  };
  document.getElementById("importFile").onchange = function(e) {
    if (e.target.files.length > 0) {
      importCharacter(e.target.files[0]);
    }
    this.value = "";
  };
}

function initNewChar() {
  document.getElementById("randomBtn").onclick = function() {
    if (!confirm("Generate a random character? Current data will be lost.")) return;
    generateRandomCharacter();
  };
  document.getElementById("newCharBtn").onclick = function() {
    if (!confirm("Create a new character? Current data will be lost.")) return;
    resetCharacter();
    document.getElementById("char_handle").focus();
  };
}

function initPrint() {
  document.getElementById("printBtn").onclick = printCharacter;
}

function initSkillSearch() {
  document.getElementById("skillSearch").oninput = function() {
    renderSkills();
  };
}

function setDefaultValues() {
  var hp = document.getElementById("hp_current");
  if (!hp.value || parseInt(hp.value) === 0) {
    var body = state.stats.body || 2;
    hp.value = calcHitsMax(body);
  }
}

document.addEventListener("DOMContentLoaded", init);