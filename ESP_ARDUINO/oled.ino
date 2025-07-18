#include <WiFi.h>
#include <PubSubClient.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <ArduinoJson.h>  

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1
#define OLED_ADDR 0x3C
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

// Thông tin WiFi
const char* ssid = "GiangNgo";
const char* password = "19062001";

// Thông tin MQTT Broker (nếu dùng local Mosquitto trên Windows)
const char* mqttServer = "172.20.10.6"; // Thay bằng IP máy tính chạy Mosquitto
// Hoặc dùng broker public:
// const char* mqttServer = "broker.hivemq.com";

const int mqttPort = 1883;
const char* mqttTopic = "PRO001"; // Mã sản phẩm của ESP32 này

WiFiClient espClient;
PubSubClient mqttClient(espClient);

void setup() {
    Serial.begin(115200);

     // Khởi tạo I2C với chân mặc định cho ESP32-C3
   Wire.begin(6, 7); // SDA=GPIO6, SCL=GPIO7
  
  // Khởi tạo OLED
  if(!display.begin(SSD1306_SWITCHCAPVCC, OLED_ADDR)) {
    Serial.println(F("SSD1306 allocation failed"));
    while(1); // Dừng chương trình nếu không kết nối được OLED
  }
  
    display.clearDisplay();
    display.setTextSize(1);
    display.setTextColor(WHITE);


    // Kết nối WiFi
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println("\nConnected to WiFi!");
    Serial.println(WiFi.localIP());  // Phải cùng subnet với máy tính (ví dụ: 172.20.10.x)


    delay(2000);

    // Kết nối MQTT Broker
    mqttClient.setServer(mqttServer, mqttPort);
    mqttClient.setCallback(mqttCallback); // Hàm xử lý khi nhận dữ liệu

    reconnectMQTT();


display.clearDisplay();
display.setCursor(0, 0);
display.println("OK.");
display.display();

}

void loop() {
    if (!mqttClient.connected()) {
        reconnectMQTT();
    }
    mqttClient.loop();
}

// Hàm kết nối lại MQTT nếu bị mất
void reconnectMQTT() {
    while (!mqttClient.connected()) {
        Serial.println("Connecting to MQTT...");
        if (mqttClient.connect("ESP32Client")) {
            Serial.println("✅ Connected to MQTT");
            mqttClient.subscribe(mqttTopic);
        } else {
            Serial.print("❌ Failed, rc=");
            Serial.print(mqttClient.state());  // In mã lỗi
            Serial.println(" Retry in 5s...");
            delay(5000);
        }
    }
}

// Hàm xử lý khi nhận dữ liệu từ MQTT
void mqttCallback(char* topic, byte* payload, unsigned int length) {
    Serial.print("📢 Received message on topic: ");
    Serial.println(topic);

    // Chuyển payload thành String
    String message;
    for (int i = 0; i < length; i++) {
        message += (char)payload[i];
    }

    // Parse JSON (ví dụ: {"name":"iPhone", "price":"1000"})
    DynamicJsonDocument doc(1024);
    deserializeJson(doc, message);
    String name = doc["name"];
    String price = doc["price"];
    Serial.println(name);
    Serial.println(price);

    // Hiển thị lên OLED
    display.clearDisplay();
    display.setTextSize(1);
    display.setCursor(0, 0);
    display.print("Code:");
    display.println(mqttTopic);
    
    display.setCursor(0, 20);
    display.print("Name: ");
    display.println(name);
    
    display.setCursor(0, 40);
    display.print("Price: ");
    display.println(price);
    
    display.display();

    Serial.println("Updated OLED display!");
}