const fs = require('fs');
const path = require('path');

const pagesDir = path.resolve(__dirname, '../client/src/pages');
const orgDir = path.resolve(pagesDir, 'org');

function listTsx(dir) {
  return fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => f.endsWith('.tsx')).map(f => path.basename(f, '.tsx')) : [];
}

const rootFiles = listTsx(pagesDir).filter(n => n !== 'org');
const orgFiles = listTsx(orgDir);

const candidates = [];

for (const name of rootFiles) {
  const entity = (() => {
    const mCreate = name.match(/^Create(.+)$/);
    const mEdit = name.match(/^Edit(.+)$/);
    const mDetail = name.match(/^(.+?)(Details|Detail)$/);
    if (mCreate) return mCreate[1];
    if (mEdit) return mEdit[1];
    if (mDetail) return mDetail[1];
    if (name.endsWith('s')) return name.slice(0, -1);
    return null;
  })();
  if (!entity) continue;
  const indexPlural = rootFiles.includes(entity + 's') ? entity + 's' : (rootFiles.includes(entity) ? entity : null);
  const hasIndex = !!indexPlural;
  const hasCreate = rootFiles.includes('Create' + entity);
  const hasEdit = rootFiles.includes('Edit' + entity);
  const hasDetail = rootFiles.includes(entity + 'Detail') || rootFiles.includes(entity + 'Details');
  if (hasIndex && hasCreate && hasEdit && hasDetail) {
    const orgIndex = 'Org' + indexPlural;
    const orgCreate = 'OrgCreate' + entity;
    const orgEdit = 'OrgEdit' + entity;
    const orgDetail = 'Org' + entity + 'Detail';
    const missing = [];
    if (!orgFiles.includes(orgIndex)) missing.push(orgIndex);
    if (!orgFiles.includes(orgCreate)) missing.push(orgCreate);
    if (!orgFiles.includes(orgEdit)) missing.push(orgEdit);
    if (!orgFiles.includes(orgDetail)) missing.push(orgDetail);
    if (missing.length) candidates.push({ entity, indexPlural, missing });
  }
}

console.log(JSON.stringify(candidates, null, 2));
fs.writeFileSync(path.resolve(__dirname, 'full_crud_missing_refined.json'), JSON.stringify(candidates, null, 2));
console.log('Wrote full_crud_missing_refined.json');
