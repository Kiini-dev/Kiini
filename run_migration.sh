#!/bin/bash

# Copy SQL file to container
docker cp e:/Kiini/migrations/accounting_automation_complete.sql kiini-mysql:/tmp/

# Run MySQL inside container with a heredoc to avoid password issues
docker exec kiini-mysql bash -c 'mysql -u kiini_user -pKJ4S8L2M9N3P1Q5R7T kiini-one-hub-total-control < /tmp/accounting_automation_complete.sql'

echo "✅ Migration completed"
