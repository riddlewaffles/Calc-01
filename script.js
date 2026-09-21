let items = [];

const itemForm = document.getElementById('item-form');
const itemList = document.getElementById('item-list');
const totalValueEl = document.getElementById('total-value');
const weeklyCostEl = document.getElementById('weekly-cost');
const monthlyCostEl = document.getElementById('monthly-cost');

itemForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('item-name').value;
    const price = parseFloat(document.getElementById('item-price').value);
    const durationDays = parseInt(document.getElementById('item-duration').value);

    const newItem = {
        id: Date.now(),
        name: name,
        price: price,
        durationDays: durationDays,
        isChecked: false,
        timerEndTime: null
    };

    items.push(newItem);
    itemForm.reset();
    renderTable();
    updateSummaries();
});

function toggleCheck(id) {
    const item = items.find(i => i.id === id);
    if (!item) return;

    item.isChecked = !item.isChecked;

    if (item.isChecked) {
        const durationMs = item.durationDays * 24 * 60 * 60 * 1000;
        item.timerEndTime = Date.now() + durationMs;
    } else {
        item.timerEndTime = null;
    }

    renderTable();
    updateSummaries();
}

function deleteItem(id) {
    items = items.filter(i => i.id !== id);
    renderTable();
    updateSummaries();
}

function renderTable() {
    itemList.innerHTML = '';

    items.forEach(item => {
        const tr = document.createElement('tr');
        if (item.isChecked) tr.classList.add('checked-row');

        const remainingText = item.isChecked ? formatRemainingTime(item.timerEndTime) : '--';

        tr.innerHTML = `
            <td>
                <input type="checkbox" ${item.isChecked ? 'checked' : ''} onchange="toggleCheck(${item.id})">
            </td>
            <td>${escapeHtml(item.name)}</td>
            <td>$${item.price.toFixed(2)}</td>
            <td>${item.durationDays} day(s)</td>
            <td id="timer-${item.id}">${remainingText}</td>
            <td>
                <button class="btn-delete" onclick="deleteItem(${item.id})">Remove</button>
            </td>
        `;
        itemList.appendChild(tr);
    });
}

function formatRemainingTime(endTime) {
    const totalSecs = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
    
    const days = Math.floor(totalSecs / 86400);
    const hours = Math.floor((totalSecs % 86400) / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;

    return `${days}d ${hours}h ${mins}m ${secs}s`;
}

function updateSummaries() {
    const totalVal = items.reduce((sum, item) => sum + item.price, 0);

    let weeklyCost = 0;
    let monthlyCost = 0;

    items.forEach(item => {
        if (item.isChecked) {
            const dailyRate = item.price / item.durationDays;
            weeklyCost += dailyRate * 7;
            monthlyCost += dailyRate * 30;
        }
    });

    totalValueEl.textContent = `$${totalVal.toFixed(2)}`;
    weeklyCostEl.textContent = `$${weeklyCost.toFixed(2)}`;
    monthlyCostEl.textContent = `$${monthlyCost.toFixed(2)}`;
}

setInterval(() => {
    let stateChanged = false;

    items.forEach(item => {
        if (item.isChecked && item.timerEndTime) {
            const timeLeft = item.timerEndTime - Date.now();

            if (timeLeft <= 0) {
                item.isChecked = false;
                item.timerEndTime = null;
                stateChanged = true;
            } else {
                const timerCell = document.getElementById(`timer-${item.id}`);
                if (timerCell) {
                    timerCell.textContent = formatRemainingTime(item.timerEndTime);
                }
            }
        }
    });

    if (stateChanged) {
        renderTable();
        updateSummaries();
    }
}, 1000);

function escapeHtml(str) {
    return str.replace(/[&<>"']/g, (m) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
    })[m]);
}