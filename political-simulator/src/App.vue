<template>
  <div class="sim-page">
    <header class="sim-header">
      <div class="header-tools">
        <a href="https://github.com/Heinlinhtun/Political-simulator" target="_blank" class="github-link"
          title="View Source on GitHub">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="github-icon">
            <path
              d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.2-.3 2.4 0 3.5-.73 1.02-1.1 2.24-1 3.5 0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4">
            </path>
            <path d="M9 18c-4.51 2-5-2-7-2"></path>
          </svg>
          <span class="github-text">Repo</span>
        </a>

        <label class="field-label language-label" for="language-select">{{ t('language') }}</label>
        <select id="language-select" v-model="language" class="field-input language-input">
          <option value="en">{{ t('english') }}</option>
          <option value="my">{{ t('burmese') }}</option>
        </select>
      </div>
      <h1 class="sim-title">{{ t('title') }}</h1>
      <p class="sim-subtitle">{{ t('subtitle') }}</p>
    </header>

    <div class="sim-layout">
      <aside class="panel panel-controls">
        <h2 class="panel-title">{{ t('parameters') }}</h2>

        <div class="control-stack">
          <div class="control-block control-block--muted">
            <label class="field-label" for="country-select">{{ t('countryProfile') }}</label>
            <select id="country-select" v-model="selectedCountryCode" class="field-input"
              :disabled="countryListLoading">
              <option value="" disabled>{{ t('selectCountry') }}</option>
              <option v-for="country in countries" :key="country.cca2" :value="country.cca2">
                {{ country.name }} ({{ country.cca2 }})
              </option>
            </select>
            <p class="field-note" v-if="countryListLoading">{{ t('loadingCountries') }}</p>
            <p class="field-error" v-if="countryError">{{ countryError }}</p>
            <p class="field-note">{{ t('sourceApis') }}</p>
          </div>

          <label class="slider-field">
            <span class="slider-head">
              {{ t('education') }}
              <strong>{{ params.h }}</strong>
            </span>
            <input type="range" v-model.number="params.h" min="0" max="1" step="0.1" class="slider-input">
          </label>

          <label class="slider-field">
            <span class="slider-head">
              {{ t('civicVirtue') }}
              <strong>{{ params.m }}</strong>
            </span>
            <input type="range" v-model.number="params.m" min="0" max="1" step="0.1" class="slider-input">
          </label>

          <label class="slider-field">
            <span class="slider-head">
              {{ t('discipline') }}
              <strong>{{ params.sd }}</strong>
            </span>
            <input type="range" v-model.number="params.sd" min="0" max="1" step="0.1" class="slider-input">
          </label>

          <label class="slider-field">
            <span class="slider-head">
              {{ t('resources') }}
              <strong>{{ params.r }}</strong>
            </span>
            <input type="range" v-model.number="params.r" min="0" max="1" step="0.1" class="slider-input">
          </label>

          <label class="slider-field">
            <span class="slider-head">
              {{ t('unemployment') }}
              <strong>{{ params.u }}</strong>
            </span>
            <input type="range" v-model.number="params.u" min="0" max="1" step="0.1" class="slider-input">
          </label>

          <label class="slider-field">
            <span class="slider-head">
              {{ t('inflation') }}
              <strong>{{ params.inf }}</strong>
            </span>
            <input type="range" v-model.number="params.inf" min="0" max="1" step="0.1" class="slider-input">
          </label>

          <label class="slider-field">
            <span class="slider-head">
              {{ t('runPeriod') }}
              <strong>{{ runPeriod }}</strong>
            </span>
            <input type="range" v-model.number="runPeriod" min="5" max="120" step="1" class="slider-input">
          </label>

          <div class="control-block">
            <label class="field-label" for="system-select">{{ t('chooseSystem') }}</label>
            <select id="system-select" v-model="selectedSystem" class="field-input">
              <option value="COMMUNISM">{{ t('communism') }}</option>
              <option value="SOCIALISM">{{ t('socialism') }}</option>
              <option value="FEDERALISM">{{ t('federalism') }}</option>
              <option value="CAPITALISM">{{ t('capitalism') }}</option>
            </select>
          </div>

          <button @click="isRunning ? stopSimulation() : startSimulation()"
            :class="['run-button', { 'run-button--stop': isRunning }]"
            :disabled="!selectedCountryCode || profileLoading">
            {{ isRunning ? t('stopSimulation') : t('runSimulation') }}
          </button>
        </div>
      </aside>

      <main class="sim-main">
        <section class="kpi-grid">
          <article class="kpi-card kpi-card--blue">
            <p class="kpi-label">{{ t('currentYear') }}</p>
            <p class="kpi-value">{{ currentCalendarYear }}</p>
          </article>
          <article class="kpi-card kpi-card--green">
            <p class="kpi-label">{{ t('stability') }}</p>
            <p class="kpi-value" :class="{ 'kpi-value--alert': stability < 30 }">{{ stability.toFixed(1) }}%</p>
          </article>
          <article class="kpi-card kpi-card--red">
            <p class="kpi-label">{{ t('corruption') }}</p>
            <p class="kpi-value">{{ corruption.toFixed(1) }}%</p>
          </article>
          <article class="kpi-card kpi-card--amber">
            <p class="kpi-label">{{ t('equality') }}</p>
            <p class="kpi-value">{{ equality.toFixed(1) }}%</p>
          </article>
        </section>

        <section class="panel snapshot-panel">
          <p class="snapshot-title">
            {{ t('countrySnapshot') }}:
            <span class="snapshot-country">{{ selectedCountryName }}</span>
            <span v-if="profileLoading" class="snapshot-loading">({{ t('refreshingData') }})</span>
          </p>
          <div class="snapshot-grid">
            <article class="snapshot-card">
              <p class="snapshot-label">{{ t('population') }}</p>
              <p class="snapshot-value">{{ formatCompactNumber(countryProfile.population) }}</p>
            </article>
            <article class="snapshot-card">
              <p class="snapshot-label">{{ t('gdpPerCapita') }}</p>
              <p class="snapshot-value">{{ formatCurrency(countryProfile.gdpPerCapita) }}</p>
            </article>
            <article class="snapshot-card">
              <p class="snapshot-label">{{ t('literacy') }}</p>
              <p class="snapshot-value">{{ formatPercent(countryProfile.literacyRate) }}</p>
            </article>
            <article class="snapshot-card">
              <p class="snapshot-label">{{ t('govEffectiveness') }}</p>
              <p class="snapshot-value">{{ formatSigned(countryProfile.govEffectiveness) }}</p>
            </article>
            <article class="snapshot-card">
              <p class="snapshot-label">{{ t('ruleOfLaw') }}</p>
              <p class="snapshot-value">{{ formatSigned(countryProfile.ruleOfLaw) }}</p>
            </article>
            <article class="snapshot-card">
              <p class="snapshot-label">{{ t('gini') }}</p>
              <p class="snapshot-value">{{ formatPercent(countryProfile.gini) }}</p>
            </article>
            <article class="snapshot-card">
              <p class="snapshot-label">{{ t('unemploymentRate') }}</p>
              <p class="snapshot-value">{{ formatPercent(countryProfile.unemploymentRate) }}</p>
            </article>
            <article class="snapshot-card">
              <p class="snapshot-label">{{ t('inflationRate') }}</p>
              <p class="snapshot-value">{{ formatPercent(countryProfile.inflationRate) }}</p>
            </article>
          </div>
        </section>

        <section class="panel chart-panel">
          <Line v-if="chartData.labels.length > 0" :data="chartData" :options="chartOptions" />
          <div v-else class="chart-empty">
            {{ t('chartEmpty') }}
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { Line } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement
} from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement);

const REST_COUNTRIES_URL = 'https://restcountries.com/v3.1/all?fields=name,cca2,population,region,subregion';
const WORLD_BANK_BASE_URL = 'https://api.worldbank.org/v2';
const language = ref('en');

const translations = {
  en: {
    language: 'Language',
    english: 'English',
    burmese: 'Burmese',
    title: 'Political System Simulator v2.0',
    subtitle: 'Country-based model with live public data',
    parameters: 'Parameters',
    countryProfile: 'Country Profile',
    selectCountry: 'Select a country',
    loadingCountries: 'Loading countries...',
    sourceApis: 'Source: REST Countries + World Bank',
    education: 'Education (H)',
    civicVirtue: 'Civic Virtue (M)',
    discipline: 'Discipline (Sd)',
    resources: 'Resources (R)',
    unemployment: 'Unemployment Risk (U)',
    inflation: 'Inflation Risk (I)',
    runPeriod: 'Run Period (Years)',
    chooseSystem: 'Choose System',
    communism: 'Communism',
    socialism: 'Socialism',
    federalism: 'Federalism',
    capitalism: 'Capitalism',
    runSimulation: 'Run Simulation',
    stopSimulation: 'Stop Simulation',
    currentYear: 'Current Year',
    stability: 'Stability',
    corruption: 'Corruption',
    equality: 'Equality',
    countrySnapshot: 'Country Snapshot',
    refreshingData: 'Refreshing data...',
    population: 'Population',
    gdpPerCapita: 'GDP/Capita',
    literacy: 'Literacy',
    govEffectiveness: 'Gov. Effectiveness',
    ruleOfLaw: 'Rule Of Law',
    gini: 'Gini',
    unemploymentRate: 'Unemployment',
    inflationRate: 'Inflation',
    chartEmpty: 'Select a country and press "Run Simulation" to model outcomes.',
    noCountrySelected: 'No country selected',
    chartStability: 'Stability %',
    chartCorruption: 'Corruption %',
    chartEquality: 'Equality %',
    errCountryListUnavailable: 'Live country list unavailable. Using offline fallback countries.',
    errWorldBankPartial: 'Some World Bank indicators are unavailable. Using partial data.',
    errWorldBankUnavailable: 'World Bank indicators are unavailable. Using fallback parameter mapping.'
  },
  my: {
    language: 'ဘာသာစကား',
    english: 'အင်္ဂလိပ်',
    burmese: 'မြန်မာ',
    title: 'နိုင်ငံရေးစနစ် Simulator v2.0',
    subtitle: 'တိုင်းပြည်ဒေတာအခြေပြု မော်ဒယ် (Public API)',
    parameters: 'ကန့်သတ်ချက်များ',
    countryProfile: 'နိုင်ငံရွေးချယ်မှု',
    selectCountry: 'နိုင်ငံရွေးချယ်ပါ',
    loadingCountries: 'နိုင်ငံစာရင်း ဖတ်နေသည်...',
    sourceApis: 'ရင်းမြစ်: REST Countries + World Bank',
    education: 'လူထုပညာရေး (H)',
    civicVirtue: 'လူထုကျင့်ဝတ်လိုက်နာမှု (M)',
    discipline: 'တစ်ဦးချင်းစည်းကမ်း (Sd)',
    resources: 'လူ/လူလုပ်/သဘာဝ/ဘဏ္ဍာအရင်းအမြစ် (R)',
    unemployment: 'အလုပ်လက်မဲ့ဖြစ်ခြင်း (U)',
    inflation: 'ငွေကြေးဖောင်းပွမှု (I)',
    runPeriod: 'Run မည့်ကာလ (နှစ်)',
    chooseSystem: 'စနစ်ရွေးချယ်ပါ',
    communism: 'ကွန်မြူနစ်',
    socialism: 'ဆိုရှယ်လစ်',
    federalism: 'ဖက်ဒရယ်',
    capitalism: 'အရင်းရှင်စနစ်',
    runSimulation: 'Simulation စတင်မည်',
    stopSimulation: 'Simulation ရပ်မည်',
    currentYear: 'လက်ရှိနှစ်',
    stability: 'တည်ငြိမ်မှု',
    corruption: 'အကျင့်ပျက်ခြစားမှု',
    equality: 'တန်းတူညီမျှမှု',
    countrySnapshot: 'နိုင်ငံအခြေအနေ',
    refreshingData: 'ဒေတာ ပြန်လည်ဖတ်နေသည်...',
    population: 'လူဦးရေ',
    gdpPerCapita: 'GDP/တစ်ဦးချင်း',
    literacy: 'စာတတ်မြောက်မှု',
    govEffectiveness: 'အုပ်ချုပ်ရေးစွမ်းဆောင်ရည်',
    ruleOfLaw: 'ဥပဒေစိုးမိုးမှု',
    gini: 'ဂီနီ(ဝင်ငွေမညီမျှမှု)',
    unemploymentRate: 'အလုပ်လက်မဲ့နှုန်း',
    inflationRate: 'ငွေကြေးဖောင်းပွမှုနှုန်း',
    chartEmpty: 'နိုင်ငံရွေးပြီး "Simulation စတင်မည်" ကိုနှိပ်ပါ။',
    noCountrySelected: 'နိုင်ငံမရွေးထားသေးပါ',
    chartStability: 'တည်ငြိမ်မှု %',
    chartCorruption: 'အကျင့်ပျက်ခြစားမှု %',
    chartEquality: 'တန်းတူညီမျှမှု %',
    errCountryListUnavailable: 'Live country list မရရှိပါ။ Offline fallback ကိုအသုံးပြုထားသည်။',
    errWorldBankPartial: 'World Bank အချက်အလက်အချို့ မရနိုင်ပါ။ ရရှိသလောက်ဒေတာနဲ့ ဆက်လုပ်မည်။',
    errWorldBankUnavailable: 'World Bank အချက်အလက် မရနိုင်ပါ။ Fallback mapping အသုံးပြုမည်။'
  }
};

const FALLBACK_COUNTRIES = [
  { cca2: 'US', name: 'United States', population: 340000000, region: 'Americas', subregion: 'North America' },
  { cca2: 'DE', name: 'Germany', population: 84000000, region: 'Europe', subregion: 'Western Europe' },
  { cca2: 'JP', name: 'Japan', population: 124000000, region: 'Asia', subregion: 'Eastern Asia' },
  { cca2: 'IN', name: 'India', population: 1430000000, region: 'Asia', subregion: 'Southern Asia' },
  { cca2: 'BR', name: 'Brazil', population: 216000000, region: 'Americas', subregion: 'South America' }
];

const isRunning = ref(false);
const year = ref(0);
const simulationStartYear = ref(new Date().getFullYear());
const runPeriod = ref(30);
const selectedSystem = ref('SOCIALISM');

const countries = ref([]);
const selectedCountryCode = ref('');
const countryListLoading = ref(false);
const profileLoading = ref(false);
const countryErrorKey = ref('');

const params = reactive({ h: 0.5, m: 0.5, sd: 0.5, r: 0.5, u: 0.4, inf: 0.3 });
const stability = ref(60);
const corruption = ref(35);
const equality = ref(50);

const countryProfile = reactive({
  population: null,
  gdpPerCapita: null,
  literacyRate: null,
  govEffectiveness: null,
  ruleOfLaw: null,
  gini: null,
  unemploymentRate: null,
  inflationRate: null
});

let timer = null;

function createEmptyChartData() {
  return {
    labels: [],
    datasets: [
      { label: t('chartStability'), borderColor: '#3b82f6', data: [], tension: 0.25 },
      { label: t('chartCorruption'), borderColor: '#ef4444', data: [], tension: 0.25 },
      { label: t('chartEquality'), borderColor: '#f59e0b', data: [], tension: 0.25 }
    ]
  };
}

const chartData = ref(createEmptyChartData());

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: false,
  plugins: {
    legend: {
      labels: {
        color: '#e5e7eb'
      }
    }
  },
  scales: {
    y: {
      min: 0,
      max: 100
    }
  }
};

const selectedCountryName = computed(() => {
  const country = countries.value.find((item) => item.cca2 === selectedCountryCode.value);
  return country ? country.name : t('noCountrySelected');
});

const currentCalendarYear = computed(() => simulationStartYear.value + year.value);
const countryError = computed(() => (countryErrorKey.value ? t(countryErrorKey.value) : ''));

function t(key) {
  return translations[language.value][key] ?? key;
}

const baselineMetrics = computed(() => {
  const giniPenalty = countryProfile.gini === null ? 0 : Math.max(0, countryProfile.gini - 35) * 0.5;
  const economicStress = params.u * 0.6 + params.inf * 0.4;
  const baselineStability = clamp(40 + params.h * 16 + params.m * 22 + params.sd * 17 + params.r * 10 - economicStress * 20, 25, 95);
  const baselineCorruption = clamp(82 - params.m * 35 - params.sd * 30 - params.h * 14 + economicStress * 14, 5, 90);
  const baselineEquality = clamp(25 + params.h * 27 + params.r * 22 - giniPenalty - params.u * 10, 8, 96);
  return {
    stability: baselineStability,
    corruption: baselineCorruption,
    equality: baselineEquality
  };
});

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function roundToTenth(value) {
  return Math.round(clamp(value, 0, 1) * 10) / 10;
}

function normalizeLinear(value, min, max) {
  if (value === null || value === undefined) return 0.5;
  if (max === min) return 0.5;
  return clamp((value - min) / (max - min), 0, 1);
}

function normalizeLog(value, min, max) {
  if (value === null || value === undefined || value <= 0) return 0.5;
  const logValue = Math.log10(value);
  return normalizeLinear(logValue, Math.log10(min), Math.log10(max));
}

async function fetchWorldBankLatest(countryCode, indicatorCode) {
  const endpoint = `${WORLD_BANK_BASE_URL}/country/${countryCode}/indicator/${indicatorCode}?format=json&per_page=80`;
  const response = await fetch(endpoint);
  if (!response.ok) {
    throw new Error(`Failed to fetch indicator ${indicatorCode}`);
  }

  const payload = await response.json();
  const rows = Array.isArray(payload) ? payload[1] : null;
  if (!Array.isArray(rows)) return null;

  const latest = rows.find((row) => row && row.value !== null);
  if (!latest) return null;

  return Number(latest.value);
}

async function loadCountryList() {
  countryListLoading.value = true;
  countryErrorKey.value = '';

  try {
    const response = await fetch(REST_COUNTRIES_URL);
    if (!response.ok) {
      throw new Error('Country list failed');
    }

    const data = await response.json();
    countries.value = data
      .filter((item) => item.cca2 && item.name && item.name.common)
      .map((item) => ({
        cca2: item.cca2,
        name: item.name.common,
        population: item.population ?? null,
        region: item.region ?? null,
        subregion: item.subregion ?? null
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    countries.value = FALLBACK_COUNTRIES;
    countryErrorKey.value = 'errCountryListUnavailable';
  } finally {
    countryListLoading.value = false;
  }

  if (!selectedCountryCode.value && countries.value.length > 0) {
    const defaultCountry = countries.value.find((country) => country.cca2 === 'US') || countries.value[0];
    selectedCountryCode.value = defaultCountry.cca2;
  }
}

function applyCountryParameters(country) {
  const literacy = normalizeLinear(countryProfile.literacyRate, 50, 100);
  const govEffectiveness = normalizeLinear(countryProfile.govEffectiveness, -2.5, 2.5);
  const ruleOfLaw = normalizeLinear(countryProfile.ruleOfLaw, -2.5, 2.5);
  const gdp = normalizeLog(countryProfile.gdpPerCapita, 1200, 90000);
  const popScale = normalizeLog(country.population, 1000000, 1450000000);
  const unemployment = normalizeLinear(countryProfile.unemploymentRate, 2, 30);
  const inflation = normalizeLinear(Math.abs(countryProfile.inflationRate), 0, 40);

  params.h = roundToTenth(countryProfile.literacyRate === null ? 0.45 + popScale * 0.2 : literacy);
  params.m = roundToTenth(countryProfile.govEffectiveness === null ? 0.45 : govEffectiveness);
  params.sd = roundToTenth(countryProfile.ruleOfLaw === null ? 0.45 : ruleOfLaw);
  params.r = roundToTenth(countryProfile.gdpPerCapita === null ? 0.45 + popScale * 0.2 : gdp);
  params.u = roundToTenth(countryProfile.unemploymentRate === null ? 0.4 : unemployment);
  params.inf = roundToTenth(countryProfile.inflationRate === null ? 0.3 : inflation);
}

async function loadCountryProfile(countryCode) {
  const selectedCountry = countries.value.find((country) => country.cca2 === countryCode);
  if (!selectedCountry) return;

  profileLoading.value = true;
  countryErrorKey.value = '';

  countryProfile.population = selectedCountry.population ?? null;
  countryProfile.gdpPerCapita = null;
  countryProfile.literacyRate = null;
  countryProfile.govEffectiveness = null;
  countryProfile.ruleOfLaw = null;
  countryProfile.gini = null;
  countryProfile.unemploymentRate = null;
  countryProfile.inflationRate = null;

  try {
    const indicators = await Promise.allSettled([
      fetchWorldBankLatest(countryCode, 'NY.GDP.PCAP.CD'),
      fetchWorldBankLatest(countryCode, 'SE.ADT.LITR.ZS'),
      fetchWorldBankLatest(countryCode, 'GE.EST'),
      fetchWorldBankLatest(countryCode, 'RL.EST'),
      fetchWorldBankLatest(countryCode, 'SI.POV.GINI'),
      fetchWorldBankLatest(countryCode, 'SL.UEM.TOTL.ZS'),
      fetchWorldBankLatest(countryCode, 'FP.CPI.TOTL.ZG')
    ]);

    countryProfile.gdpPerCapita = indicators[0].status === 'fulfilled' ? indicators[0].value : null;
    countryProfile.literacyRate = indicators[1].status === 'fulfilled' ? indicators[1].value : null;
    countryProfile.govEffectiveness = indicators[2].status === 'fulfilled' ? indicators[2].value : null;
    countryProfile.ruleOfLaw = indicators[3].status === 'fulfilled' ? indicators[3].value : null;
    countryProfile.gini = indicators[4].status === 'fulfilled' ? indicators[4].value : null;
    countryProfile.unemploymentRate = indicators[5].status === 'fulfilled' ? indicators[5].value : null;
    countryProfile.inflationRate = indicators[6].status === 'fulfilled' ? indicators[6].value : null;

    const failedCount = indicators.filter((result) => result.status === 'rejected').length;
    if (failedCount > 0) {
      countryErrorKey.value = 'errWorldBankPartial';
    }
  } catch (error) {
    countryErrorKey.value = 'errWorldBankUnavailable';
  } finally {
    applyCountryParameters(selectedCountry);
    if (!isRunning.value) {
      resetMetricsFromBaseline();
    }
    profileLoading.value = false;
  }
}

function resetMetricsFromBaseline() {
  stability.value = baselineMetrics.value.stability;
  corruption.value = baselineMetrics.value.corruption;
  equality.value = baselineMetrics.value.equality;
}

function resetChart() {
  chartData.value = createEmptyChartData();
}

function appendChartPoint(nextYear, nextStability, nextCorruption, nextEquality) {
  const current = chartData.value;
  chartData.value = {
    labels: [...current.labels, nextYear],
    datasets: [
      { ...current.datasets[0], data: [...current.datasets[0].data, nextStability] },
      { ...current.datasets[1], data: [...current.datasets[1].data, nextCorruption] },
      { ...current.datasets[2], data: [...current.datasets[2].data, nextEquality] }
    ]
  };
}

function runYearlyUpdate() {
  if (!isRunning.value) return;

  year.value += 1;

  const structuralStrength = params.h * 0.2 + params.m * 0.35 + params.sd * 0.3 + params.r * 0.15;
  const governance = params.m * 0.55 + params.sd * 0.45;
  const resourceStress = 1 - params.r;
  const economicStress = params.u * 0.6 + params.inf * 0.4;
  const volatility = 0.5 + resourceStress * 1.5 + Math.max(0, (45 - equality.value) / 100);
  const shock = (Math.random() - 0.5) * volatility;

  let stabilityDelta = 0;
  let corruptionDelta = 0;
  let equalityDelta = 0;

  if (selectedSystem.value === 'COMMUNISM') {
    corruptionDelta = 1.2 + (1 - params.m) * 2.0 + (1 - params.sd) * 1.3 + economicStress * 1.1 + shock * 0.3;
    equalityDelta = 0.7 + params.h * 0.8 + params.r * 0.6 - params.u * 0.8 - corruption.value * 0.02 - Math.abs(shock) * 0.4;
    stabilityDelta = governance * 2.3 + (equality.value / 100) * 1.0 - economicStress * 1.9 - (corruption.value / 100) * 2.7 - Math.abs(shock) * 1.4 - 0.6;
  } else if (selectedSystem.value === 'SOCIALISM') {
    corruptionDelta = 1.0 + resourceStress * 1.0 + (1 - governance) * 1.3 + economicStress * 0.9 + shock * 0.2;
    equalityDelta = 0.5 + params.h * 0.6 + params.r * 0.9 - params.u * 0.6 - corruption.value * 0.018 - Math.abs(shock) * 0.25;
    stabilityDelta = structuralStrength * 2.5 + (equality.value / 100) * 0.7 - economicStress * 1.5 - (corruption.value / 100) * 2.2 - Math.abs(shock) * 1.0 - 0.2;
  } else if (selectedSystem.value === 'FEDERALISM') {
    corruptionDelta = 1.5 + (1 - governance) * 1.7 + resourceStress * 0.6 + economicStress * 1.0 + shock * 0.25;
    equalityDelta = 0.2 + params.h * 0.7 + params.r * 0.4 - params.u * 0.55 - corruption.value * 0.015 - Math.abs(shock) * 0.2;
    stabilityDelta = structuralStrength * 2.0 + params.sd * 1.0 - economicStress * 1.7 - (corruption.value / 100) * 2.0 - Math.abs(shock) * 1.1;
  } else if (selectedSystem.value === 'CAPITALISM') {
    const inequalityPressure = Math.max(0, (50 - equality.value) / 100);
    corruptionDelta = 0.8 + resourceStress * 0.7 + (1 - governance) * 1.4 + inequalityPressure * 1.3 + economicStress * 1.15 + shock * 0.2;
    equalityDelta = -0.5 + params.h * 0.65 + params.r * 0.35 - params.u * 0.9 - corruption.value * 0.017 - Math.abs(shock) * 0.35;
    stabilityDelta =
      structuralStrength * 2.2 +
      params.r * 1.0 -
      inequalityPressure * 2.0 -
      economicStress * 1.8 -
      (corruption.value / 100) * 2.3 -
      Math.abs(shock) * 1.0;
  } else {
    corruptionDelta = 1.0 + resourceStress * 1.0 + (1 - governance) * 1.3 + economicStress * 1.0 + shock * 0.2;
    equalityDelta = 0.5 + params.h * 0.6 + params.r * 0.9 - params.u * 0.6 - corruption.value * 0.018 - Math.abs(shock) * 0.25;
    stabilityDelta = structuralStrength * 2.5 + (equality.value / 100) * 0.7 - economicStress * 1.6 - (corruption.value / 100) * 2.2 - Math.abs(shock) * 1.0 - 0.2;
  }

  corruption.value = clamp(corruption.value + corruptionDelta, 0, 100);
  equality.value = clamp(equality.value + equalityDelta, 0, 100);
  stability.value = clamp(stability.value + stabilityDelta, 0, 100);

  appendChartPoint(currentCalendarYear.value, stability.value, corruption.value, equality.value);

  if (stability.value <= 0 || year.value >= runPeriod.value) {
    stopSimulation();
  }
}

function stopSimulation() {
  if (timer !== null) {
    clearInterval(timer);
    timer = null;
  }
  isRunning.value = false;
}

function startSimulation() {
  stopSimulation();

  simulationStartYear.value = new Date().getFullYear();
  year.value = 0;
  resetMetricsFromBaseline();
  resetChart();
  appendChartPoint(currentCalendarYear.value, stability.value, corruption.value, equality.value);

  isRunning.value = true;
  timer = setInterval(runYearlyUpdate, 1000);
}

function formatCompactNumber(value) {
  if (value === null || value === undefined) return 'N/A';
  return new Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 1 }).format(value);
}

function formatCurrency(value) {
  if (value === null || value === undefined) return 'N/A';
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(value);
}

function formatPercent(value) {
  if (value === null || value === undefined) return 'N/A';
  return `${Number(value).toFixed(1)}%`;
}

function formatSigned(value) {
  if (value === null || value === undefined) return 'N/A';
  const sign = value > 0 ? '+' : '';
  return `${sign}${Number(value).toFixed(2)}`;
}

watch(language, () => {
  chartData.value = {
    ...chartData.value,
    datasets: chartData.value.datasets.map((dataset, index) => {
      const labelKeys = ['chartStability', 'chartCorruption', 'chartEquality'];
      return { ...dataset, label: t(labelKeys[index]) };
    })
  };
});

watch(selectedCountryCode, async (countryCode) => {
  if (!countryCode) return;
  if (isRunning.value) {
    stopSimulation();
  }
  await loadCountryProfile(countryCode);
});

watch(
  () => [params.h, params.m, params.sd, params.r, params.u, params.inf, countryProfile.gini],
  () => {
    if (!isRunning.value) {
      resetMetricsFromBaseline();
    }
  }
);

watch(runPeriod, (nextPeriod) => {
  runPeriod.value = clamp(Math.round(nextPeriod), 5, 120);
  if (isRunning.value && year.value >= runPeriod.value) {
    stopSimulation();
  }
});

onMounted(async () => {
  await loadCountryList();
});

onBeforeUnmount(() => {
  stopSimulation();
});
</script>

<style scoped>
.sim-page {
  min-height: 100vh;
  padding: 20px;
  color: #f4f6ff;
  background:
    radial-gradient(900px 500px at 10% -10%, rgba(29, 78, 216, 0.35), transparent 55%),
    radial-gradient(700px 420px at 95% 0%, rgba(5, 150, 105, 0.22), transparent 60%),
    #0b1320;
}

.sim-header {
  position: relative;
  text-align: center;
  margin: 0 auto 20px;
  max-width: 1300px;
  padding-top: 2px;
}

.header-tools {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.language-input {
  min-width: 96px;
  width: auto;
  padding: 5px 8px;
  font-size: 0.78rem;
  border-radius: 8px;
}

.language-label {
  font-size: 0.75rem;
  color: #9fb1d5;
}

.sim-title {
  margin: 0;
  font-size: clamp(1.5rem, 1.1rem + 2vw, 2.3rem);
  line-height: 1.15;
  letter-spacing: 0.01em;
  color: #8dc5ff;
}

.sim-subtitle {
  margin: 8px 0 0;
  color: #a9b4cc;
  font-size: 0.98rem;
}

.sim-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  align-items: start;
  max-width: 1300px;
  margin: 0 auto;
}

.panel {
  background: rgba(11, 19, 32, 0.75);
  border: 1px solid rgba(163, 183, 216, 0.2);
  border-radius: 14px;
  backdrop-filter: blur(5px);
}

.panel-controls {
  padding: 16px;
}

.panel-title {
  margin: 0 0 14px;
  font-size: 1.08rem;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(163, 183, 216, 0.2);
  color: #e6edff;
}

.control-stack {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.control-block {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.control-block--muted {
  border-bottom: 1px solid rgba(163, 183, 216, 0.2);
  padding-bottom: 12px;
}

.field-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #c6d3ef;
}

.field-input {
  width: 100%;
  border: 1px solid #32425e;
  border-radius: 10px;
  background: #152136;
  color: #f5f8ff;
  padding: 10px 12px;
  font-size: 0.95rem;
}

.field-input:focus-visible {
  outline: 2px solid #4f9cff;
  outline-offset: 2px;
}

.github-link {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(163, 183, 216, 0.2);
  border-radius: 8px;
  color: #c6d3ef;
  text-decoration: none;
  font-size: 0.78rem;
  transition: all 0.2s ease;
  margin-right: 8px;
}

.github-link:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: #4f9cff;
  color: #4f9cff;
  transform: translateY(-1px);
}

.github-icon {
  color: currentColor;
}

@media (max-width: 480px) {
  .github-text {
    display: none;
    /* ဖုန်းမှာဆိုရင် စာသားဖျောက်ပြီး Logo ပဲပြမယ် */
  }

  .github-link {
    padding: 5px;
    margin-right: 4px;
  }
}

.field-note {
  margin: 0;
  color: #8fa1c4;
  font-size: 0.78rem;
}

.field-error {
  margin: 0;
  color: #f3c66b;
  font-size: 0.78rem;
}

.slider-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.slider-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.9rem;
  color: #dbe4f7;
}

.slider-input {
  width: 100%;
  cursor: pointer;
  accent-color: #4f9cff;
}

.slider-input:focus-visible {
  outline: 2px solid #4f9cff;
  outline-offset: 2px;
}

.run-button {
  margin-top: 2px;
  border: 0;
  border-radius: 10px;
  padding: 12px;
  font-weight: 700;
  font-size: 0.96rem;
  color: #eef5ff;
  background: linear-gradient(120deg, #1d4ed8, #2563eb);
  cursor: pointer;
  transition: transform 0.16s ease, filter 0.16s ease;
}

.run-button:hover {
  transform: translateY(-1px);
  filter: brightness(1.08);
}

.run-button--stop {
  background: linear-gradient(120deg, #b91c1c, #dc2626);
}

.run-button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  transform: none;
  filter: none;
}

.sim-main {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.kpi-card {
  background: rgba(11, 19, 32, 0.72);
  border: 1px solid rgba(163, 183, 216, 0.2);
  border-radius: 12px;
  padding: 12px 14px;
  border-left: 4px solid #4f9cff;
}

.kpi-card--blue {
  border-left-color: #3b82f6;
}

.kpi-card--green {
  border-left-color: #22c55e;
}

.kpi-card--red {
  border-left-color: #ef4444;
}

.kpi-card--amber {
  border-left-color: #f59e0b;
}

.kpi-label {
  margin: 0;
  font-size: 0.71rem;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: #9aa9c8;
}

.kpi-value {
  margin: 8px 0 0;
  font-size: clamp(1.3rem, 1.05rem + 1vw, 1.9rem);
  font-weight: 700;
  color: #f3f7ff;
}

.kpi-value--alert {
  color: #ff7c7c;
}

.snapshot-panel {
  padding: 14px;
}

.snapshot-title {
  margin: 0 0 10px;
  font-size: 0.9rem;
  color: #b9c6e0;
}

.snapshot-country {
  color: #f2f6ff;
  font-weight: 700;
  margin-left: 4px;
}

.snapshot-loading {
  margin-left: 8px;
  color: #9aa9c8;
  font-size: 0.78rem;
}

.snapshot-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.snapshot-card {
  background: rgba(14, 28, 48, 0.74);
  border: 1px solid rgba(163, 183, 216, 0.18);
  border-radius: 10px;
  padding: 10px;
}

.snapshot-label {
  margin: 0;
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #9aa9c8;
}

.snapshot-value {
  margin: 6px 0 0;
  font-size: 0.95rem;
  color: #f0f5ff;
  overflow-wrap: anywhere;
}

.chart-panel {
  min-height: 300px;
  height: clamp(300px, 48vh, 460px);
  padding: 14px;
}

.chart-empty {
  display: grid;
  place-items: center;
  text-align: center;
  height: 100%;
  color: #8fa1c4;
  font-style: italic;
  padding: 20px;
}

input[type='range']::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 14px;
  height: 14px;
  background: #eff6ff;
  border: 2px solid #1d4ed8;
  border-radius: 50%;
}

@media (min-width: 760px) {
  .sim-page {
    padding: 24px;
  }

  .kpi-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
  }

  .snapshot-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
  }

  .panel-controls {
    padding: 18px;
  }
}

@media (min-width: 1120px) {
  .sim-layout {
    grid-template-columns: 360px minmax(0, 1fr);
    gap: 18px;
  }

  .panel-controls {
    position: sticky;
    top: 16px;
  }
}

@media (max-width: 480px) {
  .sim-page {
    padding: 14px;
  }

  .header-tools {
    top: -2px;
    right: 0;
  }

  .language-input {
    min-width: 82px;
    font-size: 0.73rem;
    padding: 4px 6px;
  }

  .language-label {
    font-size: 0.68rem;
  }

  .panel-controls,
  .snapshot-panel,
  .chart-panel {
    padding: 12px;
  }

  .snapshot-grid {
    grid-template-columns: 1fr;
  }

  .run-button {
    padding: 11px;
  }
}
</style>
