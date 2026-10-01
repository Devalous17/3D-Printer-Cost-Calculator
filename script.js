try { if (localStorage.getItem('prints-pesos-theme-v1') === 'dark') document.documentElement.dataset.theme = 'dark'; } catch (_) {}

(() => {
      const $ = (id) => document.getElementById(id);
      const ids = ['printName', 'hours', 'grams', 'multiplier', 'hourRate', 'gramRate'];
      const defaults = { printName: '', hours: '4', grams: '35', multiplier: '4', hourRate: '25', gramRate: '2' };
      const settingsKey = 'prints-pesos-settings-v2';
      const previousSettingsKey = 'prints-pesos-settings-v1';
      const themeKey = 'prints-pesos-theme-v1';
      const fmt = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const number = (id, fallback = 0) => {
        const value = Number($(id).value);
        return Number.isFinite(value) && value >= 0 ? value : fallback;
      };
      const money = (value) => fmt.format(Number.isFinite(value) ? value : 0);
      let toastTimer;

      function calculate() {
        const hours = number('hours');
        const grams = number('grams');
        const hourRate = number('hourRate');
        const gramRate = number('gramRate');
        const multiplier = Math.min(8, Math.max(1, number('multiplier', 4)));
        const electric = hours * hourRate;
        const filament = grams * gramRate;
        const cost = electric + filament;
        const sale = cost * multiplier;
        const profit = sale - cost;
        const name = $('printName').value.trim();

        $('multiplierDisplay').textContent = `${multiplier.toFixed(1)}×`;
        $('salePrice').textContent = money(sale);
        $('priceCaption').textContent = `Based on a ${multiplier.toFixed(1)}× multiplier`;
        $('electricCost').textContent = money(electric);
        $('filamentCost').textContent = money(filament);
        $('baseCost').textContent = money(cost);
        $('profit').textContent = money(profit);
        $('profitMultiple').textContent = `${multiplier.toFixed(1)}×`;
        $('marginPercent').textContent = `${cost === 0 ? 0 : Math.round((profit / sale) * 100)}%`;
        $('rateSummary').textContent = `${money(hourRate)} / hr`;
        $('gramSummary').textContent = `${money(gramRate)} / g`;
        $('resultName').textContent = name ? `A quick estimate for ${name}.` : 'A quick estimate for your print.';
        storeSettings();
        return { name: name || 'Untitled print', hours, grams, hourRate, gramRate, multiplier, electric, filament, cost, sale, profit };
      }

      function storeSettings() {
        try {
          const data = Object.fromEntries(ids.map(id => [id, $(id).value]));
          localStorage.setItem(settingsKey, JSON.stringify(data));
        } catch (_) { /* The calculator still works if browser storage is unavailable. */ }
      }

      function announce(message) {
        const toast = $('toast');
        toast.textContent = message;
        toast.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
      }

      function setTheme(theme) {
        const dark = theme === 'dark';
        document.documentElement.dataset.theme = dark ? 'dark' : 'light';
        $('themeToggle').setAttribute('aria-pressed', String(dark));
        $('themeToggle').setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
        $('themeIcon').textContent = dark ? '☀' : '☾';
        $('themeLabel').textContent = dark ? 'Light mode' : 'Dark mode';
        document.querySelector('meta[name="theme-color"]').content = dark ? '#242321' : '#f8f5ed';
        try { localStorage.setItem(themeKey, dark ? 'dark' : 'light'); } catch (_) { /* The theme still changes for this visit. */ }
      }

      function saveQuote() {
        const q = calculate();
        const line = `${q.name} — ${q.hours} hr · ${q.grams} g · ${q.multiplier.toFixed(1)}× · ${money(q.sale)} suggested`;
        try {
          const key = 'prints-pesos-quotes-v1';
          const quotes = JSON.parse(localStorage.getItem(key) || '[]');
          quotes.unshift({ ...q, savedAt: new Date().toISOString() });
          const recent = quotes.slice(0, 25);
          localStorage.setItem(key, JSON.stringify(recent));
          renderQuotes(recent);
          $('savedQuotes').open = true;
          $('saveStatus').textContent = `Saved on this device: ${line}`;
          announce('Quote saved on this device');
        } catch (_) {
          $('saveStatus').textContent = 'Could not save in this browser. Your estimate is still shown above.';
        }
      }

      function renderQuotes(quotes) {
        $('quoteCount').textContent = String(quotes.length);
        const list = $('quoteList');
        list.replaceChildren();
        if (!quotes.length) {
          const empty = document.createElement('p');
          empty.className = 'hint';
          empty.textContent = 'Your saved estimates will show up here.';
          list.append(empty);
          return;
        }
        for (const quote of quotes) {
          const item = document.createElement('div');
          item.className = 'quote-item';
          const description = document.createElement('div');
          const title = document.createElement('strong');
          title.textContent = quote.name || 'Untitled print';
          const meta = document.createElement('small');
          meta.textContent = `${quote.hours} hr · ${quote.grams} g · ${Number(quote.multiplier).toFixed(1)}×`;
          const total = document.createElement('span');
          total.className = 'quote-total';
          total.textContent = money(Number(quote.sale) || 0);
          description.append(title, meta);
          item.append(description, total);
          list.append(item);
        }
      }

      function reset() {
        for (const id of ids) $(id).value = defaults[id];
        $('saveStatus').textContent = '';
        calculate();
        announce('Calculator reset to your starting values');
      }

      try {
        const currentSettings = localStorage.getItem(settingsKey);
        const saved = JSON.parse(currentSettings || localStorage.getItem(previousSettingsKey) || 'null');
        if (saved) for (const id of ids) if (typeof saved[id] === 'string') $(id).value = saved[id];
        if (saved && !currentSettings) {
          if (saved.hourRate === '2') $('hourRate').value = defaults.hourRate;
          if (saved.gramRate === '0.70') $('gramRate').value = defaults.gramRate;
        }
      } catch (_) { /* Use the starting values when stored settings cannot be read. */ }
      try { renderQuotes(JSON.parse(localStorage.getItem('prints-pesos-quotes-v1') || '[]')); }
      catch (_) { renderQuotes([]); }
      for (const id of ids) $(id).addEventListener('input', calculate);
      $('saveQuote').addEventListener('click', saveQuote);
      $('resetButton').addEventListener('click', reset);
      setTheme(document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');
      $('themeToggle').addEventListener('click', () => setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'));
      calculate();
    })();
