-- Expand accountType enum to include additional account types
ALTER TABLE `accounts` 
MODIFY `accountType` enum('asset','liability','equity','revenue','expense','cost of goods sold','operating expense','capital expenditure','other income','other expense') NOT NULL;
