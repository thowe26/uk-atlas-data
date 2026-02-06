// ==========================================
// 1. CONFIGURATION & CONTEXT
// ==========================================

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

// ==========================================
// 2. UNIVERSAL RENDERER
// ==========================================

function renderChart(elemId, data, column, label, color, type = 'line', isCurrency = false, isMillions = false) {
    // 1. Filter data: only rows where this specific column has a value
    const cleanData = data.filter(r => r[column] && r[column] !== "");

    // 2. Auto-detect Percentage
    const isPercentage = label.includes('%') || label.includes('Rate') || label.includes('Growth') || label.includes('Ratio');

    new Chart(document.getElementById(elemId), {
        type: type,
        data: {
            labels: cleanData.map(d => d.Year),
            datasets: [{
                label: label,
                data: cleanData.map(d => parseFloat(d[column])),
                borderColor: color,
                backgroundColor: color + '20', // Add transparency
                borderWidth: 2,
                pointRadius: 0,
                hoverRadius: 4,
                fill: true,
                tension: 0.2
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            scales: {
                x: { 
                    type: 'linear', 
                    min: parseInt(cleanData[0].Year), 
                    max: parseInt(cleanData[cleanData.length-1].Year), 
                    ticks: { callback: v => String(v).replace(/,/g, '') } 
                },
                y: {
                    beginAtZero: false,
                    ticks: {
                        callback: function(value) {
                            if (isCurrency) {
                                if (value >= 1000) return '£' + (value/1000) + 'k';
                                return '£' + value;
                            }
                            if (isPercentage) return value + '%';
                            if (isMillions) return value + 'm';
                            return value;
                        }
                    }
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: { 
                    callbacks: { 
                        title: ctx => String(ctx[0].label).replace(/,/g, ''), // <--- FIX HERE
                        label: ctx => label + ': ' + (isCurrency ? '£' : '') + ctx.parsed.y.toLocaleString() + (isPercentage ? '%' : '') + (isMillions ? 'm' : '') 
                    } 
                },
                annotation: historicalContext
            }
        }
    });
}

// Special Function: Stacked Area Charts (For Taxes, Sectors, etc.)
function renderStacked(elemId, data, columns, colors, labels, yTitle) {
    // Filter to rows that have data for the first column
    const cleanData = data.filter(r => r[columns[0]]);

    new Chart(document.getElementById(elemId), {
        type: 'line',
        data: {
            labels: cleanData.map(d => d.Year),
            datasets: columns.map((col, i) => ({
                label: labels[i],
                data: cleanData.map(d => parseFloat(d[col] || 0)), // Handle blanks as 0
                borderColor: colors[i],
                backgroundColor: colors[i],
                borderWidth: 0,
                pointRadius: 0,
                fill: true
            }))
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            scales: {
                x: { type: 'linear', min: 1900, max: 2024, ticks: { callback: v => String(v).replace(/,/g, '') } },
                y: { stacked: true, beginAtZero: true, title: { display: true, text: yTitle } }
            },
            plugins: {
                legend: { display: true, position: 'bottom', labels: { boxWidth: 12, padding: 10, font: { size: 11 } } },
                annotation: historicalContext,
                tooltip: { 
                    callbacks: { 
                        title: ctx => String(ctx[0].label).replace(/,/g, ''), // <--- FIX HERE
                        footer: (items) => { const total = items.reduce((a, b) => a + b.parsed.y, 0); return 'Total: ' + total.toFixed(1); } 
                    } 
                }
            }
        }
    });
}

// ==========================================
// 3. MASTER EXECUTION (FROM GOOGLE SHEETS)
// ==========================================

// Your Published Google Sheet URL
const sheetURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRX_OSl_z-Fnou-iUO0KI-lnION2I1NzYhWS_URwjfF_U6jA4ccqAm1mFTpZjf6wKD0bX9dhD3OAmyi/pub?gid=0&single=true&output=csv';

Papa.parse(sheetURL, {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: function(results) {
        const data = results.data;

        // --- CHAPTER 1: MACRO ---
        renderChart('chartInflation', data, 'CPI', 'Inflation %', '#e74c3c');
        renderChart('chartDebt', data, 'Debt_GDP', 'Debt % GDP', '#8e44ad');
        renderChart('chartGDP', data, 'GDP_Growth', 'GDP Growth %', '#2c3e50');
        renderChart('chartUnemployment', data, 'Unemployment', 'Unemployment Rate', '#2980b9');
        renderChart('chartInterest', data, 'Interest_Rate', 'Interest Rate', '#e67e22');
        
        // Tax Revenue Stack
        renderStacked(
            'chartTaxRate', 
            data, 
            ['Tax_Rev_Income', 'Tax_Rev_NI', 'Tax_Rev_VAT', 'Tax_Rev_Corp', 'Tax_Rev_Other'],
            ['#27ae60', '#2980b9', '#c0392b', '#e67e22', '#95a5a6'],
            ['Income Tax', 'National Insurance', 'VAT', 'Corporation Tax', 'Other'],
            '% of GDP'
        );

        // --- CHAPTER 2: INDIVIDUAL ---
        renderChart('chartDebtCapita', data, 'Debt_Per_Capita', 'Real Debt', '#d35400', 'line', true);
        renderChart('chartGDPCapita', data, 'GDP_Per_Capita_Growth', 'Growth Per Person %', '#27ae60');
        renderChart('chartRealWages', data, 'Real_Wages', 'Weekly Earnings (2024 £)', '#1abc9c', 'line', true);
        renderChart('chartHousePrices', data, 'House_Price', 'Avg Price (2024 £)', '#9b59b6', 'line', true);
        renderChart('chartHouseRatio', data, 'House_Ratio', 'Price to Earnings Ratio', '#2c3e50');
        renderChart('chartTaxCapita', data, 'Tax_Per_Capita', 'Tax Per Person', '#8e44ad', 'line', true);

        // --- CHAPTER 3: INDUSTRY ---
        renderStacked(
            'chartSectors',
            data,
            ['Sector_Services', 'Sector_Industry', 'Sector_Agri'],
            ['#f1c40f', '#34495e', '#27ae60'],
            ['Services', 'Industry', 'Agriculture'],
            '% of Economy'
        );

        renderStacked(
            'chartWorkforce',
            data,
            ['Work_Public', 'Work_Services', 'Work_Industry', 'Work_Agri'],
            ['#3498db', '#f1c40f', '#7f8c8d', '#27ae60'],
            ['Public Sector', 'Services', 'Industry', 'Agriculture'],
            '% of Workforce'
        );

        // --- CHAPTER 4: POPULATION ---
        renderChart('chartPopulation', data, 'Population', 'Total Population', '#16a085', 'line', false, true);

    }
});

// NOTE: Migration charts still use separate files because their structure is unique.
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
