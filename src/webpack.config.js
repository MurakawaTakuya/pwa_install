const { InjectManifest } = require('workbox-webpack-plugin');

module.exports = {
  // 他の設定
  plugins: [
    // 他のプラグイン
    new InjectManifest({
      swSrc: './src/service-worker.js', // ソースのサービスワーカーのパス
      swDest: 'service-worker.js', // 出力先のサービスワーカーのパス
    }),
  ],
};
