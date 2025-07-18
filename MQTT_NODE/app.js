const express = require('express');
const mqtt = require('mqtt');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Cấu hình EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
const expressLayouts = require('express-ejs-layouts');
app.use(expressLayouts);
app.set('layout', 'layouts/main');
//router
app.get('/', (req, res) => {
    res.render('pages/home', {
        title: 'Trang chủ',
        message: 'Chào mừng đến với ứng dụng Node.js + EJS!'
    });
});

app.use(cors());
app.use(bodyParser.json());


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

// API nhận dữ liệu từ client và publish qua MQTT
app.post('/api/product', (req, res) => {
    const { productId, name, price } = req.body;

    if (!productId || !name || !price) {
        return res.status(400).json({ error: 'Missing productId, name, or price' });
    }

    // Publish data đến topic = productId (ví dụ: "PRO001")
    const topic = productId;
    const payload = JSON.stringify({ name, price });

    mqttClient.publish(topic, payload, (err) => {
        if (err) {
            console.error('❌ Publish error:', err);
            return res.status(500).json({ error: 'Failed to send data to ESP32' });
        }
        console.log(`📢 Published to topic "${topic}": ${payload}`);
        res.status(200).json({ success: true, message: 'Data sent to ESP32' });
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});