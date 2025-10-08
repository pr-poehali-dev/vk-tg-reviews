CREATE TABLE IF NOT EXISTS groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    platform VARCHAR(20) NOT NULL CHECK (platform IN ('vk', 'telegram')),
    members VARCHAR(50),
    description TEXT,
    link VARCHAR(500),
    avatar VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    group_id INTEGER NOT NULL REFERENCES groups(id),
    user_name VARCHAR(255) NOT NULL,
    user_avatar VARCHAR(500),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_groups_platform ON groups(platform);
CREATE INDEX IF NOT EXISTS idx_reviews_group_id ON reviews(group_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);

INSERT INTO groups (name, platform, members, description, link) VALUES
('IT Специалисты', 'telegram', '81K', 'Сообщество IT специалистов для обмена опытом и поиска работы', 'https://t.me/it_specialists'),
('Дизайн и творчество', 'vk', '300K', 'Группа для дизайнеров, художников и всех творческих людей', 'https://vk.com/design_creativity'),
('Маркетинг PRO', 'telegram', '45K', 'Профессиональное сообщество маркетологов и SMM специалистов', 'https://t.me/marketing_pro'),
('Python разработчики', 'telegram', '120K', 'Сообщество Python разработчиков всех уровней', 'https://t.me/python_devs'),
('Фотография', 'vk', '250K', 'Группа для любителей и профессионалов фотографии', 'https://vk.com/photography');

INSERT INTO reviews (group_id, user_name, rating, text) VALUES
(1, 'Анна Смирнова', 5, 'Отличное сообщество! Много полезной информации и активное общение. Рекомендую всем IT специалистам.'),
(2, 'Дмитрий Иванов', 4, 'Хорошая группа, но иногда много офтопа. В целом доволен контентом и участниками.'),
(3, 'Мария Петрова', 5, 'Лучший канал по маркетингу! Регулярно делятся кейсами и полезными материалами.'),
(1, 'Сергей Козлов', 5, 'Нашёл здесь работу! Спасибо организаторам за активное сообщество.'),
(4, 'Елена Волкова', 4, 'Хороший канал для изучения Python. Много примеров кода и туториалов.'),
(5, 'Алексей Новиков', 5, 'Потрясающая группа! Вдохновляюсь работами других фотографов каждый день.');