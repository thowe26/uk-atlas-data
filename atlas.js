// ==========================================
// 1. CONFIGURATION & MOBILE DETECTION
// ==========================================
const isMobile = window.innerWidth < 768;
const lineThick = isMobile ? 1 : 2.5;

const historicalContext = {
    annotations: {
        ww1: { type: 'box', xMin: 1914, xMax: 1918, backgroundColor: 'rgba(50, 50, 50, 0.1)', borderWidth: 0, label: { content: 'WW1', display: true, position: { x: 'center', y: 'start' }, rotation: -90, yAdjust: 20, color: '#7f8c8d', font: { size: 10, weight: 'lighter' } } },
        ww2: { type: 'box', xMin: 1939, xMax: 1945, backgroundColor: 'rgba(50, 50, 50, 0.1)', borderWidth: 0, label: { content: 'WW2', display: true, position: { x: 'center', y: 'start' }, rotation: -90, yAdjust: 20, color: '#7f8c8d', font: { size: 10, weight: 'lighter' } } },
        energy: { type: 'box', xMin: 1973, xMax: 1976, backgroundColor: 'rgba(50, 50, 50, 0.1)', borderWidth: 0, label: { content: 'Energy Crisis', display: true, position: { x: 'center', y: 'start' }, rotation: -90, yAdjust: 40, color: '#7f8c8d', font: { size: 10, weight: 'lighter' } } },
        recession90: { type: 'box', xMin: 1990, xMax: 1992, backgroundColor: 'rgba(50, 50, 50, 0.1)', borderWidth: 0, label: { content: 'Recession', display: true, position: { x: 'center', y: 'start' }, rotation: -90, yAdjust: 30, color: '#7f8c8d', font: { size: 10, weight: 'lighter' } } },
        finance: { type: 'box', xMin: 2008, xMax: 2009, backgroundColor: 'rgba(50, 50, 50, 0.1)', borderWidth: 0, label: { content: '2008 Crash', display: true, position: { x: 'center', y: 'start' }, rotation: -90, yAdjust: 35, color: '#7f8c8d', font: { size: 10, weight: 'lighter' } } },
        covid: { type: 'box', xMin: 2020, xMax: 2022, backgroundColor: 'rgba(50, 50, 50, 0.1)', borderWidth: 0, label: { content: 'Covid', display: true, position: { x: 'center', y: 'start' }, rotation: -90, yAdjust: 20, color: '#7f8c8d', font: { size: 10, weight: 'lighter' } } }
    }
};

// ==========================================
// 2. CHART CONFIGURATION (FALLBACK DATA)
// ==========================================
const chartsConfig = [
    { id: 'chartInflation', type: 'line', column: 'CPI', label: 'Inflation %', color: '#e74c3c' },
    { id: 'chartDebt', type: 'line', column: 'Debt_GDP', label: 'Debt % GDP', color: '#8e44ad' },
    { id: 'chartGDP', type: 'line', column: 'GDP_Growth', label: 'GDP Growth %', color: '#2c3e50' },
    { id: 'chartUnemployment', type: 'line', column: 'Unemployment', label: 'Unemployment Rate', color: '#2980b9' },
    { id: 'chartInterest', type: 'line', column: 'Interest_Rate', label: 'Bank of England Base Rate', color: '#e67e22' },
    { id: 'chartTaxRate', type: 'stacked', columns: ['Tax_Rev_Income', 'Tax_Rev_NI', 'Tax_Rev_VAT', 'Tax_Rev_Corp', 'Tax_Rev_Other'], colors: ['#27ae60', '#2980b9', '#c0392b', '#e67e22', '#95a5a6'], labels: ['Income Tax', 'National Insurance', 'VAT', 'Corporation Tax', 'Other'], yTitle: '% of GDP' },
    { id: 'chartSectorCrash', type: 'multi-line', columns: ['Combined_FinProp', 'Combined_MatEn', 'Combined_IndUtil', 'Sect_Tech', 'Sect_Health', 'Sect_Consumer'], labels: ['Financials & Property', 'Materials & Energy', 'Industrials & Utilities', 'Technology', 'Health Care', 'Consumer'], colors: ['#c0392b', '#d35400', '#7f8c8d', '#8e44ad', '#27ae60', '#3498db'], minX: 1975, yTitle: 'Relative Value (1975 = 100)' },
    { id: 'chartDebtCapita', type: 'line', column: 'Debt_Per_Capita', label: 'Real Debt', color: '#d35400' },
    { id: 'chartGDPCapita', type: 'line', column: 'GDP_Per_Capita_Growth', label: 'Growth Per Person %', color: '#27ae60' },
    { id: 'chartRealWages', type: 'line', column: 'Real_Wages', label: 'Weekly Earnings (2024 £)', color: '#1abc9c' },
    { id: 'chartHousePrices', type: 'line', column: 'House_Price', label: 'Avg Price (2024 £)', color: '#9b59b6' },
    { id: 'chartHouseRatio', type: 'line', column: 'House_Ratio', label: 'Price to Earnings Ratio', color: '#2c3e50' },
    { id: 'chartTaxCapita', type: 'line', column: 'Tax_Per_Capita', label: 'Tax Per Person', color: '#8e44ad' },
    { id: 'chartSectors', type: 'stacked', columns: ['Sector_Services', 'Sector_Industry', 'Sector_Agri'], colors: ['#f1c40f', '#34495e', '#27ae60'], labels: ['Services', 'Industry', 'Agriculture'], yTitle: '% of Economy' },
    { id: 'chartWorkforce', type: 'stacked', columns: ['Work_Public', 'Work_Services', 'Work_Industry', 'Work_Agri'], colors: ['#3498db', '#f1c40f', '#7f8c8d', '#27ae60'], labels: ['Public Sector', 'Services', 'Industry', 'Agriculture'], yTitle: '% of Workforce' },
    { id: 'chartPopulation', type: 'line', column: 'Population', label: 'Total Population', color: '#16a085', isMillions: true },
    { id: 'chartMigrationNet', type: 'manual-bar' },
    { id: 'chartMigrationMirror', type: 'manual-mirror' }
];
const comingSoonCharts = [
    { id: 'chartEnergy', type: 'coming-soon' }, { id: 'chartBirthRates', type: 'coming-soon' },
    { id: 'chartLifeExpectancy', type: 'coming-soon' }, { id: 'chartAgeingCrisis', type: 'coming-soon' },
    { id: 'chartAsylumNetMigration', type: 'coming-soon' }, { id: 'chartAsylumDensity', type: 'coming-soon' },
    { id: 'chartVisaTypes', type: 'coming-soon' }, { id: 'chartNHSWaitingLists', type: 'coming-soon' },
    { id: 'chartCrimeRates', type: 'coming-soon' }, { id: 'chartPrisonPopulation', type: 'coming-soon' },
    { id: 'chartUniversityDegrees', type: 'coming-soon' }, { id: 'chartGDPG7', type: 'coming-soon' },
    { id: 'chartInflationG7', type: 'coming-soon' }, { id: 'chartDebtG7', type: 'coming-soon' }
];

// ==========================================
// 3. UNIVERSAL RENDERER
// ==========================================
let thumbnailChartInstances = {};
let currentModalChartInstance = null;

function renderChartInstance(config, allData, isThumbnail, showTooltips = true, showAnnotations = true) {
    const targetCanvasId = isThumbnail ? `thumbnail-canvas-${config.id}` : `lightboxChartCanvas`;
    let canvas = document.getElementById(targetCanvasId);

    if (isThumbnail) {
        const thumbnailContainer = document.querySelector(`.card[data-chart-id="${config.id}"] .chart-thumbnail`);
        if (!thumbnailContainer) return;
        thumbnailContainer.innerHTML = '';
        const titleOverlay = document.createElement('div');
        titleOverlay.className = 'chart-title';
        titleOverlay.textContent = config.title || config.id;
        thumbnailContainer.appendChild(titleOverlay);
        canvas = document.createElement('canvas');
        canvas.id = targetCanvasId;
        thumbnailContainer.appendChild(canvas);
    } else if (!canvas) { return; }

    if (Chart.getChart(canvas)) { Chart.getChart(canvas).destroy(); }

    const isPercentageChart = config.id.includes('Inflation') || config.id.includes('Debt') || config.id.includes('GDP') || config.id.includes('Unemployment') || config.id.includes('Rate') || config.id.includes('Ratio');
    const isCurrencyChart = config.id === 'chartDebtCapita' || config.id === 'chartRealWages' || config.id === 'chartHousePrices';

    let chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
            legend: { display: !isThumbnail },
            tooltip: {
                enabled: showTooltips,
                callbacks: {
                    title: ctx => String(ctx[0].label).replace(/,/g, ""),
                    label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) { label += ': '; }
                        let value = context.parsed.y;
                        if (value !== null) {
                            if (isCurrencyChart) { label += `£${value.toLocaleString()}`; } 
                            else if (isPercentageChart) { label += `${value.toFixed(2)}%`; }
                            else { label += value.toLocaleString(); }
                        }
                        return label;
                    }
                }
            },
            annotation: isThumbnail ? { annotations: {} } : (showAnnotations ? historicalContext : { annotations: {} })
        },
        scales: {
            x: {
                display: !isThumbnail,
                type: 'linear',
                ticks: { maxTicksLimit: isMobile ? 6 : 12, callback: v => String(v).replace(/,/g, '') }
            },
            y: {
                display: !isThumbnail,
                ticks: {
                    callback: function(value) {
                        if (isThumbnail) return '';
                        if (isCurrencyChart) return '£' + (value / 1000) + 'k';
                        if (isPercentageChart) return value + '%';
                        return value;
                    }
                }
            }
        }
    };
    if (isThumbnail) { chartOptions.events = []; }

    let chartjsType = 'line';
    let datasets = [];
    let labels = [];
    let chartData = allData;

    // --- Data Processing & Chart-Specific Options ---
    if (config.id === 'chartSectorCrash') {
        const requiredCols = ['Sect_Finance', 'Sect_Prop', 'Sect_Materials', 'Sect_Energy', 'Sect_Industry', 'Sect_Util', 'Sect_Tech', 'Sect_Health', 'Sect_Consumer'];
        const processedData = allData.map(d => {
            requiredCols.forEach(col => {
                if (!(col in d)) { console.warn(`Column '${col}' not found in data for chartSectorCrash`); }
            });
            return {
                Year: d.Year,
                Combined_FinProp: parseFloat(d.Sect_Finance || 0) + parseFloat(d.Sect_Prop || 0),
                Combined_MatEn: parseFloat(d.Sect_Materials || 0) + parseFloat(d.Sect_Energy || 0),
                Combined_IndUtil: parseFloat(d.Sect_Industry || 0) + parseFloat(d.Sect_Util || 0),
                Sect_Tech: parseFloat(d.Sect_Tech || 0),
                Sect_Health: parseFloat(d.Sect_Health || 0),
                Sect_Consumer: parseFloat(d.Sect_Consumer || 0)
            };
        });

        const reindexedData = [];
        const referenceValues = {};
        const sectorsToReindex = config.columns;
        const data1975 = processedData.find(d => parseInt(d.Year) === 1975);

        if (data1975) {
            sectorsToReindex.forEach(sector => { referenceValues[sector] = data1975[sector] || 1; });
            processedData.forEach(d => {
                if (parseInt(d.Year) >= 1975) {
                    const reindexedRow = { Year: d.Year };
                    sectorsToReindex.forEach(sector => {
                        reindexedRow[sector] = (d[sector] / referenceValues[sector]) * 100;
                    });
                    reindexedData.push(reindexedRow);
                }
            });
            chartData = reindexedData; // Use the re-indexed data
        } else {
            console.warn("1975 data not found for re-indexing chartSectorCrash.");
            chartData = []; // Prevent rendering if baseline is missing
        }
        
        labels = chartData.map(d => d.Year);
        datasets = config.columns.map((col, i) => ({
            label: config.labels[i],
            data: chartData.map(d => d[col]),
            borderColor: config.colors[i],
            borderWidth: lineThick, pointRadius: 0, fill: false, showLine: true, spanGaps: true
        }));
        chartOptions.scales.x.min = 1975;
        chartOptions.scales.x.max = 2025;

    } else if (config.id === 'chartMigrationNet') {
        chartjsType = 'bar';
        const barData = allData.filter(r => r.Net_Migration);
        labels = barData.map(d => d.Year);
        datasets.push({
            label: 'Net People',
            data: barData.map(d => parseFloat(d.Net_Migration)),
            backgroundColor: barData.map(d => parseFloat(d.Net_Migration) < 0 ? '#e74c3c' : '#3498db')
        });
        chartOptions.scales.x.min = Math.min(...labels);
        chartOptions.scales.x.max = Math.max(...labels);
    } else if (config.column) {
        const cleanData = allData.filter(r => r[config.column] && r[config.column] !== "");
        labels = cleanData.map(d => d.Year);
        datasets.push({
            label: config.label,
            data: cleanData.map(d => parseFloat(d[config.column])),
            borderColor: config.color,
            borderWidth: lineThick, pointRadius: 0, tension: 0.2, fill: true,
            backgroundColor: config.color + '20', showLine: true, spanGaps: true
        });
        chartOptions.scales.x.min = parseInt(labels[0]);
        chartOptions.scales.x.max = parseInt(labels[labels.length - 1]);
    } else if (config.columns) {
        const cleanData = allData.filter(r => r.Year >= (config.minX || 1900) && r[config.columns[0]]);
        labels = cleanData.map(d => d.Year);
        datasets = config.columns.map((col, i) => ({
            label: config.labels[i],
            data: cleanData.map(d => parseFloat(d[col] || 0)),
            borderColor: config.colors[i],
            backgroundColor: config.type === 'stacked' ? config.colors[i] : 'transparent',
            borderWidth: lineThick, pointRadius: 0, fill: config.type === 'stacked',
            tension: 0.3, stack: config.type === 'stacked' ? 'stack' : undefined,
            showLine: true, spanGaps: true
        }));
        chartOptions.scales.x.min = config.minX || 1900;
        chartOptions.scales.x.max = 2025;
    }

    const chart = new Chart(canvas, { type: chartjsType, data: { labels, datasets }, options: chartOptions });
    if (isThumbnail) { thumbnailChartInstances[config.id] = chart; } 
    else { currentModalChartInstance = chart; }
}

// ==========================================
// 4. DATA LOADING & EXECUTION
// ==========================================
const allChartData = {};
let timeSeriesData = [];

function loadData() {
    const baseConfigs = [...chartsConfig, ...comingSoonCharts];
    baseConfigs.forEach(config => { allChartData[config.id] = config; });

    const metadataUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRX_OSl_z-Fnou-iUO0KI-lnION2I1NzYhWS_URwjfF_U6jA4ccqAm1mFTpZjf6wKD0bX9dhD3OAmyi/pub?gid=1829770745&single=true&output=tsv';
    const dataUrl = 'https://docs.google.com/spreadsheets/d/1WoVsdG-U-Pbbs3WhNpXPFqjU5G5-yslJ4-xV7882t0E/export?format=csv&gid=0';

    const metadataPromise = new Promise(resolve => Papa.parse(metadataUrl, { download: true, header: true, delimiter: "\t", complete: r => resolve(r.data), error: () => resolve([]) }));
    const dataPromise = new Promise(resolve => Papa.parse(dataUrl, { download: true, header: true, delimiter: ",", skipEmptyLines: true, complete: r => resolve(r.data), error: () => resolve([]) }));

    Promise.all([metadataPromise, dataPromise])
        .then(([metadata, data]) => {
            metadata.forEach(row => {
                if (row && row.id && allChartData[row.id]) { Object.assign(allChartData[row.id], row); }
            });
            timeSeriesData = data;
            initializeDashboard();
        })
        .catch(error => {
            console.error("Data loading failed, using hardcoded fallbacks.", error);
            initializeDashboard();
        });
}

function initializeDashboard() {
    const chartOrder = [...chartsConfig, ...comingSoonCharts].map(c => c.id);
    chartOrder.forEach(id => {
        const config = allChartData[id];
        const thumbnailContainer = document.querySelector(`.card[data-chart-id="${id}"] .chart-thumbnail`);
        if (!thumbnailContainer) return;

        if (config.type === 'coming-soon') {
            thumbnailContainer.innerHTML = 'Coming Soon';
            thumbnailContainer.style.display = 'flex';
            thumbnailContainer.style.alignItems = 'center';
            thumbnailContainer.style.justifyContent = 'center';
        } else {
            renderChartInstance(config, timeSeriesData, true);
        }
    });
    initializeLightbox(chartOrder);
}

// ==========================================
// 5. LIGHTBOX FUNCTIONALITY
// ==========================================
function initializeLightbox(chartOrder) {
    const lightboxModal = document.getElementById('lightboxModal');
    const lightboxChartTitle = document.getElementById('lightboxChartTitle');
    const homeBtn = document.querySelector('.home-icon');
    const prevChartBtn = document.getElementById('prevChartBtn');
    const nextChartBtn = document.getElementById('nextChartBtn');
    const toggleHoverBtn = document.getElementById('toggleHoverBtn');
    const toggleAnnotationsBtn = document.getElementById('toggleAnnotationsBtn');
    const toggleAboutBtn = document.getElementById('toggleAboutBtn');
    const aboutPanel = document.getElementById('aboutPanel');
    const commentaryText = document.getElementById('commentaryText');
    const sourcesText = document.getElementById('sourcesText');
    const shareBtn = document.getElementById('shareBtn');
    const shareFeedback = document.getElementById('shareFeedback');

    let currentChartIndex = 0;
    let showTooltips = false, showAnnotations = false, showAbout = false;

    function renderModalContent(index) {
        currentChartIndex = index;
        const chartId = chartOrder[index];
        const config = allChartData[chartId];
        
        lightboxChartTitle.textContent = config.modalTitle || "Chart";
        commentaryText.textContent = config.commentary || "Commentary coming soon.";
        sourcesText.textContent = config.sources || "N/A";

        toggleHoverBtn.classList.toggle('toggled-on', showTooltips);
        toggleAnnotationsBtn.classList.toggle('toggled-on', showAnnotations);
        toggleAboutBtn.classList.toggle('toggled-on', showAbout);
        aboutPanel.classList.toggle('active', showAbout);

        if (config.type === 'coming-soon') {
            const canvas = document.getElementById('lightboxChartCanvas');
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            if(currentModalChartInstance) currentModalChartInstance.destroy();
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#bdc3c7';
            ctx.fillText('Coming Soon', canvas.width / 2, canvas.height / 2);
        } else {
            renderChartInstance(config, timeSeriesData, false, showTooltips, showAnnotations);
        }
    }

    document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('click', () => {
            const chartId = card.dataset.chartId;
            const index = chartOrder.findIndex(id => id === chartId);
            if (index !== -1) {
                lightboxModal.style.display = 'block';
                renderModalContent(index);
            }
        });
    });

    homeBtn.addEventListener('click', () => lightboxModal.style.display = 'none');
    prevChartBtn.addEventListener('click', () => {
        let newIndex = currentChartIndex;
        do { newIndex = (newIndex - 1 + chartOrder.length) % chartOrder.length; } while (allChartData[chartOrder[newIndex]].type === 'coming-soon');
        renderModalContent(newIndex);
    });
    nextChartBtn.addEventListener('click', () => {
        let newIndex = currentChartIndex;
        do { newIndex = (newIndex + 1) % chartOrder.length; } while (allChartData[chartOrder[newIndex]].type === 'coming-soon');
        renderModalContent(newIndex);
    });

    toggleHoverBtn.addEventListener('click', () => { showTooltips = !showTooltips; renderModalContent(currentChartIndex); });
    toggleAnnotationsBtn.addEventListener('click', () => { showAnnotations = !showAnnotations; renderModalContent(currentChartIndex); });
    toggleAboutBtn.addEventListener('click', () => { showAbout = !showAbout; aboutPanel.classList.toggle('active', showAbout); });

    shareBtn.addEventListener('click', () => {
        const config = allChartData[chartOrder[currentChartIndex]];
        const shareData = { title: config.modalTitle, text: config.commentary, url: window.location.href };
        if (navigator.share) {
            navigator.share(shareData).catch(console.error);
        } else {
            navigator.clipboard.writeText(window.location.href).then(() => {
                shareFeedback.textContent = 'Link Copied';
                shareFeedback.style.opacity = 1;
                setTimeout(() => { shareFeedback.style.opacity = 0; }, 2000);
            }).catch(console.error);
        }
    });

    window.addEventListener('click', e => { if (e.target === lightboxModal) lightboxModal.style.display = 'none'; });
}

loadData();
