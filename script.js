// Cache DOM elements
const body = document.body;
const toggleBtn = document.getElementById('toggle-dark');
const serialInput = document.getElementById('serial');
const resultDiv = document.getElementById('result');
const explanationDiv = document.getElementById('explanation');
const yearSpan = document.getElementById('year');
const modelInfoDiv = document.getElementById('model-info');
const modelImageDiv = document.getElementById('model-image');
const modelDetailsDiv = document.getElementById('model-details');
const guideLinksDiv = document.getElementById('guide-links');

// DARK MODE SETUP
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const savedTheme = localStorage.getItem('theme');

if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
  body.classList.add('dark-mode');
}

toggleBtn.addEventListener('click', () => {
  const isDark = body.classList.toggle('dark-mode');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
});

yearSpan.textContent = new Date().getFullYear();

// Serial number configuration
const serialConfig = {
  XAW1: [74000000, 120000000],
  XAW4: [11000000, 12000000],
  XAW7: [17800000, 30000000],
  XAJ1: [10200000, 30000000],
  XAJ4: [40460000, 40600000],
  XAJ7: [70040000, 70050000]
};

const messages = {
  unpatched: "✅ Unpatched – CFW ohne Modchip möglich!",
  maybe: "⚠️ Vielleicht – 50/50 Chance.",
  patched: "❌ Gepatcht – keine CFW ohne Modchip.",
  tooShort: "❗ Seriennummer zu kurz – bitte vollständige Nummer eingeben.",
  tooLong: "❗ Seriennummer zu lang – bitte nur die letzten 14 Zeichen eingeben.",
  invalid: "❗ Ungültiges Format – bitte nur gültige Seriennummern eingeben.",
  unknown: "❓ Unbekannte Seriennummer."
};

const explanationMessages = {
  unpatched: "Deine Switch ist definitiv ungepatcht und kann mit CFW modifiziert werden.",
  maybe: "Deine Switch könnte gepatcht sein. Es wird empfohlen, weitere Checks durchzuführen.",
  patched: "Deine Switch ist definitiv gepatcht. CFW ist nur mit einem Modchip möglich.",
  unknown: "Diese Seriennummer ist nicht in unserer Datenbank. Bitte überprüfe die Eingabe."
};

// Set of known patched prefixes for O(1) lookup
const patchedPrefixes = new Set([
  // Mariko (HAC-001(-01)) combinations
  'XKC1', // China
  'XKE1', // Europe
  'XKJ1', // Japan
  'XKK1', // Korea
  'XKL1', // Development
  'XKM1', // Malaysia
  'XKW1', // Americas
  
  // OLED (HEG-001) combinations
  'XTC1', // China
  'XTE1', // Europe
  'XTJ1', // Japan
  'XTK1', // Korea
  'XTL1', // Development
  'XTM1', // Malaysia
  'XTW1', // Americas

  // Switch Lite (HDH-001) combinations
  'XJC1', // China
  'XJE1', // Europe
  'XJJ1', // Japan
  'XJK1', // Korea
  'XJL1', // Development
  'XJM1', // Malaysia
  'XJW1'  // Americas
]);

// Model information configuration
const modelInfo = {
  HAC001: {
    name: 'Nintendo Switch (Original)',
    image: 'https://i.imgur.com/B2qzwtH.png',
    details: {
      'Display': '6.2" LCD (720p)',
      'Akkulaufzeit': '2.5 bis 6.5 Stunden',
      'Gewicht': 'ca. 398g (mit Joy-Cons)',
      'Erscheinungsdatum': 'März 2017',
      'Modellnummer': 'HAC-001'
    }
  },
  HAC001_01: {
    name: 'Nintendo Switch (Verbesserte Akkulaufzeit)',
    image: 'https://i.imgur.com/t9l6zpm.png',
    details: {
      'Display': '6.2" LCD (720p)',
      'Akkulaufzeit': '4.5 bis 9 Stunden',
      'Gewicht': 'ca. 398g (mit Joy-Cons)',
      'Erscheinungsdatum': 'August 2019',
      'Modellnummer': 'HAC-001(-01)'
    }
  },
  HDH001: {
    name: 'Nintendo Switch Lite',
    image: 'https://i.imgur.com/3uHxflH.png',
    details: {
      'Display': '5.5" LCD (720p)',
      'Akkulaufzeit': '3 bis 7 Stunden',
      'Gewicht': 'ca. 275g',
      'Erscheinungsdatum': 'September 2019',
      'Modellnummer': 'HDH-001'
    }
  },
  HEG001: {
    name: 'Nintendo Switch OLED',
    image: 'https://i.imgur.com/wF5mgEL.png',
    details: {
      'Display': '7" OLED (720p)',
      'Akkulaufzeit': '4.5 bis 9 Stunden',
      'Gewicht': 'ca. 420g (mit Joy-Cons)',
      'Erscheinungsdatum': 'Oktober 2021',
      'Modellnummer': 'HEG-001'
    }
  }
};

// Guide information based on patch status
const guideInfo = {
  unpatched: [
    {
      title: '📷 Niklas CFW Guide',
      url: 'https://www.youtube.com/watch?v=jMjc1DYtJKE',
      description: 'Anleitung zur Installation von Atmosphere CFW'
    }
  ],
  maybe: [
    {
      title: '❓ RCM Test Guide',
      url: 'https://nh-server.github.io/switch-guide/user_guide/rcm/',
      description: 'Teste ob deine Switch RCM-fähig ist'
    }
  ],
  patched: [
    {
      title: '⚠️ Modchip Einbau',
      url: 'https://discord.gg/niklascfw',
      description: 'Informationen zu Modchip-Optionen'
    }
  ]
};

// Debounce function to limit input processing
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function updateResult(result, explanation, type) {
  resultDiv.className = '';
  resultDiv.textContent = result;
  resultDiv.classList.add(`result-${type}`);
  explanationDiv.textContent = explanation || '';
}

function showModelInfo(prefix) {
  let model;
  
  // Determine model based on prefix
  if (patchedPrefixes.has(prefix)) {
    if (prefix.startsWith('XJ')) model = modelInfo.HDH001;
    else if (prefix.startsWith('XT')) model = modelInfo.HEG001;
    else model = modelInfo.HAC001_01;
  } else {
    model = modelInfo.HAC001;
  }

  // Create and load image before showing
  const img = new Image();
  img.onload = () => {
    // Show model image once loaded
    modelImageDiv.innerHTML = `<img src="${model.image}" alt="${model.name}" />`;
    
    // Show model details
    let detailsHTML = `<h4>${model.name}</h4><ul>`;
    for (const [key, value] of Object.entries(model.details)) {
      detailsHTML += `<li><strong>${key}:</strong> ${value}</li>`;
    }
    detailsHTML += '</ul>';
    modelDetailsDiv.innerHTML = detailsHTML;
    
    // Show the model info section
    requestAnimationFrame(() => {
      modelInfoDiv.classList.add('visible');
    });
  };
  img.src = model.image;
}

function showGuides(status) {
  const guides = guideInfo[status] || [];
  let guidesHTML = '';
  
  guides.forEach(guide => {
    guidesHTML += `
      <a href="${guide.url}" target="_blank" rel="noopener noreferrer" class="guide-link">
        ${guide.title}
        <div class="guide-description">${guide.description}</div>
      </a>
    `;
  });
  
  guideLinksDiv.innerHTML = guidesHTML;
  requestAnimationFrame(() => {
    document.getElementById('guide-info').classList.add('visible');
  });
}

// SWITCH CFW CHECK
const checkSerial = debounce((serial) => {
  serial = serial.toUpperCase().trim();
  
  // Hide info sections initially
  modelInfoDiv.classList.remove('visible');
  document.getElementById('guide-info').classList.remove('visible');

  // Clear previous results if input is empty
  if (!serial) {
    resultDiv.className = '';
    resultDiv.textContent = '';
    explanationDiv.textContent = '';
    return;
  }

  if (serial.length < 14) {
    updateResult(messages.tooShort, '', 'warning');
    return;
  }

  if (serial.length > 14) {
    updateResult(messages.tooLong, '', 'warning');
    return;
  }

  const prefix = serial.slice(0, 4);
  const number = parseInt(serial.slice(4, 14));

  if (isNaN(number)) {
    updateResult(messages.invalid, '', 'warning');
    return;
  }

  // Show model information
  showModelInfo(prefix);

  if (patchedPrefixes.has(prefix)) {
    updateResult(messages.patched, explanationMessages.patched, 'danger');
    showGuides('patched');
    return;
  }

  const config = serialConfig[prefix];
  if (!config) {
    updateResult(messages.unknown, explanationMessages.unknown, 'unknown');
    return;
  }

  const [unpatched, maybe] = config;
  if (number <= unpatched) {
    updateResult(messages.unpatched, explanationMessages.unpatched, 'success');
    showGuides('unpatched');
  } else if (number <= maybe) {
    updateResult(messages.maybe, explanationMessages.maybe, 'warning');
    showGuides('maybe');
  } else {
    updateResult(messages.patched, explanationMessages.patched, 'danger');
    showGuides('patched');
  }
}, 150);

serialInput.addEventListener('input', e => checkSerial(e.target.value)); 
