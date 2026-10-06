export interface DepartmentColumnDefinition {
  name: string;
  definition: string;
}

export function getMissingDepartmentColumns(existingColumns: Iterable<string>): DepartmentColumnDefinition[] {
  const existing = new Set(Array.from(existingColumns, (column) => column.toLowerCase()));
  const requiredColumns: DepartmentColumnDefinition[] = [
    {
      name: 'defaultRole',
      definition: 'varchar(100) NULL',
    },
    {
      name: 'organizationId',
      definition: 'varchar(64) NULL',
    },
  ];

  return requiredColumns.filter((column) => !existing.has(column.name.toLowerCase()));
}
