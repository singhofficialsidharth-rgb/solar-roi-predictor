export default function SummaryCards({ grossCost, subsidyAmount, netCost, breakEvenYear }) {
  return (
    <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
      
      <div style={{ flex: 1, padding: '20px', background: '#e3f2fd', borderRadius: '8px', borderLeft: '4px solid #1976d2', minWidth: '250px' }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#1565c0' }}>Financial Breakdown</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
          <span style={{ color: '#555' }}>Gross System Cost:</span>
          <span style={{ color: '#0d47a1', fontWeight: 'bold' }}>₹{grossCost.toLocaleString()}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ccc', paddingBottom: '10px', marginBottom: '10px' }}>
          <span style={{ color: '#2e7d32' }}>Govt. Subsidy (-):</span>
          <span style={{ color: '#2e7d32', fontWeight: 'bold' }}>₹{subsidyAmount.toLocaleString()}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#333', fontSize: '18px', fontWeight: 'bold' }}>Net Payable:</span>
          <span style={{ color: '#0d47a1', fontSize: '24px', fontWeight: 'bold' }}>₹{netCost.toLocaleString()}</span>
        </div>
      </div>
      
      <div style={{ flex: 1, padding: '20px', background: '#e8f5e9', borderRadius: '8px', borderLeft: '4px solid #388e3c', minWidth: '250px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#2e7d32' }}>Estimated Break-Even</h3>
        <p style={{ fontSize: '32px', margin: 0, fontWeight: 'bold', color: '#1b5e20' }}>
          {breakEvenYear > 25 ? "> 25 Years" : `Year ${breakEvenYear}`}
        </p>
        <p style={{ fontSize: '14px', color: '#555', margin: '5px 0 0 0' }}>
          After this point, your electricity is effectively free.
        </p>
      </div>

    </div>
  );
}