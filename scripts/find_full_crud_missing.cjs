const fs = require('fs');
const path = require('path');

const pagesDir = path.resolve(__dirname, '../client/src/pages');
const orgDir = path.resolve(pagesDir, 'org');

function listTsx(dir) {
  return fs.readdirSync(dir).filter(f => f.endsWith('.tsx')).map(f => path.basename(f, '.tsx'));
}

const rootFiles = listTsx(pagesDir).filter(n => n !== 'org');
const orgFiles = listTsx(orgDir);

function hasRoot(name) { return rootFiles.includes(name); }
function hasOrg(name) { return orgFiles.includes(name); }

const candidates = [];

for (const name of rootFiles) {
  // consider base like Suppliers, SupplierDetails, CreateSupplier etc
  // extract entity name heuristics
  // if name is plural (endsWith s) treat entity = name (e.g., Suppliers)
  // else if CreateX/EditX/Details etc, entity = remove prefix/suffix
  const mCreate = name.match(/^Create(.+)$/);
  const mEdit = name.match(/^Edit(.+)$/);
  const mDetails = name.match(/^(.+)(Details|Detail)$/);
  let entity = null;
  if (mCreate) entity = mCreate[1];
  if (mEdit) entity = mEdit[1];
  if (!entity && mDetails) entity = mDetails[1];
  if (!entity && name.endsWith('s')) entity = name.slice(0, -1);
  if (!entity) continue;
  const indexNamePlural = entity.endsWith('s') ? entity : entity + 's';
  const hasIndex = rootFiles.includes(indexNamePlural) || rootFiles.includes(entity + 's');
  const hasCreate = rootFiles.includes('Create' + entity);
  const hasEdit = rootFiles.includes('Edit' + entity) || rootFiles.includes('Edit' + entity + 's');
  const hasDetail = rootFiles.includes(entity + 'Details') || rootFiles.includes(entity + 'Detail') || rootFiles.includes(entity + 's' + 'Details');

  if (hasIndex && hasCreate && hasEdit && hasDetail) {
    const orgIndex = 'Org' + indexNamePlural;
    const orgCreate = 'OrgCreate' + entity;
    const orgEdit = 'OrgEdit' + entity;
    const orgDetail = 'Org' + entity + 'Detail';
    const anyOrgExists = [orgIndex, orgCreate, orgEdit, orgDetail].some(hasOrg);
    if (!anyOrgExists) {
      candidates.push({ entity, index: indexNamePlural, create: 'Create'+entity, edit: 'Edit'+entity, detailCandidates: [entity+'Detail', entity+'Details'], orgs: [orgIndex, orgCreate, orgEdit, orgDetail] });
    }
  }
}

console.log('Full CRUD root candidates missing org counterparts:', candidates.length);
candidates.forEach(c => console.log('-', c.entity, c));
fs.writeFileSync(path.resolve(__dirname, 'full_crud_missing.json'), JSON.stringify(candidates, null, 2));
console.log('Wrote full_crud_missing.json');
