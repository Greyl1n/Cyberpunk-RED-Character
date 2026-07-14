const fs = require('fs');
let html = fs.readFileSync('index_js.html', 'utf8');

// Replace CSS
const baseCss = fs.readFileSync('css/base.css', 'utf8');
const darkCss = fs.readFileSync('css/theme-dark.css', 'utf8').replace(/\.\.\/src\/bg/g, 'src/bg');

html = html.replace('<link href="css/base.css" rel="stylesheet">', '<style id="base-css">\n' + baseCss + '\n</style>');
html = html.replace('<link id="theme" href="css/theme-dark.css" rel="stylesheet">', '<style id="theme">\n' + darkCss + '\n</style>');

// Build JS
let js = fs.readFileSync('js/data.js', 'utf8') + '\n';
js += fs.readFileSync('js/calculations.js', 'utf8') + '\n';
js += fs.readFileSync('js/storage.js', 'utf8') + '\n';
js += fs.readFileSync('js/export.js', 'utf8') + '\n';
js += fs.readFileSync('js/ui.js', 'utf8') + '\n';
js += fs.readFileSync('js/main.js', 'utf8') + '\n';


html = html.replace(/<script src="js\/.*><\/script>\r?\n/g, '');
html = html.replace('</body>', '<script>\n' + js + '\n</script>\n</body>');

fs.writeFileSync('index.html', html);
console.log('index.html monolith built');
