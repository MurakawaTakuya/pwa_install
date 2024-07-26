import { Helmet } from 'react-helmet';
import './App.scss';
import { useEffect, useState } from 'react';
import { css, ClassNames } from '@emotion/react';
import Button from '@mui/material/Button';

function App() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isInStandaloneMode, setIsInStandaloneMode] = useState(false);

  useEffect(() => {
    // Service Workerの有効化
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register(`${process.env.PUBLIC_URL}/service-worker.js`)
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

  const flexButtonStyle = css({
    display: 'flex',
    justifyContent: 'center',
  });

  return (
    <div className="App">
      <Helmet>
        <link rel="manifest" href="manifest.webmanifest" />
        <title>React PWA</title>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" />
      </Helmet>
      <h1>PWA INSTALL TEST</h1>
      {deferredPrompt && !isIOS && (
        <ClassNames>
          {({ css }) => (
            <div className={css(flexButtonStyle)}>
              <Button variant="outlined" onClick={handleInstall}>Install PWA</Button>
            </div>
          )}
        </ClassNames>
      )}
      {isIOS && !isInStandaloneMode && (
        <div className="ios-install-guide">
          <p>このアプリをインストールするには、Safariの共有ボタンをタップし、「ホーム画面に追加」を選択してください。</p>
        </div>
      )}
    </div>
  );
}

export default App;
