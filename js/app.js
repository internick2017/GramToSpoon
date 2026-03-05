/**
 * GramToSpoon - Calculator and navigation.
 * Depends on ingredients-data.js (INGREDIENTS_DATA, gramsToUnit, formatAmount).
 */
(function () {
  'use strict';

  const unitLabels = {
    cups: 'cups',
    tablespoons: 'tablespoons',
    teaspoons: 'teaspoons',
  };

  function getSelectedUnit() {
    var select = document.getElementById('convert-to-unit');
    return select ? select.value : 'tablespoons';
  }

  function getSelectedIngredient() {
    var select = document.getElementById('ingredient');
    return select ? select.value : 'sugar';
  }

  function getGramsInput() {
    var input = document.getElementById('grams-input');
    if (!input) return null;
    var n = parseFloat(input.value, 10);
    return isNaN(n) || n < 0 ? null : n;
  }

  function renderCalculatorResult() {
    var grams = getGramsInput();
    var resultEl = document.getElementById('calculator-result');
    if (!resultEl) return;

    if (grams == null || grams === 0) {
      resultEl.innerHTML = '<span class="result-label">Enter grams and optionally change ingredient/unit.</span>';
      return;
    }

    var ingredient = getSelectedIngredient();
    var unit = getSelectedUnit();
    var data = typeof INGREDIENTS_DATA !== 'undefined' && INGREDIENTS_DATA[ingredient];
    if (!data) {
      resultEl.innerHTML = '<span class="result-label">Unknown ingredient.</span>';
      return;
    }

    var value = gramsToUnit(grams, unit, ingredient);
    var label = data.name;
    var unitLabel = unitLabels[unit] || unit;
    resultEl.innerHTML =
      '<span class="result-value">' + formatAmount(value) + ' ' + unitLabel + '</span> ' +
      '<span class="result-label">' + grams + ' grams of ' + label.toLowerCase() + ' = ' + formatAmount(value) + ' ' + unitLabel + '</span>';
  }

  function initCalculator() {
    var form = document.getElementById('conversion-calculator');
    var gramsInput = document.getElementById('grams-input');
    var ingredientSelect = document.getElementById('ingredient');
    var unitSelect = document.getElementById('convert-to-unit');

    if (!form || !gramsInput) return;

    function populateIngredients() {
      if (!ingredientSelect || typeof INGREDIENTS_DATA === 'undefined') return;
      var keys = Object.keys(INGREDIENTS_DATA);
      keys.forEach(function (key) {
        var opt = document.createElement('option');
        opt.value = key;
        opt.textContent = INGREDIENTS_DATA[key].name;
        ingredientSelect.appendChild(opt);
      });
    }

    function populateUnits() {
      if (!unitSelect) return;
      Object.keys(unitLabels).forEach(function (unit) {
        var opt = document.createElement('option');
        opt.value = unit;
        opt.textContent = unitLabels[unit];
        unitSelect.appendChild(opt);
      });
    }

    populateIngredients();
    populateUnits();

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      renderCalculatorResult();
    });

    gramsInput.addEventListener('input', renderCalculatorResult);
    gramsInput.addEventListener('change', renderCalculatorResult);
    if (ingredientSelect) ingredientSelect.addEventListener('change', renderCalculatorResult);
    if (unitSelect) unitSelect.addEventListener('change', renderCalculatorResult);

    renderCalculatorResult();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCalculator);
  } else {
    initCalculator();
  }
})();
