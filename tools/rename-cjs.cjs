const fs = require("fs");
const path = require("path");

const sanitizePath = (str) => str?.replace(/^(\.\.(\/|\\|$))+/, '');

function renameJsToCjs(dir) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(sanitizePath(dir), sanitizePath(file));
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      renameJsToCjs(filePath);
    } else if (path.extname(file) === ".js") {
      const newPath = path.join(sanitizePath(dir), `${path.basename(sanitizePath(file), ".js")}.cjs`);
      fs.renameSync(filePath, newPath);
    }
  });
}

const cjsDir = path.join("dist", "cjs");
renameJsToCjs(cjsDir);
