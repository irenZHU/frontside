// Маска телефона для форм обратной связи: +7 (999) 123-45-67.
// В фокусе поле сразу показывает «+7 (»; ввод 8 или 7 в начале считается кодом страны; пустая маска при уходе стирается.
(() => {
  const format = digits => {
    const d = digits.slice(0, 10);
    let out = "+7 (" + d.slice(0, 3);
    if (d.length > 3) out += ") " + d.slice(3, 6);   // разделитель появляется вместе со следующей цифрой
    if (d.length > 6) out += "-" + d.slice(6, 8);
    if (d.length > 8) out += "-" + d.slice(8, 10);
    return out;
  };
  const digitsOf = value => {
    let d = value.trim().replace(/^\+7/, "").replace(/\D/g, "");   // префикс маски — не цифры номера
    if (/^[78]/.test(d) && d.length === 11) d = d.slice(1);          // вставили номер целиком: 8… или 7…
    return d;
  };
  document.querySelectorAll('input[type="tel"]').forEach(input => {
    input.placeholder = "Телефон";
    input.setAttribute("inputmode", "tel");
    input.addEventListener("focus", () => { if (!input.value) input.value = "+7 ("; });
    input.addEventListener("blur", () => { if (!digitsOf(input.value)) input.value = ""; });
    let prev = "";
    input.addEventListener("input", e => {
      let d = digitsOf(input.value);
      // стёрли разделитель («)», пробел, дефис) — стираем и цифру перед ним, иначе маска вернёт его на место
      if (e.inputType === "deleteContentBackward" && d === prev) d = d.slice(0, -1);
      input.value = d ? format(d) : "+7 (";
      prev = d;
    });
  });
})();
