import { useState } from 'react';

export default function Settings() {
  // Local state for the settings form
  const [profile, setProfile] = useState({
    name: 'Sidharth Singh Kushwah',
    email: 'sidharth@example.com',
    company: 'Independent Data Analyst'
  });

  const [preferences, setPreferences] = useState({
    currency: 'INR',
    defaultLocation: 'New Delhi',
    theme: 'dark',
    notifications: true
  });

  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    // In a real app, you would send this data to your backend here
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000); // Hide the success message after 3 seconds
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-in-out', maxWidth: '800px', margin: '0 auto' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2 style={{ color: '#fff', margin: 0 }}>Application Settings</h2>
        <button 
          onClick={handleSave}
          style={{ 
            background: isSaved ? '#388e3c' : '#4CAF50', 
            color: '#fff', 
            border: 'none', 
            padding: '10px 20px', 
            borderRadius: '4px', 
            cursor: 'pointer', 
            fontWeight: 'bold',
            transition: 'background 0.3s'
          }}
        >
          {isSaved ? '✓ Saved Successfully' : 'Save Changes'}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        
        {/* Profile Settings Card */}
        <div style={{ background: '#2c2f33', padding: '25px', borderRadius: '8px', borderLeft: '4px solid #1976d2' }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#1565c0', fontSize: '18px' }}>User Profile</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ color: '#aaa', fontSize: '14px' }}>Full Name</label>
              <input 
                type="text" 
                value={profile.name}
                onChange={(e) => setProfile({...profile, name: e.target.value})}
                style={{ padding: '10px', borderRadius: '4px', border: '1px solid #444', background: '#1e1e24', color: '#fff', fontSize: '16px' }}
              />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ color: '#aaa', fontSize: '14px' }}>Email Address</label>
              <input 
                type="email" 
                value={profile.email}
                onChange={(e) => setProfile({...profile, email: e.target.value})}
                style={{ padding: '10px', borderRadius: '4px', border: '1px solid #444', background: '#1e1e24', color: '#fff', fontSize: '16px' }}
              />
            </div>
          </div>
        </div>

        {/* Application Preferences Card */}
        <div style={{ background: '#2c2f33', padding: '25px', borderRadius: '8px', borderLeft: '4px solid #4CAF50' }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#2e7d32', fontSize: '18px' }}>System Defaults</h3>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
            
            <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ color: '#aaa', fontSize: '14px' }}>Default Currency</label>
              <select 
                value={preferences.currency}
                onChange={(e) => setPreferences({...preferences, currency: e.target.value})}
                style={{ padding: '10px', borderRadius: '4px', border: '1px solid #444', background: '#1e1e24', color: '#fff', fontSize: '16px' }}
              >
                <option value="INR">INR (₹) - Indian Rupee</option>
                <option value="USD">USD ($) - US Dollar</option>
                <option value="EUR">EUR (€) - Euro</option>
              </select>
            </div>

            <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ color: '#aaa', fontSize: '14px' }}>Default Dashboard Location</label>
              <select 
                value={preferences.defaultLocation}
                onChange={(e) => setPreferences({...preferences, defaultLocation: e.target.value})}
                style={{ padding: '10px', borderRadius: '4px', border: '1px solid #444', background: '#1e1e24', color: '#fff', fontSize: '16px' }}
              >
                <option value="New Delhi">New Delhi</option>
                <option value="Kanpur">Kanpur</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Bangalore">Bangalore</option>
              </select>
            </div>

            <div style={{ flex: '1 1 100%', display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
              <input 
                type="checkbox" 
                id="notif-toggle"
                checked={preferences.notifications}
                onChange={(e) => setPreferences({...preferences, notifications: e.target.checked})}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <label htmlFor="notif-toggle" style={{ color: '#ccc', cursor: 'pointer' }}>
                Enable system status notifications
              </label>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}