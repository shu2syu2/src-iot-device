require('dotenv').config();

const { Client } = require('azure-iot-device');
const { MqttWs } = require('azure-iot-device-mqtt');

// IoT Hub のデバイス接続文字列（device-recv のもの）を設定
const connectionString = process.env.IOTHUB_CONNECTION_STRING_RECV;

if (!connectionString) {
  console.error('❌ 環境変数 IOTHUB_CONNECTION_STRING_RECV が未設定です');
  process.exit(1);
}

const client = Client.fromConnectionString(connectionString, MqttWs);

client.open((err) => {
  if (err) {
    console.error('接続エラー:', err.message);
    return;
  }

  console.log('📡 接続成功: device-recv は受信待機中です（Ctrl + C で終了）');

  client.on('message', (msg) => {
    const content = msg.getData().toString();
    console.log('📩 受信メッセージ:', content);

    // メッセージ受信後の処理があればここに
    // ...

    // 完了通知を送る（重要）
    client.complete(msg, (err) => {
      if (err) {
        console.error('⚠️ 完了応答エラー:', err.toString());
      } else {
        console.log('✅ メッセージ受信完了を通知しました');
      }
    });
  });
});
