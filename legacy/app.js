/**
 * Sistema Oposiciones TAI - Interactive Study & Simulation Engine.
 * Supports dual hybrid operation (Static zero-cost CDN or ASP.NET Core 10 local REST API).
 * Enforces official INAP public examination scoring (+1.0 correct, -0.33 wrong, 0 blank) and localStorage analytics.
 */

const STORAGE_KEY = "nain_tai_analytics_v1";

const state = {
  mode: "loading", // "local" | "static"
  blocks: [],
  topics: [],
  questions: [],
  answersKey: {}, // Maps question ID string to correct option ID integer
  currentTest: [],
  userSelections: new Map(), // Maps question ID integer to selected option ID integer
  isStudyMode: true,
  timerId: null,
  secondsRemaining: 0,
  analytics: null
};

const els = {
  modeBadge: document.getElementById("modeBadge"),
  tabSimulacroBtn: document.getElementById("tabSimulacroBtn"),
  tabAnalyticBtn: document.getElementById("tabAnalyticBtn"),
  viewSimulacro: document.getElementById("viewSimulacro"),
  viewAnalytics: document.getElementById("viewAnalytics"),

  blockSelect: document.getElementById("blockSelect"),
  topicSelect: document.getElementById("topicSelect"),
  difficultySelect: document.getElementById("difficultySelect"),
  countSelect: document.getElementById("countSelect"),
  generateBtn: document.getElementById("generateBtn"),

  configSection: document.getElementById("configSection"),
  testSection: document.getElementById("testSection"),
  resultSection: document.getElementById("resultSection"),
  testTitle: document.getElementById("testTitle"),
  timerBanner: document.getElementById("timerBanner"),
  timerDisplay: document.getElementById("timerDisplay"),
  questionHost: document.getElementById("questionHost"),
  
  finishBtn: document.getElementById("finishBtn"),
  cancelBtn: document.getElementById("cancelBtn"),
  reviewBtn: document.getElementById("reviewBtn"),
  newTestBtn: document.getElementById("newTestBtn"),
  
  examScoreGrid: document.getElementById("examScoreGrid"),
  examAdviceBox: document.getElementById("examAdviceBox"),

  kpiTotalTests: document.getElementById("kpiTotalTests"),
  kpiAvgScore: document.getElementById("kpiAvgScore"),
  kpiWinRate: document.getElementById("kpiWinRate"),
  kpiTotalQuestions: document.getElementById("kpiTotalQuestions"),
  blockStatsTableBody: document.getElementById("blockStatsTableBody"),
  resetStatsBtn: document.getElementById("resetStatsBtn")
};

// ==========================================
// DATA LOADING & INITIALIZATION
// ==========================================

async function initApplication() {
  loadAnalyticsFromStorage();
  setupEventListeners();

  const apiSuccess = await tryLocalApi();
  if (apiSuccess) {
    try {
      await loadLocalData();
      setMode("local");
    } catch (e) {
      console.warn("Failed retrieving data from local API, falling back to static CDN.", e);
      await loadStaticData();
      setMode("static");
    }
  } else {
    await loadStaticData();
    setMode("static");
  }

  fillBlocks();
  fillTopics();
  renderAnalyticsView();
}

async function tryLocalApi() {
  if (location.protocol === "https:") return false;
  if (location.hostname !== "localhost" && location.hostname !== "127.0.0.1") return false;
  try {
    const response = await fetch("http://localhost:5298/api/health/db", { mode: "cors" });
    if (!response.ok) return false;
    const data = await response.json();
    return data && data.ok === true;
  } catch {
    return false;
  }
}

async function loadStaticData() {
  const [blocks, topics, questions, answersKey] = await Promise.all([
    fetch("./data/blocks.json").then(r => r.json()),
    fetch("./data/topics.json").then(r => r.json()),
    fetch("./data/questions.json").then(r => r.json()),
    fetch("./data/answers.json").then(r => r.json())
  ]);

  state.blocks = blocks;
  state.topics = topics;
  state.questions = questions;
  state.answersKey = answersKey;
}

async function loadLocalData() {
  const blocks = await fetch("http://localhost:5298/api/syllabus/blocks").then(r => r.json());
  const topics = await fetch("http://localhost:5298/api/syllabus/topics").then(r => r.json());
  const questions = await fetch("http://localhost:5298/api/tests/all").then(r => r.json()).catch(async () => {
    return await fetch("./data/questions.json").then(r => r.json());
  });
  const answersKey = await fetch("./data/answers.json").then(r => r.json());

  state.blocks = blocks;
  state.topics = topics;
  state.questions = questions;
  state.answersKey = answersKey;
}

function setMode(mode) {
  state.mode = mode;
  els.modeBadge.textContent = `Conexión: ${mode === "local" ? "API .NET 10 Local" : "Cloud Estático 0€"}`;
  els.modeBadge.style.borderColor = mode === "local" ? "#22c55e" : "#2563eb";
  els.modeBadge.style.color = mode === "local" ? "#86efac" : "#60a5fa";
}

// ==========================================
// FORM SELECTORS & UTILS
// ==========================================

function fillBlocks() {
  els.blockSelect.replaceChildren(new Option("Todos los bloques TAI", "0"));
  for (const b of state.blocks) {
    els.blockSelect.append(new Option(`${b.code} - ${b.name}`, String(b.id)));
  }
}

function getTopicsForBlock(blockId) {
  if (blockId === 0) return state.topics;
  return state.topics.filter(t => t.blockId === blockId);
}

function fillTopics() {
  const blockId = Number(els.blockSelect.value);
  const topics = getTopicsForBlock(blockId);

  els.topicSelect.replaceChildren(new Option("Todos los temas de la selección", "0"));
  for (const t of topics) {
    els.topicSelect.append(new Option(`Tema ${t.topicNumber}. ${t.title}`, String(t.id)));
  }
}

function shuffle(array) {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ==========================================
// SIMULATION & TEST RENDERING
// ==========================================

function startSimulation() {
  const blockId = Number(els.blockSelect.value);
  const topicId = Number(els.topicSelect.value);
  const difficulty = Number(els.difficultySelect.value);
  const requestedCount = Number(els.countSelect.value);

  const radioSelected = document.querySelector('input[name="studyMode"]:checked');
  state.isStudyMode = (radioSelected && radioSelected.value === "study");

  let filtered = state.questions.slice();
  if (blockId > 0) {
    const validTopicIds = new Set(state.topics.filter(t => t.blockId === blockId).map(t => t.id));
    filtered = filtered.filter(q => validTopicIds.has(q.topicId));
  }
  if (topicId > 0) {
    filtered = filtered.filter(q => q.topicId === topicId);
  }
  if (difficulty > 0) {
    filtered = filtered.filter(q => q.difficulty === difficulty);
  }

  if (filtered.length === 0) {
    alert("No hay preguntas registradas con esa combinación exacta de filtros. Prueba ampliando la dificultad o el bloque.");
    return;
  }

  filtered = shuffle(filtered).slice(0, requestedCount);
  state.currentTest = filtered;
  state.userSelections.clear();

  els.configSection.classList.add("hidden");
  els.resultSection.classList.add("hidden");
  els.testSection.classList.remove("hidden");
  els.testTitle.textContent = state.isStudyMode ? `Práctica Activa (${filtered.length} preguntas)` : `Simulacro Oficial INAP (${filtered.length} preguntas)`;

  if (!state.isStudyMode) {
    startExamTimer(filtered.length * 60);
    els.timerBanner.classList.remove("hidden");
  } else {
    els.timerBanner.classList.add("hidden");
  }

  renderTestQuestions();
  window.scrollTo({ top: els.testSection.offsetTop - 80, behavior: "smooth" });
}

function renderTestQuestions() {
  els.questionHost.replaceChildren();
  const fragment = document.createDocumentFragment();

  state.currentTest.forEach((question, idx) => {
    const questionEl = createQuestionCard(question, idx + 1);
    fragment.append(questionEl);
  });

  els.questionHost.append(fragment);
}

function createQuestionCard(question, questionNumber) {
  const wrapper = document.createElement("div");
  wrapper.className = "question-item";
  wrapper.id = `q_card_${question.id}`;

  const title = document.createElement("div");
  title.className = "question-title";
  title.innerHTML = `<strong>${questionNumber}.</strong> ${question.statement}`;

  const optionsList = document.createElement("div");
  optionsList.className = "options-list";

  const correctOptionId = Number(state.answersKey[String(question.id)]);

  question.options.forEach(option => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "option-btn";
    btn.dataset.optionId = option.id;
    btn.innerHTML = `<span>${String.fromCharCode(64 + option.sortOrder)}.</span> <span>${option.text}</span>`;

    btn.addEventListener("click", () => handleOptionClick(question, option.id, wrapper, correctOptionId));
    optionsList.append(btn);
  });

  const explanationDiv = document.createElement("div");
  explanationDiv.className = "explanation-box hidden";
  explanationDiv.id = `explain_${question.id}`;

  const topicObj = state.topics.find(t => t.id === question.topicId);
  const blockObj = topicObj ? state.blocks.find(b => b.id === topicObj.blockId) : null;
  const blockName = blockObj ? `${blockObj.code} (${blockObj.name})` : "Temario TAI";

  explanationDiv.innerHTML = `<b>Fundamento y Repaso:</b> La respuesta correcta en las convocatorias oficiales corresponde a la opción señalada en verde. Tema de estudio asociado: <i>${blockName}</i>.`;

  wrapper.append(title, optionsList, explanationDiv);
  return wrapper;
}

function handleOptionClick(question, clickedOptionId, cardElement, correctOptionId) {
  const allBtns = cardElement.querySelectorAll(".option-btn");

  if (state.isStudyMode && state.userSelections.has(question.id)) {
    return;
  }

  state.userSelections.set(question.id, clickedOptionId);

  if (state.isStudyMode) {
    allBtns.forEach(b => {
      b.classList.add("disabled");
      const optId = Number(b.dataset.optionId);
      if (optId === correctOptionId) {
        b.classList.add("correct");
      } else if (optId === clickedOptionId) {
        b.classList.add("incorrect");
      }
    });

    const explanationDiv = document.getElementById(`explain_${question.id}`);
    if (explanationDiv) explanationDiv.classList.remove("hidden");
  } else {
    allBtns.forEach(b => {
      b.classList.toggle("selected", Number(b.dataset.optionId) === clickedOptionId);
    });
  }
}

// ==========================================
// EXAM TIMING & GRADING ENGINE
// ==========================================

function startExamTimer(seconds) {
  clearInterval(state.timerId);
  state.secondsRemaining = seconds;
  updateTimerDisplay();

  state.timerId = setInterval(() => {
    state.secondsRemaining--;
    updateTimerDisplay();

    if (state.secondsRemaining <= 0) {
      clearInterval(state.timerId);
      alert("Tiempo agotado. El examen se evaluará automáticamente según las normas del INAP.");
      finishAndGradeTest();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const mins = Math.floor(state.secondsRemaining / 60);
  const secs = state.secondsRemaining % 60;
  els.timerDisplay.textContent = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function finishAndGradeTest() {
  clearInterval(state.timerId);
  els.testSection.classList.add("hidden");
  els.resultSection.classList.remove("hidden");

  let correctCount = 0;
  let wrongCount = 0;
  let blankCount = 0;

  const blockPerformance = {};

  state.currentTest.forEach(question => {
    const correctOptId = Number(state.answersKey[String(question.id)]);
    const userSelected = state.userSelections.get(question.id);
    const topicObj = state.topics.find(t => t.id === question.topicId);
    const blockId = topicObj ? topicObj.blockId : 0;

    if (!blockPerformance[blockId]) {
      blockPerformance[blockId] = { total: 0, correct: 0, wrong: 0 };
    }
    blockPerformance[blockId].total++;

    if (userSelected === undefined) {
      blankCount++;
    } else if (userSelected === correctOptId) {
      correctCount++;
      blockPerformance[blockId].correct++;
    } else {
      wrongCount++;
      blockPerformance[blockId].wrong++;
    }
  });

  const netPoints = (correctCount * 1.0) - (wrongCount * 0.33);
  const maxPossible = state.currentTest.length * 1.0;
  const officialGrade = Math.max(0.0, (netPoints / maxPossible) * 10.0);

  renderGradeSummary(officialGrade, correctCount, wrongCount, blankCount, netPoints);
  saveTestToAnalytics(officialGrade, correctCount, wrongCount, blankCount, blockPerformance);
  window.scrollTo({ top: els.resultSection.offsetTop - 80, behavior: "smooth" });
}

function renderGradeSummary(grade, correct, wrong, blank, netPoints) {
  els.examScoreGrid.innerHTML = `
    <div class="kpi-card">
      <div class="kpi-title">Nota Baremada INAP</div>
      <div class="kpi-value" style="color: ${grade >= 5.0 ? '#22c55e' : '#ef4444'}">${grade.toFixed(2)} / 10</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-title">Aciertos (+1,00 pt)</div>
      <div class="kpi-value" style="color: #22c55e;">${correct}</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-title">Fallos (-0,33 pts)</div>
      <div class="kpi-value" style="color: #ef4444;">${wrong}</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-title">En Blanco (0,00 pts)</div>
      <div class="kpi-value" style="color: #94a3b8;">${blank}</div>
    </div>
  `;

  let adviceHTML = "";
  if (grade >= 7.0) {
    adviceHTML = `<div style="padding: 16px; border-radius: 8px; background: rgba(22, 101, 52, 0.3); border: 1px solid #22c55e; color: #86efac;">
      <b>Nivel Sobresaliente de Oposición:</b> Con esta puntuación obtendrías una plaza competitiva. Mantén el ritmo de repaso en tu portafolio y simulacros diarios.
    </div>`;
  } else if (grade >= 5.0) {
    adviceHTML = `<div style="padding: 16px; border-radius: 8px; background: rgba(37, 99, 235, 0.2); border: 1px solid #3b82f6; color: #93c5fd;">
      <b>Aprobado Competitivo:</b> Has superado el corte del 5, pero en la Administración General cada décima cuenta. Te recomendamos ir al Panel de Analítica para repasar tu bloque más débil.
    </div>`;
  } else {
    adviceHTML = `<div style="padding: 16px; border-radius: 8px; background: rgba(153, 27, 27, 0.3); border: 1px solid #ef4444; color: #fca5a5;">
      <b>Atención al Baremo:</b> Recuerda que los errores restan 0,33 puntos en el examen oficial TAI. Utiliza el Modo Estudio sin cronómetro para memorizar primero los artículos de ley y protocolos de red sin arriesgar en exceso.
    </div>`;
  }
  els.examAdviceBox.innerHTML = adviceHTML;
}

function reviewTestSolutions() {
  els.resultSection.classList.add("hidden");
  els.testSection.classList.remove("hidden");
  els.timerBanner.classList.add("hidden");
  els.testTitle.textContent = "Revisión de Soluciones del Examen";

  state.isStudyMode = true;

  state.currentTest.forEach(question => {
    const card = document.getElementById(`q_card_${question.id}`);
    if (!card) return;

    const correctOptionId = Number(state.answersKey[String(question.id)]);
    const userSelected = state.userSelections.get(question.id);
    const allBtns = card.querySelectorAll(".option-btn");

    allBtns.forEach(b => {
      b.classList.add("disabled");
      const optId = Number(b.dataset.optionId);
      if (optId === correctOptionId) {
        b.classList.add("correct");
      } else if (optId === userSelected && optId !== correctOptionId) {
        b.classList.add("incorrect");
      }
    });

    const explanationDiv = document.getElementById(`explain_${question.id}`);
    if (explanationDiv) explanationDiv.classList.remove("hidden");
  });

  window.scrollTo({ top: els.testSection.offsetTop - 80, behavior: "smooth" });
}

function abandonSimulation() {
  if (confirm("¿Seguro que deseas abandonar el simulacro en curso? No se computará en tu historial.")) {
    clearInterval(state.timerId);
    els.testSection.classList.add("hidden");
    els.resultSection.classList.add("hidden");
    els.configSection.classList.remove("hidden");
  }
}

// ==========================================
// LOCALSTORAGE ANALYTICS & STATS ENGINE
// ==========================================

function loadAnalyticsFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      state.analytics = JSON.parse(raw);
    }
  } catch (e) {
    console.error("Error reading localStorage analytics, initializing default state.", e);
  }

  if (!state.analytics) {
    state.analytics = {
      totalTests: 0,
      sumScores10: 0.0,
      totalQuestions: 0,
      totalCorrect: 0,
      totalWrong: 0,
      blockStats: {}
    };
  }
}

function saveTestToAnalytics(grade, correct, wrong, blank, blockPerformance) {
  state.analytics.totalTests++;
  state.analytics.sumScores10 += grade;
  state.analytics.totalQuestions += (correct + wrong + blank);
  state.analytics.totalCorrect += correct;
  state.analytics.totalWrong += wrong;

  for (const [blockIdStr, perf] of Object.entries(blockPerformance)) {
    const bId = String(blockIdStr);
    if (!state.analytics.blockStats[bId]) {
      state.analytics.blockStats[bId] = { total: 0, correct: 0, wrong: 0 };
    }
    state.analytics.blockStats[bId].total += perf.total;
    state.analytics.blockStats[bId].correct += perf.correct;
    state.analytics.blockStats[bId].wrong += perf.wrong;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.analytics));
  } catch (e) {
    console.warn("Failed writing analytics to localStorage.", e);
  }

  renderAnalyticsView();
}

function renderAnalyticsView() {
  const ana = state.analytics;
  els.kpiTotalTests.textContent = String(ana.totalTests);
  
  const avg = ana.totalTests > 0 ? (ana.sumScores10 / ana.totalTests) : 0.0;
  els.kpiAvgScore.textContent = `${avg.toFixed(2)} / 10`;

  const winRate = ana.totalQuestions > 0 ? ((ana.totalCorrect / ana.totalQuestions) * 100).toFixed(0) : 0;
  els.kpiWinRate.textContent = `${winRate} %`;

  els.kpiTotalQuestions.textContent = String(ana.totalQuestions);

  if (Object.keys(ana.blockStats).length === 0) {
    els.blockStatsTableBody.innerHTML = `<tr><td colspan="4" class="muted">No hay suficientes datos registrados todavía. Realiza un simulacro para generar estadísticas.</td></tr>`;
    return;
  }

  els.blockStatsTableBody.replaceChildren();
  for (const [blockIdStr, bStats] of Object.entries(ana.blockStats)) {
    const blockObj = state.blocks.find(b => String(b.id) === blockIdStr);
    const blockLabel = blockObj ? `${blockObj.code} - ${blockObj.name}` : `Bloque General TAI (ID: ${blockIdStr})`;

    const accuracy = bStats.total > 0 ? Math.round((bStats.correct / bStats.total) * 100) : 0;
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${blockLabel}</strong></td>
      <td>${bStats.total} preguntas</td>
      <td><span style="color: #22c55e;">${bStats.correct} aciertos</span> / <span style="color: #ef4444;">${bStats.wrong} fallos</span></td>
      <td>
        <div>${accuracy} % precisión</div>
        <div class="progress-bar"><div class="progress-fill" style="width: ${accuracy}%; background: ${accuracy >= 50 ? '#22c55e' : '#ef4444'};"></div></div>
      </td>
    `;
    els.blockStatsTableBody.append(tr);
  }
}

function resetAnalyticsHistory() {
  if (confirm("¿Estás seguro de que deseas borrar todo tu historial y estadísticas de estudio guardadas en este navegador?")) {
    localStorage.removeItem(STORAGE_KEY);
    state.analytics = null;
    loadAnalyticsFromStorage();
    renderAnalyticsView();
    alert("Historial reiniciado correctamente.");
  }
}

// ==========================================
// EVENT BINDINGS & TABS
// ==========================================

function setupEventListeners() {
  els.blockSelect.addEventListener("change", fillTopics);
  els.generateBtn.addEventListener("click", startSimulation);
  els.finishBtn.addEventListener("click", finishAndGradeTest);
  els.cancelBtn.addEventListener("click", abandonSimulation);
  els.reviewBtn.addEventListener("click", reviewTestSolutions);
  els.newTestBtn.addEventListener("click", () => {
    els.resultSection.classList.add("hidden");
    els.configSection.classList.remove("hidden");
  });
  els.resetStatsBtn.addEventListener("click", resetAnalyticsHistory);

  els.tabSimulacroBtn.addEventListener("click", () => switchTab("simulacro"));
  els.tabAnalyticBtn.addEventListener("click", () => switchTab("analytics"));
}

function switchTab(target) {
  if (target === "simulacro") {
    els.tabSimulacroBtn.classList.add("active");
    els.tabAnalyticBtn.classList.remove("active");
    els.viewSimulacro.classList.remove("hidden");
    els.viewAnalytics.classList.add("hidden");
  } else {
    els.tabSimulacroBtn.classList.remove("active");
    els.tabAnalyticBtn.classList.add("active");
    els.viewSimulacro.classList.add("hidden");
    els.viewAnalytics.classList.remove("hidden");
    renderAnalyticsView();
  }
}

window.addEventListener("DOMContentLoaded", initApplication);
