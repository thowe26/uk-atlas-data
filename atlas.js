// --- 1. HISTORICAL CONTEXT DEFINITIONS ---
const historicalContext = {
    annotations: {
        ww1: { 
            type: 'box', xMin: 1914, xMax: 1918, backgroundColor: 'rgba(50, 50, 50, 0.2)', borderWidth: 0, 
            label: { content: ['World War', '1'], display: true, position: { x: 'center', y: 'start' }, textAlign: 'center', yAdjust: 0, color: '#555', font: { size: 10, weight: 'normal' } } 
        },
        ww2: { 
            type: 'box', xMin: 1939, xMax: 1945, backgroundColor: 'rgba(50, 50, 50, 0.2)', borderWidth: 0, 
            label: { content: ['World War', '2'], display: true, position: { x: 'center', y: 'start' }, textAlign: 'center', yAdjust: 0, color: '#555', font: { size: 10, weight: 'normal' } } 
        },
        energy: { 
            type: 'box', xMin: 1973, xMax: 1976, backgroundColor: 'rgba(50, 50, 50, 0.2)', borderWidth: 0, 
            label: { content: ['Energy', 'Crisis'], display: true, position: { x: 'center', y: 'start' }, textAlign: 'center', yAdjust: 0, color: '#555', font: { size: 10, weight: 'normal' } } 
        },
        finance: { 
            type: 'box', xMin: 2008, xMax: 2009, backgroundColor: 'rgba(50, 50, 50, 0.2)', borderWidth: 0, 
            label: { content: ['Financial', 'Crisis'], display: true, position: { x: 'center', y: 'start' }, textAlign: 'center', yAdjust: 0, color: '#555', font: { size: 10, weight: 'normal' } } 
        },
        covid: { 
            type: 'box', xMin: 2020, xMax: 2022, backgroundColor: 'rgba(231, 76, 60, 0.2)', borderWidth: 0, 
            label: { content: 'Covid', display: true, position: { x: 'center', y: 'start' }, textAlign: 'center', yAdjust: 0, color: '#c0392b', font: { size: 10, weight: 'normal' } } 
        }
    }
};

// --- 2. UNIVERSAL RENDER FUNCTION ---
function renderChart(elemId, dataArray, label, color, type, addContext = false, isCurrency = false, isMillions = false) {
    const isYearly = dataArray.length > 0 && dataArray.every(d => /^\d{4}$/.test(d.date));
    
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
                            if (isCurrency) return '£' + (value/1000) + 'k'; 
                            if (isMillions) return value + 'm'; 
                            return value; 
                        } 
                    }
                } 
            },
            plugins: { 
                legend: { display: false },
                tooltip: { callbacks: { title: ctx => String(ctx[0].parsed.x).replace(/,/g, ''), label: ctx => label + ': ' + (isCurrency ? '£' : '') + ctx.parsed.y.toLocaleString() + (isMillions ? 'm' : '') } },
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

// Chapter 2: The Individual
Papa.parse('data/debt_per_capita.csv', { download: true, header: true, skipEmptyLines: true, complete: function(results) { renderChart('chartDebtCapita', results.data.filter(r => r.Year).map(r => ({ date: r.Year, value: parseFloat(r.Value) })), 'Real Debt', '#d35400', 'line', true, true); } });
Papa.parse('data/gdp_per_capita_growth.csv', { download: true, header: true, skipEmptyLines: true, complete: function(results) { renderChart('chartGDPCapita', results.data.filter(r => r.Year).map(r => ({ date: r.Year, value: parseFloat(r.Value) })), 'Growth Per Head %', '#27ae60', 'line', true); } });

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
