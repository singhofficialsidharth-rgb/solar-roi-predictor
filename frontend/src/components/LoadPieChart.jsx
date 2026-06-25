import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function LoadPieChart({ appliances }) {
  // Calculate daily Watt-hours for each appliance to generate the pie slices
  const data = appliances
    .map(app => ({
      name: app.name || 'Unnamed Appliance',
      value: (Number(app.watts) || 0) * (Number(app.hours) || 0)
    }))
    .filter(item => item.value > 0); // Only draw slices for items with actual usage

  // A sleek, vibrant color palette for the dark theme
  const COLORS = ['#4CAF50', '#2196F3', '#FFC107', '#FF5722', '#9C27B0', '#00BCD4'];

  if (data.length === 0) return null;

  return (
    <div style={{ marginTop: '30px', height: '280px', width: '100%' }}>
      <h4 style={{ textAlign: 'center', margin: '0 0 10px 0', color: '#aaa', borderTop: '1px solid #444', paddingTop: '20px' }}>
        Daily Energy Consumption Breakdown
      </h4>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60} // This creates the "Doughnut" hole in the middle
            outerRadius={90}
            paddingAngle={5} // Adds a nice gap between slices
            dataKey="value"
            stroke="none" // Removes the default white border
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value) => [`${value.toLocaleString()} Wh`, 'Daily Energy']} 
            contentStyle={{ backgroundColor: '#1e1e24', border: '1px solid #555', borderRadius: '8px' }}
          />
          <Legend wrapperStyle={{ fontSize: '12px', color: '#fff' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
} 