// ==========================================
// 1. CONFIGURATION & MOBILE DETECTION
// ==========================================
const isMobile = window.innerWidth < 768;
const lineThick = isMobile ? 1 : 2.5;

// World events: Horizontal for screen, Vertical for mobile; Darker charcoal text
const historicalContext = {
    annotations: {
        ww1: { type: 'box', xMin: 1914, xMax: 1918, backgroundColor: 'rgba(0, 0, 0, 0.18)', borderWidth: 0, label: { content: 'WW1', display: true, position: { x: 'center', y: 'start' }, rotation: isMobile ? -90 : 0, yAdjust: isMobile ? 20 : 10, color: '#444', font: { size: 10, weight: 'bold' } } },
        ww2: { type: 'box', xMin: 1939, xMax: 1945, backgroundColor: 'rgba(0, 0, 0, 0.18)', borderWidth: 0, label: { content: 'WW2', display: true, position: { x: 'center', y: 'start' }, rotation: isMobile ? -90 : 0, yAdjust: isMobile ? 20 : 10, color: '#444', font: { size: 10, weight: 'bold' } } },
        energy: { type: 'box', xMin: 1973, xMax: 1976, backgroundColor: 'rgba(0, 0, 0, 0.18)', borderWidth: 0, label: { content: 'Energy Crisis', display: true, position: { x: 'center', y: 'start' }, rotation: isMobile ? -90 : 0, yAdjust: isMobile ? 40 : 10, color: '#444', font: { size: 10, weight: 'bold' } } },
        recession90: { type: 'box', xMin: 1990, xMax: 1992, backgroundColor: 'rgba(0, 0, 0, 0.18)', borderWidth: 0, label: { content: 'Recession', display: true, position: { x: 'center', y: 'start' }, rotation: isMobile ? -90 : 0, yAdjust: isMobile ? 30 : 10, color: '#444', font: { size: 10, weight: 'bold' } } },
        finance: { type: 'box', xMin: 2008, xMax: 2009, backgroundColor: 'rgba(0, 0, 0, 0.18)', borderWidth: 0, label: { content: '2008 Crash', display: true, position: { x: 'center', y: 'start' }, rotation: isMobile ? -90 : 0, yAdjust: isMobile ? 35 : 10, color: '#444', font: { size: 10, weight: 'bold' } } },
        covid: { type: 'box', xMin: 2020, xMax: 2022, backgroundColor: 'rgba(0, 0, 0, 0.18)', borderWidth: 0, label: { content: 'Covid', display: true, position: { x: 'center', y: 'start' }, rotation: isMobile ? -90 : 0, yAdjust: isMobile ? 20 : 10, color: '#444', font: { size: 10, weight: 'bold' } } }
    }
};

// ==========================================
// 2. CHART CONFIGURATION
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
    }

    if (Chart.getChart(canvas)) { Chart.getChart(canvas).destroy(); }

    const isPercentageChart = config.id.includes('Inflation') || config.id.includes('Debt') || config.id.includes('GDP') || config.id.includes('Unemployment') || config.id.includes('Rate') || config.id.includes('Interest') || config.id.includes('Ratio');
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
                        let value = context.parsed.y;
                        if (value !== null) {
                            if (isCurrencyChart) { label += `: £${value.toLocaleString()}`; } 
                            else if (isPercentageChart) { label += `: ${value.toFixed(2)}%`; }
                            else { label += `: ${value.toLocaleString()}`; }
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
                min: 1900,
                max: 2030, // Scale ends on 2030
                ticks: { 
                    stepSize: 10, // 10-year increments
                    callback: v => String(v).replace(/,/g, '') 
                }
            },
     y: {
    display: !isThumbnail,
    ticks: {
        callback: function(value) {
            if (isThumbnail) return '';

            if (isCurrencyChart) {
                // If the value is 1000 or more, show as 'k'
                // If the engine has already scaled it down (value < 1000), 
                // we just add the 'k' without dividing again.
                if (value >= 1000) {
                    return '£' + (value / 1000) + 'k';
                }
                return '£' + value + 'k';
            }
            
            if (isPercentageChart) return value + '%';
            
            return value;
        }
    }
}
        }
    };
    if (isThumbnail) { chartOptions.events = []; }

    const cleanData = allData.filter(r => r.Year && r[config.column]);
    const labels = cleanData.map(d => d.Year);
    const datasets = [{
        label: config.label,
        data: cleanData.map(d => parseFloat(d[config.column])),
        borderColor: config.color,
        borderWidth: lineThick, pointRadius: 0, tension: 0.2, fill: true,
        backgroundColor: config.color + '20'
    }];

    const chart = new Chart(canvas, { type: 'line', data: { labels, datasets }, options: chartOptions });
    if (!isThumbnail) { currentModalChartInstance = chart; }
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

    Promise.all([
        new Promise(resolve => Papa.parse(metadataUrl, { download: true, header: true, delimiter: "\t", complete: r => resolve(r.data) })),
        new Promise(resolve => Papa.parse(dataUrl, { download: true, header: true, complete: r => resolve(r.data) }))
    ]).then(([metadata, data]) => {
        metadata.forEach(row => { if(row.id && allChartData[row.id]) Object.assign(allChartData[row.id], row); });
        timeSeriesData = data;
        initializeDashboard();
    });
}

function initializeDashboard() {
    const chartOrder = [...chartsConfig, ...comingSoonCharts].map(c => c.id);
    chartOrder.forEach(id => {
        if (allChartData[id].type !== 'coming-soon') renderChartInstance(allChartData[id], timeSeriesData, true);
    });
    initializeLightbox(chartOrder);

    const hash = window.location.hash.substring(1);
    if (hash && allChartData[hash]) {
        const idx = chartOrder.indexOf(hash);
        if (idx !== -1) {
            document.getElementById('lightboxModal').style.display = 'block';
            window.renderModalAtLoad(idx);
        }
    }
}

// ==========================================
// 5. LIGHTBOX FUNCTIONALITY
// ==========================================
function initializeLightbox(chartOrder) {
    const lightboxModal = document.getElementById('lightboxModal');
    const toggleHoverBtn = document.getElementById('toggleHoverBtn');
    const toggleAnnotationsBtn = document.getElementById('toggleAnnotationsBtn');
    const toggleAboutBtn = document.getElementById('toggleAboutBtn');
    const aboutPanel = document.getElementById('aboutPanel');
    const shareBtn = document.getElementById('shareBtn');
    const shareFeedback = document.getElementById('shareFeedback');

    let currentChartIndex = 0;
    let showTooltips = false, showAnnotations = false, showAbout = false;

    window.renderModalAtLoad = (index) => renderModalContent(index);

    function renderModalContent(index) {
        currentChartIndex = index;
        const config = allChartData[chartOrder[index]];
        
        document.getElementById('lightboxChartTitle').textContent = config.modalTitle || "UK Economic History";
        document.getElementById('commentaryText').innerHTML = config.commentary || "N/A";
        document.getElementById('sourcesText').innerHTML = config.sources || "N/A";

        window.history.replaceState(null, null, `#${config.id}`);

        // Maintain button bold states
        toggleHoverBtn.classList.toggle('toggled-on', showTooltips);
        toggleAnnotationsBtn.classList.toggle('toggled-on', showAnnotations);
        toggleAboutBtn.classList.toggle('toggled-on', showAbout);
        aboutPanel.classList.toggle('active', showAbout);

        renderChartInstance(config, timeSeriesData, false, showTooltips, showAnnotations);
    }

    document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('click', () => {
            const index = chartOrder.indexOf(card.dataset.chartId);
            lightboxModal.style.display = 'block';
            renderModalContent(index);
        });
    });

    // Share Functionality - native share if possible, clipboard fallback
    shareBtn.addEventListener('click', () => {
        const config = allChartData[chartOrder[currentChartIndex]];
        const shareUrl = `${window.location.origin}${window.location.pathname}#${config.id}`;
        
        if (navigator.share) {
            navigator.share({ title: config.modalTitle, url: shareUrl }).catch(() => copyToClipboard(shareUrl));
        } else {
            copyToClipboard(shareUrl);
        }
    });

    function copyToClipboard(url) {
        navigator.clipboard.writeText(url).then(() => {
            shareFeedback.textContent = 'Link Copied';
            shareFeedback.style.opacity = 1;
            setTimeout(() => { shareFeedback.style.opacity = 0; }, 2000);
        });
    }

    // Toggle Listeners
    toggleHoverBtn.addEventListener('click', () => { 
        showTooltips = !showTooltips; 
        renderModalContent(currentChartIndex); 
    });
    toggleAnnotationsBtn.addEventListener('click', () => { 
        showAnnotations = !showAnnotations; 
        renderModalContent(currentChartIndex); 
    });
    toggleAboutBtn.addEventListener('click', () => { 
        showAbout = !showAbout; 
        renderModalContent(currentChartIndex); 
    });

    document.querySelector('.home-icon').addEventListener('click', () => {
        lightboxModal.style.display = 'none';
        window.history.replaceState(null, null, ' ');
    });

    document.getElementById('prevChartBtn').addEventListener('click', () => {
        let newIndex = currentChartIndex;
        do { newIndex = (newIndex - 1 + chartOrder.length) % chartOrder.length; } while (allChartData[chartOrder[newIndex]].type === 'coming-soon');
        renderModalContent(newIndex);
    });

    document.getElementById('nextChartBtn').addEventListener('click', () => {
        let newIndex = currentChartIndex;
        do { newIndex = (newIndex + 1) % chartOrder.length; } while (allChartData[chartOrder[newIndex]].type === 'coming-soon');
        renderModalContent(newIndex);
    });
}

loadData();
