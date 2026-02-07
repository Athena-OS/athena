const fs = require('fs');
const path = require('path');
const THEME_DIR = path.join(__dirname, '..', 'theme');
if (!fs.existsSync(THEME_DIR)) {
    fs.mkdirSync(THEME_DIR);
}
async function generate() {
    const jsonFile = fs.readFileSync(
        path.join(__dirname, '..', 'themes', 'HackTheBox.json'),
        'utf-8');
    fs.writeFileSync(
        path.join(THEME_DIR, 'HackTheBox.json'),
        jsonFile
    )
}
generate()