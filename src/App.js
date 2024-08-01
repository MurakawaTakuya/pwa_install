import { Helmet } from 'react-helmet';
import './App.scss';
import { useEffect, useState } from 'react';
import { css, ClassNames } from '@emotion/react';
import Button from '@mui/material/Button';

function App() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isInStandaloneMode, setIsInStandaloneMode] = useState(false);
  const [log, setLog] = useState([]);

  useEffect(() => {
    // Service Workerの有効化
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register(`${process.env.PUBLIC_URL}/service-worker.js`)
        .then(function(registration) {
          setLog(prevLog => [...prevLog, `Service Worker registered with scope: ${registration.scope}`]);
        })
        .catch(function(error) {
          setLog(prevLog => [...prevLog, `Service Worker registration failed: ${error}`]);
        });
    }

    // iOSデバイスかどうかをチェック
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);
    setLog(prevLog => [...prevLog, `Is iOS device: ${isIOSDevice}`]);

    // スタンドアロンモードかどうかをチェック
    const standalone = window.navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches;
    setIsInStandaloneMode(standalone);
    setLog(prevLog => [...prevLog, `Is in standalone mode: ${standalone}`]);

    // beforeinstallpromptイベントをリスン
    const handleBeforeInstallPrompt = (e) => {
      setLog(prevLog => [...prevLog, 'beforeinstallprompt event detected']);
      e.preventDefault();
      setDeferredPrompt(e);
      setLog(prevLog => [...prevLog, 'beforeinstallprompt event was prevented and deferredPrompt set']);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          setLog(prevLog => [...prevLog, 'User accepted the A2HS prompt']);
        } else {
          setLog(prevLog => [...prevLog, 'User dismissed the A2HS prompt']);
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
      {isInStandaloneMode ? (
        <p className='pwa-already-installed'>&#10003;既にインストールされています</p>
      ) : (
        !deferredPrompt ? (
          <p className='installed-or-error'>既にインストールさているか、エラーです</p>
        ) : (
          deferredPrompt && !isIOS && (
            <ClassNames>
              {({ css }) => (
                <div className={css(flexButtonStyle)}>
                  <Button variant="outlined" onClick={handleInstall}>Install PWA</Button>
                </div>
              )}
            </ClassNames>
          )
        )
      )}
      {isIOS && !isInStandaloneMode && (
        <div className="ios-install-guide">
          <p>このアプリをインストールするには、Safariの共有ボタンをタップし、「ホーム画面に追加」を選択してください。</p>
        </div>
      )}
      <div className="debug-log">
        <h2>Debug Log</h2>
        <ul>
          {log.map((entry, index) => (
            <li key={index}>{entry}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
