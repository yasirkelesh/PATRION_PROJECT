-- Temel tablolar
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    company_id INT,
    role_id INT NOT NULL DEFAULT 3,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Sensors" (
    id SERIAL PRIMARY KEY,
    description VARCHAR(255) NOT NULL,
    sensor_id INT NOT NULL,
    device_company VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_sensors (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    sensor_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_sensor_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_sensor_sensor FOREIGN KEY (sensor_id) REFERENCES "Sensors"(id) ON DELETE CASCADE,
    CONSTRAINT user_sensor_unique UNIQUE (user_id, sensor_id)
);

-- Örnek şirketler
INSERT INTO companies (id, name) VALUES
(1, 'Company 1'),
(2, 'Company 2');


CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


INSERT INTO roles (id, name, description) VALUES
(1, 'system_admin', 'Tüm sisteme erişim yetkisi olan yönetici'),
(2, 'company_admin', 'Şirkete ait verilere tam erişim yetkisi olan yönetici'),
(3, 'standard_user', 'Standart kullanıcı, sınırlı yetkilere sahip');


ALTER TABLE users
ADD CONSTRAINT fk_user_role
FOREIGN KEY (role_id) REFERENCES roles(id);

-- Kullanıcı tablosu ile şirket tablosu arasında ilişki kur
ALTER TABLE users
ADD CONSTRAINT fk_user_company
FOREIGN KEY (company_id) REFERENCES companies(id);

-- Sensör tablosuna şirket ID kolonu ekle
ALTER TABLE "Sensors"
ADD COLUMN company_id INT;

-- Şirket isimlerine göre company_id güncelle
UPDATE "Sensors"
SET company_id = (SELECT id FROM companies WHERE name = device_company);

-- Sensör tablosu ile şirket tablosu arasında ilişki kur
ALTER TABLE "Sensors"
ADD CONSTRAINT fk_sensor_company
FOREIGN KEY (company_id) REFERENCES companies(id);

-- Örnek kullanıcılar ekle
INSERT INTO users (username, password, company_id, role_id) VALUES
('admin', '$2b$10$rNCLuPQ6vgHVweTmT5zxF.GfHYCcFxH3CXT5ByKZ.RUwHSLQSGmFO', NULL, 1),
('manager1', '$2b$10$HfzIhGCCaxqyaIdGgjARSuOKAcm1Uy82YfLuNaajn6JrjLWy9Sj/W', 1, 2),
('manager2', '$2b$10$2lVYyAULPUMb7BzYQJs16O9PMFRAz/rZ4qDl4Ve/XKqE8lKbQTgQ.', 2, 2),
('user1', '$2b$10$OcSgyRXceal6PV0mCRJyYu9eZJodf7/uOlpXxZj9P69V79VnPHQOm', 1, 3),
('user2', '$2b$10$IEFyLSLvFN9VG6VU3QUUqenmLf26bQUWRzsel1vGuhfz1nXAFvE0O', 1, 3),
('user3', '$2b$10$DIROZ1YTA6KBCO2z0o6O3O3Y2MpX4WGkrgUQHxK6Hq.L2bvh6XJ3S', 2, 3);
-- Örnek sensörler ekle
INSERT INTO "Sensors" (sensor_id, description, device_company) VALUES
(1, 'Sensor 1','Company 1'),
(2, 'Sensor 2','Company 1'),
(3, 'Sensor 3','Company 2'),
(4, 'Sensor 4','Company 2'),
(5, 'Sensor 5','Company 2');