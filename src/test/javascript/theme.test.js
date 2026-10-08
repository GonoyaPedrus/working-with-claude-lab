const fs = require('fs');
const path = require('path');
const { loadApp, requireApp, readIndexHtml, APP_PATH } = require('./setup/loadApp');

const CSS_PATH = path.join(path.dirname(APP_PATH), 'style.css');
const STORAGE_KEY = requireApp().THEME_STORAGE_KEY;

function currentTheme() {
  return document.documentElement.getAttribute('data-theme');
}

function toggle() {
  return document.getElementById('theme-toggle');
}

/** Every CSS rule as { selector, body }. Good enough for a flat stylesheet without @media. */
function cssRules(css) {
  const rules = [];
  const re = /([^{}]+)\{([^}]*)\}/g;
  let match;
  while ((match = re.exec(css.replace(/\/\*[\s\S]*?\*\//g, ''))) !== null) {
    rules.push({ selector: match[1].trim(), body: match[2] });
  }
  return rules;
}

function variableNames(body) {
  return (body.match(/--[\w-]+(?=\s*:)/g) || []).sort();
}

describe('theme toggle (TODO-231)', () => {
  test('AC-1: the header has a toggle that switches theme and names the theme you get next', async () => {
    await loadApp();
    const button = document.querySelector('#app-header #theme-toggle');
    expect(button).not.toBeNull();

    expect(currentTheme()).toBe('dark');
    expect(button.textContent).toMatch(/light/i);
    expect(button.getAttribute('aria-label')).toMatch(/light/i);

    button.click();
    expect(currentTheme()).toBe('light');
    expect(button.textContent).toMatch(/dark/i);
    expect(button.getAttribute('aria-label')).toMatch(/dark/i);

    button.click();
    expect(currentTheme()).toBe('dark');
  });

  test('AC-2: charts get their colours from CSS only, and app.js holds no colours', async () => {
    await loadApp();
    const marks = document.querySelectorAll(
      '#chart-on-time .bar, #chart-on-time .bar-label, #chart-on-time .bar-value, ' +
      '#chart-tickets .bar, #chart-tickets .bar-label, #chart-tickets .bar-value'
    );
    expect(marks.length).toBeGreaterThan(0);
    marks.forEach((el) => {
      expect(el.getAttribute('fill')).toBeNull();
      expect(el.getAttribute('style')).toBeNull();
    });

    const source = fs.readFileSync(APP_PATH, 'utf8');
    expect(source).not.toMatch(/#[0-9a-f]{3,8}\b/i);
    expect(source).not.toMatch(/\b(rgba?|hsla?)\(/i);
  });

  test('AC-2: style.css defines the same variables for both themes and no colour outside them', () => {
    const css = fs.readFileSync(CSS_PATH, 'utf8');
    const rules = cssRules(css);
    const light = rules.find((r) => r.selector.includes('[data-theme="light"]'));
    const dark = rules.find((r) => r.selector.includes('[data-theme="dark"]'));
    expect(light).toBeDefined();
    expect(dark).toBeDefined();

    const lightVars = variableNames(light.body);
    expect(lightVars).toEqual(variableNames(dark.body));
    expect(lightVars).toEqual(expect.arrayContaining(['--chart-bar', '--chart-bar-warn', '--chart-label', '--chart-value']));

    rules
      .filter((r) => r !== light && r !== dark)
      .forEach((r) => {
        expect({ selector: r.selector, colour: r.body.match(/#[0-9a-f]{3,8}\b|\b(rgba?|hsla?)\(/i) })
          .toEqual({ selector: r.selector, colour: null });
      });
  });

  test('AC-3: clicking the toggle saves the choice in localStorage', async () => {
    await loadApp();
    toggle().click();
    expect(localStorage.getItem(STORAGE_KEY)).toBe('light');
    toggle().click();
    expect(localStorage.getItem(STORAGE_KEY)).toBe('dark');
  });

  test('AC-3: a saved theme is restored on load', async () => {
    await loadApp({ storage: { [STORAGE_KEY]: 'light' } });
    expect(currentTheme()).toBe('light');
    expect(toggle().textContent).toMatch(/dark/i);

    await loadApp({ storage: { [STORAGE_KEY]: 'dark' } });
    expect(currentTheme()).toBe('dark');
    expect(toggle().textContent).toMatch(/light/i);
  });

  test('AC-4: with nothing saved the page starts dark, whatever the OS prefers', async () => {
    const matchMedia = jest.fn(() => ({
      matches: true,
      media: '(prefers-color-scheme: light)',
      addListener() {},
      removeListener() {},
      addEventListener() {},
      removeEventListener() {}
    }));
    window.matchMedia = matchMedia;
    try {
      await loadApp();
      expect(currentTheme()).toBe('dark');
      expect(matchMedia).not.toHaveBeenCalled();
    } finally {
      delete window.matchMedia;
    }

    expect(fs.readFileSync(CSS_PATH, 'utf8')).not.toMatch(/prefers-color-scheme/);
    expect(readIndexHtml()).toMatch(/<html[^>]*\sdata-theme="dark"/);
  });

  test('AC-3: a saved theme is applied from <head>, before the page body renders', () => {
    const html = readIndexHtml();
    const head = html.match(/<head>([\s\S]*)<\/head>/)[1];
    expect(head).toMatch(/<script src="app\.js"><\/script>/);

    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem(STORAGE_KEY, 'light');
    expect(requireApp().applySavedTheme(document)).toBe('light');
    expect(currentTheme()).toBe('light');
    localStorage.clear();
  });

  test('AC-4: an unknown saved value falls back to dark', async () => {
    await loadApp({ storage: { [STORAGE_KEY]: 'purple' } });
    expect(currentTheme()).toBe('dark');
    expect(document.getElementById('status-line').classList.contains('error')).toBe(false);
  });
});
