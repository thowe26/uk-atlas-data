// ==========================================
// 1. CONFIGURATION & MOBILE DETECTION
// ==========================================

// Detect if screen is small (mobile)
const isMobile = window.innerWidth < 768;

// Set Line Thickness: 1px for mobile (crisp), 2.5px for desktop (standard)
const lineThick = isMobile ? 1 : 2.5;

// ANNOTATIONS: Rotated -90 degrees, 'lighter' font weight for skinny text
const historicalContext = {
    annotations: {
        ww1: { 
            type: 'box', xMin: 1914, xMax: 1918, backgroundColor: 'rgba(50, 50, 50, 0.1)', borderWidth: 0, 
            label: { 
                content: 'WW1', display: true, position: { x: 'center', y: 'start' }, 
                rotation: -90, 
                yAdjust: 20, 
                color: '#7f8c8d', 
                font: { size: 10, weight: 'lighter' }
            } 
        },
        ww2: { 
            type: 'box', xMin: 1939, xMax: 1945, backgroundColor: 'rgba(50, 50, 50, 0.1)', borderWidth: 0, 
            label: { 
                content: 'WW2', display: true, position: { x: 'center', y: 'start' }, 
                rotation: -90, 
                yAdjust: 20, 
                color: '#7f8c8d', 
                font: { size: 10, weight: 'lighter' } 
            } 
        },
        energy: { 
            type: 'box', xMin: 1973, xMax: 1976, backgroundColor: 'rgba(50, 50, 50, 0.1)', borderWidth: 0, 
            label: { 
                content: 'Energy Crisis', display: true, position: { x: 'center', y: 'start' }, 
                rotation: -90, 
                yAdjust: 40, 
                color: '#7f8c8d', 
                font: { size: 10, weight: 'lighter' } 
            } 
        },
        recession90: { 
            type: 'box', xMin: 1990, xMax: 1992, backgroundColor: 'rgba(50, 50, 50, 0.1)', borderWidth: 0, 
            label: { 
                content: 'Recession', display: true, position: { x: 'center', y: 'start' }, 
                rotation: -90, 
                yAdjust: 30, 
                color: '#7f8c8d', 
                font: { size: 10, weight: 'lighter' } 
            } 
        },
        finance: { 
            type: 'box', xMin: 2008, xMax: 2009, backgroundColor: 'rgba(50, 50, 50, 0.1)', borderWidth: 0, 
            label: { 
                content: '2008 Crash', display: true, position: { x: 'center', y: 'start' }, 
                rotation: -90, 
                yAdjust: 35, 
                color: '#7f8c8d', 
                font: { size: 10, weight: 'lighter' } 
            } 
        },
        covid: { 
            type: 'box', xMin: 2020, xMax: 2022, backgroundColor: 'rgba(50, 50, 50, 0.1)', borderWidth: 0, 
            label: { 
                content: 'Covid', display: true, position: { x: 'center', y: 'start' }, 
                rotation: -90, 
                yAdjust: 20, 
                color: '#7f8c8d', 
                font: { size: 10, weight: 'lighter' } 
            } 
        }
    }
};

// ==========================================
// 2. UNIVERSAL RENDERERS
// ==========================================

// Global Chart Instances to manage lifecycle for thumbnails
const thumbnailChartInstances = {};
let currentModalChartInstance = null; // To store the Chart.js instance in the modal
let chartDataFromCSV = []; // Global variable to store data once loaded

function renderChartInstance(config, allData, isThumbnail, showTooltips = true, showAnnotations = true) {
    // Determine the target canvas element ID
    const targetCanvasId = isThumbnail ? `chart-canvas-${config.id}-thumbnail` : `lightboxChartCanvas`;
    let canvas = document.getElementById(targetCanvasId);

    // If thumbnail and canvas doesn't exist, create it inside the thumbnail container
    if (isThumbnail) {
        const thumbnailContainer = document.querySelector(`.card[data-chart-id="${config.id}"] .chart-thumbnail`);
        if (!thumbnailContainer) {
            console.warn(`Thumbnail container not found for chart ID: ${config.id}`);
            return;
        }
        thumbnailContainer.innerHTML = ''; // Clear any existing content like "Coming Soon"

        // Create the title overlay element
        const titleOverlay = document.createElement('div');
        titleOverlay.className = 'chart-title-overlay';
        titleOverlay.textContent = document.querySelector(`.card[data-chart-id="${config.id}"] h3`).textContent;
        thumbnailContainer.appendChild(titleOverlay);

        canvas = document.createElement('canvas');
        canvas.id = targetCanvasId;
        thumbnailContainer.appendChild(canvas);
    } else if (!canvas) {
        console.error(`Lightbox canvas element not found for ID: ${targetCanvasId}`);
        return;
    }

    // Destroy existing Chart.js instance for this canvas if it exists
    if (Chart.getChart(canvas)) {
        Chart.getChart(canvas).destroy();
    }
    
    let chartData = allData; // Start with the full dataset
    let chartOptions = {
        responsive: true,
        maintainAspectRatio: false, // Important for filling container
        interaction: { mode: 'index', intersect: false },
        plugins: {
            legend: { display: !isThumbnail }, // Hide legend for thumbnails
            tooltip: { 
                enabled: showTooltips,
                callbacks: {
                    title: ctx => String(ctx[0].label).replace(/,/g, ''), // Format Year without commas
                    label: function(context) { // Ensure label also shows Year without commas if applicable
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += context.parsed.y.toLocaleString(); // Use original formatting for value
                        }
                        return label;
                    }
                }
            },
            annotation: isThumbnail ? { display: false } : (showAnnotations ? historicalContext : { annotations: {} }) // Disable annotations for thumbnails
        },
        scales: {
            x: {
                display: !isThumbnail, // Hide x-axis for thumbnails
                ticks: {
                    maxTicksLimit: isMobile ? 6 : 10,
                    callback: v => String(v).replace(/,/g, '') // Format Year without commas
                }
            },
            y: {
                display: !isThumbnail, // Hide y-axis for thumbnails
                ticks: {
                    padding: 10
                }
            }
        }
    };

    let datasets = [];
    let labels = [];
    let chartjsType = 'line'; // Default Chart.js type

    // Disable interaction for thumbnails
    if (isThumbnail) {
        chartOptions.events = [];
    }

    // --- Data Preprocessing & Chart Options based on config type ---
    
    // Special handling for chartSectorCrash (combined and re-indexed data)
    if (config.id === 'chartSectorCrash') {
        const processedDataForSectorCrash = allData.map(d => ({
            Year: d.Year,
            Combined_FinProp: parseFloat(d.Sect_Finance || 0) + parseFloat(d.Sect_Prop || 0),
            Combined_MatEn: parseFloat(d.Sect_Materials || 0) + parseFloat(d.Sect_Energy || 0),
            Combined_IndUtil: parseFloat(d.Sect_Industry || 0) + parseFloat(d.Sect_Util || 0),
            Sect_Tech: parseFloat(d.Sect_Tech || 0),
            Sect_Health: parseFloat(d.Sect_Health || 0),
            Sect_Consumer: parseFloat(d.Sect_Consumer || 0)
        }));

        const reindexedDataForSectorCrash = [];
        const referenceValues = {};
        const sectorsToReindex = ['Combined_FinProp', 'Combined_MatEn', 'Combined_IndUtil', 'Sect_Tech', 'Sect_Health', 'Sect_Consumer'];

        const data1975 = processedDataForSectorCrash.find(d => parseInt(d.Year) === 1975);
        if (data1975) {
            sectorsToReindex.forEach(sector => {
                referenceValues[sector] = data1975[sector] || 1; 
            });
        } else {
            sectorsToReindex.forEach(sector => {
                referenceValues[sector] = 1; 
            });
            console.warn("1975 data not found for re-indexing chartSectorCrash.");
        }

        processedDataForSectorCrash.forEach(d => {
            if (parseInt(d.Year) >= 1975) {
                const reindexedRow = { Year: d.Year };
                sectorsToReindex.forEach(sector => {
                    reindexedRow[sector] = (d[sector] / referenceValues[sector]) * 100;
                });
                reindexedDataForSectorCrash.push(reindexedRow);
            }
        });
        chartData = reindexedDataForSectorCrash;
        
        // Apply scales for reindexed multi-line chart
        chartOptions.scales.x = { 
            type: 'linear', 
            min: config.minX, 
            max: 2025, 
            ticks: { callback: v => String(v).replace(/,/g, ''), maxTicksLimit: isMobile ? 6 : 10, display: !isThumbnail },
            display: !isThumbnail 
        };
        chartOptions.scales.y = { 
            title: { display: !isThumbnail, text: config.yTitle }, 
            ticks: { padding: 10, display: !isThumbnail, callback: (value) => value.toFixed(0) },
            display: !isThumbnail 
        };

        // Datasets for multi-line
        const cleanData = chartData.filter(r => r.Year >= (config.minX || 1900) && r[config.columns[0]]);
        labels = cleanData.map(d => d.Year);
        datasets = config.columns.map((col, i) => ({
            label: config.labels[i],
            data: cleanData.map(d => parseFloat(d[col])),
            borderColor: config.colors[i],
            backgroundColor: 'transparent',
            borderWidth: lineThick,
            pointRadius: 0,
            tension: 0.3
        }));
    } 
    // Special handling for chartMigrationNet (Bar Chart)
    else if (config.id === 'chartMigrationNet') {
        const barData = allData.filter(r => r.Net_Migration); 
        labels = barData.map(d => d.Year);
        datasets.push({
            label: 'Net People',
            data: barData.map(d => parseFloat(d.Net_Migration)),
            backgroundColor: barData.map(d => parseFloat(d.Net_Migration) < 0 ? '#e74c3c' : '#3498db')
        });
        chartjsType = 'bar'; // Set Chart.js type to bar

        chartOptions.scales.x = { 
            grid: { display: false }, 
            ticks: { maxRotation: 0, minRotation: 0, maxTicksLimit: isMobile ? 6 : 10, display: !isThumbnail, callback: v => String(v).replace(/,/g, '') },
            display: !isThumbnail 
        };
        chartOptions.scales.y = { 
            display: !isThumbnail,
            ticks: { 
                callback: function(value) { return isThumbnail ? '' : value / 1000 + 'k'; },
                padding: 10 
            } 
        };
        chartOptions.plugins.legend.display = false; // No legend for simple bar chart
    }
    // Special handling for chartMigrationMirror (Stacked Line Chart)
    else if (config.id === 'chartMigrationMirror') {
        const mirrorData = allData.filter(r => r.Year);
        labels = mirrorData.map(d => d.Year);
        const emigrationData = mirrorData.map(d => parseInt(d.Net_Total) - (parseInt(d.Asylum || 0) + parseInt(d.Humanitarian || 0) + parseInt(d.Work_Health || 0) + parseInt(d.Work_Other || 0) + parseInt(d.Study || 0) + parseInt(d.Family || 0)));
        datasets = [ 
            { label: 'Asylum', data: mirrorData.map(d => parseFloat(d.Asylum || 0)), backgroundColor: '#34495e', borderColor: '#34495e', fill: true, pointRadius: 0, tension: 0.4, stack: 'inflow' }, 
            { label: 'Humanitarian', data: mirrorData.map(d => parseFloat(d.Humanitarian || 0)), backgroundColor: '#f39c12', borderColor: '#f39c12', fill: true, pointRadius: 0, tension: 0.4, stack: 'inflow' }, 
            { label: 'Health Care', data: mirrorData.map(d => parseFloat(d.Work_Health || 0)), backgroundColor: '#2ecc71', borderColor: '#2ecc71', fill: true, pointRadius: 0, tension: 0.4, stack: 'inflow' }, 
            { label: 'Other Work', data: mirrorData.map(d => parseFloat(d.Work_Other || 0)), backgroundColor: '#27ae60', borderColor: '#27ae60', fill: true, pointRadius: 0, tension: 0.4, stack: 'inflow' }, 
            { label: 'Study', data: mirrorData.map(d => parseFloat(d.Study || 0)), backgroundColor: '#3498db', borderColor: '#3498db', fill: true, pointRadius: 0, tension: 0.4, stack: 'inflow' }, 
            { label: 'Family', data: mirrorData.map(d => parseFloat(d.Family || 0)), backgroundColor: '#9b59b6', borderColor: '#9b59b6', fill: true, pointRadius: 0, tension: 0.4, stack: 'inflow' }, 
            { label: 'Emigration (Leaving)', data: emigrationData, backgroundColor: '#e74c3c', borderColor: '#e74c3c', fill: true, pointRadius: 0, tension: 0.4, stack: 'outflow' } 
        ];
        chartjsType = 'line'; // Still a line chart in Chart.js, but stacked
        chartOptions.scales.x = { 
            grid: { display: false }, 
            ticks: { maxTicksLimit: isMobile ? 6 : 10, display: !isThumbnail, callback: v => String(v).replace(/,/g, '') },
            display: !isThumbnail 
        };
        chartOptions.scales.y = { 
            stacked: true, 
            display: !isThumbnail,
            ticks: { 
                callback: function(value) { return isThumbnail ? '' : value / 1000 + 'k'; },
                padding: 10 
            } 
        };
        chartOptions.plugins.legend.display = !isThumbnail;
    }
    // Generic line, stacked, or multi-line (non-special)
    else { 
        let cleanData;
        if (config.column) { // Single line charts
            cleanData = chartData.filter(r => r[config.column] && r[config.column] !== "");
            labels = cleanData.map(d => d.Year);
            datasets.push({
                label: config.label,
                data: cleanData.map(d => parseFloat(d[config.column])),
                borderColor: config.color,
                backgroundColor: config.color + '20',
                borderWidth: lineThick,
                pointRadius: 0,
                hoverRadius: 4,
                fill: true,
                tension: 0.2
            });
            chartjsType = 'line';

            chartOptions.scales.x = { type: 'linear', min: parseInt(cleanData[0].Year), max: parseInt(cleanData[cleanData.length-1].Year), ticks: { callback: v => String(v).replace(/,/g, ''), maxTicksLimit: isMobile ? 6 : 10, display: !isThumbnail }, display: !isThumbnail };
            chartOptions.scales.y = {
                beginAtZero: false,
                ticks: {
                    padding: 10,
                    callback: function(value) {
                        if (isThumbnail) return '';
                        if (config.isCurrency) return (value >= 1000) ? '£' + (value/1000) + 'k' : '£' + value;
                        if (config.isPercentage) return value + '%';
                        if (config.isMillions) return value + 'm';
                        return value;
                    },
                    display: !isThumbnail
                },
                display: !isThumbnail
            };
            chartOptions.plugins.legend.display = false; // Single line charts usually don't need a legend in full view
        } else if (config.columns) { // Stacked or Multi-line charts
            cleanData = chartData.filter(r => r.Year >= (config.minX || 1900) && r[config.columns[0]]);
            labels = cleanData.map(d => d.Year);
            datasets = config.columns.map((col, i) => ({
                label: config.labels[i],
                data: cleanData.map(d => parseFloat(d[col] || 0)),
                borderColor: config.colors[i],
                backgroundColor: config.type === 'stacked' ? config.colors[i] : 'transparent',
                borderWidth: lineThick,
                pointRadius: 0,
                fill: config.type === 'stacked',
                tension: 0.3,
                stack: config.type === 'stacked' ? 'stack' : undefined
            }));
            
            if (config.type === 'stacked') {
                chartjsType = 'line'; // Stacked charts are type 'line' in Chart.js
                chartOptions.scales.y.stacked = true;
                chartOptions.scales.y.beginAtZero = true;
            } else if (config.type === 'multi-line') {
                chartjsType = 'line';
            }

            chartOptions.scales.x = { type: 'linear', min: (config.minX || 1900), max: 2025, ticks: { callback: v => String(v).replace(/,/g, ''), maxTicksLimit: isMobile ? 6 : 10, display: !isThumbnail }, display: !isThumbnail };
            chartOptions.scales.y = { 
                title: { display: !isThumbnail, text: config.yTitle }, 
                ticks: { padding: 10, display: !isThumbnail },
                display: !isThumbnail 
            };
            chartOptions.plugins.legend.display = !isThumbnail;
        }
    }

    const newChartInstance = new Chart(canvas, {
        type: chartjsType,
        data: { labels: labels, datasets: datasets },
        options: chartOptions
    });

    if (isThumbnail) {
        thumbnailChartInstances[config.id] = newChartInstance;
    } else {
        currentModalChartInstance = newChartInstance;
    }
}

// ==========================================
// 3. MASTER EXECUTION
// ==========================================

const chartsConfig = [
    // --- CHAPTER 1: MACRO ---
    { id: 'chartInflation', type: 'line', column: 'CPI', label: 'Inflation %', color: '#e74c3c', isPercentage: true },
    { id: 'chartDebt', type: 'line', column: 'Debt_GDP', label: 'Debt % GDP', color: '#8e44ad', isPercentage: true },
    { id: 'chartGDP', type: 'line', column: 'GDP_Growth', label: 'GDP Growth %', color: '#2c3e50', isPercentage: true },
    { id: 'chartUnemployment', type: 'line', column: 'Unemployment', label: 'Unemployment Rate', color: '#2980b9', isPercentage: true },
    { id: 'chartInterest', type: 'line', column: 'Interest_Rate', label: 'Bank of England Base Rate', color: '#e67e22' },
    { 
        id: 'chartTaxRate', 
        type: 'stacked', 
        columns: ['Tax_Rev_Income', 'Tax_Rev_NI', 'Tax_Rev_VAT', 'Tax_Rev_Corp', 'Tax_Rev_Other'],
        colors: ['#27ae60', '#2980b9', '#c0392b', '#e67e22', '#95a5a6'],
        labels: ['Income Tax', 'National Insurance', 'VAT', 'Corporation Tax', 'Other'],
        yTitle: '% of GDP',
        isPercentage: true
    },
    { 
        id: 'chartSectorCrash', 
        type: 'multi-line', // Chart.js type 'line' but with multiple lines
        columns: ['Combined_FinProp', 'Combined_MatEn', 'Combined_IndUtil', 'Sect_Tech', 'Sect_Health', 'Sect_Consumer'],
        labels: ['Financials & Property', 'Materials & Energy', 'Industrials & Utilities', 'Technology', 'Health Care', 'Consumer'],
        colors: ['#c0392b', '#d35400', '#7f8c8d', '#8e44ad', '#27ae60', '#3498db'],
        minX: 1975,
        yTitle: 'Relative Value (1975 = 100)'
    },
    // --- CHAPTER 2: INDIVIDUAL ---
    { id: 'chartDebtCapita', type: 'line', column: 'Debt_Per_Capita', label: 'Real Debt', color: '#d35400', isCurrency: true },
    { id: 'chartGDPCapita', type: 'line', column: 'GDP_Per_Capita_Growth', label: 'Growth Per Person %', color: '#27ae60', isPercentage: true },
    { id: 'chartRealWages', type: 'line', column: 'Real_Wages', label: 'Weekly Earnings (2024 £)', color: '#1abc9c', isCurrency: true },
    { id: 'chartHousePrices', type: 'line', column: 'House_Price', label: 'Avg Price (2024 £)', color: '#9b59b6', isCurrency: true },
    { id: 'chartHouseRatio', type: 'line', column: 'House_Ratio', label: 'Price to Earnings Ratio', color: '#2c3e50' },
    { id: 'chartTaxCapita', type: 'line', column: 'Tax_Per_Capita', label: 'Tax Per Person', color: '#8e44ad', isCurrency: true },

    // --- CHAPTER 3: INDUSTRY ---
    { 
        id: 'chartSectors', 
        type: 'stacked', 
        columns: ['Sector_Services', 'Sector_Industry', 'Sector_Agri'],
        colors: ['#f1c40f', '#34495e', '#27ae60'],
        labels: ['Services', 'Industry', 'Agriculture'],
        yTitle: '% of Economy',
        isPercentage: true
    },
    { 
        id: 'chartWorkforce', 
        type: 'stacked', 
        columns: ['Work_Public', 'Work_Services', 'Work_Industry', 'Work_Agri'],
        colors: ['#3498db', '#f1c40f', '#7f8c8d', '#27ae60'],
        labels: ['Public Sector', 'Services', 'Industry', 'Agriculture'],
        yTitle: '% of Workforce',
        isPercentage: true
    },

    // --- CHAPTER 4: POPULATION ---
    { id: 'chartPopulation', type: 'line', column: 'Population', label: 'Total Population', color: '#16a085', isMillions: true },

    // --- MIGRATION CHARTS ---
    { id: 'chartMigrationNet', type: 'manual-bar', colLabel: 'Year', colValue: 'Net_Migration' }, // Data expected directly in allData
    { id: 'chartMigrationMirror', type: 'manual-mirror' } // Data expected directly in allData
];

// Placeholder for "Coming Soon" charts to avoid issues with array indexing
// These are not actual renderable charts but entries for navigation purposes
const comingSoonCharts = [
    { id: 'chartEnergy', type: 'coming-soon', title: 'Energy: Coal vs Renewables' },
    { id: 'chartBirthRates', type: 'coming-soon', title: 'Birth Rates (Boys vs Girls)' },
    { id: 'chartLifeExpectancy', type: 'coming-soon', title: 'Life Expectancy (1900 vs 2024)' },
    { id: 'chartAgeingCrisis', type: 'coming-soon', title: 'The Ageing Crisis (Dependency Ratio)' },
    { id: 'chartAsylumNetMigration', type: 'coming-soon', title: 'Asylum as % of Net Migration' },
    { id: 'chartAsylumDensity', type: 'coming-soon', title: 'Asylum Density (Per 1,000 People)' },
    { id: 'chartVisaTypes', type: 'coming-soon', title: 'Visa Types: Work vs Study vs Family' },
    { id: 'chartNHSWaitingLists', type: 'coming-soon', title: 'NHS Waiting Lists (The Long View)' },
    { id: 'chartCrimeRates', type: 'coming-soon', title: 'Crime Rates (Violent vs Theft)' },
    { id: 'chartPrisonPopulation', type: 'coming-soon', title: 'Prison Population (Men vs Women)' },
    { id: 'chartUniversityDegrees', type: 'coming-soon', title: 'Education: University Degrees %' },
    { id: 'chartGDPG7', type: 'coming-soon', title: 'GDP Growth: UK vs G7 Average' },
    { id: 'chartInflationG7', type: 'coming-soon', title: 'Inflation Peaks: UK vs G7' },
    { id: 'chartDebtG7', type: 'coming-soon', title: 'National Debt: UK vs G7' }
];

// Combine renderable charts with coming soon charts for full navigation
const allChartsForNavigation = [...chartsConfig, ...comingSoonCharts];


const sheetURL = 'https://docs.google.com/spreadsheets/d/1WoVsdG-U-Pbbs3WhNpXPFqjU5G5-yslJ4-xV7882t0E/export?format=csv&gid=0';

Papa.parse(sheetURL, {
    download: true, header: true, skipEmptyLines: true,
    complete: function(results) {
        chartDataFromCSV = results.data; // Store raw data globally for lightbox

        // --- RENDER ALL CHARTS AS THUMBNAILS ---
        allChartsForNavigation.forEach(config => {
            const thumbnailContainer = document.querySelector(`.card[data-chart-id="${config.id}"] .chart-thumbnail`);
            if (!thumbnailContainer) {
                console.warn(`Thumbnail container not found for chart ID: ${config.id}`);
                return;
            }

            if (config.type === 'coming-soon') {
                thumbnailContainer.innerHTML = 'Coming Soon';
                thumbnailContainer.style.display = 'flex';
                thumbnailContainer.style.alignItems = 'center';
                thumbnailContainer.style.justifyContent = 'center';
                thumbnailContainer.style.color = '#bdc3c7';
                thumbnailContainer.style.fontWeight = 'bold';
                thumbnailContainer.style.fontStyle = 'italic';
                thumbnailContainer.style.border = '2px dashed #bdc3c7';
                thumbnailContainer.style.borderRadius = '8px';
                thumbnailContainer.style.height = '150px'; // Fixed height for consistency
                thumbnailContainer.style.backgroundColor = '#fafafa';
            } else {
                renderChartInstance(config, chartDataFromCSV, true); // Render actual charts as thumbnails
            }
        });

        // --- LIGHTBOX FUNCTIONALITY ---
        const lightboxModal = document.getElementById('lightboxModal');
        const lightboxChartTitle = document.getElementById('lightboxChartTitle');
        const lightboxChartCanvas = document.getElementById('lightboxChartCanvas'); 
        const backToGalleryBtn = document.getElementById('backToGalleryBtn');
        const prevChartBtn = document.getElementById('prevChartBtn');
        const nextChartBtn = document.getElementById('nextChartBtn');
        const toggleHoverBtn = document.getElementById('toggleHoverBtn');
        const toggleAnnotationsBtn = document.getElementById('toggleAnnotationsBtn');

        let currentChartIndex = 0; // Initialize to 0 as per user request
        let showTooltipsInLightbox = true; // Default to true for detail view
        let showAnnotationsInLightbox = true; // Default to true for detail view

        function renderChartInLightbox(index) {
            currentChartIndex = index;
            const config = allChartsForNavigation[currentChartIndex];
            
            if (!config) { // Should not happen with allChartsForNavigation
                const ctx = lightboxChartCanvas.getContext('2d');
                ctx.clearRect(0, 0, lightboxChartCanvas.width, lightboxChartCanvas.height);
                lightboxChartTitle.textContent = "Chart Not Available";
                toggleHoverBtn.disabled = true;
                toggleAnnotationsBtn.disabled = true;
                return;
            }

            if (config.type === 'coming-soon') {
                const ctx = lightboxChartCanvas.getContext('2d');
                ctx.clearRect(0, 0, lightboxChartCanvas.width, lightboxChartCanvas.height); // Clear any previous chart
                lightboxChartTitle.textContent = config.title + " (Coming Soon)";
                toggleHoverBtn.disabled = true;
                toggleAnnotationsBtn.disabled = true;

                // Draw "Coming Soon" text on canvas
                ctx.font = '24px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = '#bdc3c7';
                ctx.fillText('Coming Soon', lightboxChartCanvas.width / 2, lightboxChartCanvas.height / 2);
                return;
            } else {
                toggleHoverBtn.disabled = false;
                toggleAnnotationsBtn.disabled = false;
            }

            const cardTitleElement = document.querySelector(`.card[data-chart-id="${config.id}"] h3`);
            lightboxChartTitle.textContent = cardTitleElement ? cardTitleElement.textContent : config.title;
            renderChartInstance(config, chartDataFromCSV, false, showTooltipsInLightbox, showAnnotationsInLightbox);

            toggleHoverBtn.textContent = `Toggle Hover (${showTooltipsInLightbox ? 'On' : 'Off'})`;
            toggleAnnotationsBtn.textContent = `Toggle World Events (${showAnnotationsInLightbox ? 'On' : 'Off'})`;
        }

        // Open lightbox when a thumbnail is clicked
        document.querySelectorAll('.card[data-chart-id]').forEach((card) => {
            card.addEventListener('click', () => {
                const chartId = card.dataset.chartId;
                const configIndex = allChartsForNavigation.findIndex(c => c.id === chartId);
                if (configIndex !== -1) {
                    lightboxModal.style.display = 'block';
                    // Force Chart.js to resize after modal is visible
                    // This is a common workaround for "empty modal" bug
                    setTimeout(() => {
                        renderChartInLightbox(configIndex);
                        if (currentModalChartInstance) { // Use currentModalChartInstance
                            currentModalChartInstance.resize();
                        }
                    }, 0); // Use setTimeout to ensure modal is rendered
                }
            });
        });

        // Close lightbox
        backToGalleryBtn.addEventListener('click', () => {
            lightboxModal.style.display = 'none';
            if (currentModalChartInstance) {
                currentModalChartInstance.destroy();
                currentModalChartInstance = null;
            }
        });

        // Previous chart
        prevChartBtn.addEventListener('click', () => {
            let newIndex = currentChartIndex;
            do {
                newIndex--;
                if (newIndex < 0) newIndex = allChartsForNavigation.length - 1;
            } while (allChartsForNavigation[newIndex].type === 'coming-soon' && newIndex !== currentChartIndex); // Avoid infinite loop if all are coming-soon

            renderChartInLightbox(newIndex);
        });

        // Next chart
        nextChartBtn.addEventListener('click', () => {
            let newIndex = currentChartIndex;
            do {
                newIndex++;
                if (newIndex >= allChartsForNavigation.length) newIndex = 0;
            } while (allChartsForNavigation[newIndex].type === 'coming-soon' && newIndex !== currentChartIndex); // Avoid infinite loop

            renderChartInLightbox(newIndex);
        });

        // Toggle hover
        toggleHoverBtn.addEventListener('click', () => {
            showTooltipsInLightbox = !showTooltipsInLightbox;
            if (currentModalChartInstance) {
                currentModalChartInstance.options.plugins.tooltip.enabled = showTooltipsInLightbox;
                currentModalChartInstance.update();
            }
            toggleHoverBtn.textContent = `Toggle Hover (${showTooltipsInLightbox ? 'On' : 'Off'})`;
        });

        // Toggle annotations
        toggleAnnotationsBtn.addEventListener('click', () => {
            showAnnotationsInLightbox = !showAnnotationsInLightbox;
            if (currentModalChartInstance) {
                currentModalChartInstance.options.plugins.annotation = showAnnotationsInLightbox ? historicalContext : { annotations: {} };
                currentModalChartInstance.update();
            }
            toggleAnnotationsBtn.textContent = `Toggle World Events (${showAnnotationsInLightbox ? 'On' : 'Off'})`;
        });

        // Close modal when clicking outside
        window.addEventListener('click', (event) => {
            if (event.target === lightboxModal) {
                lightboxModal.style.display = 'none';
                if (currentModalChartInstance) {
                    currentModalChartInstance.destroy();
                    currentModalChartInstance = null;
                }
            }
        });
    }
});