package main

import (
	"encoding/json"
	"fmt"
	"math/rand"
	"time"

	mqtt "github.com/eclipse/paho.mqtt.golang"
)

const (
	broker      = "tcp://localhost:1883" // MQTT broker adresini güncelle
	topic       = "sensor/data"
	clientID    = "go_mqtt_publisher"
	interval    = 5 * time.Second // Veri gönderme aralığı
	maxSensorID = 5               // Kaç farklı sensör ID'si olacak
)

type SensorData struct {
	SensorID    string  `json:"sensor_id"`
	Timestamp   int64   `json:"timestamp"`
	Temperature float64 `json:"temperature"`
	Humidity    float64 `json:"humidity"`
}

// RandomFloat belirtilen aralıkta rastgele float değer üretir
func RandomFloat(min, max float64) float64 {
	return min + rand.Float64()*(max-min)
}

func main() {
	// Rastgele sayı üreteci için seed
	rand.Seed(time.Now().UnixNano())

	// MQTT bağlantı ayarları
	opts := mqtt.NewClientOptions()
	opts.AddBroker(broker)
	opts.SetClientID(clientID)
	opts.SetKeepAlive(60 * time.Second)
	opts.SetPingTimeout(1 * time.Second)
	opts.SetAutoReconnect(true)
	opts.SetCleanSession(true)

	// Bağlantı yapılandırması
	client := mqtt.NewClient(opts)
	if token := client.Connect(); token.Wait() && token.Error() != nil {
		panic(token.Error())
	}

	fmt.Println("MQTT broker'a bağlandı. Veri göndermeye başlıyor...")
	fmt.Printf("Veri gönderme aralığı: %s\n", interval)

	// Döngü içinde sürekli veri gönder
	counter := 0
	for {
		counter++
		// Rastgele bir sensör ID'si seç
		sensorID := fmt.Sprintf("temp_sensor_%02d", rand.Intn(maxSensorID)+1)

		// Sensör verileri oluştur
		data := SensorData{
			SensorID:    sensorID,
			Timestamp:   time.Now().Unix(),
			Temperature: RandomFloat(18.0, 32.0),
			Humidity:    RandomFloat(40.0, 80.0),
		}

		// JSON formatına dönüştür
		payload, err := json.Marshal(data)
		if err != nil {
			fmt.Printf("JSON oluşturma hatası: %v\n", err)
			continue
		}

		// MQTT üzerinden yayınla
		token := client.Publish(topic, 0, false, payload)
		token.Wait()

		fmt.Printf("[%d] Sensör: %s, Sıcaklık: %.2f°C, Nem: %.2f%% gönderildi\n", 
			counter, sensorID, data.Temperature, data.Humidity)

		// Belirtilen süre kadar bekle
		time.Sleep(interval)
	}

	// Not: Bu koda asla ulaşılmayacak, çünkü sonsuz döngü var
	// client.Disconnect(250)
}