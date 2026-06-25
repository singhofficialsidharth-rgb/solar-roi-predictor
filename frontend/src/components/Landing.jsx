export default function Landing({ setActiveView }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '60px 20px', animation: 'fadeIn 0.5s ease-in-out' }}>
      
      <div style={{ background: 'rgba(76, 175, 80, 0.1)', color: '#4CAF50', padding: '8px 16px', borderRadius: '20px', fontWeight: 'bold', marginBottom: '20px' }}>
        🚀 The Future of Energy Management
      </div>
      
      <h1 style={{ fontSize: '48px', color: '#fff', margin: '0 0 20px 0', maxWidth: '800px', lineHeight: '1.2' }}>
        Take Control of Your Energy with <span style={{ color: '#4CAF50' }}>Smart Solar Projections</span>
      </h1>
      
      <p style={{ fontSize: '18px', color: '#aaa', maxWidth: '600px', marginBottom: '40px', lineHeight: '1.6' }}>
        Stop guessing about your electricity bills. Calculate your exact solar requirements, explore real-time government subsidies, and map out your 25-year financial break-even point in seconds.
      </p>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button 
          onClick={() => setActiveView('login')}
          style={{ background: '#4CAF50', color: '#fff', border: 'none', padding: '15px 30px', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)', transition: 'transform 0.2s' }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          Get Started — It's Free
        </button>
        
        <button 
          style={{ background: 'transparent', color: '#fff', border: '1px solid #555', padding: '15px 30px', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.2s' }}
          onMouseOver={(e) => e.currentTarget.style.background = '#333'}
          onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
        >
          View Live Demo
        </button>
      </div>

      {/* Feature Highlights */}
      <div style={{ display: 'flex', gap: '30px', marginTop: '80px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {[
          { title: "📍 Location Aware", desc: "Uses NASA satellite data for your exact GPS coordinates." },
          { title: "💰 Real-time Subsidies", desc: "Automatically calculates PM Surya Ghar adjustments." },
          { title: "📊 25-Year Forecasting", desc: "Detailed ROI tracking and environmental impact reports." }
        ].map((feature, i) => (
          <div key={i} style={{ background: '#2c2f33', padding: '25px', borderRadius: '12px', width: '250px', textAlign: 'left', borderTop: '4px solid #4CAF50' }}>
            <h3 style={{ color: '#fff', margin: '0 0 10px 0' }}>{feature.title}</h3>
            <p style={{ color: '#aaa', margin: 0, fontSize: '14px', lineHeight: '1.5' }}>{feature.desc}</p>
          </div>
        ))}
      </div>

    </div>
  );
}
