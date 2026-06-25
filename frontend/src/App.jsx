import { useState, useEffect, useContext, useMemo, useCallback } from 'react';
import axios from 'axios';
import { AuthContext } from './context/authContext';
import Header from './components/Header';
import Landing from './components/Landing';
import Login from './components/Login';
import ApplianceCalculator from './components/ApplianceCalculator';
import FinancialSettings from './components/FinancialSettings';
import SummaryCards from './components/SummaryCards';
import ROILineChart from './components/ROILineChart';
import Reports from './components/Reports';
import Settings from './components/Settings';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

function App() {
  const { user, loading: authLoading } = useContext(AuthContext);
  
  const [activeView, setActiveView] = useState(user ? 'dashboard' : 'landing');
  const [systemSize, setSystemSize] = useState(3);
  const [installerCost, setInstallerCost] = useState(50000);
  const [applySubsidy, setApplySubsidy] = useState(true);
  const [forecastData, setForecastData] = useState(null);
  const [isForecastLoading, setIsForecastLoading] = useState(false);
  const [forecastError, setForecastError] = useState(null);

  const effectiveActiveView = !user
    ? activeView === 'login'
      ? 'login'
      : 'landing'
    : (activeView === 'landing' || activeView === 'login')
      ? 'dashboard'
      : activeView;

  useEffect(() => {
    if (!user) return;

    const controller = new AbortController();

    const fetchForecast = async () => {
      setIsForecastLoading(true);
      setForecastError(null);

      try {
        const response = await axios.get(`${API_BASE_URL}/api/forecast`, {
          params: { size: systemSize },
          signal: controller.signal,
        });
        setForecastData(response.data);
      } catch (error) {
        if (error.name !== 'CanceledError') {
          setForecastError(error.response?.data?.error || 'Unable to load forecast data.');
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsForecastLoading(false);
        }
      }
    };

    fetchForecast();

    return () => controller.abort();
  }, [user, systemSize]);

  const subsidyAmount = useMemo(() => {
    if (!applySubsidy) return 0;

    const firstTwoKw = Math.min(systemSize, 2) * 30000;
    const nextOneKw = Math.min(Math.max(systemSize - 2, 0), 1) * 18000;

    return Math.min(78000, Math.round(firstTwoKw + nextOneKw));
  }, [applySubsidy, systemSize]);

  const grossCost = useMemo(
    () => Math.round(systemSize * installerCost),
    [installerCost, systemSize],
  );

  const dynamicNetCost = useMemo(
    () => Math.max(0, grossCost - subsidyAmount),
    [grossCost, subsidyAmount],
  );

  const dynamicBreakEvenYear = useMemo(() => {
    const projection = forecastData?.projection_data || [];
    const breakEvenRow = projection.find(
      (row) => row.Cumulative_Savings_INR >= dynamicNetCost,
    );

    return breakEvenRow?.Year || 26;
  }, [dynamicNetCost, forecastData]);

  const handleCalculatedSize = useCallback((size) => {
    setSystemSize(size);
  }, []);

  if (authLoading) return <div style={{ background: '#1e1e24', height: '100vh' }}></div>;

  return (
    <div className="app-wrapper" style={{ fontFamily: 'sans-serif', width: '100%', minHeight: '100vh', background: '#1e1e24', color: '#fff' }}>
      
      <Header activeView={effectiveActiveView} setActiveView={setActiveView} />
      
      <main id="exportable-dashboard" style={{ padding: '30px 4vw', boxSizing: 'border-box' }}>
        
        {!user && effectiveActiveView === 'landing' && <Landing setActiveView={setActiveView} />}
        {!user && effectiveActiveView === 'login' && <Login />}

        {user && effectiveActiveView === 'dashboard' && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', alignItems: 'flex-start' }}>
            <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <ApplianceCalculator onCalculatedSize={handleCalculatedSize} />
              <FinancialSettings 
                installerCost={installerCost} onInstallerChange={setInstallerCost}
                applySubsidy={applySubsidy} onSubsidyToggle={setApplySubsidy}
              />
            </div>

            <div style={{ flex: '2 1 500px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ textAlign: 'center', background: '#2c2f33', padding: '15px', borderRadius: '8px' }}>
                <h2 style={{ color: '#4CAF50', margin: 0 }}>Calculated System Requirement: {systemSize} kW</h2>
              </div>

              {isForecastLoading && (
                <div style={{ background: '#2c2f33', padding: '20px', borderRadius: '8px', color: '#aaa', textAlign: 'center' }}>
                  Loading forecast...
                </div>
              )}

              {forecastError && (
                <div style={{ background: '#ff4d4d20', border: '1px solid #ff4d4d', color: '#ffb3b3', padding: '15px', borderRadius: '8px' }}>
                  {forecastError}
                </div>
              )}

              {forecastData && !isForecastLoading && !forecastError && (
                <>
                  <SummaryCards
                    grossCost={grossCost}
                    subsidyAmount={subsidyAmount}
                    netCost={dynamicNetCost}
                    breakEvenYear={dynamicBreakEvenYear}
                  />
                  <div style={{ background: '#2c2f33', padding: '20px', borderRadius: '8px' }}>
                    <ROILineChart
                      projectionData={forecastData.projection_data}
                      initialCost={dynamicNetCost}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {user && effectiveActiveView === 'reports' && (
          <Reports forecastData={forecastData} systemSize={systemSize} netCost={dynamicNetCost} breakEvenYear={dynamicBreakEvenYear} />
        )}

        {user && effectiveActiveView === 'settings' && <Settings />}

      </main>
    </div>
  );
}

export default App;
