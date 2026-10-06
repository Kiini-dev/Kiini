export interface NotificationColumnDefinition {
  name: string;
  definition: string;
}

export function getMissingNotificationColumns(existingColumns: Iterable<string>): NotificationColumnDefinition[] {
  const existing = new Set(Array.from(existingColumns, (column) => column.toLowerCase()));
  const requiredColumns: NotificationColumnDefinition[] = [
    {
      name: "deliveryStatus",
      definition: "enum('pending','sent','failed') NOT NULL DEFAULT 'pending'",
    },
    {
      name: "deliveryDate",
      definition: "timestamp NULL",
    },
    {
      name: "status",
      definition: "enum('active','archived') NOT NULL DEFAULT 'active'",
    },
  ];

  return requiredColumns.filter((column) => !existing.has(column.name.toLowerCase()));
}
