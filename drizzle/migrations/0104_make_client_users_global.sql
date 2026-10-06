-- Client portal users are scoped by clientId, not organization membership.
UPDATE `users`
SET `organizationId` = NULL
WHERE `role` = 'client';