import React, { useState } from 'react';
import { KidSelector } from './pages/KidSelector';
import { KidDashboard } from './pages/KidDashboard';
import { ParentAdmin } from './pages/ParentAdmin';
import { useAppData } from './hooks/useAppData';

function App() {
  const { data } = useAppData();
  const [selectedKidId, setSelectedKidId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [pinDialog, setPinDialog] = useState(false);
  const [pinCode, setPinCode] = useState('');
  const [pinError, setPinError] = useState(false);

  const handleAdminLogin = () => {
    setPinDialog(true);
    setPinError(false);
  };

  const verifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinCode === data.pin) {
      setIsAdmin(true);
      setPinDialog(false);
      setPinCode('');
      setPinError(false);
    } else {
      setPinError(true);
      setPinCode('');
    }
  };

  const handleBackFromAdmin = () => {
    setIsAdmin(false);
    setSelectedKidId(null);
  };

  const isDefaultPin = data.pin === '1234';

  let content: React.ReactNode;

  if (isAdmin) {
    content = <ParentAdmin onBack={handleBackFromAdmin} />;
  } else if (selectedKidId) {
    content = (
      <KidDashboard
        kidId={selectedKidId}
        onBack={() => setSelectedKidId(null)}
      />
    );
  } else {
    content = (
      <KidSelector
        onSelectKid={setSelectedKidId}
        onAdminLogin={handleAdminLogin}
      />
    );
  }

  return (
    <>
      {content}

      {pinDialog && (
        <div className="modal-overlay" onClick={() => setPinDialog(false)}>
          <div className="modal-content glass-panel" style={{ maxWidth: '320px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>家长锁</h2>
            </div>
            <form onSubmit={verifyPin} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <label style={{ fontWeight: 600, fontSize: '0.92rem' }}>请输入4位家长密码</label>
                {isDefaultPin && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>默认密码: 1234</p>
                )}
                {pinError && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>密码错误，请重试</p>
                )}
              </div>
              <input
                type="password"
                value={pinCode}
                onChange={e => { setPinCode(e.target.value); setPinError(false); }}
                style={{ padding: '0.8rem', borderRadius: 'var(--radius-sm)', border: `1px solid ${pinError ? 'var(--primary)' : 'var(--border-color)'}`, fontSize: '1.3rem', textAlign: 'center', letterSpacing: '0.4em', fontFamily: 'inherit' }}
                autoFocus
                maxLength={4}
              />
              <button type="submit" className="btn-primary" style={{ width: '100%', padding: '0.75rem' }}>进入管理</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
