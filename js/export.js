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
const printCharacter = async () => {
  let toHide = [];
  if (typeof showPrintOptions === "function") {
    toHide = await showPrintOptions();
    if (toHide === null) return;
  }

  // Desired print order explicitly defined
  const printOrder = [
    '#print-section-identity',
    '#role_info',
    '#multiclass_section',
    '#print-section-stats',
    '#print-section-lifepath',
    '#role_lifepath_container',
    '#print-section-weapons',
    '#print-section-cyberware',
    '#print-section-cyberdeck',
    '#print-section-vehicles',
    '#print-section-notes',
    '#print-section-skills'
  ];

  document.body.classList.add("printing");
  
  // Physically move elements into a temporary print container to bypass Apple/Safari flex order bugs
  let printContainer = document.createElement("div");
  printContainer.id = "safari-print-container";
  printContainer.style.display = "flex";
  printContainer.style.flexDirection = "column";
  printContainer.style.width = "100%";
  
  // Create an array to track where elements came from so we can restore them exactly
  let restoreData = [];

  printOrder.forEach(sel => {
    // If it's in the toHide list, we just skip moving it (it stays in the hidden main UI)
    if (toHide.includes(sel)) return;
    
    let el = document.querySelector(sel);
    if (el && el.style.display !== 'none') {
        // Create a placeholder
        let ph = document.createElement('div');
        ph.className = 'safari-print-ph';
        ph.style.display = 'none';
        
        el.parentNode.insertBefore(ph, el);
        restoreData.push({ el: el, ph: ph });
        
        printContainer.appendChild(el);
    }
  });

  // Hide the entire original main content from the printer
  let dynamicStyle = document.createElement("style");
  dynamicStyle.id = "print-hider";
  dynamicStyle.innerHTML = `
    @media print { 
        .main-content, .tabs-nav { display: none !important; } 
        .print-overlay-hide { display: none !important; }
    }
  `;
  document.head.appendChild(dynamicStyle);
  
  // Append the newly ordered container directly to the body
  document.body.appendChild(printContainer);

  // Create a cleanup overlay that the user must click to restore the UI
  let restoreOverlay = document.createElement("div");
  restoreOverlay.className = "modal-overlay active";
  restoreOverlay.style.display = "flex";
  restoreOverlay.style.flexDirection = "column";
  restoreOverlay.style.zIndex = "10000"; // above everything
  
  restoreOverlay.innerHTML = `
    <div class="modal-box print-overlay-hide" style="text-align:center; max-width:500px;">
      <h2>Print Mode Active</h2>
      <p style="margin:1rem 0;color:var(--text-secondary)">Your print dialog should open shortly. If you change print settings, the preview will update properly.<br><br>When you are completely finished printing, click below to return to your character sheet.</p>
      <button class="btn-action" style="width:100%;margin-top:1rem;" id="finish-print-btn">Finish Printing & Return</button>
    </div>
  `;
  document.body.appendChild(restoreOverlay);

  document.getElementById("finish-print-btn").onclick = () => {
    document.body.classList.remove("printing");
    
    // Restore DOM elements to their exact original positions using placeholders
    // We reverse it just in case there are nested elements, though there shouldn't be
    for (let i = restoreData.length - 1; i >= 0; i--) {
        let data = restoreData[i];
        data.ph.parentNode.insertBefore(data.el, data.ph);
        data.ph.remove();
    }
    
    printContainer.remove();
    let styleTag = document.getElementById("print-hider");
    if (styleTag) styleTag.remove();
    document.body.removeChild(restoreOverlay);
  };

  // Small delay then print
  setTimeout(() => {
    window.print();
  }, 100);
};