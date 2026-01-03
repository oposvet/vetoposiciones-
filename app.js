// ==================================================
// ===== ESTADÍSTICAS EN VIVO (SIMULADAS) ============
// ==================================================

let stats = {
    usersToday: 247,
    testsCompleted: 1832,
    avgScore: 6.4,
    maxStreak: 15,
    rating: 4.8,
    approved: 94
};

function displayStats() {
    const statsHTML = `
        <div id="stats-panel" style="
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 10px;
            margin: 20px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        ">
            <h2 style="margin: 0 0 10px 0;">📊 Estadísticas en vivo</h2>

            <p style="font-size:12px; opacity:0.85; font-style:italic;">
                ℹ️ Datos simulados con fines informativos.
            </p>

            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(140px,1fr)); gap:15px;">
                <div><strong>👥 Usuarios hoy</strong><br><span id="stat-users">${stats.usersToday}</span></div>
                <div><strong>📊 Tests</strong><br><span id="stat-tests">${stats.testsCompleted}</span></div>
                <div><strong>✅ Media</strong><br><span id="stat-avg">${stats.avgScore}/10</span></div>
                <div><strong>🔥 Racha máx</strong><br><span id="stat-streak">${stats.maxStreak} d</span></div>
                <div><strong>⭐ Rating</strong><br>${stats.rating}/5</div>
                <div><strong>✨ Aprobados</strong><br>${stats.approved}</div>
            </div>
        </div>
    `;

    const main = document.querySelector("main");
    if (main && !document.getElementById("stats-panel")) {
        main.insertAdjacentHTML("afterbegin", statsHTML);
    }
}

function updateStats(score) {
    stats.testsCompleted += 1;
    stats.avgScore = score;
    stats.maxStreak = Math.max(stats.maxStreak, Math.floor(Math.random() * 20) + 5);

    document.getElementById("stat-tests").textContent = stats.testsCompleted;
    document.getElementById("stat-avg").textContent = `${stats.avgScore}/10`;
    document.getElementById("stat-streak").textContent = `${stats.maxStreak} d`;
}

// ==================================================
// ===== NOVEDADES ==================================
// ==================================================

const novedades = [
    {
        fecha: "05/01/2026",
        titulo: "Nuevas preguntas de sanidad animal",
        descripcion: "Actualización conforme a normativa básica estatal y reglamentos europeos vigentes."
    },
    {
        fecha: "20/12/2025",
        titulo: "Ampliación de categorías autonómicas",
        descripcion: "Incorporadas preguntas específicas para Castilla-La Mancha y Andalucía."
    },
    {
        fecha: "01/12/2025",
        titulo: "Publicación inicial de la aplicación",
        descripcion: "Lanzamiento de la plataforma gratuita de test de veterinaria."
    }
];

function renderNovedades() {
    const section = document.querySelector("section h2")?.textContent.includes("Novedades")
        ? document.querySelector("section h2").parentElement
        : null;

    if (!section) return;

    const container = section.querySelector("div");
    if (!container) return;

    container.innerHTML = "";

    novedades.forEach(nov => {
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
// ===== FILTRO DE CATEGORÍAS =======================
// ==================================================

function updateCategoryFilter() {
    const categoryFilter = document.getElementById("category-filter");
    if (!categoryFilter) return;

    const categories = [
        "🍖 Higiene y Seguridad Alimentaria",
        "🐄 Sanidad Animal",
        "📋 Legislación"
    ];

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

let currentTest = [];

function startTest() {
    const testDiv = document.getElementById("test");
    const category = document.getElementById("category-filter").value;

    const questions = [
        { question: "Pregunta A", a: "1", b: "2", c: "3", d: "4", correct: "A", category: "🍖 Higiene y Seguridad Alimentaria" },
        { question: "Pregunta B", a: "1", b: "2", c: "3", d: "4", correct: "B", category: "🐄 Sanidad Animal" },
        { question: "Pregunta C", a: "1", b: "2", c: "3", d: "4", correct: "C", category: "📋 Legislación" }
    ];

    currentTest = questions.filter(q => category === "all" || q.category === category);

    testDiv.innerHTML = currentTest.map((q, i) => `
        <div style="margin-bottom:15px;">
            <p><strong>${i + 1}. ${q.question}</strong></p>
            <label><input type="radio" name="q${i}" value="A"> ${q.a}</label><br>
            <label><input type="radio" name="q${i}" value="B"> ${q.b}</label><br>
            <label><input type="radio" name="q${i}" value="C"> ${q.c}</label><br>
            <label><input type="radio" name="q${i}" value="D"> ${q.d}</label>
        </div>
    `).join("");

    document.getElementById("result").textContent = "";
}

function correctTest() {
    let score = 0;

    currentTest.forEach((q, i) => {
        const selected = document.querySelector(`input[name="q${i}"]:checked`);
        if (selected && selected.value === q.correct) score++;
    });

    const total = currentTest.length;
    const finalScore = total ? (score / total * 10).toFixed(1) : 0;

    document.getElementById("result").textContent =
        `Tu puntuación: ${finalScore}/10 (${score}/${total})`;

    updateStats(parseFloat(finalScore));
}

// ==================================================
// ===== INICIALIZACIÓN =============================
// ==================================================

window.addEventListener("load", () => {
    displayStats();
    updateCategoryFilter();
    renderNovedades();
});
