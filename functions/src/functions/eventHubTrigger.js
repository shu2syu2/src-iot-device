const { app } = require('@azure/functions');
const { Client, Message } = require('azure-iothub');

// IoT Hub サービス接続文字列（iothubowner ポリシーのもの）を環境変数から取得
const serviceConnectionString = process.env.IOTHUB_SERVICE_CONNECTION;
const deviceRecvId = 'device-recv'; // 送信先デバイスID

// クライアントは外に定義して再利用可能に（初期化コスト削減）
const serviceClient = Client.fromConnectionString(serviceConnectionString);

app.eventHub('eventHubTrigger', {
  connection: 'IoTHubConnection', // local.settings.json にある Event Hub互換接続文字列
  eventHubName: 'messages/events',
  consumerGroup: '$Default',
  cardinality: 'many',
  handler: async (messages, context) => {
    for (const msg of messages) {
      const deviceId = msg.systemProperties?.['iothub-connection-device-id'];
      const payload = Buffer.isBuffer(msg.body)
        ? msg.body.toString('utf-8')
        : JSON.stringify(msg.body);

      context.log(`📥 受信 from ${deviceId}: ${payload}`);

      // 受信したメッセージを C2D で device-recv に送信
      try {
        await serviceClient.open();
        const c2dMessage = new Message(payload);
        await serviceClient.send(deviceRecvId, c2dMessage);
        context.log(`📤 device-recv に送信完了: ${payload}`);
      } catch (error) {
        context.log.error('❌ C2D送信失敗:', error);
      }
    }
  }
});
