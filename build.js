const fs = require('fs');
let html = fs.readFileSync('index_js.html', 'utf8');

// Replace CSS
const baseCss = fs.readFileSync('css/base.css', 'utf8');
const darkCss = fs.readFileSync('css/theme-dark.css', 'utf8').replace(/\.\.\/src\/bg/g, 'src/bg');

html = html.replace('<link href="css/base.css" rel="stylesheet">', '<style id="base-css">\n' + baseCss + '\n</style>');
html = html.replace('<link id="theme" href="css/theme-dark.css" rel="stylesheet">', '<style id="theme">\n' + darkCss + '\n</style>');

// Inline Favicon data URI for standalone portability
if (fs.existsSync('favicon.ico')) {
  const icoBase64 = fs.readFileSync('favicon.ico').toString('base64');
  html = html.replace(/href="favicon\.ico"/g, `href="data:image/x-icon;base64,${icoBase64}"`);
}
if (fs.existsSync('src/icons/favicon-32.png')) {
  const iconBase64 = fs.readFileSync('src/icons/favicon-32.png').toString('base64');
  html = html.replace('href="src/icons/favicon-32.png"', `href="data:image/png;base64,${iconBase64}"`);
}
if (fs.existsSync('src/icons/favicon-16.png')) {
  const icon16Base64 = fs.readFileSync('src/icons/favicon-16.png').toString('base64');
  html = html.replace('href="src/icons/favicon-16.png"', `href="data:image/png;base64,${icon16Base64}"`);
}

// Build JS
let js = fs.readFileSync('js/data.js', 'utf8') + '\n';
js += fs.readFileSync('js/calculations.js', 'utf8') + '\n';
js += fs.readFileSync('js/storage.js', 'utf8') + '\n';
js += fs.readFileSync('js/export.js', 'utf8') + '\n';
js += fs.readFileSync('js/ui.js', 'utf8') + '\n';
js += fs.readFileSync('js/gm.js', 'utf8') + '\n';
js += fs.readFileSync('js/main.js', 'utf8') + '\n';


html = html.replace(/<script src="js\/.*><\/script>\r?\n/g, '');
html = html.replace('</body>', '<script>\n' + js + '\n</script>\n</body>');

fs.writeFileSync('index.html', html);
console.log('index.html monolith built');
