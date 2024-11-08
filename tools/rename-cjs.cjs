const fs = require("fs");
const path = require("path");

function renameJsToCjs(dir) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      renameJsToCjs(filePath);
    } else if (path.extname(file) === ".js") {
      const newPath = path.join(dir, `${path.basename(file, ".js")}.cjs`);
      fs.renameSync(filePath, newPath);
    }
  });
}

const cjsDir = path.join("dist", "cjs");
renameJsToCjs(cjsDir);
