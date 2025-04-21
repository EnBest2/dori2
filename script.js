// Globális változók
let vacations = [];
let totalVacationDays = 25; // Alapértelmezett érték

// Oldal betöltésekor ellenőrizzük, hogy van-e mentett adat
document.addEventListener('DOMContentLoaded', function() {
  if (localStorage.getItem("totalVacationDays")) {
    totalVacationDays = parseInt(localStorage.getItem("totalVacationDays"));
    document.getElementById('totalDays').value = totalVacationDays;
  }
  
  if (localStorage.getItem("vacations")) {
    vacations = JSON.parse(localStorage.getItem("vacations"));
  }
  
  updateUI();
  
  // Teljes napok mentése
  document.getElementById('saveTotal').addEventListener('click', function(){
    let newTotal = parseInt(document.getElementById('totalDays').value);
    if (!isNaN(newTotal)) {
      totalVacationDays = newTotal;
      localStorage.setItem("totalVacationDays", totalVacationDays);
      updateUI();
    }
  });

  // Új szabadság hozzáadása (mindig 1 nap)
  document.getElementById('addVacationForm').addEventListener('submit', function(e) {
    e.preventDefault();
    let vacDate = document.getElementById('vacationDate').value;
    if (vacDate) {
      vacations.push({ date: vacDate });
      // Rendezzük a szabadságokat dátum szerint növekvő sorrendbe
      vacations.sort((a, b) => new Date(a.date) - new Date(b.date));
      localStorage.setItem("vacations", JSON.stringify(vacations));
      updateUI();
      document.getElementById('addVacationForm').reset();
    }
  });
});

// Számolja ki a felhasznált szabadság napokat
function calculateRemaining() {
  // Minden bejegyzés 1 napot jelent
  let usedDays = vacations.length;
  return totalVacationDays - usedDays;
}

// Ellenőrzi, hogy a megadott dátum teljesült-e (<= mai dátum)
function isCompleted(dateStr) {
  let todayStr = new Date().toISOString().slice(0, 10); // YYYY-MM-DD formátum
  return dateStr <= todayStr;
}

// Frissíti az összes UI elemet
function updateUI() {
  updateCounter();
  updateVacationList();
  updateMonthlySummary();
}

// Számláló frissítése
function updateCounter() {
  document.getElementById('displayTotal').textContent = totalVacationDays;
  document.getElementById('displayRemaining').textContent = calculateRemaining();
}

// Szabadságok listájának frissítése
function updateVacationList() {
  let list = document.getElementById('vacationList');
  list.innerHTML = "";
  vacations.forEach((vac, index) => {
    let li = document.createElement('li');
    let statusClass = isCompleted(vac.date) ? "completed" : "planned";
    let statusText = isCompleted(vac.date) ? "Teljesült" : "Tervezett";
    li.innerHTML = `<div class="vacation-item">
                      <span class="vacation-date">${index + 1}. ${vac.date}</span>
                      <span>1 nap - <span class="${statusClass}">${statusText}</span></span>
                    </div>
                    <button class="delete-btn" onclick="deleteVacation(${index})">Törlés</button>`;
    list.appendChild(li);
  });
}

// Törli a megadott indexű szabadság bejegyzést
function deleteVacation(index) {
  vacations.splice(index, 1);
  localStorage.setItem("vacations", JSON.stringify(vacations));
  updateUI();
}

// Havi összegzés elkészítése, felsorolva a napok dátumát és a hét napját
function updateMonthlySummary() {
  let summaryContainer = document.getElementById('summaryContainer');
  summaryContainer.innerHTML = "";
  
  // Csoportosítás hónapok szerint (YYYY-MM)
  let summaryData = {};
  vacations.forEach(vac => {
    let month = vac.date.slice(0, 7);
    if (!summaryData[month]) {
      summaryData[month] = [];
    }
    summaryData[month].push(vac.date);
  });
  
  // Rendezett hónapok
  let sortedMonths = Object.keys(summaryData).sort();
  sortedMonths.forEach(month => {
    let div = document.createElement('div');
    div.className = "summary-item";
    let title = document.createElement('p');
    title.innerHTML = `<strong>${month}</strong>`;
    div.appendChild(title);
    
    let ul = document.createElement('ul');
    // Rendezés az adott hónapban a napok szerint
    summaryData[month].sort();
    summaryData[month].forEach(dateStr => {
      let li = document.createElement('li');
      li.textContent = formatDateWithDay(dateStr);
      ul.appendChild(li);
    });
    div.appendChild(ul);
    summaryContainer.appendChild(div);
  });
}

// Formázza a dátumot: pl. "25. Péntek"
function formatDateWithDay(dateStr) {
  const dateObj = new Date(dateStr);
  const day = dateObj.getDate();
  const daysInHungarian = ["Vasárnap", "Hétfő", "Kedd", "Szerda", "Csütörtök", "Péntek", "Szombat"];
  const weekday = daysInHungarian[dateObj.getDay()];
  return day + ". " + weekday;
}
