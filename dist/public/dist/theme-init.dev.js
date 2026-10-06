"use strict";

/**
 * Theme Initialization Script
 * This runs BEFORE React loads to prevent theme flash
 * Must be placed in <head> and run synchronously
 */
(function () {
  // Get stored theme preference
  var stored = localStorage.getItem("theme");
  var theme = stored === "dark" || stored === "light" ? stored : null; // If no stored preference, check system preference

  if (!theme) {
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      theme = "dark";
    } else {
      theme = "light";
    }
  } // Apply theme immediately before React loads


  var root = document.documentElement;

  if (theme === "dark") {
    root.classList.add("dark");
    root.style.colorScheme = "dark";
  } else {
    root.classList.remove("dark");
    root.style.colorScheme = "light";
  } // Store the applied theme for React to pick up


  localStorage.setItem("theme", theme); // Also set a CSS custom property so any early-loading styles can use it

  root.style.setProperty("--initial-theme", theme);
})();