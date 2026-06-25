export default function LocationSelector({ 
  selectedCity, cities, onCityChange, onUseMyLocation, isLocating, isLoadingSolar, sunlightHours 
}) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #444', paddingBottom: '10px', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
        <h3 style={{ margin: 0 }}>Smart Load Calculator</h3>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button 
            onClick={onUseMyLocation}
            disabled={isLocating}
            style={{ 
              background: '#1976d2', color: '#fff', border: 'none', padding: '6px 12px', 
              borderRadius: '4px', cursor: isLocating ? 'wait' : 'pointer', fontSize: '14px',
              display: 'flex', alignItems: 'center', gap: '5px'
            }}
          >
            {isLocating ? '⏳ Locating...' : '📍 Use My Location'}
          </button>

          <span style={{ color: '#aaa', fontSize: '14px' }}>or</span>

          <select 
            value={cities.some(c => c.name === selectedCity.name) ? selectedCity.name : "custom"} 
            onChange={onCityChange}
            style={{ padding: '6px', borderRadius: '4px', background: '#40444b', color: '#fff', border: '1px solid #555' }}
          >
            {!cities.some(c => c.name === selectedCity.name) && (
              <option value="custom">{selectedCity.name}</option>
            )}
            {cities.map(city => (
              <option key={city.name} value={city.name}>{city.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <p style={{ fontSize: '14px', color: '#aaa', margin: 0 }}>
          Add your daily usage to determine your required system size.
        </p>
        <p style={{ fontSize: '12px', color: isLoadingSolar ? '#ffeb3b' : '#4CAF50', margin: 0, fontWeight: 'bold' }}>
          {isLoadingSolar 
            ? "Fetching NASA satellite data..." 
            : `☀️ Local Irradiance: ${sunlightHours.toFixed(2)} kWh/m²/day`
          }
        </p>
      </div>
    </div>
  );
}