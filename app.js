"use strict";

const DATASETS = {
  "questions_bienestar_animal.json": "🐄 Bienestar Animal",
  "questions_sanidad_animal.json": "🦠 Sanidad Animal",
  "questions_higiene_alimentaria.json": "🍗 Higiene Alimentaria",
  "questions_etiquetado.json": "🏷️ Etiquetado",
};

let questions = [];
let current = 0;
let correctCount = 0;
let answered = false;

const el = (id) => document.getElementById(id);

function showError(msg) {
  const box = el("error");
  box.textContent = msg;
  box.style.display = "block";
}

function clearError() {
  const box = el("error");
  box.textContent = "";
  box.style.display = "none";
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

async function loadQuestions(jsonFile) {
  // Importante: URL relativa robusta para GitHub Pages / subcarpetas
  const url = new URL(jsonFile, document.baseURI);

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error(`No se pudo cargar ${jsonFile} (HTTP ${res.status}).`);

  const data = await res.json();
  if (!Array.isArray(data)) throw new Error(`Formato inválido en ${jsonFile}: se esperaba un array.`);
  return data;
}

function resetQuiz() {
  current = 0;
  correctCount = 0;
  answered = false;

  el("feedback").textContent = "";
  el("nextBtn").disabled = true;
}

function renderQuestion() {
  const q = questions[current];
  if (!q) return;

  el("qTitle").style.display = "";
  el("quizForm").style.display = "";
  el("qTitle").textContent = `(${current + 1}/${questions.length}) ${q.question}`;

  const options = el("options");
  options.innerHTML = "";

  const entries = [
    ["A", q.a],
    ["B", q.b],
    ["C", q.c],
    ["D", q.d],
  ];

  for (const [key, text] of entries) {
    const id = `opt_${key}`;

    const label = document.createElement("label");
    label.htmlFor = id;

    const input = document.createElement("input");
    input.type = "radio";
    input.name = "answer";
    input.value = key;
    input.id = id;

    label.appendChild(input);
    label.appendChild(document.createTextNode(` ${key}) ${text}`));

    options.appendChild(label);
  }

  el("feedback").textContent = "";
  el("nextBtn").disabled = true;
  answered = false;

  el("status").textContent = `Aciertos: ${correctCount} · Fallos: ${current - correctCount}`;
}

function getSelectedAnswer() {
  const checked = document.querySelector('input[name="answer"]:checked');
  return checked ? checked.value : null;
}

function finish() {
  const score10 = Math.round((correctCount / questions.length) * 10 * 100) / 100;
  el("status").textContent = `Test finalizado · Aciertos: ${correctCount}/${questions.length} · Nota: ${score10}/10`;
  el("qTitle").style.display = "none";
  el("quizForm").style.display = "none";
}

async function startCategory(jsonFile) {
  clearError();
  el("status").textContent = `Cargando: ${DATASETS[jsonFile] ?? jsonFile}...`;

  const data = await loadQuestions(jsonFile);

  // Opcional: barajar preguntas
  questions = shuffle(data);

  // Validación mínima de campos esperados
  const bad = questions.find(
    (q) => !q || !q.question || !q.a || !q.b || !q.c || !q.d || !q.correct
  );
  if (bad) throw new Error("Alguna pregunta no tiene el formato esperado (question, a, b, c, d, correct).");

  resetQuiz();
  renderQuestion();
}

document.addEventListener("DOMContentLoaded", () => {
  // Botones de categorías
  el("categoryButtons").addEventListener("click", async (ev) => {
    const btn = ev.target.closest("button[data-file]");
    if (!btn) return;

    try {
      await startCategory(btn.dataset.file);
    } catch (e) {
      showError(e.message || String(e));
      el("status").textContent = "Error al cargar la categoría.";
      el("qTitle").style.display = "none";
      el("quizForm").style.display = "none";
    }
  });

  // Responder
  el("quizForm").addEventListener("submit", (ev) => {
    ev.preventDefault();
    if (!questions.length) return;
    if (answered) return;

    const q = questions[current];
    const selected = getSelectedAnswer();
    if (!selected) {
      el("feedback").textContent = "Selecciona una opción.";
      return;
    }

    answered = true;

    const ok = String(selected).toUpperCase() === String(q.correct).toUpperCase();
    if (ok) correctCount++;

    el("feedback").textContent = ok
      ? "Correcto."
      : `Incorrecto. La respuesta correcta era ${q.correct}.`;

    el("nextBtn").disabled = false;
    el("status").textContent = `Aciertos: ${correctCount} · Fallos: ${current + 1 - correctCount}`;
  });

  // Siguiente
  el("nextBtn").addEventListener("click", () => {
    if (!questions.length) return;

    current++;
    if (current >= questions.length) {
      finish();
      return;
    }
    renderQuestion();
  });

  // Reiniciar
  el("restartBtn").addEventListener("click", () => {
    clearError();
    questions = [];
    current = 0;
    correctCount = 0;
    answered = false;

    el("status").textContent = "Elige una categoría para empezar.";
    el("qTitle").style.display = "none";
    el("quizForm").style.display = "none";
  });
});
