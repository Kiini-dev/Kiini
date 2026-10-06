const fs = require('fs');
const path = require('path');

const pagesDir = path.resolve(__dirname, '../client/src/pages');
const orgDir = path.resolve(pagesDir, 'org');

function listTsx(dir) {
  return fs.readdirSync(dir).filter(f => f.endsWith('.tsx')).map(f => path.basename(f, '.tsx'));
}

const rootFiles = listTsx(pagesDir).filter(n => n !== 'org');
const orgFiles = listTsx(orgDir);

function existsOrg(name) {
  return orgFiles.includes(name);
}

function candidateOrgNames(basename) {
  const names = [];
  if (/^Create[A-Z]/.test(basename)) names.push('Org' + basename);
  if (/^Edit[A-Z]/.test(basename)) names.push('Org' + basename);
  names.push('Org' + basename);
  if (/Details$/.test(basename)) names.push('Org' + basename.replace(/Details$/, 'Detail'));
  if (/Detail$/.test(basename)) names.push('Org' + basename);
  names.push('Org' + (basename.endsWith('s') ? basename : (basename + 's')));
  names.push('Org' + (basename.endsWith('s') ? basename.slice(0, -1) : basename));
  return Array.from(new Set(names));
}

const missing = [];
for (const f of rootFiles) {
  const candidates = candidateOrgNames(f);
  const found = candidates.some(existsOrg);
  if (!found) {
    missing.push({ page: f, candidates });
  }
}

console.log('Total root pages:', rootFiles.length);
console.log('Total org pages:', orgFiles.length);
console.log('Missing org clones (heuristic):', missing.length);
missing.forEach(m => console.log('-', m.page, '->', m.candidates.join(', ')));

fs.writeFileSync(path.resolve(__dirname, 'audit_org_pages_result.json'), JSON.stringify({ rootFiles, orgFiles, missing }, null, 2));
console.log('Wrote audit_org_pages_result.json');
