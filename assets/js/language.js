/* =========================================================
   language.js — EN / FR switcher
   - All copy lives in index.html, wrapped in data-lang="en" / data-lang="fr".
   - CSS hides the language that does not match <html lang>.
   - Elements that cannot contain markup (<title>, <option>, meta content,
     aria-label) carry data-en / data-fr attributes plus data-i18n.
     data-i18n-attr="content" swaps that attribute instead of the text.
   - Loaded in <head> (not deferred) so the stored language applies before
     first paint, avoiding a flash of the wrong language.
   ========================================================= */
(function () {
  "use strict";

  var SUPPORTED = ["en", "fr"];
  var DEFAULT_LANG = "en";
  var STORAGE_KEY = "chalema-lang";

  function getInitialLang() {
    var fromUrl = new URLSearchParams(window.location.search).get("lang");
    if (SUPPORTED.indexOf(fromUrl) !== -1) return fromUrl;
    try {
      var stored = window.localStorage.getItem(STORAGE_KEY);
      if (SUPPORTED.indexOf(stored) !== -1) return stored;
    } catch (e) {
      /* storage unavailable */
    }
    return DEFAULT_LANG;
  }

  function applyLang(lang) {
    if (SUPPORTED.indexOf(lang) === -1) lang = DEFAULT_LANG;
    document.documentElement.lang = lang;

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var value = el.getAttribute("data-" + lang);
      if (value === null) return;
      var attr = el.getAttribute("data-i18n-attr");
      if (attr) el.setAttribute(attr, value);
      else el.textContent = value;
    });

    document.querySelectorAll("[data-set-lang]").forEach(function (btn) {
      btn.setAttribute(
        "aria-pressed",
        String(btn.getAttribute("data-set-lang") === lang),
      );
    });

    // Hidden form fields that record the visitor's language
    document
      .querySelectorAll("input[data-lang-field]")
      .forEach(function (input) {
        input.value = lang;
      });

    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {
      /* ignore */
    }

    document.dispatchEvent(
      new CustomEvent("languagechange", { detail: { lang: lang } }),
    );
  }

  // Apply immediately to <html> so CSS shows the right language on first paint
  var initial = getInitialLang();
  document.documentElement.lang = initial;

  document.addEventListener("DOMContentLoaded", function () {
    applyLang(initial);
    document.querySelectorAll("[data-set-lang]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        applyLang(btn.getAttribute("data-set-lang"));
      });
    });
  });

  window.ChalemaLanguage = {
    set: applyLang,
    get: function () {
      return document.documentElement.lang;
    },
  };
})();
