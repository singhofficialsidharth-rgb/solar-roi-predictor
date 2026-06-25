export default function FinancialSettings({ 
  installerCost, onInstallerChange, 
  applySubsidy, onSubsidyToggle 
}) {
  
  // Real-world estimated pricing for Northern India
  const installers = [
    { name: "Tata Power Solar", cost: 50000 },
    { name: "Adani Solar", cost: 48000 },
    { name: "Luminous", cost: 52000 },
    { name: "Local/Unbranded Installer", cost: 42000 }
  ];

  return (
    <div style={{ padding: '20px', background: '#2c2f33', borderRadius: '8px', marginBottom: '20px', color: '#fff' }}>
      <h3 style={{ marginTop: 0, borderBottom: '1px solid #444', paddingBottom: '10px' }}>
        Financial Settings & Subsidies
      </h3>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center', marginTop: '15px' }}>
        
        {/* Installer Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ fontSize: '14px', color: '#aaa' }}>Select Installer:</label>
          <select 
            value={installerCost} 
            onChange={(e) => onInstallerChange(Number(e.target.value))}
            style={{ padding: '8px', borderRadius: '4px', background: '#40444b', color: '#fff', border: '1px solid #555', cursor: 'pointer' }}
          >
            {installers.map(inst => (
              <option key={inst.name} value={inst.cost}>
                {inst.name} (₹{inst.cost.toLocaleString()}/kW)
              </option>
            ))}
          </select>
        </div>

        {/* PM Surya Ghar Subsidy Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#1b5e20', padding: '8px 15px', borderRadius: '4px' }}>
          <input 
            type="checkbox" 
            id="subsidy-toggle"
            checked={applySubsidy}
            onChange={(e) => onSubsidyToggle(e.target.checked)}
            style={{ cursor: 'pointer', width: '18px', height: '18px' }}
          />
          <label htmlFor="subsidy-toggle" style={{ cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>
            Apply PM Surya Ghar Subsidy
          </label>
        </div>

      </div>
    </div>
  );
}