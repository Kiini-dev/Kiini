ALTER TABLE `documentNumberFormats`
  ADD UNIQUE INDEX `doc_type_unique_idx` (`documentType`);