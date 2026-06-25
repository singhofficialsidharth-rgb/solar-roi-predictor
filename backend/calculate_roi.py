import pandas as pd
import numpy as np
import sys
import json


def calculate_system_size(daily_energy_wh, sunlight_hours=4.5, efficiency=0.80):
    """
    Calculates the required solar system size in kW.
    
    Parameters:
    - daily_energy_wh: Total daily energy usage in Watt-hours.
    - sunlight_hours: Average peak sunlight hours per day (4.5 is a solid baseline for Northern India).
    - efficiency: Accounts for energy lost in the inverter and wiring (typically 20% loss, so 0.8).
    """
    # Convert Watt-hours to Kilowatt-hours (kWh)
    daily_energy_kwh = daily_energy_wh / 1000
    
    # Calculate required kW capacity
    required_kw = daily_energy_kwh / (sunlight_hours * efficiency)
    
    return round(required_kw, 2)



def generate_roi_forecast(system_size_kw, cost_per_kw=50000, grid_rate=8.0, years=25):
    """
    Generates a 25-year financial projection for a solar installation.
    """
    initial_cost = system_size_kw * cost_per_kw
    
    # Core Assumptions
    sunlight_hours = 4.5  
    annual_production_kwh_base = system_size_kw * sunlight_hours * 365
    
    # Real-world variables: Panels lose a tiny bit of efficiency each year, and electricity gets more expensive.
    panel_degradation_rate = 0.005 # Panels degrade by ~0.5% annually
    grid_inflation_rate = 0.03     # Electricity prices rise by ~3% annually
    
    # Vectorized calculations using NumPy (Fast and clean)
    years_array = np.arange(1, years + 1)
    
    # Array of annual energy production over 25 years
    production = annual_production_kwh_base * ((1 - panel_degradation_rate) ** (years_array - 1))
    
    # Array of electricity rates over 25 years
    rates = grid_rate * ((1 + grid_inflation_rate) ** (years_array - 1))
    
    # Array of financial savings
    annual_savings = production * rates
    cumulative_savings = np.cumsum(annual_savings)
    
    # Package into a Pandas DataFrame
    df = pd.DataFrame({
        'Year': years_array,
        'Energy_Produced_kWh': np.round(production, 2),
        'Grid_Rate_INR': np.round(rates, 2),
        'Annual_Savings_INR': np.round(annual_savings, 2),
        'Cumulative_Savings_INR': np.round(cumulative_savings, 2)
    })
    
    # Identify the exact year the system pays for itself
    # We use Pandas filtering to find the first year where savings exceed the initial cost
    break_even_data = df[df['Cumulative_Savings_INR'] >= initial_cost]
    break_even_year = break_even_data['Year'].min() if not break_even_data.empty else None
    
    return {
        "system_size_kw": system_size_kw,
        "total_initial_cost": initial_cost,
        "break_even_year": int(break_even_year) if break_even_year else ">25",
        "projection_data": df.to_dict(orient='records') # Easily convertible to JSON for your API
    }





if __name__ == "__main__":
    # Check if arguments are passed from Node.js, otherwise default to a 3kW system
    if len(sys.argv) > 1:
        system_size_kw = float(sys.argv[1])
    else:
        system_size_kw = 3.0
        
    
    forecast = generate_roi_forecast(system_size_kw)
    
   
    print(json.dumps(forecast))