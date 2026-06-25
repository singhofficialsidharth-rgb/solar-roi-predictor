import { useState, useContext } from 'react';
import { AuthContext } from '../context/authContext';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export default function Header({ activeView, setActiveView }) {
  const { user, logout } = useContext(AuthContext);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const initials = user?.name
    ? user.name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
    : 'SR';

  const handleExportPDF = async () => {
    const dashboard = document.getElementById('exportable-dashboard');
    if (!dashboard || isExporting) return;

    setIsExporting(true);

    try {
      const canvas = await html2canvas(dashboard, {
        backgroundColor: '#1e1e24',
        scale: 2,
        useCORS: true,
      });

      const imageData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imageHeight = (canvas.height * pageWidth) / canvas.width;
      let remainingHeight = imageHeight;
      let position = 0;

      pdf.addImage(imageData, 'PNG', 0, position, pageWidth, imageHeight);
      remainingHeight -= pageHeight;

      while (remainingHeight > 0) {
        position -= pageHeight;
        pdf.addPage();
        pdf.addImage(imageData, 'PNG', 0, position, pageWidth, imageHeight);
        remainingHeight -= pageHeight;
      }

      pdf.save('solar-roi-report.pdf');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <header style={{ background: '#15151a', borderBottom: '1px solid #333', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 1000 }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => setActiveView(user ? 'dashboard' : 'landing')}>
        <div style={{ background: '#4CAF50', color: '#fff', width: '35px', height: '35px', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', fontSize: '18px' }}>☀️</div>
        <h2 style={{ margin: 0, color: '#fff', fontSize: '20px', letterSpacing: '0.5px' }}>Solar<span style={{ color: '#4CAF50' }}>ROI</span></h2>
      </div>

      {/* Conditionally Render Navigation */}
      <nav style={{ display: 'flex', gap: '20px' }}>
        {user ? (
          ['dashboard', 'reports', 'settings'].map((view) => (
            <button key={view} onClick={() => setActiveView(view)} style={{ background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer', padding: '0 0 4px 0', textTransform: 'capitalize', color: activeView === view ? '#4CAF50' : '#aaa', borderBottom: activeView === view ? '2px solid #4CAF50' : '2px solid transparent', fontWeight: activeView === view ? 'bold' : 'normal', transition: 'all 0.2s' }}>
              {view}
            </button>
          ))
        ) : (
          <button onClick={() => setActiveView('landing')} style={{ background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer', color: activeView === 'landing' ? '#4CAF50' : '#aaa', fontWeight: 'bold' }}>
            Home
          </button>
        )}
      </nav>

      {/* Conditionally Render Right Side Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', position: 'relative' }}>
        {user ? (
          <>
            <button onClick={handleExportPDF} disabled={isExporting} style={{ background: 'transparent', color: '#fff', border: '1px solid #555', padding: '6px 15px', borderRadius: '20px', cursor: 'pointer', fontSize: '14px' }}>
              {isExporting ? '⏳ Generating...' : 'Export PDF'}
            </button>
            <div onClick={() => setShowDropdown(!showDropdown)} style={{ width: '35px', height: '35px', borderRadius: '50%', background: '#1976d2', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', cursor: 'pointer', userSelect: 'none' }}>
              {initials}
            </div>
            {showDropdown && (
              <div style={{ position: 'absolute', top: '50px', right: '0', background: '#2c2f33', border: '1px solid #444', borderRadius: '8px', padding: '10px', width: '200px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)', zIndex: 1001 }}>
                <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#fff', borderBottom: '1px solid #444', paddingBottom: '10px' }}>Signed in as<br/><strong style={{ color: '#4CAF50' }}>{user.email}</strong></p>
                <button onClick={() => { logout(); setActiveView('landing'); setShowDropdown(false); }} style={{ width: '100%', background: '#ff4d4d20', color: '#ff4d4d', border: 'none', padding: '8px', borderRadius: '4px', cursor: 'pointer', textAlign: 'left', fontWeight: 'bold' }}>Sign Out</button>
              </div>
            )}
          </>
        ) : (
          <button onClick={() => setActiveView('login')} style={{ background: '#4CAF50', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
            Sign In
          </button>
        )}
      </div>
    </header>
  );
}
