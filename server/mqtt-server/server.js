const mqtt = require('mqtt');
const sqlite3 = require('sqlite3').verbose();
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Connect to SQLite database
const db = new sqlite3.Database('mqttData.db');

// Create table if not exists
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS sensorData (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            temperature REAL,
            humidity REAL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
});

// Connect to MQTT broker
const mqttClient = mqtt.connect('mqtt://public.mqtthq.com');

mqttClient.on('connect', function () {
    console.log('Connected to MQTT broker');
    mqttClient.subscribe('sensor/data', function (err) {
        if (!err) {
            console.log('Subscribed to topic: sensor/data');
        } else {
            console.error('Failed to subscribe to topic:', err);
        }
    });
});

mqttClient.on('message', function (topic, message) {
    // message is Buffer
    console.log(`Received message: ${message.toString()} on topic: ${topic}`);

    try {
        const data = JSON.parse(message.toString());
        const stmt = db.prepare('INSERT INTO sensorData (temperature, humidity) VALUES (?, ?)'); // insert data into database
        stmt.run(data.temperature, data.humidity, (err) => {
            if (err) {
                console.error('Failed to insert data into SQLite:', err);
                return;
            }
            console.log('Data inserted into SQLite');
        });
        stmt.finalize();
    } catch (err) {
        console.error('Failed to parse message:', err);
    }
});

// Optional: Express server for additional functionality
app.get('/', (req, res) => {
    res.send('MQTT Server is running');
});

app.get('/api/fetchlatestdata', (req, res) => {
    db.all("SELECT * FROM sensorData", [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({
            message: "success",
            data: rows
        });
    });
});


app.listen(port, () => {
    console.log(`Express server listening at http://localhost:${port}`);
});
