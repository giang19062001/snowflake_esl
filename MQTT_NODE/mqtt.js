
const mqtt = require('mqtt');

// Kết nối MQTT Broker (nếu dùng local Mosquitto trên Windows)
const mqttBrokerUrl = 'mqtt://localhost:1883'; 
// Hoặc dùng broker public:
// const mqttBrokerUrl = 'mqtt://broker.hivemq.com:1883';

const mqttClient = mqtt.connect(mqttBrokerUrl);

mqttClient.on('connect', () => {
    console.log('✅ Connected to MQTT Broker');
});

mqttClient.on('error', (err) => {
    console.error('❌ MQTT Error:', err);
});

module.exports = mqttClient;
