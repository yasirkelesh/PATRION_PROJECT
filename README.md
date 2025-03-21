# Akıllı Sensör Takip Sistemi

## Proje Hakkında

Bu sistem, IoT sensörlerden MQTT protokolü aracılığıyla veri toplayan, işleyen, depolayan ve gerçek zamanlı olarak kullanıcılara sunan kapsamlı bir yönetim platformudur. Sistem, şirket ve kullanıcı yönetimi, sensör verilerinin izlenmesi ve kullanıcı aktivitelerinin loglanması gibi temel özellikler içerir.

## Sistem Mimarisi

![Sistem Mimarisi](/Users/mukeles/Desktop/Mimari.png)

### Temel Bileşenler

1. **Sensörler**: MQTT protokolü üzerinden veri gönderen IoT cihazları
2. **MQTT Broker**: Sensörler ve backend arasında iletişimi sağlayan mesajlaşma aracısı
3. **Backend API (NestJS)**: Ana uygulama motoru
4. **Veritabanları**:
   - PostgreSQL: Kullanıcı ve sensör meta verileri için ilişkisel veritabanı
   - InfluxDB: Zaman serisi verileri için optimize edilmiş NoSQL veritabanı
5. **WebSocket Servisi**: Gerçek zamanlı veri yayını için

## Veri Akışı

1. Sensörler belirli aralıklarla MQTT broker'a veri gönderir
2. Backend API, ilgili MQTT konularına abone olur ve verileri alır
3. Alınan veriler doğrulanır ve işlenir
4. Veriler InfluxDB'ye kaydedilir
5. İşlenen veriler WebSocket üzerinden istemcilere gerçek zamanlı olarak yayınlanır
6. Tüm sistem olayları ve kullanıcı davranışları JSON formatında loglanır

## API Referansı

### Şirket Yönetimi (Company)

| Endpoint | Metod | Açıklama | İstek Gövdesi | Yetkilendirme |
|----------|-------|----------|--------------|---------------|
| /companies | POST | Yeni şirket oluştur | `{ "name": "Şirket Adı" }` | Bearer Token(jwt) |
| /companies | GET | Tüm şirketleri listele | - | Bearer Token(jwt) |
| /companies/:id | GET | Belirli bir şirketin detaylarını getir | - | Bearer Token(jwt) |
| /companies/:id | PUT | Şirket bilgilerini güncelle | `{ "name": "Güncellenmiş Şirket Adı" }` | Bearer Token(jwt) |
| /companies/:id | DELETE | Şirketi sil | - | Bearer Token(jwt) |
| /companies/:id/sensor | GET | Şirkete ait sensörleri listele | - | Bearer Token(jwt) |
| /companies/:id/users | GET | Şirkete ait kullanıcıları listele | - | Bearer Token(jwt) |

### Kullanıcı Yönetimi (User)

| Endpoint | Metod | Açıklama | İstek Gövdesi | Yetkilendirme |
|----------|-------|----------|--------------|---------------|
| /users | POST | Yeni kullanıcı oluştur | `{ "username": "kullanici_adi", "password": "sifre", "company_id": 1 }` | Bearer Token(jwt) |
| /users | GET | Tüm kullanıcıları listele | - | Bearer Token(jwt) |
| /users/:id | GET | Belirli bir kullanıcının detaylarını getir | - | Bearer Token(jwt) |
| /users/:id | PUT | Kullanıcı bilgilerini güncelle | `{ "username": "yeni_ad", "password": "yeni_sifre", "company_id": 2 }` | Bearer Token(jwt) |
| /users/:id | DELETE | Kullanıcıyı sil | - | Bearer Token(jwt) |
| /auth/login | POST | Kullanıcı girişi | `{ "username": "kullanici_adi", "password": "sifre" }` | - |
| /auth/logout | GET | Kullanıcı çıkışı | - | Bearer Token(jwt) |

### Sensör Yönetimi (Sensors)

| Endpoint | Metod | Açıklama | İstek Gövdesi | Yetkilendirme |
|----------|-------|----------|--------------|---------------|
| /sensors | POST | Yeni sensör oluştur | `{ "description": "Açıklama", "sensor_id": 123, "device_company": "Üretici", "company_id": 1 }` | Bearer Token(jwt) |
| /sensors | GET | Tüm sensörleri listele | - | Bearer Token(jwt) |
| /sensors/:id | GET | Belirli bir sensörün detaylarını getir | - | Bearer Token(jwt) |
| /sensors/:id | PUT | Sensör bilgilerini güncelle | `{ "description": "Yeni Açıklama", "sensor_id": 123, "device_company": "Üretici", "company_id": 1 }` | Bearer Token(jwt) |
| /sensors/:id | DELETE | Sensörü sil | - | Bearer Token(jwt) |
| /sensors/company/:companyId | GET | Şirkete ait sensörleri listele | - | Bearer Token(jwt) |
| /api/sensors/:sensorId/readings | GET | Sensör okuma verilerini getir | Query Params: limit=10 | Bearer Token(jwt) |

### Loglama Sistemi (Logger)

| Endpoint | Metod | Açıklama | İstek Gövdesi | Yetkilendirme |
|----------|-------|----------|--------------|---------------|
| /api/logs | GET | Tüm logları listele | - | Bearer Token(jwt) |
| /api/logs/stats | GET | Log istatistiklerini getir | - | Bearer Token(jwt) |
| /api/logs/user/:userId | GET | Belirli bir kullanıcının loglarını getir | - | Bearer Token(jwt) |

## Güvenlik Özellikleri

### 1. Kimlik Doğrulama ve Yetkilendirme:
- JWT tabanlı kimlik doğrulama
- Rol tabanlı yetkilendirme (admin, manager, user, technician, guest)

### 2. Veri Güvenliği:
- API anahtarı veya JWT ile korunan endpointler
- Şifrelerin bcrypt ile hashlenmiş olarak saklanması

## Loglama Sistemi

Sistem, aşağıdaki olayları JSON formatında loglar:

- Kullanıcı giriş/çıkış işlemleri
- API istekleri
- Sensör veri akışı
- Hatalı veri tespiti
- Sistem hataları ve uyarıları

Sistem, kullanıcı aktivitelerini basit bir dosya tabanlı JSON loglama sistemi ile izler:
- Kayıtlar `logs/user-activity.log` dosyasında saklanır
- Her log satırı bir JSON nesnesidir

## Güvenlik İyileştirme Önerileri (Tamamlanmamış)

- MQTT broker'ın TLS/SSL ile korunması
- API'ler için rate limiting uygulanması (DDoS koruması)
- Log dosyalarının yetkisiz erişime karşı korunması

## Test Etme

### MQTT Sensör Verisi Simülatörü

Sistemi test etmek için testMQTT içindeki test.go programını kullanabilirsiniz. Bu program, 5 saniyede bir farklı sensörlerden rastgele veriler göndererek gerçek sensörleri simüle eder. Bunu kullanabilmeniz için ortamınızda go kurulu olması lazım eğer go kurulu değilse farklı bir similatör kullanabilirisiniz.

## Kurulum Adımları

1. Repo'yu klonlayın:
```
git clone git@github.com:yasirkelesh/PATRION_PROJECT.git
cd PATRION_PROJECT/iot-system
```

2. Ortam Değişkenleri:
Sistemi çalıştırmak için aşağıdaki ortam değişkenlerini `.env` dosyasına ekleyin:

```
INFLUXDB_USERNAME=
INFLUXDB_PASSWORD=
INFLUXDB_ORG=
INFLUXDB_BUCKET=
INFLUXDB_ADMIN_TOKEN=

POSTGRES_USER=
POSTGRES_PASSWORD=
POSTGRES_DB=

JWT_SECRET=
```

3. Docker Compose ile tüm servisleri başlatın:
```
docker-compose up --build -d
```

4. Uygulamanın çalıştığını kontrol edin:
```
docker-compose ps
```

## Teknolojiler

- Backend: NestJS
- Veritabanları: PostgreSQL, InfluxDB
- Mesajlaşma: MQTT
- Gerçek Zamanlı İletişim: WebSocket
- Konteynerizasyon: Docker, Docker Compose
- Güvenlik: JWT, bcrypt

## Katkıda Bulunma

1. Bu depoyu forklayın
2. Kendi feature branch'inizi oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some amazing feature'`)
4. Branch'inize push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## İletişim

Yasir Keleş - [@yasirkelesh](https://github.com/yasirkelesh)

Proje Linki: [https://github.com/yasirkelesh/PATRION_PROJECT](https://github.com/yasirkelesh/PATRION_PROJECT)