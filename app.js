const CATEGORIES = [
  {
    label: 'Wood - Random Linear - Floating',
    divisor: 20,
    unit: 'm²',
    showOiled: true,
  },
  {
    label: 'Wood - Random Linear - Gluedown',
    divisor: 14,
    unit: 'm²',
    showOiled: true,
  },
  {
    label: 'Wood - Herringbone - Gluedown',
    divisor: 10,
    unit: 'm²',
    showOiled: true,
  },
  {
    label: 'Wood - Herringbone/Chevron, floating (LIFE AUTHENTIC)',
    divisor: 14,
    unit: 'm²',
    showOiled: true,
  },
  {
    label: 'Wood - Herringbone - Gluedown, Customized pattern',
    divisor: 7,
    unit: 'm²',
    showOiled: true,
  },
  {
    label: 'Wood - Chevron - Gluedown',
    divisor: 8,
    unit: 'm²',
    showOiled: true,
  },
  {
    label: 'LVT - Random Linear - Floating',
    divisor: 24,
    unit: 'm²',
    showOiled: false,
  },
  {
    label: 'LVT - Random Linear - Gluedown',
    divisor: 16,
    unit: 'm²',
    showOiled: false,
  },
  {
    label: 'LVT - Herringbone - Floating',
    divisor: 12,
    unit: 'm²',
    showOiled: false,
  },
  {
    label: 'LVT - Chevron - Floating',
    divisor: 12,
    unit: 'm²',
    showOiled: false,
  },
  {
    label: 'Custom Pattern',
    divisor: 8,
    unit: 'm²',
    showOiled: true,
  },
  {
    label: 'Custom tiles',
    divisor: 4,
    unit: 'm²',
    showOiled: true,
  },
  {
    label: 'Borders',
    divisor: 5,
    unit: 'lm',
    showOiled: false,
  },
  {
    label: 'Cladding - Ceiling',
    divisor: 2,
    unit: 'm²',
    showOiled: true,
  },
  {
    label: 'Cladding - Walls (Gluedown)',
    divisor: 4,
    unit: 'm²',
    showOiled: true,
  },
  {
    label: 'Skirting',
    divisor: 30,
    unit: 'lm',
    showOiled: false,
  },
];

const THEME_STORAGE_KEY = 'eit-theme';

const form = document.getElementById('eit-form');
const categorySelect = document.getElementById('category');
const amountField = document.getElementById('amount-field');
const amountInput = document.getElementById('amount');
const amountLabel = document.getElementById('amount-label');
const oiledField = document.getElementById('oiled-field');
const oiledError = document.getElementById('oiled-error');
const categoryError = document.getElementById('category-error');
const amountError = document.getElementById('amount-error');
const formError = document.getElementById('form-error');
const resultsSection = document.getElementById('results');
const resultLabel = document.getElementById('result-label');
const resultValue = document.getElementById('result-value');
const teamResultLabel = document.getElementById('team-result-label');
const teamResultValue = document.getElementById('team-result-value');
const themeToggle = document.getElementById('theme-toggle');

function populateCategories() {
  CATEGORIES.forEach((category, index) => {
    const option = document.createElement('option');
    option.value = String(index);
    option.textContent = category.label;
    categorySelect.appendChild(option);
  });
}

function getSelectedCategory() {
  const index = categorySelect.value;
  if (index === '') {
    return null;
  }
  return CATEGORIES[Number(index)];
}

function getAmountLabel(unit) {
  if (unit === 'lm') {
    return 'Add (input the lm)';
  }
  return 'Add (input the M2)';
}

function getEmptyAmountMessage(unit) {
  if (unit === 'lm') {
    return 'Enter lm';
  }
  return 'Enter m²';
}

function resetOiledSelection() {
  oiledField.querySelectorAll('input[name="oiled"]').forEach((input) => {
    input.checked = false;
  });
}

function shouldShowOiled(category) {
  if (!category) {
    return false;
  }

  if (category.label === 'Skirting' || category.label.startsWith('LVT -')) {
    return false;
  }

  return category.showOiled;
}

function updateFormForCategory() {
  const category = getSelectedCategory();

  if (!category) {
    amountField.hidden = true;
    oiledField.hidden = true;
    amountInput.value = '';
    resetOiledSelection();
    return;
  }

  amountField.hidden = false;
  amountInput.placeholder = category.unit;
  amountLabel.textContent = getAmountLabel(category.unit);

  if (shouldShowOiled(category)) {
    oiledField.hidden = false;
  } else {
    oiledField.hidden = true;
    resetOiledSelection();
  }
}

function validateCategory() {
  if (categorySelect.value === '') {
    return 'Select an installation type';
  }
  return null;
}

function validateAmount(value, category) {
  const trimmed = value.trim();

  if (trimmed === '') {
    return getEmptyAmountMessage(category.unit);
  }

  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed)) {
    return 'Enter a valid number';
  }

  if (parsed < 0) {
    return 'Enter a positive number';
  }

  if (category.divisor === 0) {
    return 'Cannot divide by zero';
  }

  return null;
}

function validateOiled(category) {
  if (!shouldShowOiled(category)) {
    return null;
  }

  const selected = form.querySelector('input[name="oiled"]:checked');
  if (!selected) {
    return 'Select Yes or No';
  }

  return null;
}

function getOiledSelection() {
  const selected = form.querySelector('input[name="oiled"]:checked');
  return selected ? selected.value === 'yes' : false;
}

function calculateBaseDays(value, divisor) {
  if (divisor === 0) {
    throw new Error('Division by zero');
  }
  return Math.ceil(value / divisor + 0.5);
}

function applyOiledDays(days, squareMeters, isOiled) {
  if (!isOiled) {
    return days;
  }

  return days + (squareMeters < 500 ? 1 : 2);
}

function calculateDays(amount, category, isOiled) {
  const baseDays = calculateBaseDays(amount, category.divisor);

  if (shouldShowOiled(category)) {
    return applyOiledDays(baseDays, amount, isOiled);
  }

  return baseDays;
}

function formatResult(value) {
  return String(value);
}

function calculateDaysPerTeam(days) {
  return Math.ceil(days / 2);
}

function clearErrors() {
  formError.hidden = true;
  formError.textContent = '';
  categorySelect.classList.remove('invalid');
  amountInput.classList.remove('invalid');
  oiledField.classList.remove('invalid');
  categoryError.hidden = true;
  categoryError.textContent = '';
  amountError.hidden = true;
  amountError.textContent = '';
  oiledError.hidden = true;
  oiledError.textContent = '';
}

function handleCalculate(event) {
  event.preventDefault();
  clearErrors();
  resultsSection.hidden = true;

  const categoryErrorMessage = validateCategory();
  if (categoryErrorMessage) {
    categorySelect.classList.add('invalid');
    categoryError.textContent = categoryErrorMessage;
    categoryError.hidden = false;
    return;
  }

  const category = getSelectedCategory();
  const amountErrorMessage = validateAmount(amountInput.value, category);

  if (amountErrorMessage) {
    amountInput.classList.add('invalid');
    amountError.textContent = amountErrorMessage;
    amountError.hidden = false;
    return;
  }

  const oiledErrorMessage = validateOiled(category);
  if (oiledErrorMessage) {
    oiledField.classList.add('invalid');
    oiledError.textContent = oiledErrorMessage;
    oiledError.hidden = false;
    return;
  }

  try {
    const amount = Number(amountInput.value.trim());
    const isOiled = getOiledSelection();
    const days = calculateDays(amount, category, isOiled);

    resultLabel.textContent = category.label;
    resultValue.textContent = formatResult(days);
    teamResultLabel.textContent = category.label;
    teamResultValue.textContent = formatResult(calculateDaysPerTeam(days));
    resultsSection.hidden = false;
  } catch {
    formError.textContent = `Cannot divide by zero for ${category.label}.`;
    formError.hidden = false;
  }
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(THEME_STORAGE_KEY, theme);

  const isDark = theme === 'dark';
  themeToggle.textContent = isDark ? 'Dark Mode' : 'Light Mode';
  themeToggle.setAttribute(
    'aria-label',
    isDark ? 'Switch to light mode' : 'Switch to dark mode',
  );
}

function initTheme() {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = savedTheme === 'dark' || savedTheme === 'light'
    ? savedTheme
    : prefersDark
      ? 'dark'
      : 'light';

  applyTheme(theme);
}

populateCategories();
initTheme();
updateFormForCategory();

themeToggle.addEventListener('click', () => {
  const nextTheme =
    document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  applyTheme(nextTheme);
});

categorySelect.addEventListener('change', () => {
  clearErrors();
  resultsSection.hidden = true;
  updateFormForCategory();
});

form.addEventListener('submit', handleCalculate);
