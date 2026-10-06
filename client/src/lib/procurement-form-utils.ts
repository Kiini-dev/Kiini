export function normalizeTagList(value: string | string[] | null | undefined): string[] {
  if (Array.isArray(value)) {
    return value
      .map((tag) => String(tag ?? '').trim())
      .filter(Boolean)
      .filter((tag, index, list) => list.indexOf(tag) === index);
  }

  return String(value ?? '')
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
    .filter((tag, index, list) => list.indexOf(tag) === index);
}

export function buildSupplierPayload(input: {
  supplierId?: string | null;
  supplierName?: string | null;
}) {
  const supplierName = String(input.supplierName ?? '').trim();
  const supplierId = input.supplierId && String(input.supplierId).trim() ? String(input.supplierId).trim() : undefined;

  if (!supplierId && !supplierName) {
    return { supplierId: undefined, supplierName: '' };
  }

  if (!supplierId) {
    return {
      supplierId: undefined,
      supplierName,
    };
  }

  return {
    supplierId,
    supplierName: supplierName || undefined,
  };
}

export function normalizeSupplierSelection(value: string | null | undefined) {
  return String(value ?? '').trim();
}
