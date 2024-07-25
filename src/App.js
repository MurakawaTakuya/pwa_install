import { Helmet } from 'react-helmet';
import './App.scss';
import { useEffect, useState } from 'react';

function App() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isInStandaloneMode, setIsInStandaloneMode] = useState(false);

  useEffect(() => {
    // Service Workerの有効化
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('service-worker.js')
        .then(function(registration) {
          console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch(function(error) {
          console.error('Service Worker registration failed:', error);
        });
    }

    // iOSデバイスかどうかをチェック
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    // スタンドアロンモードかどうかをチェック
    const standalone = window.navigator.standalone === true;
    setIsInStandaloneMode(standalone);

    // beforeinstallpromptイベントをリスン
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      console.log('beforeinstallprompt event was fired.');
    });
  }, []);

  const handleInstall = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the A2HS prompt');
        } else {
          console.log('User dismissed the A2HS prompt');
        }
        setDeferredPrompt(null);
      });
    }
  };

  return (
    <div className="App">
      <Helmet>
        <link rel="manifest" href="manifest.webmanifest" />
        <title>React PWA</title>
      </Helmet>
      <h1>React PWA</h1>
      {/* PWAダウンロードボタンの追加 */}
      {deferredPrompt && !isIOS && (
        <button onClick={handleInstall}>Install PWA</button>
      )}
      {/* iOS用のインストールガイドを表示 */}
      {isIOS && !isInStandaloneMode && (
        <div className="ios-install-guide">
          <p>このアプリをインストールするには、Safariの共有ボタンをタップし、「ホーム画面に追加」を選択してください。</p>
        </div>
      )}
    </div>
  );
}

export default App;
