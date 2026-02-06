// --- 1. HISTORICAL CONTEXT DEFINITIONS ---
const historicalContext = {
    annotations: {
        ww1: { 
            type: 'box', xMin: 1914, xMax: 1918, backgroundColor: 'rgba(50, 50, 50, 0.2)', borderWidth: 0, 
            label: { content: ['WW1'], display: true, position: { x: 'center', y: 'start' }, textAlign: 'center', yAdjust: 0, color: '#555', font: { size: 10, weight: 'normal' } } 
        },
        ww2: { 
            type: 'box', xMin: 1939, xMax: 1945, backgroundColor: 'rgba(50, 50, 50, 0.2)', borderWidth: 0, 
            label: { content: ['WW2'], display: true, position: { x: 'center', y: 'start' }, textAlign: 'center', yAdjust: 0, color: '#555', font: { size: 10, weight: 'normal' } } 
        },
        energy: { 
            type: 'box', xMin: 1973, xMax: 1976, backgroundColor: 'rgba(50, 50, 50, 0.2)', borderWidth: 0, 
            label: { content: ['Energy', 'Crisis'], display: true, position: { x: 'center', y: 'start' }, textAlign: 'center', yAdjust: 0, color: '#555', font: { size: 10, weight: 'normal' } } 
        },
        recession90: { 
            type: 'box', xMin: 1990, xMax: 1992, backgroundColor: 'rgba(50, 50, 50, 0.2)', borderWidth: 0, 
            label: { content: ['90s', 'Recession'], display: true, position: { x: 'center', y: 'start' }, textAlign: 'center', yAdjust: 0, color: '#555', font: { size: 10, weight: 'normal' } } 
        },
        finance: { 
            type: 'box', xMin: 2008, xMax: 2009, backgroundColor: 'rgba(50, 50, 50, 0.2)', borderWidth: 0, 
            label: { content: ['Financial', 'Crisis'], display: true, position: { x: 'center', y: 'start' }, textAlign: 'center', yAdjust: 0, color: '#555', font: { size: 10, weight: 'normal' } } 
        },
        covid: { 
            type: 'box', xMin: 2020, xMax: 2022, backgroundColor: 'rgba(50, 50, 50, 0.2)', borderWidth: 0, 
            label: { content: 'Covid', display: true, position: { x: 'center', y: 'start' }, textAlign: 'center', yAdjust: 0, color: '#555', font: { size: 10, weight: 'normal' } } 
        }
    }
};

// --- 2. UNIVERSAL RENDER FUNCTION (SMART AXIS: £ and %) ---
function renderChart(elemId, dataArray, label, color, type, addContext = false, isCurrency = false, isMillions = false) {
    const isYearly = dataArray.length > 0 && dataArray.every(d => /^\d{4}$/.test(d.date));
    
    // Auto-detect if this is a percentage chart based on the label name
    const isPercentage = label.includes('%') || label.includes('Rate') || label.includes('Growth');

    new Chart(document.getElementById(elemId), {
        type: type,
        data: {
            labels: isYearly ? undefined : dataArray.map(d => d.date),
            datasets: [{
                label: label,
                data: isYearly ? dataArray.map(d => ({x: parseInt(d.date), y: d.value})) : dataArray.map(d => d.value),
                borderColor: color, backgroundColor: color + '20', borderWidth: 2, pointRadius: 0, hoverRadius: 4, fill: true, tension: 0.2
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            scales: { 
                x: isYearly ? { type: 'linear', min: parseInt(dataArray[0].date), max: parseInt(dataArray[dataArray.length - 1].date), ticks: { callback: v => String(v).replace(/,/g, '') } } : { grid: { display: false }, ticks: { maxTicksLimit: 6 } },
                y: { 
                    beginAtZero: false,
                    ticks: { 
                        callback: function(value) { 
                            if (isCurrency) {
                                if (value >= 1000) return '£' + (value/1000) + 'k'; 
                                return '£' + value; 
                            }
                            if (isPercentage) return value + '%'; // <--- NEW: Adds % symbol
                            if (isMillions) return value + 'm'; 
                            return value; 
                        } 
                    }
                } 
            },
            plugins: { 
                legend: { display: false },
                tooltip: { callbacks: { title: ctx => String(ctx[0].parsed.x).replace(/,/g, ''), label: ctx => label + ': ' + (isCurrency ? '£' : '') + ctx.parsed.y.toLocaleString() + (isMillions ? 'm' : '') + (isPercentage ? '%' : '') } },
                annotation: addContext ? historicalContext : {}
            }
        }
    });
}

// --- 3. DATA LOADING & EXECUTION ---

// Chapter 1: Macro Economy
Papa.parse('data/cpi_long.csv', { download: true, header: true, skipEmptyLines: true, complete: function(results) { renderChart('chartInflation', results.data.filter(r => r.Year).map(r => ({ date: r.Year, value: parseFloat(r.Value) })), 'Inflation %', '#e74c3c', 'line', true); } });
Papa.parse('data/national_debt_long.csv', { download: true, header: true, skipEmptyLines: true, complete: function(results) { renderChart('chartDebt', results.data.filter(r => r.Year).map(r => ({ date: r.Year, value: parseFloat(r.Debt_GDP) })), 'Debt % GDP', '#8e44ad', 'line', true); } });
Papa.parse('data/gdp_growth_long.csv', { download: true, header: true, skipEmptyLines: true, complete: function(results) { renderChart('chartGDP', results.data.filter(r => r.Year).map(r => ({ date: r.Year, value: parseFloat(r.GDP_Growth) })), 'GDP Growth %', '#2c3e50', 'line', true); } });
Papa.parse('data/unemployment_long.csv', { download: true, header: true, skipEmptyLines: true, complete: function(results) { renderChart('chartUnemployment', results.data.filter(r => r.Year).map(r => ({ date: r.Year, value: parseFloat(r.Unemployment) })), 'Unemployment %', '#2980b9', 'line', true); } });
Papa.parse('data/interest_rates_long.csv', { download: true, header: true, skipEmptyLines: true, complete: function(results) { renderChart('chartInterest', results.data.filter(r => r.Year).map(r => ({ date: r.Year, value: parseFloat(r.Value) })), 'Interest Rate %', '#e67e22', 'line', true); } });

// Function for Tax Revenue Sources (Stacked % of GDP)
function drawTaxComposition(elemId) {
    Papa.parse('data/tax_revenue_detailed.csv', { 
        download: true, header: true, skipEmptyLines: true,
        complete: function(results) {
            const data = results.data.filter(r => r.Year);
            const fmt = (val) => val ? parseFloat(val) : 0;

            new Chart(document.getElementById(elemId), {
                type: 'line',
                data: {
                    datasets: [
                        { label: 'Income Tax', data: data.map(r => ({x: parseInt(r.Year), y: fmt(r.Income)})), borderColor: '#27ae60', backgroundColor: '#27ae60', borderWidth: 0, pointRadius: 0, fill: true },
                        { label: 'National Insurance', data: data.map(r => ({x: parseInt(r.Year), y: fmt(r.NI)})), borderColor: '#2980b9', backgroundColor: '#2980b9', borderWidth: 0, pointRadius: 0, fill: true },
                        { label: 'VAT', data: data.map(r => ({x: parseInt(r.Year), y: fmt(r.VAT)})), borderColor: '#c0392b', backgroundColor: '#c0392b', borderWidth: 0, pointRadius: 0, fill: true },
                        { label: 'Corporation Tax', data: data.map(r => ({x: parseInt(r.Year), y: fmt(r.Corp)})), borderColor: '#e67e22', backgroundColor: '#e67e22', borderWidth: 0, pointRadius: 0, fill: true },
                        { label: 'Other (Council/Fuel/Stamp)', data: data.map(r => ({x: parseInt(r.Year), y: fmt(r.Other)})), borderColor: '#95a5a6', backgroundColor: '#95a5a6', borderWidth: 0, pointRadius: 0, fill: true }
                    ]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    interaction: { mode: 'index', intersect: false },
                    scales: { 
                        x: { type: 'linear', min: 1900, max: 2025, ticks: { callback: v => String(v).replace(/,/g, '') } },
                        y: { stacked: true, beginAtZero: true, title: { display: true, text: '% of GDP' } }
                    },
                    plugins: { 
                        legend: { display: true, position: 'bottom', labels: { boxWidth: 12, padding: 10, font: { size: 11 } } },
                        annotation: historicalContext,
                        tooltip: { callbacks: { footer: (items) => { const total = items.reduce((a, b) => a + b.parsed.y, 0); return 'Total Tax Revenue: ' + total.toFixed(1) + '% of GDP'; } } }
                    }
                }
            });
        }
    });
}
drawTaxComposition('chartTaxRate');

// Chapter 2: The Individual
Papa.parse('data/debt_per_capita.csv', { download: true, header: true, skipEmptyLines: true, complete: function(results) { renderChart('chartDebtCapita', results.data.filter(r => r.Year).map(r => ({ date: r.Year, value: parseFloat(r.Value) })), 'Real Debt', '#d35400', 'line', true, true); } });
Papa.parse('data/gdp_per_capita_growth.csv', { download: true, header: true, skipEmptyLines: true, complete: function(results) { renderChart('chartGDPCapita', results.data.filter(r => r.Year).map(r => ({ date: r.Year, value: parseFloat(r.Value) })), 'Growth Per Head %', '#27ae60', 'line', true); } });
Papa.parse('data/real_house_prices.csv', { download: true, header: true, skipEmptyLines: true, complete: function(results) { renderChart('chartHousePrices', results.data.filter(r => r.Year).map(r => ({ date: r.Year, value: parseFloat(r.Value) })), 'Avg Price (2024 £)', '#9b59b6', 'line', true, true); } });
Papa.parse('data/house_price_ratio.csv', { download: true, header: true, skipEmptyLines: true, complete: function(results) { renderChart('chartHouseRatio', results.data.filter(r => r.Year).map(r => ({ date: r.Year, value: parseFloat(r.Value) })), 'Price to Earnings Ratio', '#2c3e50', 'line', true); } });
Papa.parse('data/tax_per_capita.csv', { download: true, header: true, skipEmptyLines: true, complete: function(results) { renderChart('chartTaxCapita', results.data.filter(r => r.Year).map(r => ({ date: r.Year, value: parseFloat(r.Value) })), 'Tax Per Person', '#8e44ad', 'line', true, true); } });
Papa.parse('data/real_wages.csv', { download: true, header: true, skipEmptyLines: true, complete: function(results) { renderChart('chartRealWages', results.data.filter(r => r.Year).map(r => ({ date: r.Year, value: parseFloat(r.Value) })), 'Weekly Earnings (2024 £)', '#1abc9c', 'line', true, true); } });

// Chapter 4: Population
Papa.parse('data/population_long.csv', { download: true, header: true, skipEmptyLines: true, complete: function(results) { renderChart('chartPopulation', results.data.filter(r => r.Year).map(r => ({ date: r.Year, value: parseFloat(r.Population) })), 'Total Population', '#16a085', 'line', true, false, true); } });

// Chapter 5: Migration (Functions & Execution)
function drawManualBar(elemId, file, colLabel, colValue) {
    Papa.parse(`data/${file}`, {
        download: true, header: true, skipEmptyLines: true,
        complete: function(results) {
            const data = results.data.filter(r => r[colLabel]);
            new Chart(document.getElementById(elemId), { type: 'bar', data: { labels: data.map(r => r[colLabel]), datasets: [{ label: 'Net People', data: data.map(r => r[colValue]), backgroundColor: data.map(r => r[colValue] < 0 ? '#e74c3c' : '#3498db') }] }, options: { responsive: true, maintainAspectRatio: false, scales: { x: { grid: { display: false }, ticks: { maxRotation: 0, minRotation: 0, maxTicksLimit: 6 } } }, plugins: { legend: { display: false } } } });
        }
    });
}

function drawMirrorChart(elemId, file) {
     Papa.parse(`data/${file}`, {
        download: true, header: true, skipEmptyLines: true,
        complete: function(results) {
            const data = results.data.filter(r => r.Year);
            const emigrationData = data.map(r => parseInt(r.Net_Total) - (parseInt(r.Asylum) + parseInt(r.Humanitarian) + parseInt(r.Work_Health) + parseInt(r.Work_Other) + parseInt(r.Study) + parseInt(r.Family)));
            new Chart(document.getElementById(elemId), { type: 'line', data: { labels: data.map(r => r.Year), datasets: [ { label: 'Asylum', data: data.map(r => r.Asylum), backgroundColor: '#34495e', borderColor: '#34495e', fill: true, pointRadius: 0, tension: 0.4, stack: 'inflow' }, { label: 'Humanitarian', data: data.map(r => r.Humanitarian), backgroundColor: '#f39c12', borderColor: '#f39c12', fill: true, pointRadius: 0, tension: 0.4, stack: 'inflow' }, { label: 'Health Care', data: data.map(r => r.Work_Health), backgroundColor: '#2ecc71', borderColor: '#2ecc71', fill: true, pointRadius: 0, tension: 0.4, stack: 'inflow' }, { label: 'Other Work', data: data.map(r => r.Work_Other), backgroundColor: '#27ae60', borderColor: '#27ae60', fill: true, pointRadius: 0, tension: 0.4, stack: 'inflow' }, { label: 'Study', data: data.map(r => r.Study), backgroundColor: '#3498db', borderColor: '#3498db', fill: true, pointRadius: 0, tension: 0.4, stack: 'inflow' }, { label: 'Family', data: data.map(r => r.Family), backgroundColor: '#9b59b6', borderColor: '#9b59b6', fill: true, pointRadius: 0, tension: 0.4, stack: 'inflow' }, { label: 'Emigration (Leaving)', data: emigrationData, backgroundColor: '#e74c3c', borderColor: '#e74c3c', fill: true, pointRadius: 0, tension: 0.4, stack: 'outflow' } ] }, options: { responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false }, scales: { x: { grid: { display: false }, ticks: { maxTicksLimit: 10 } }, y: { stacked: true, ticks: { callback: function(value) { return value / 1000 + 'k'; } } } }, elements: { line: { borderWidth: 1 } }, plugins: { legend: { display: true, position: 'bottom', labels: { boxWidth: 12, font: { size: 10 } } } } } });
        }
    });
}

drawManualBar('chartMigrationNet', 'net_migration_long_term.csv', 'Year', 'Net_Migration');
drawMirrorChart('chartMigrationMirror', 'migration_extended.csv');
