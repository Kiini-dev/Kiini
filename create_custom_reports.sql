CREATE TABLE IF NOT EXISTS custom_reports (
  id varchar(64) NOT NULL,
  name varchar(200) NOT NULL,
  description text,
  category varchar(100) NOT NULL,
  dataSources text,
  layout text,
  format enum('PDF','Excel','CSV','HTML') NOT NULL DEFAULT 'PDF',
  isTemplate tinyint NOT NULL DEFAULT 0,
  status enum('draft','active','archived') NOT NULL DEFAULT 'draft',
  owner varchar(200),
  createdBy varchar(64) NOT NULL,
  createdAt timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_custom_reports_category (category),
  KEY idx_custom_reports_status (status)
);