// ==================================================
// ===== NOVEDADES ==================================
// ==================================================

const novedades = [
    {
        fecha: "03/01/2026",
        titulo: "Nuevas preguntas de bienestar animal",
        descripcion: "Actualización conforme a normativa básica estatal y reglamentos europeos vigentes."
    }
];

function renderNovedades() {
    const container = document.getElementById("news-container");
    if (!container) return;

    container.innerHTML = "";

    novedades.forEach(nov => {
        const div = document.createElement("div");
        div.style = "background:white; padding:20px; border-left:5px solid #667eea; border-radius:8px;";
        div.innerHTML = `
            <strong>📅 ${nov.fecha}</strong>
            <p style="margin:5px 0; font-weight:bold;">${nov.titulo}</p>
            <p style="font-size:14px; color:#555;">${nov.descripcion}</p>
        `;
        container.appendChild(div);
    });
}

// ==================================================
// ===== VARIABLES GLOBALES ==========================
// ==================================================

let allQuestions = [];
let currentTest = [];

// ==================================================
// ===== CARGA DE PREGUNTAS =========================
// ==================================================

async function loadQuestions() {
    try {
        const response = await fetch("questions.json");
        if (!response.ok) {
            throw new Error("No se pudo cargar questions.json");
        }
        allQuestions = await response.json();
        updateCategoryFilter();
    } catch (error) {
        console.error(error);
        document.getElementById("test").innerHTML =
            "<p>Error al cargar el banco de preguntas.</p>";
    }
}

// ==================================================
// ===== FILTRO DE CATEGORÍAS =======================
// ==================================================

function updateCategoryFilter() {
    const categoryFilter = document.getElementById("category-filter");
    if (!categoryFilter) return;

    const categories = [...new Set(allQuestions.map(q => q.category))];

    categories.forEach(cat => {
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
    const category = document.getElementById("category-filter").value;
    const resultDiv = document.getElementById("result");

    currentTest = allQuestions.filter(
        q => category === "all" || q.category === category
    );

    if (currentTest.length === 0) {
        testDiv.innerHTML = "<p>No hay preguntas disponibles para esta categoría.</p>";
        return;
    }

    testDiv.innerHTML = currentTest.map((q, i) => `
        <div style="margin-bottom:15px;">
            <p><strong>${i + 1}. ${q.question}</strong></p>
            <label><input type="radio" name="q${i}" value="A"> ${q.a}</label><br>
            <label><input type="radio" name="q${i}" value="B"> ${q.b}</label><br>
            <label><input type="radio" name="q${i}" value="C"> ${q.c}</label><br>
            <label><input type="radio" name="q${i}" value="D"> ${q.d}</label>
        </div>
    `).join("");

    resultDiv.textContent = "";
}

function correctTest() {
    let score = 0;

    currentTest.forEach((q, i) => {
        const selected = document.querySelector(`input[name="q${i}"]:checked`);
        if (selected && selected.value === q.correct) {
            score++;
        }
    });

    const total = currentTest.length;
    const finalScore = total ? (score / total * 10).toFixed(1) : 0;

    document.getElementById("result").textContent =
        `Tu puntuación: ${finalScore}/10 (${score}/${total})`;
}

// ==================================================
// ===== INICIALIZACIÓN =============================
// ==================================================

window.addEventListener("load", () => {
    renderNovedades();
    loadQuestions();
});
