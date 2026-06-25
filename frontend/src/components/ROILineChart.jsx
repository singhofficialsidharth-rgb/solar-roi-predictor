import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

export default function ROILineChart({ projectionData, initialCost }) {
  return (
    <div style={{ marginTop: '30px' }}>
      <h2>25-Year Cumulative Savings Projection</h2>
      <div style={{ height: '400px', width: '100%', maxWidth: '800px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={projectionData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="Year" />
            <YAxis />
            <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
            <Legend verticalAlign="top" height={36}/>
            
            <Line 
              type="monotone" 
              name="Cumulative Savings (INR)" 
              dataKey="Cumulative_Savings_INR" 
              stroke="#8884d8" 
              strokeWidth={3}
              dot={false}
            />
            <Line 
              type="monotone" 
              name="Initial System Cost" 
              dataKey={() => initialCost} 
              stroke="#ff7300" 
              strokeDasharray="5 5"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}