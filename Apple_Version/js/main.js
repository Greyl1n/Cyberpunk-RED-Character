// ============================================================
// INIT — Bootstrap and event binding
// ============================================================

/**
 * init()
 * This is the "boot sequence" of the app. When the web page loads,
 * it runs this function, which triggers all the other initialization functions
 * to draw the screen (renderStats, renderSkills, etc.) and hook up buttons.
 */
const init = () => {
  initState();
  initRoleSelect();
  
  document.getElementById("toggle_creation_mode").addEventListener("change", function(e) {
    toggleCreationMode(e.target.checked);
  });

  // Global event delegation for dynamically created elements
  document.addEventListener("click", function(e) {
    if (e.target.matches(".remove-lifepath-item")) {
      removeLifepathItem(e.target.dataset.type, parseInt(e.target.dataset.index));
    }
    if (e.target.matches(".sell-cyberdeck")) {
      removeCyberdeck();
    }
    if (e.target.matches(".uninstall-program")) {
      removeProgram(e.target.dataset.id, parseInt(e.target.dataset.cost));
    }
  });

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
  initExportImport();
  initNewChar();
  initPrint();
  initSkillSearch();
  initCurrency();
  setDefaultValues();
};

/**
 * initTabs()
 * Finds all the tab buttons (Character, Gear, Cyberdeck, etc.) and makes them clickable.
 * When clicked, it hides all tabs and shows only the one that was clicked.
 */
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

/**
 * initWelcome()
 * Handles the big welcome screen you see when you first open the app.
 * It waits for a click or tap, and then hides the welcome overlay.
 */
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

/**
 * initCharManager()
 * Connects all the buttons in the "Save / Load / Manage Characters" popup menu.
 * (e.g. the Save button runs the saveCharacter() function, Load runs loadCharacter(), etc.)
 */
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
  saveBtn.addEventListener("click", async () => {
    const name = nameInput.value.trim();
    if (!name) { alert("Enter a name to save."); return; }
    const exists = listCharacters().includes(name);
    if (exists && !await customConfirm(`Overwrite existing character "${name}"?`)) return;
    saveCharacter(name);
    buildCharList();
    alert(`Character saved as "${name}"`);
  });
  loadBtn.addEventListener("click", async () => {
    const name = nameInput.value.trim();
    if (!name) { alert("Select or enter a character name to load."); return; }
    const data = loadCharacter(name);
    if (!data) { alert(`Character "${name}" not found.`); return; }
    if (!await customConfirm(`Load "${name}"? Current character data will be lost.`)) return;
    loadCharacterData(data);
    modal.classList.remove("active");
    modal.style.display = "none";
    alert(`Character "${name}" loaded!`);
  });
  delBtn.addEventListener("click", async () => {
    const name = nameInput.value.trim();
    if (!name) { alert("Select a character to delete."); return; }
    if (!await customConfirm(`Delete "${name}"? This cannot be undone.`)) return;
    deleteCharacter(name);
    buildCharList();
    nameInput.value = "";
    alert("Character deleted.");
  });
  newBtn.addEventListener("click", async () => {
    if (!await customConfirm("Create a new character? Current data will be lost.")) return;
    resetCharacter();
    modal.classList.remove("active");
    modal.style.display = "none";
    document.getElementById("char_handle").focus();
  });
};

/**
 * initExportImport()
 * Hooks up the "Export JSON" and "Import JSON" buttons to their respective functions.
 */
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

/**
 * initNewChar()
 * Hooks up the "Random" button (which generates a whole new character instantly)
 * and the "New" button (which blanks out the character sheet).
 */
const initNewChar = () => {
  document.getElementById("randomBtn").addEventListener("click", async () => {
    if (!await customConfirm("Generate a random character? Current data will be lost.")) return;
    generateRandomCharacter();
  });
  document.getElementById("newCharBtn").addEventListener("click", async () => {
    if (!await customConfirm("Create a new character? Current data will be lost.")) return;
    resetCharacter();
    document.getElementById("char_handle").focus();
  });
};

/**
 * initPrint()
 * Connects the Print button to the printCharacter() function.
 */
const initPrint = () => {
  document.getElementById("printBtn").addEventListener("click", printCharacter);
};

/**
 * initSkillSearch()
 * Adds a "listener" to the skill search text box. As you type, it waits 150 milliseconds 
 * (to make sure you're done typing) and then redraws the skills list, hiding non-matches.
 */
const initSkillSearch = () => {
  let timeout;
  document.getElementById("skillSearch").addEventListener("input", () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      renderSkills();
    }, 150);
  });
};

/**
 * initCurrency()
 * Makes the Eurobucks +/- buttons work. When you type "500" and click "+/-", 
 * it adds 500 to your total money. If you type "-500", it subtracts.
 */
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

/**
 * setDefaultValues()
 * Makes sure that if you load a fresh character, your Hit Points aren't blank.
 * It calculates your Max HP based on your BODY stat and fills in the current HP.
 */
const setDefaultValues = () => {
  const hp = document.getElementById("hp_current");
  if (!hp.value || parseInt(hp.value) === 0) {
    const body = state.stats.body || 2;
    hp.value = calcHitsMax(body);
  }
};

// This is the magical line that tells the browser: 
// "When the HTML is fully loaded on the screen, please run the init() function!"
document.addEventListener("DOMContentLoaded", init);