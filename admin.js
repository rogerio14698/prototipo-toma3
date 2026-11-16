// Maqueta del panel: todo ocurre en el navegador y no se guarda nada.
// La versión real necesita servidor (login, base de datos y permisos).
(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var toastEl = $("#toast"), toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("is-on"); }, 2200);
  }

  /* ----- Login de demostración ----- */
  var login = $("#login"), app = $("#app");
  $("#login-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var ok = $("#l-email").value.trim() && $("#l-pass").value;
    $("#login-msg").textContent = ok ? "" : "Escribe tu correo y tu contraseña.";
    if (ok) { login.hidden = true; app.hidden = false; window.scrollTo(0, 0); }
  });
  $("#logout").addEventListener("click", function () {
    app.hidden = true; login.hidden = false; $("#l-pass").value = "";
  });

  /* ----- Navegación entre vistas ----- */
  var titles = {};
  $$(".side__nav button").forEach(function (b) {
    titles[b.dataset.view] = b.textContent;
    b.addEventListener("click", function () {
      $$(".side__nav button").forEach(function (x) { x.classList.toggle("is-active", x === b); });
      $$(".view").forEach(function (v) { v.classList.toggle("is-active", v.id === "v-" + b.dataset.view); });
      $("#view-title").textContent = titles[b.dataset.view];
      window.scrollTo(0, 0);
    });
  });

  /* ----- Formularios con guardado de demostración ----- */
  $$("form[data-save]").forEach(function (f) {
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      if (f.id !== "event-form") toast("Cambios guardados (demo)");
    });
  });
  $$("[data-save-btn]").forEach(function (b) { b.addEventListener("click", function () { toast("Carta guardada (demo)"); }); });
  $$("[data-toast]").forEach(function (b) { b.addEventListener("click", function () { toast(b.dataset.toast); }); });

  /* ----- Eventos: nuevo y eliminar ----- */
  var evForm = $("#event-form"), evBody = $("#events-body");
  $("#toggle-event-form").addEventListener("click", function () { evForm.hidden = !evForm.hidden; if (!evForm.hidden) $("#e-title").focus(); });
  $("#cancel-event").addEventListener("click", function () { evForm.hidden = true; evForm.reset(); });
  evForm.addEventListener("submit", function () {
    var title = $("#e-title").value.trim(), date = $("#e-date").value;
    if (!title || !date) { toast("Falta el título o la fecha"); return; }
    var d = date.split("-");
    var tr = document.createElement("tr");
    [title, $("#e-type").value, d[2] + "/" + d[1] + "/" + d[0]].forEach(function (t) {
      var td = document.createElement("td"); td.textContent = t; tr.appendChild(td);
    });
    var st = document.createElement("td"), badge = document.createElement("span");
    var pub = $("#e-pub").checked;
    badge.className = "badge" + (pub ? " badge--ok" : "");
    badge.textContent = pub ? "Publicado" : "Borrador";
    st.appendChild(badge); tr.appendChild(st);
    var act = document.createElement("td"), del = document.createElement("button");
    del.className = "link del"; del.type = "button"; del.textContent = "Eliminar";
    act.appendChild(del); tr.appendChild(act);
    evBody.insertBefore(tr, evBody.firstChild);
    evForm.reset(); evForm.hidden = true;
    toast("Evento guardado (demo)");
  });
  evBody.addEventListener("click", function (e) {
    if (e.target.classList.contains("del")) { e.target.closest("tr").remove(); toast("Evento eliminado (demo)"); }
  });

  /* ----- Carta: añadir producto ----- */
  $$("[data-add-item]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var ul = document.getElementById(btn.dataset.addItem);
      var li = document.createElement("li");
      li.innerHTML = '<input aria-label="Nombre" placeholder="Nombre"><input aria-label="Precio" class="price" placeholder="0,00 €"><label class="switch"><input type="checkbox" checked><span></span>Disponible</label>';
      ul.appendChild(li);
      li.querySelector("input").focus();
    });
  });

  /* ----- Horarios ----- */
  var days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
  var hours = $("#hours");
  days.forEach(function (d, i) {
    var li = document.createElement("li");
    var closed = i === 0;
    li.innerHTML =
      "<strong>" + d + "</strong>" +
      '<label class="switch"><input type="checkbox"' + (closed ? " checked" : "") + '><span></span>Cerrado</label>' +
      '<input type="time" aria-label="Apertura ' + d + '" value="18:00"' + (closed ? " disabled" : "") + ">" +
      '<input type="time" aria-label="Cierre ' + d + '" value="01:00"' + (closed ? " disabled" : "") + ">";
    var chk = li.querySelector('input[type="checkbox"]');
    chk.addEventListener("change", function () {
      $$('input[type="time"]', li).forEach(function (t) { t.disabled = chk.checked; });
    });
    hours.appendChild(li);
  });

  /* ----- SEO: contadores y vista previa ----- */
  var sTitle = $("#seo-title"), sDesc = $("#seo-desc");
  function seo() {
    var t = sTitle.value, d = sDesc.value;
    $("#c-title").textContent = t.length + " / 60";
    $("#c-title").classList.toggle("is-over", t.length > 60);
    $("#c-desc").textContent = d.length + " / 160";
    $("#c-desc").classList.toggle("is-over", d.length > 160);
    $("#p-title").textContent = t.length > 60 ? t.slice(0, 57) + "…" : t;
    $("#p-desc").textContent = d.length > 160 ? d.slice(0, 157) + "…" : d;
    $("#p-url").textContent = "toma3.es" + ($("#seo-slug").value === "/" ? "" : $("#seo-slug").value);
  }
  [sTitle, sDesc, $("#seo-slug")].forEach(function (el) { el.addEventListener("input", seo); });
  seo();

  /* ----- Imágenes: vista previa local ----- */
  $$("input.file[data-preview]").forEach(function (inp) {
    inp.addEventListener("change", function () {
      var img = document.getElementById(inp.dataset.preview), f = inp.files[0];
      if (!f) { img.hidden = true; return; }
      img.src = URL.createObjectURL(f); img.hidden = false;
    });
  });
  $("#g-add").addEventListener("change", function (e) {
    Array.prototype.forEach.call(e.target.files, function (f) {
      var fig = document.createElement("figure"), img = document.createElement("img"), alt = document.createElement("input");
      img.src = URL.createObjectURL(f); img.alt = "";
      alt.placeholder = "Texto alternativo"; alt.setAttribute("aria-label", "Texto alternativo");
      fig.appendChild(img); fig.appendChild(alt);
      $("#gallery").appendChild(fig);
    });
    e.target.value = "";
  });

  /* ----- Apariencia: vista previa en vivo ----- */
  function look() {
    $("#sw-dark").style.background = $("#a-bg").value;
    $("#sw-light").style.background = $("#a-paper").value;
    $("#sw-btn").style.background = $("#a-accent").value;
    $("#sw-title").style.fontFamily = $("#a-font").value;
  }
  ["#a-bg", "#a-paper", "#a-accent", "#a-font"].forEach(function (s) { $(s).addEventListener("input", look); });
})();
