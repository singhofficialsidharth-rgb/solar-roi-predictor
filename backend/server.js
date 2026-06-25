const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const mongoose = require('mongoose');
const { spawn } = require('child_process');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// simple request logger to help debug route issues
app.use((req, res, next) => {
    try {
        console.log('REQ', req.method, req.originalUrl);
    } catch (e) {
        // ignore
    }
    next();
});

app.use(cors());
app.use(express.json());
app.use('/api/auth', require('./routes/auth'));

// Endpoint to fetch solar projections
const findPythonExecutable = () => {
    const venvPython = path.join(__dirname, 'venv', 'Scripts', 'python.exe');
    if (fs.existsSync(venvPython)) return venvPython;

    if (process.platform === 'win32') {
        return 'python';
    }

    return 'python3';
};

const generateForecastJS = (systemSize) => {
    const size = Number(systemSize) || 3.0;
    const costPerKw = 50000;
    const gridRate = 8.0;
    const years = 25;
    const sunlightHours = 4.5;
    const degradationRate = 0.005;
    const inflationRate = 0.03;
    const initialCost = Math.round(size * costPerKw * 100) / 100;

    let cumulativeSavings = 0;
    let breakEvenYear = null;
    const projectionData = [];

    for (let year = 1; year <= years; year += 1) {
        const energyProduced = size * sunlightHours * 365 * Math.pow(1 - degradationRate, year - 1);
        const gridRateYear = gridRate * Math.pow(1 + inflationRate, year - 1);
        const annualSavings = energyProduced * gridRateYear;
        cumulativeSavings += annualSavings;

        if (!breakEvenYear && cumulativeSavings >= initialCost) {
            breakEvenYear = year;
        }

        projectionData.push({
            Year: year,
            Energy_Produced_kWh: Number(energyProduced.toFixed(2)),
            Grid_Rate_INR: Number(gridRateYear.toFixed(2)),
            Annual_Savings_INR: Number(annualSavings.toFixed(2)),
            Cumulative_Savings_INR: Number(cumulativeSavings.toFixed(2)),
        });
    }

    return {
        system_size_kw: size,
        total_initial_cost: initialCost,
        break_even_year: breakEvenYear || '>25',
        projection_data: projectionData,
    };
};

app.get('/api/forecast', (req, res) => {
    const systemSize = req.query.size || '3.0';
    const pythonExecutable = findPythonExecutable();
    const scriptPath = path.join(__dirname, 'calculate_roi.py');

    const sendForecastError = (message) => {
        if (!res.headersSent) {
            res.status(500).json({ error: message });
        }
    };

    let dataString = '';
    let pythonProcess;

    try {
        pythonProcess = spawn(pythonExecutable, [scriptPath, systemSize]);
    } catch (error) {
        console.error('Failed to start Python process:', error);
        console.warn('Falling back to built-in forecast calculator.');
        return res.json(generateForecastJS(systemSize));
    }

    pythonProcess.stdout.on('data', (data) => {
        dataString += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`Python Error: ${data}`);
    });

    pythonProcess.on('close', (code) => {
        if (res.headersSent) return;

        if (code !== 0) {
            console.warn('Python process failed with code', code, 'falling back to built-in forecast calculator.');
            return res.json(generateForecastJS(systemSize));
        }

        try {
            const jsonOutput = JSON.parse(dataString);
            res.json(jsonOutput);
        } catch (error) {
            console.error('Failed to parse system computation data:', error);
            res.json(generateForecastJS(systemSize));
        }
    });

    pythonProcess.on('error', (error) => {
        console.error('Failed to start Python process:', error);
        res.json(generateForecastJS(systemSize));
    });
});

const startServer = async () => {
    if (process.env.MONGO_URI) {
        try {
            mongoose.set('bufferCommands', false);
            await mongoose.connect(process.env.MONGO_URI, {
                serverSelectionTimeoutMS: 3000,
            });
            console.log('MongoDB connected successfully.');
        } catch (error) {
            console.warn('MongoDB unavailable. Auth will use the local dev user store.');
            console.warn(error.message);
        }
    } else {
        console.warn('MONGO_URI is not set. Auth will use the local dev user store.');
    }

    app.listen(PORT, () => {
        console.log(`Server running smoothly on http://localhost:${PORT}`);
    });
};

startServer();
