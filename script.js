// Globale Variablen
let selectedProfile = null;
let selectedYear = new Date().getFullYear();

const currentYear = new Date().getFullYear();
const profiles = {
    dom: { counter: 6, history: [] },
    lex: { counter: 6, history: [] }
};

// Initialisiere die Standarddaten
for (let i = 0; i < 6; i++) {
    const date = new Date(currentYear, i, 1);
    const entry = `${date.toLocaleDateString('de-DE')} am 12:00:00 - Do gehts oan glei besser!`;
    profiles.dom.history.push(entry);
    profiles.lex.history.push(entry);
}

// DOM-Elemente
const domProfile = document.getElementById('dom-profile');
const lexProfile = document.getElementById('lex-profile');
const jumpButton = document.getElementById('jump-button');
const splashContainer = document.getElementById('splash-container');
const historyTabs = document.querySelectorAll('.history-tab');
const historyLists = document.querySelectorAll('.history-list');
const lakeContainer = document.querySelector('.lake-container');
const yearSelect = document.getElementById('year-select');

// Event Listeners
domProfile.addEventListener('click', () => selectProfile('dom'));
lexProfile.addEventListener('click', () => selectProfile('lex'));
jumpButton.addEventListener('click', takeABath);
historyTabs.forEach(tab => tab.addEventListener('click', switchHistoryTab));
yearSelect.addEventListener('change', handleYearChange);

// Initialisiere die Jahresauswahl
function initYearSelect() {
    const startYear = currentYear - 0;
    const endYear = currentYear + 1;
    for (let year = startYear; year <= endYear; year++) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    }
    yearSelect.value = currentYear;
}

function handleYearChange() {
    selectedYear = parseInt(yearSelect.value);
    updateCalendarView(selectedProfile || 'dom');
}

function selectProfile(profile) {
    if (selectedProfile) {
        document.getElementById(`${selectedProfile}-profile`).classList.remove('selected');
    }
    selectedProfile = profile;
    document.getElementById(`${profile}-profile`).classList.add('selected');
    jumpButton.disabled = false;
    jumpButton.querySelector('.button-text').textContent = `${profile.toUpperCase()} hupf in See!`;
    updateCalendarView(profile);
}

function updateCalendarView(profile) {
    const historyList = document.getElementById(`${profile}-history`);
    historyList.innerHTML = '';

    const months = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

    months.forEach((month, index) => {
        const monthEntry = profiles[profile].history.find(entry => {
            const entryDate = new Date(entry.split(' ')[0].split('.').reverse().join('-'));
            return entryDate.getMonth() === index && entryDate.getFullYear() === selectedYear;
        });

        const monthElement = document.createElement('div');
        monthElement.classList.add('month-entry');
        
        if (monthEntry) {
            monthElement.classList.add('active');
            const entryDate = new Date(monthEntry.split(' ')[0].split('.').reverse().join('-'));
            monthElement.innerHTML = `
                <h3>${month}</h3>
                <p>${entryDate.getDate()}. ${month}</p>
            `;
        } else {
            monthElement.innerHTML = `<h3>${month}</h3>`;
        }

        historyList.appendChild(monthElement);
    });
}

let originalScrollPosition = 0;

function takeABath() {
    if (!selectedProfile || hasJumpedThisMonth(selectedProfile)) {
        showMessage(`He ${selectedProfile}, du woast des monat scho drin!`);
        return;
    }

    // Save the current scroll position
    originalScrollPosition = window.pageYOffset || document.documentElement.scrollTop;

    // Scroll to the top of the page
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });

    const profileElement = document.getElementById(`${selectedProfile}-profile`);
    const profileImageContainer = profileElement.querySelector('.profile-image-container');
    
    // Erstelle eine Kopie des Profilbildes
    const clonedImage = profileImageContainer.cloneNode(true);
    clonedImage.classList.add('bathing');
    lakeContainer.appendChild(clonedImage);

    createWaterDrops(clonedImage);
    updateCounter();
    updateHistory();
    // Aktualisiere den Kalender und stelle sicher, dass er sichtbar ist
    updateCalendarView(selectedProfile);
    document.querySelectorAll('.history-list').forEach(list => list.style.display = 'none');
    const activeList = document.getElementById(`${selectedProfile}-history`);
    activeList.style.display = 'grid';
    
    // Aktiviere den entsprechenden Tab
    document.querySelectorAll('.history-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelector(`.history-tab[data-profile="${selectedProfile}"]`).classList.add('active');
    
    showMessage(`Oke ${selectedProfile} des woa 2 cm koit!`);
    
    setTimeout(() => {
        lakeContainer.removeChild(clonedImage);
        
        // Scroll back to the original position
        window.scrollTo({
            top: originalScrollPosition,
            behavior: 'smooth'
        });
    }, 3000);
}

function createWaterDrops(element) {
    const lakeRect = lakeContainer.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();
    const centerX = elementRect.left + elementRect.width / 2 - lakeRect.left;
    const centerY = elementRect.top + elementRect.height / 2 - lakeRect.top;

    for (let i = 0; i < 30; i++) {
        setTimeout(() => {
            const drop = document.createElement('div');
            drop.classList.add('water-drop');
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 100 + 50;
            drop.style.left = `${centerX + Math.cos(angle) * distance}px`;
            drop.style.top = `${centerY + Math.sin(angle) * distance}px`;
            drop.style.width = `${Math.random() * 10 + 5}px`;
            drop.style.height = drop.style.width;
            splashContainer.appendChild(drop);
            setTimeout(() => drop.remove(), 1000);
        }, i * 50);
    }
}

function updateCounter() {
    profiles[selectedProfile].counter++;
    const counterElement = document.querySelector(`#${selectedProfile}-profile .counter`);
    counterElement.textContent = `${profiles[selectedProfile].counter} Monat${profiles[selectedProfile].counter !== 1 ? 'e' : ''}`;
}

function updateHistory() {
    const currentDate = new Date();
    const bathDate = currentDate.toLocaleDateString('de-DE');
    const bathTime = currentDate.toLocaleTimeString('de-DE');
    const bathEntry = `${bathDate} am ${bathTime} - Do gehts oan glei besser!`;

    profiles[selectedProfile].history.unshift(bathEntry);

    // Begrenze die Historie auf einen Eintrag pro Monat
    profiles[selectedProfile].history = profiles[selectedProfile].history.filter((entry, index, self) =>
        index === self.findIndex((t) => {
            const entryDate = new Date(t.split(' ')[0].split('.').reverse().join('-'));
            const currentEntryDate = new Date(entry.split(' ')[0].split('.').reverse().join('-'));
            return entryDate.getMonth() === currentEntryDate.getMonth() && 
                   entryDate.getFullYear() === currentEntryDate.getFullYear();
        })
    );

    updateCalendarView(selectedProfile);
}
// Funktion zum Überprüfen, ob ein Bad im aktuellen Monat bereits genommen wurde
function hasJumpedThisMonth(profile) {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    return profiles[profile].history.some(entry => {
        const entryDate = new Date(entry.split(' ')[0].split('.').reverse().join('-'));
        return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
    });
}

// Historie-Tabs Funktionalität
function switchHistoryTab(event) {
    const profile = event.target.dataset.profile;
    
    // Deaktiviere alle Tabs und verstecke alle Kalender
    historyTabs.forEach(tab => tab.classList.remove('active'));
    historyLists.forEach(list => {
        list.classList.remove('active');
        list.style.display = 'none';  // Verstecke alle Kalender
    });
    
    // Aktiviere den ausgewählten Tab
    event.target.classList.add('active');
    
    // Zeige den Kalender des ausgewählten Profils
    const activeList = document.getElementById(`${profile}-history`);
    activeList.classList.add('active');
    activeList.style.display = 'grid';  // Zeige den aktiven Kalender
    
    // Aktualisiere die Kalenderansicht für das ausgewählte Profil
    updateCalendarView(profile);
}

// Nachricht anzeigen
function showMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    messageElement.classList.add('message');
    document.body.appendChild(messageElement);

    setTimeout(() => {
        messageElement.classList.add('show');
        setTimeout(() => {
            messageElement.classList.remove('show');
            setTimeout(() => messageElement.remove(), 500);
        }, 3000);
    }, 10);
}

// Lokale Speicherung
function saveData() {
    localStorage.setItem('strondbodbuamData', JSON.stringify(profiles));
}

function loadData() {
    const savedData = localStorage.getItem('strondbodbuamData');
    if (savedData) {
        Object.assign(profiles, JSON.parse(savedData));
    }
    updateUI();
    
    // Zeige den Kalender des ersten Profils (z.B. 'dom')
    const firstProfile = 'dom';
    document.querySelector(`.history-tab[data-profile="${firstProfile}"]`).classList.add('active');
    document.getElementById(`${firstProfile}-history`).classList.add('active');
    document.getElementById(`${firstProfile}-history`).style.display = 'grid';
    updateCalendarView(firstProfile);
}

function updateUI() {
    ['dom', 'lex'].forEach(profile => {
        const counterElement = document.querySelector(`#${profile}-profile .counter`);
        counterElement.textContent = `${profiles[profile].counter} Monat${profiles[profile].counter !== 1 ? 'e' : ''}`;
    });
}

// Event Listener für Speicherung
['click', 'touchend'].forEach(evt => 
    document.body.addEventListener(evt, saveData, true)
);

// Initialisierung
loadData();

// Easter Egg: Geheime Tastenkombination
let secretCode = '';
document.addEventListener('keydown', (e) => {
    secretCode += e.key;
    if (secretCode.includes('strondbodbuam')) {
        showMessage('You found the secret Strondbodbuam code! 🎉');
        createWaterDrops(document.querySelector('.lake-container'));
        secretCode = '';
    }
});

function resetData() {
    const currentYear = new Date().getFullYear();
    profiles.dom = { counter: 6, history: [] };
    profiles.lex = { counter: 6, history: [] };

    // Setze die Standarddaten für die ersten 6 Monate
    for (let i = 0; i < 6; i++) {
        const date = new Date(currentYear, i, 1);
        const entry = `${date.toLocaleDateString('de-DE')} am 12:00:00 - Do gehts oan glei besser!`;
        profiles.dom.history.push(entry);
        profiles.lex.history.push(entry);
    }

    saveData();
    updateUI();
    updateCalendarView('dom');
    updateCalendarView('lex');
    selectedProfile = null;
    document.querySelectorAll('.profile').forEach(profile => profile.classList.remove('selected'));
    jumpButton.disabled = true;
    jumpButton.querySelector('.button-text').textContent = 'Geht scho!';
    
    // Setze die Jahresauswahl zurück
    yearSelect.value = currentYear;
    selectedYear = currentYear;
    
    showMessage('Alle Daten wurden zurückgesetzt!');
}

// Event Listener für den Reset-Button
document.getElementById('reset-button').addEventListener('click', resetData);


function populateYearSelector() {
    const yearSelect = document.getElementById('year-select');
    const startYear = currentYear  - 1;  // 5 Jahre zurück
    const endYear = currentYear + 3;    // 5 Jahre in die Zukunft

    for (let year = startYear; year <= endYear; year++) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        if (year === currentYear) {
            option.selected = true;
        }
        yearSelect.appendChild(option);
    }

    yearSelect.addEventListener('change', function() {
        selectedYear = parseInt(this.value);
        updateCalendarView(selectedProfile || 'dom');
    });
}

// Rufen Sie diese Funktion beim Laden der Seite auf
populateYearSelector();
initYearSelect();
loadData();