// Модалка с формой заявки — общая для всех страниц.
// «Отправить заявку» в шапке, все ссылки на #feedback и кнопки с data-form-modal открывают форму поверх страницы, а не прокручивают к форме внизу.
// Если на странице нет <dialog id="form-modal">, он создаётся из шаблона ниже. Подключать до phone-mask.js — маска ляжет и на телефон в модалке.
(() => {
  let modal = document.getElementById("form-modal");
  if (!modal) {
    const arrow = '<svg class="fs-arrow" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M.4.5 19.1 18.3M2.9 19.2h16.85M18.9 4.3v9.4"/></svg>';
    document.body.insertAdjacentHTML("beforeend", `
  <dialog class="form-modal" id="form-modal" aria-labelledby="form-modal-title">
    <button class="form-modal__close" type="button" aria-label="Закрыть" data-form-modal-close><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M1 1l14 14M15 1 1 15"/></svg></button>
    <div class="form-modal__inner">
      <div class="category-form__intro">
        <div>
          <h2 id="form-modal-title">Расскажите о&nbsp;вашем объекте</h2>
          <p>Поможем подобрать решение под архитектуру, сроки и&nbsp;эксплуатацию</p>
        </div>
      </div>
      <form class="category-form__form" action="#" novalidate>
        <label class="category-form__field"><span class="visually-hidden">Имя</span><input type="text" name="name" placeholder="Имя" autocomplete="name"></label>
        <label class="category-form__field"><span class="visually-hidden">Телефон</span><input type="tel" name="phone" placeholder="+7 Телефон" autocomplete="tel"></label>
        <label class="category-form__field"><span class="visually-hidden">Название компании</span><input type="text" name="company" placeholder="Название компании" autocomplete="organization"></label>
        <label class="category-form__field"><span class="visually-hidden">Регион</span><input type="text" name="region" placeholder="Регион" autocomplete="address-level1"></label>
        <button class="category-form__submit" type="submit"><span>Отправить</span>${arrow}</button>
        <label class="category-form__agree"><input type="checkbox" name="agree" required><span>Я соглашаюсь на обработку персональных данных в соответствии с <a href="https://frontside.ru/privacy/" target="_blank" rel="noopener">Политикой обработки персональных данных</a></span></label>
      </form>
    </div>
  </dialog>`);
    modal = document.getElementById("form-modal");
  }
  // любая кнопка/ссылка на форму (#feedback), кнопка шапки и data-form-modal — делегированием, чтобы работало и для карточек, отрисованных скриптом
  document.addEventListener("click", event => {
    const trigger = event.target.closest('.header .btn-accent, [data-form-modal], a[href="#feedback"]');
    if (!trigger || modal.contains(trigger)) return;
    event.preventDefault(); modal.showModal();
  });
  modal.querySelector("[data-form-modal-close]").addEventListener("click", () => modal.close());
  modal.addEventListener("click", event => { if (event.target === modal) modal.close(); });   // клик по затемнению
})();
