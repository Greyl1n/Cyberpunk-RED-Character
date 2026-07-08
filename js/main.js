// ============================================================
// INIT — Bootstrap and event binding
// ============================================================
const init = () => {
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
  initCyberdeck();
  initTabs();
  initWelcome();
  initCharManager();
  initTheme();
  initExportImport();
  initNewChar();
  initPrint();
  initSkillSearch();
  initCurrency();
  setDefaultValues();
};

const initTabs = () => {
  const buttons = document.querySelectorAll(".tab-btn");
  for (const btn of buttons) {
    btn.addEventListener("click", function() {
      const tabId = this.dataset.tab;
      const allPanels = document.querySelectorAll(".tab-panel");
      for (const panel of allPanels) {
        panel.classList.remove("active");
      }
      const allBtns = document.querySelectorAll(".tab-btn");
      for (const b of allBtns) {
        b.classList.remove("active");
      }
      document.getElementById(tabId).classList.add("active");
      this.classList.add("active");
      state.currentTab = tabId;
    });
  }
};

const initWelcome = () => {
  const overlay = document.getElementById("welcomeOverlay");
  const startBtn = document.getElementById("welcomeStartBtn");
  const dismissWelcome = () => {
    overlay.style.display = "none";
    overlay.classList.add("hidden");
  };
  const onTap = (e) => {
    if (e.target === overlay || startBtn.contains(e.target)) {
      dismissWelcome();
      e.preventDefault();
    }
  };
  overlay.addEventListener("click", onTap);
  overlay.addEventListener("touchend", onTap, { passive: false });
  startBtn.addEventListener("click", dismissWelcome);
  startBtn.addEventListener("touchend", (e) => { e.preventDefault(); dismissWelcome(); }, { passive: false });
};

const initCharManager = () => {
  const modal = document.getElementById("characterModal");
  const openBtn = document.getElementById("charactersBtn");
  const closeBtn = document.getElementById("charCloseBtn");
  const saveBtn = document.getElementById("charSaveBtn");
  const loadBtn = document.getElementById("charLoadBtn");
  const delBtn = document.getElementById("charDeleteBtn");
  const newBtn = document.getElementById("charNewBtn");
  const nameInput = document.getElementById("charSaveName");

  openBtn.addEventListener("click", () => {
    buildCharList();
    modal.classList.add("active");
    modal.style.display = "flex";
  });
  closeBtn.addEventListener("click", () => {
    modal.classList.remove("active");
    modal.style.display = "none";
  });
  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.remove("active");
      modal.style.display = "none";
    }
  });
  saveBtn.addEventListener("click", () => {
    const name = nameInput.value.trim();
    if (!name) { alert("Enter a name to save."); return; }
    const exists = listCharacters().includes(name);
    if (exists && !confirm(`Overwrite existing character "${name}"?`)) return;
    saveCharacter(name);
    buildCharList();
    alert(`Character saved as "${name}"`);
  });
  loadBtn.addEventListener("click", () => {
    const name = nameInput.value.trim();
    if (!name) { alert("Select or enter a character name to load."); return; }
    const data = loadCharacter(name);
    if (!data) { alert(`Character "${name}" not found.`); return; }
    if (!confirm(`Load "${name}"? Current character data will be lost.`)) return;
    loadCharacterData(data);
    modal.classList.remove("active");
    modal.style.display = "none";
    alert(`Character "${name}" loaded!`);
  });
  delBtn.addEventListener("click", () => {
    const name = nameInput.value.trim();
    if (!name) { alert("Select a character to delete."); return; }
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    deleteCharacter(name);
    buildCharList();
    nameInput.value = "";
    alert("Character deleted.");
  });
  newBtn.addEventListener("click", () => {
    if (!confirm("Create a new character? Current data will be lost.")) return;
    resetCharacter();
    modal.classList.remove("active");
    modal.style.display = "none";
    document.getElementById("char_handle").focus();
  });
};

const initTheme = () => {
  const toggle = document.getElementById("themeToggle");
  const theme = document.getElementById("theme");
  const current = localStorage.getItem("cpr_theme") || "light";
  theme.href = `css/theme-${current}.css`;
  toggle.addEventListener("click", () => {
    const cur = theme.href.includes("theme-light") ? "light" : "dark";
    const next = cur === "light" ? "dark" : "light";
    theme.href = `css/theme-${next}.css`;
    localStorage.setItem("cpr_theme", next);
  });
};

const initExportImport = () => {
  document.getElementById("exportBtn").addEventListener("click", exportCharacter);
  document.getElementById("importBtn").addEventListener("click", () => {
    document.getElementById("importFile").click();
  });
  document.getElementById("importFile").addEventListener("change", function(e) {
    if (e.target.files.length > 0) {
      importCharacter(e.target.files[0]);
    }
    this.value = "";
  });
};

const initNewChar = () => {
  document.getElementById("randomBtn").addEventListener("click", () => {
    if (!confirm("Generate a random character? Current data will be lost.")) return;
    generateRandomCharacter();
  });
  document.getElementById("newCharBtn").addEventListener("click", () => {
    if (!confirm("Create a new character? Current data will be lost.")) return;
    resetCharacter();
    document.getElementById("char_handle").focus();
  });
};

const initPrint = () => {
  document.getElementById("printBtn").addEventListener("click", printCharacter);
};

const initSkillSearch = () => {
  let timeout;
  document.getElementById("skillSearch").addEventListener("input", () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      renderSkills();
    }, 150);
  });
};

const initCurrency = () => {
  const btn = document.getElementById("btn_modify_eb");
  const modInput = document.getElementById("modify_eb");
  const totalInput = document.getElementById("currency_eb");
  
  if (btn && modInput && totalInput) {
    btn.addEventListener("click", () => {
      let modVal = parseInt(modInput.value) || 0;
      let totalVal = parseInt(totalInput.value) || 0;
      totalInput.value = totalVal + modVal;
      modInput.value = "";
    });
    modInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        btn.click();
      }
    });
  }
};

const setDefaultValues = () => {
  const hp = document.getElementById("hp_current");
  if (!hp.value || parseInt(hp.value) === 0) {
    const body = state.stats.body || 2;
    hp.value = calcHitsMax(body);
  }
};

document.addEventListener("DOMContentLoaded", init);