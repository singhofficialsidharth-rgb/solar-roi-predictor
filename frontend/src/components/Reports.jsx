export default function Reports({ forecastData, systemSize, netCost, breakEvenYear }) {
  
  if (!forecastData || !forecastData.projection_data) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#aaa' }}>
        <p>No data available. Please generate a forecast on the Dashboard first.</p>
      </div>
    );
  }

  // --- Environmental Impact Math ---
  // Approx 0.85 kg of CO2 offset per kWh produced
  const firstYearGeneration = forecastData.projection_data[0].Energy_Produced_kWh;
  const lifetimeGeneration = forecastData.projection_data.reduce((sum, year) => sum + year.Energy_Produced_kWh, 0);
  
  const lifetimeCO2OffsetTonnes = (lifetimeGeneration * 0.85) / 1000; 
  // Approx 1 tree absorbs 21kg of CO2 per year
  const treesEquivalent = Math.round((lifetimeCO2OffsetTonnes * 1000) / 21);

  // --- CSV Export Logic ---
  const handleDownloadCSV = () => {
    const headers = ["Year,Energy Produced (kWh),Grid Rate (INR),Annual Savings (INR),Cumulative Savings (INR)\n"];
    const rows = forecastData.projection_data.map(row => 
      `${row.Year},${row.Energy_Produced_kWh.toFixed(2)},${row.Grid_Rate_INR},${row.Annual_Savings_INR.toFixed(2)},${row.Cumulative_Savings_INR.toFixed(2)}`
    );
    
    const csvContent = "data:text/csv;charset=utf-8," + headers.concat(rows).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Solar_ROI_Projection_${systemSize}kW.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-in-out' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: '#fff', margin: 0 }}>System Analytics Report</h2>
        <button 
          onClick={handleDownloadCSV}
          style={{ background: '#1976d2', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          ⬇️ Download CSV
        </button>
      </div>

      {/* Environmental KPIs */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, padding: '20px', background: '#2c2f33', borderRadius: '8px', borderTop: '4px solid #4CAF50', minWidth: '200px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#aaa' }}>Lifetime CO₂ Offset</h4>
          <p style={{ fontSize: '28px', margin: 0, fontWeight: 'bold', color: '#fff' }}>
            {lifetimeCO2OffsetTonnes.toLocaleString(undefined, {maximumFractionDigits: 1})} <span style={{fontSize: '16px', color: '#aaa'}}>Tonnes</span>
          </p>
        </div>
        <div style={{ flex: 1, padding: '20px', background: '#2c2f33', borderRadius: '8px', borderTop: '4px solid #8BC34A', minWidth: '200px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#aaa' }}>Trees Planted Equivalent</h4>
          <p style={{ fontSize: '28px', margin: 0, fontWeight: 'bold', color: '#fff' }}>
            🌳 {treesEquivalent.toLocaleString()} <span style={{fontSize: '16px', color: '#aaa'}}>Trees</span>
          </p>
        </div>
        <div style={{ flex: 1, padding: '20px', background: '#2c2f33', borderRadius: '8px', borderTop: '4px solid #00BCD4', minWidth: '200px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#aaa' }}>Year 1 Generation</h4>
          <p style={{ fontSize: '28px', margin: 0, fontWeight: 'bold', color: '#fff' }}>
            {Math.round(firstYearGeneration).toLocaleString()} <span style={{fontSize: '16px', color: '#aaa'}}>kWh</span>
          </p>
        </div>
        <div style={{ flex: 1, padding: '20px', background: '#2c2f33', borderRadius: '8px', borderTop: '4px solid #FFC107', minWidth: '200px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#aaa' }}>Break-Even Estimate</h4>
          <p style={{ fontSize: '28px', margin: 0, fontWeight: 'bold', color: '#fff' }}>
            {breakEvenYear > 25 ? '> 25 Years' : `Year ${breakEvenYear}`}
          </p>
        </div>
      </div>

      {/* Data Table */}
      <div style={{ background: '#2c2f33', borderRadius: '8px', overflow: 'hidden' }}>
        <div style={{ padding: '15px 20px', borderBottom: '1px solid #444', background: '#232529' }}>
          <h3 style={{ margin: 0, color: '#fff', fontSize: '16px' }}>25-Year Financial Projection Table</h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: '#ccc' }}>
            <thead>
              <tr style={{ background: '#1e1e24' }}>
                <th style={{ padding: '12px 20px', borderBottom: '1px solid #444' }}>Year</th>
                <th style={{ padding: '12px 20px', borderBottom: '1px solid #444' }}>Energy (kWh)</th>
                <th style={{ padding: '12px 20px', borderBottom: '1px solid #444' }}>Grid Rate (₹)</th>
                <th style={{ padding: '12px 20px', borderBottom: '1px solid #444' }}>Annual Savings</th>
                <th style={{ padding: '12px 20px', borderBottom: '1px solid #444' }}>Cumulative Savings</th>
              </tr>
            </thead>
            <tbody>
              {forecastData.projection_data.map((row) => (
                <tr key={row.Year} style={{ borderBottom: '1px solid #333', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#383c42'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '12px 20px' }}>{row.Year}</td>
                  <td style={{ padding: '12px 20px' }}>{row.Energy_Produced_kWh.toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
                  <td style={{ padding: '12px 20px' }}>₹{row.Grid_Rate_INR.toFixed(2)}</td>
                  <td style={{ padding: '12px 20px', color: '#4CAF50' }}>+₹{row.Annual_Savings_INR.toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
                  <td style={{ padding: '12px 20px', fontWeight: 'bold', color: row.Cumulative_Savings_INR >= netCost ? '#4CAF50' : '#aaa' }}>
                    ₹{row.Cumulative_Savings_INR.toLocaleString(undefined, {maximumFractionDigits: 0})}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
