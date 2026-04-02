import React, { useState } from 'react';
import { KidDashboard } from './pages/KidDashboard';
import { ParentAdmin } from './pages/ParentAdmin';

function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [pinDialog, setPinDialog] = useState(false);
  const [pinCode, setPinCode] = useState('');

  const handleAdminLogin = () => {
    setPinDialog(true);
  };

  const verifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinCode === '1234') {
      setIsAdmin(true);
      setPinDialog(false);
      setPinCode('');
    } else {
      alert('密码错误 (默认密码: 1234)');
    }
  }

  return (
    <>
      {isAdmin ? (
        <ParentAdmin onBack={() => setIsAdmin(false)} />
      ) : (
        <KidDashboard onAdminLogin={handleAdminLogin} />
      )}

      {pinDialog && (
        <div className="modal-overlay" onClick={() => setPinDialog(false)}>
          <div className="modal-content glass-panel" style={{ maxWidth: '320px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>家长锁</h2>
            </div>
            <form onSubmit={verifyPin} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <label style={{ fontWeight: 600, fontSize: '0.92rem' }}>请输入4位家长密码</label>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>默认密码: 1234</p>
              </div>
              <input
                type="password"
                value={pinCode}
                onChange={e => setPinCode(e.target.value)}
                style={{ padding: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '1.3rem', textAlign: 'center', letterSpacing: '0.4em', fontFamily: 'inherit' }}
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
