ALTER TABLE groups ADD COLUMN IF NOT EXISTS vk_group_id VARCHAR(255);
ALTER TABLE groups ADD COLUMN IF NOT EXISTS telegram_channel_id VARCHAR(255);

COMMENT ON COLUMN groups.vk_group_id IS 'ID или короткое имя группы ВКонтакте (например: apiclub или -1)';
COMMENT ON COLUMN groups.telegram_channel_id IS 'Username канала Telegram без @ (например: durov) или ID';
