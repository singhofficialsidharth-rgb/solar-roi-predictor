export default function PresetManager({ onLoadPreset, onClearAll }) {
  const presetLoads = {
    "Basic 1BHK": [
      { name: 'Fans (2)', watts: 150, hours: 12 },
      { name: 'LED Lights (4)', watts: 40, hours: 6 },
      { name: 'TV', watts: 100, hours: 4 },
      { name: 'Refrigerator', watts: 200, hours: 24 }
    ],
    "Standard 2BHK": [
      { name: '1.5 Ton AC', watts: 1500, hours: 6 },
      { name: 'Refrigerator', watts: 200, hours: 24 },
      { name: 'Fans & Lights', watts: 300, hours: 10 },
      { name: 'Washing Machine', watts: 500, hours: 1 }
    ]
  };

  return (
    <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
      <span style={{ color: '#aaa', fontSize: '14px', alignSelf: 'center' }}>Quick Presets:</span>
      {Object.keys(presetLoads).map(key => (
        <button 
          key={key} 
          onClick={() => onLoadPreset(presetLoads[key])}
          style={{ background: '#40444b', color: '#4CAF50', border: '1px solid #4CAF50', padding: '6px 12px', borderRadius: '15px', cursor: 'pointer', fontSize: '12px' }}
        >
          {key}
        </button>
      ))}
      <button 
        onClick={onClearAll}
        style={{ background: 'transparent', color: '#ff4d4d', border: '1px solid #ff4d4d', padding: '6px 12px', borderRadius: '15px', cursor: 'pointer', fontSize: '12px' }}
      >
        Clear All
      </button>
    </div>
  );
}