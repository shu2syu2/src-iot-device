require('dotenv').config(); // ← .env を読み込む

const { Client, Message } = require('azure-iot-device');
const { MqttWs } = require('azure-iot-device-mqtt');

// .env から接続文字列を取得
const connectionString = process.env.IOTHUB_CONNECTION_STRING;

if (!connectionString) {
  console.error('❌ IOTHUB_CONNECTION_STRING が .env に設定されていません');
  process.exit(1);
}

const client = Client.fromConnectionString(connectionString, MqttWs);

client.open((err) => {
  if (err) {
    console.error('接続失敗:', err.message);
    return;
  }

  console.log('✅ IoT Hubに接続しました。5秒ごとにデータを送信します。');

  setInterval(() => {
    const temperature = (20 + Math.random() * 15).toFixed(1); // 20〜35℃
    const humidity = (40 + Math.random() * 20).toFixed(1);    // 40〜60%
    const data = JSON.stringify({
      temperature,
      humidity,
      timestamp: new Date().toISOString()
    });

    const message = new Message(data);
    console.log('📤 送信データ:', data);

    client.sendEvent(message, (err) => {
      if (err) {
        console.error('送信エラー:', err.toString());
      } else {
        console.log('✅ 送信成功');
      }
    });
  }, 5000);
});
