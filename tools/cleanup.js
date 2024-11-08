import fs from 'fs';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// To remove the relative path 
function sanitizePath(str) {
  return str ? str.replace(/^(\.\.(\/|\\|$))+/, '') : str;
}


function validateAndSanitize(input) {
  // Allow only alphanumeric characters, dashes, underscores, and dots for file extensions
  return input.replace(/[^a-zA-Z0-9-_\.]/g, '');
}

function ensureSafePath(basePath, targetPath) {
  const resolvedBase = path.resolve(basePath);
  const resolvedTarget = path.resolve(basePath, targetPath);

  // console.log('Base Path:', resolvedBase);
  // console.log('Target Path:', resolvedTarget);

  if (resolvedTarget.indexOf(resolvedBase) !== 0) {
    throw new Error(`Unsafe path detected: ${resolvedTarget} is not within ${resolvedBase}`);
  }

  return resolvedTarget;
}

const deleteFolderRecursive = (_path) => {
  // console.log('Attempting to delete:', _path);

  if (fs.existsSync(_path)) {
    const sanitizedPath = sanitizePath(_path);
    fs.readdirSync(sanitizedPath).forEach((file) => {
      const sanitizedFile = validateAndSanitize(file);
      const curPath = ensureSafePath(_path, sanitizedFile);

      // console.log('Deleting:', curPath);

      if (fs.lstatSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(_path);
  } else {
    console.log('Path does not exist:', _path);
  }
};

const rootDir = path.resolve(__dirname, '..'); // Set the base path to the root of the project
const folder = process.argv.slice(2)[0];
const sanitizedFolder = folder ? validateAndSanitize(folder) : null;

if (sanitizedFolder) {
  // console.log('Sanitized folder:', sanitizedFolder);
  deleteFolderRecursive(ensureSafePath(rootDir, path.join('dist', sanitizedFolder)));
} else {
  // console.log('No folder specified, deleting default directories...');
  deleteFolderRecursive(ensureSafePath(rootDir, 'dist/cjs'));
  deleteFolderRecursive(ensureSafePath(rootDir, 'dist/esm'));
  deleteFolderRecursive(ensureSafePath(rootDir, 'dist/types'));
}