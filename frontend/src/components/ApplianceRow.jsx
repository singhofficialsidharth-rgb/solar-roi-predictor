export default function ApplianceRow({ app, onUpdate, onRemove }) {
  return (
    <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
      <input 
        type="text" placeholder="Appliance Name" value={app.name} 
        onChange={(e) => onUpdate(app.id, 'name', e.target.value)}
        style={{ flex: 2, minWidth: '150px', padding: '8px', borderRadius: '4px', border: 'none', background: '#40444b', color: '#fff' }}
      />
      <input 
        type="number" placeholder="Watts" value={app.watts} 
        onChange={(e) => onUpdate(app.id, 'watts', e.target.value === '' ? '' : Number(e.target.value))}
        className="no-spinner"
        style={{ flex: 1, minWidth: '70px', padding: '8px', borderRadius: '4px', border: 'none', background: '#40444b', color: '#fff' }}
      />
      <span style={{ color: '#aaa', fontSize: '14px' }}>W</span>
      <input 
        type="number" placeholder="Hours/Day" value={app.hours} 
        onChange={(e) => onUpdate(app.id, 'hours', e.target.value === '' ? '' : Number(e.target.value))}
        className="no-spinner"
        style={{ flex: 1, minWidth: '70px', padding: '8px', borderRadius: '4px', border: 'none', background: '#40444b', color: '#fff' }}
      />
      <span style={{ color: '#aaa', fontSize: '14px' }}>hrs</span>
      <button 
        onClick={() => onRemove(app.id)}
        style={{ background: '#ff4d4d', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' }}
      >
        ✕
      </button>
    </div>
  );
}