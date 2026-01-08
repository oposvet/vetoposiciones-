const MAX_QUESTIONS = 10;

const QUESTION_FILES = [
  "questions_bienestar_animal.json",
  "questions_higiene_alimentaria.json",
  "questions_etiquetado.json",
  "questions_sanidad_animal.json",
];

let allQuestions = [];
let currentTest = [];

document.addEventListener("DOMContentLoaded", () => {
  renderNovedades();
  loadAllQuestions();

  document.getElementById("category-filter")
    .addEventListener("change", updateStatsForSelectedCategory);

  document.getElementById("startBtn")
    .addEventListener("click", startTest);
});

// =====================
// CARGA DE PREGUNTAS
// =====================
async function loadAllQuestions() {
  const results = await Promise.all(
    QUESTION_FILES.map(f =>
      fetch(f)
        .then(r => r.ok ? r.json() : [])
        .catch(() => [])
    )
  );

  allQuestions = results.flat().filter(q =>
    q.question && q.a && q.b && q.c && q.d && q.correct && q.category
  );

  updateCategoryFilter();
  renderQuestionStats();
  updateStatsForSelectedCategory();
}

// =====================
// FILTRO CATEGORÍAS
// =====================
function updateCategoryFilter() {
  const select = document.getElementById("category-filter");
  select.innerHTML = `<option value="all">Todas</option>`;

  [...new Set(allQuestions.map(q => q.category))].forEach(cat => {
    const o = document.createElement("option");
    o.value = cat;
    o.textContent = cat;
    select.appendChild(o);
  });
}

// =====================
// INICIO TEST
// =====================
function startTest() {
  const cat = document.getElementById("category-filter").value;
  const pool = cat === "all"
    ? allQuestions
    : allQuestions.filter(q => q.category === cat);

  currentTest = pool
    .sort(() => Math.random() - 0.5)
    .slice(0, MAX_QUESTIONS);

  renderTest();
}

// =====================
// RENDER TEST
// =====================
function renderTest() {
  const container = document.getElementById("test");
  container.innerHTML = "";

  currentTest.forEach((q, i) => {
    const div = document.createElement("div");
    div.className = "question-block";

    div.innerHTML = `<p><b>${i + 1}. ${q.question}</b></p>`;

    ["a", "b", "c", "d"].forEach((opt, idx) => {
      div.innerHTML += `
        <label>
          <input type="radio" name="q${i}" value="${String.fromCharCode(65 + idx)}">
          ${q[opt]}
        </label>`;
    });

    container.appendChild(div);
  });

  const btn = document.createElement("button");
  btn.textContent = "📊 Corregir test";
  btn.onclick = corregir;
  container.appendChild(btn);
}

// =====================
// CORRECCIÓN + EXPLICACIÓN NORMATIVA
// =====================
function corregir() {
  const container = document.getElementById("test");
  let aciertos = 0;

  currentTest.forEach((q, i) => {
    const marcada = document.querySelector(`input[name="q${i}"]:checked`);
    const correcta = q.correct.toUpperCase();

    const bloque = container.children[i];

    let resultadoHTML = "";

    if (marcada && marcada.value === correcta) {
      aciertos++;
      resultadoHTML += `<p class="result-ok">✔ Respuesta correcta</p>`;
    } else {
      resultadoHTML += `
        <p class="result-ko">
          ✖ Respuesta incorrecta. Correcta: <b>${correcta}</b>
        </p>`;
    }

    // EXPLICACIÓN NORMATIVA
    resultadoHTML += `
      <div style="background:#eef2ff; padding:10px; border-radius:6px; margin-top:8px;">
        <b>📘 Fundamentación normativa:</b><br>
        ${q.explanation
          ? q.explanation
          : "La explicación normativa no ha sido incorporada para esta pregunta."}
      </div>
    `;

    bloque.insertAdjacentHTML("beforeend", resultadoHTML);
  });

  alert(
    `Resultado final: ${aciertos}/${currentTest.length} → ` +
    `${(aciertos / currentTest.length * 10).toFixed(2)} / 10`
  );
}

// =====================
// ESTADÍSTICAS
// =====================
function renderQuestionStats() {
  document.getElementById("stats-top").innerHTML =
    `Total preguntas disponibles: <b>${allQuestions.length}</b>`;
}

function updateStatsForSelectedCategory() {
  const cat = document.getElementById("category-filter").value;
  const n = cat === "all"
    ? allQuestions.length
    : allQuestions.filter(q => q.category === cat).length;

  document.getElementById("startBtn").textContent =
    `▶ Iniciar test (${Math.min(MAX_QUESTIONS, n)})`;
}

// =====================
// NOVEDADES
// =====================
function renderNovedades() {
  const novedades = [
    {
      fecha: "05/01/2026",
      titulo: "Explicación normativa por pregunta",
      descripcion:
        "Cada pregunta incluye ahora fundamentación legal con referencia a normativa UE, estatal o autonómica."
    }
  ];

  const c = document.getElementById("news-container");
  novedades.forEach(n => {
    const d = document.createElement("div");
    d.innerHTML = `<h3>${n.titulo}</h3><p>${n.descripcion}</p><small>${n.fecha}</small>`;
    c.appendChild(d);
  });
}
