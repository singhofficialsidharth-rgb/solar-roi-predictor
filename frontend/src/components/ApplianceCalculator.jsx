import { useState, useEffect } from "react";
import axios from "axios";
import LocationSelector from "./LocationSelector";
import PresetManager from "./PresetManager";
import ApplianceRow from "./ApplianceRow";
import LoadPieChart from "./LoadPieChart";

export default function ApplianceCalculator({ onCalculatedSize }) {
  // State
  const [appliances, setAppliances] = useState([]);
  const [sunlightHours, setSunlightHours] = useState(4.5);
  const [isLoadingSolar, setIsLoadingSolar] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const cities = [
    { name: "Kanpur", lat: 26.4499, lon: 80.3319 },
    { name: "New Delhi", lat: 28.6139, lon: 77.209 },
    { name: "Mumbai", lat: 19.076, lon: 72.8777 },
    { name: "Bangalore", lat: 12.9716, lon: 77.5946 },
    { name: "Chennai", lat: 13.0827, lon: 80.2707 },
  ];
  const [selectedCity, setSelectedCity] = useState(cities[0]);
  const SYSTEM_EFFICIENCY = 0.8;

  // NASA API Effect
  useEffect(() => {
    const fetchSolarData = async () => {
      setIsLoadingSolar(true);
      try {
        const url = `https://power.larc.nasa.gov/api/temporal/climatology/point?parameters=ALLSKY_SFC_SW_DWN&community=RE&longitude=${selectedCity.lon}&latitude=${selectedCity.lat}&format=JSON`;
        const response = await axios.get(url);
        setSunlightHours(
          response.data.properties.parameter.ALLSKY_SFC_SW_DWN.ANN,
        );
      } catch (error) {
        console.error("NASA API Error", error);
        setSunlightHours(4.5);
      }
      setIsLoadingSolar(false);
    };
    fetchSolarData();
  }, [selectedCity]);

  // Math Calculation Effect
  useEffect(() => {
    const totalDailyWh = appliances.reduce(
      (sum, item) =>
        sum + (Number(item.watts) || 0) * (Number(item.hours) || 0),
      0,
    );
    const dailyKwh = totalDailyWh / 1000;

    // Fallback to 1kW if list is empty to prevent zero/infinity errors
    if (dailyKwh === 0) {
      onCalculatedSize(1);
      return;
    }

    const requiredKw = dailyKwh / (sunlightHours * SYSTEM_EFFICIENCY);
    onCalculatedSize(Math.max(1, Math.ceil(requiredKw * 10) / 10));
  }, [appliances, sunlightHours, onCalculatedSize]);

  // Handlers
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) return alert("Geolocation not supported.");
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setSelectedCity({
          name: `Current Location (${pos.coords.latitude.toFixed(2)}, ${pos.coords.longitude.toFixed(2)})`,
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        });
        setIsLocating(false);
      },
      () => {
        alert("Location access denied.");
        setIsLocating(false);
      },
    );
  };

  return (
    <div
      style={{
        padding: "20px",
        background: "#2c2f33",
        borderRadius: "8px",
        marginBottom: "20px",
        color: "#fff",
      }}
    >
      <LocationSelector
        selectedCity={selectedCity}
        cities={cities}
        onCityChange={(e) =>
          setSelectedCity(
            cities.find((c) => c.name === e.target.value) || selectedCity,
          )
        }
        onUseMyLocation={handleUseMyLocation}
        isLocating={isLocating}
        isLoadingSolar={isLoadingSolar}
        sunlightHours={sunlightHours}
      />

      <PresetManager
        onLoadPreset={(presetArray) =>
          setAppliances(
            presetArray.map((app) => ({ ...app, id: Math.random() })),
          )
        }
        onClearAll={() => setAppliances([])}
      />

      {appliances.map((app) => (
        <ApplianceRow
          key={app.id}
          app={app}
          onUpdate={(id, field, val) =>
            setAppliances(
              appliances.map((a) => (a.id === id ? { ...a, [field]: val } : a)),
            )
          }
          onRemove={(id) =>
            setAppliances(appliances.filter((a) => a.id !== id))
          }
        />
      ))}

      <button
        onClick={() =>
          setAppliances([
            ...appliances,
            { id: Math.random(), name: "", watts: "", hours: "" },
          ])
        }
        style={{
          marginTop: "10px",
          background: "#4CAF50",
          color: "#fff",
          border: "none",
          padding: "10px 15px",
          borderRadius: "4px",
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        + Add Appliance
      </button>
      
      <LoadPieChart appliances={appliances} />
    </div>
  );
}
