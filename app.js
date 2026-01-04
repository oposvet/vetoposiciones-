// ==================================================
// ===== CONFIGURACIÓN ==============================
// ==================================================

const MAX_QUESTIONS = 10; // número máximo de preguntas por test

// ==================================================
// ===== NOVEDADES ==================================
// ==================================================

const novedades = [
  {
    fecha: "04/01/2026",
    titulo: "Nuevas preguntas de bienestar animal",
    descripcion:
      "Actualización conforme a normativa básica estatal y reglamentos europeos vigentes.",
  },
];

function renderNovedades() {
  const container = document.getElementById("news-container");
  if (!container) return;

  container.innerHTML = "";

  novedades.forEach((nov) => {
    container.innerHTML += `
      <div style="background:white; padding:20px; border-left:5px solid #667eea; border-radius:8px;">
          <strong>📅 ${nov.fecha}</strong>
          <p style="margin:5px 0; font-weight:bold;">${nov.titulo}</p>
          <p style="font-size:14px; color:#555;">${nov.descripcion}</p>
      </div>
    `;
  });
}

// ==================================================
// ===== VARIABLES GLOBALES ==========================
// ==================================================

let allQuestions = []; // banco completo (tal cual viene del JSON)
let currentTest = [];  // test actual (ya barajado y recortado)

// ==================================================
// ===== UTILIDADES =================================
// ==================================================

function shuffleArray(array) {
  return array
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

function shuffleQuestionOptions(question) {
  // Tu JSON usa: a/b/c/d + correct (A/B/C/D)
  const options = [
    { key: "A", text: question.a },
    { key: "B", text: question.b },
    { key: "C", text: question.c },
    { key: "D", text: question.d },
  ];

  const shuffled = shuffleArray(options);

  // La correcta se mantiene por letra (A/B/C/D)
  const correctOption = shuffled.find((opt) => opt.key === question.correct);

  return {
    question: question.question,
    options: shuffled,
    correct: correctOption ? correctOption.key : question.correct,
    category: question.category,
  };
}

function setError(message) {
  const testDiv = document.getElementById("test");
  if (testDiv) testDiv.innerHTML = `<p style="color:#b00020;">${message}</p>`;
}

// ==================================================
// ===== CARGA DE PREGUNTAS (questions.json) =========
// ==================================================

async function loadQuestions() {
  try {
    const response = await fetch("questions.json", { cache: "no-store" });
    if (!response.ok) throw new Error("No se pudo cargar questions.json");

    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error("questions.json debe ser un ARRAY [ ... ]");
    }

    // Filtro mínimo por estructura (evita preguntas rotas)
    allQuestions = data.filter((q) => {
      return (
        q &&
        typeof q.question === "string" &&
        typeof q.a === "string" &&
        typeof q.b === "string" &&
        typeof q.c === "string" &&
        typeof q.d === "string" &&
        ["A", "B", "C", "D"].includes(String(q.correct).toUpperCase()) &&
        typeof q.category === "string"
      );
    }).map(q => ({ ...q, correct: String(q.correct).toUpperCase() }));

    updateCategoryFilter();

    // Feedback en pantalla (opcional)
    const testDiv = document.getElementById("test");
    if (testDiv && allQuestions.length === 0) {
      testDiv.innerHTML = "<p>No hay preguntas válidas en questions.json.</p>";
    }
  } catch (error) {
    console.error(error);
    setError("Error al cargar el banco de preguntas. Revisa questions.json.");
  }
}

// ==================================================
// ===== FILTRO DE CATEGORÍAS =======================
// ==================================================

function updateCategoryFilter() {
  const categoryFilter = document.getElementById("category-filter");
  if (!categoryFilter) return;

  // Limpia y deja la opción "all"
  categoryFilter.innerHTML = `<option value="all">📚 Todas las categorías</option>`;

  const categories = [...new Set(allQuestions.map((q) => q.category))].sort();

  categories.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });
}

// ==================================================
// ===== TEST =======================================
// ==================================================

function startTest() {
  const testDiv = document.getElementById("test");
  const resultDiv = document.getElementById("result");
  const correctBtn = document.getElementById("correctBtn");

  if (!testDiv || !resultDiv) return;

  if (!allQuestions || allQuestions.length === 0) {
    setError("Aún no se han cargado preguntas (o el JSON está vacío).");
    return;
  }

  // Oculta resultado anterior
  resultDiv.textContent = "";

  // Selección de categoría
  const category = document.getElementById("category-filter")?.value || "all";

  let filtered = allQuestions.filter(
    (q) => category === "all" || q.category === category
  );

  if (filtered.length === 0) {
    testDiv.innerHTML = "<p>No hay preguntas disponibles para esta categoría.</p>";
    if (correctBtn) correctBtn.style.display = "none";
    return;
  }

  // Recorta a MAX_QUESTIONS y baraja preguntas
  filtered = shuffleArray(filtered).slice(0, Math.min(MAX_QUESTIONS, filtered.length));

  // Prepara test barajando opciones
  currentTest = filtered.map((q) => shuffleQuestionOptions(q));

  testDiv.innerHTML = currentTest
    .map(
      (q, i) => `
      <div style="margin-bottom:15px; background:#f8f9fa; padding:12px; border-radius:8px; border-left:4px solid #667eea;">
        <p style="margin:0 0 8px 0; font-size:12px; color:#666;">${q.category}</p>
        <p style="margin:0 0 10px 0;"><strong>${i + 1}. ${q.question}</strong></p>
        ${q.options
          .map(
            (opt) => `
            <label style="display:block; margin:6px 0; cursor:pointer;">
              <input type="radio" name="q${i}" value="${opt.key}" style="margin-right:8px;">
              ${opt.text}
            </label>
          `
          )
          .join("")}
      </div>
    `
    )
    .join("");

  // Muestra botón corregir
  if (correctBtn) correctBtn.style.display = "inline-block";
}

function correctTest() {
  const resultDiv = document.getElementById("result");
  if (!resultDiv) return;

  if (!currentTest || currentTest.length === 0) {
    resultDiv.textContent = "Primero inicia un test.";
    return;
  }

  let score = 0;

  currentTest.forEach((q, i) => {
    const selected = document.querySelector(`input[name="q${i}"]:checked`);
    if (selected && selected.value === q.correct) score++;
  });

  const total = currentTest.length;
  const finalScore = total ? ((score / total) * 10).toFixed(1) : "0.0";

  resultDiv.textContent = `Tu puntuación: ${finalScore}/10 (${score}/${total})`;
}

// ==================================================
// ===== INICIALIZACIÓN =============================
// ==================================================

window.addEventListener("load", () => {
  renderNovedades();
  loadQuestions();
});
