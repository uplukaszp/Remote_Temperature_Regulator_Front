const id = location.hash.substr(1);
document.addEventListener('DOMContentLoaded', function () {

    addFormListener();
    loadTasks();
    feather.replace()
})

function addFormListener() {
    const type = document.querySelector("#selectType");
    const state = document.querySelector("#selectState");
    const day = document.querySelector("#selectDay");
    const time = document.querySelector("#inputTime");
    const temp = document.querySelector("#inputTemp");
    const form = document.querySelector("form");
    state.addEventListener("change", function () {
        if (this.value === 'OFF') {
            temp.parentElement.classList.add("d-none");
            temp.required = false;
        } else {
            temp.parentElement.classList.remove("d-none");
            temp.required = true;
        }
    })
    form.addEventListener("submit", function (e) {
        e.preventDefault();
        const body = {
            dayOfWeek: day.selectedIndex + 1,
            time: time.value,
            type: type.value.toLowerCase(),
            stateToSchedule: state.value.toLowerCase(),
            temperatureToSchedule: temp.value,
        };

        fetch(`http://localhost:8080/device/${id}/control/schedule/`, {
            mode: "cors",
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)

        }).then(response => {
            response.json().then(response => {
                loadTask(response);
                form.reset();
                temp.parentElement.classList.remove("d-none");
                temp.required = true;
            })
        })
    })
}

function loadTasks() {
    fetch(`http://localhost:8080/device/${id}/control/schedule/`, {
        mode: "cors",
        method: "GET",
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(response => {
        response.json().then(response => {
            const tableBody = document.querySelector("tbody");
            response.forEach(task => {
                loadTask(task, tableBody);
            });
        })
    })
}

function loadTask(task, tableBody) {
    if (!tableBody) tableBody = document.querySelector("tbody");
    const row = document.createElement("tr");
    const dayCell = document.createElement("td");
    const timeCell = document.createElement("td");
    const typeCell = document.createElement("td");
    const stateCell = document.createElement("td");
    const tempCell = document.createElement("td");
    const aCell = document.createElement("td");
    const a = document.createElement("a");
    a.classList.add("trash-icon");
    a.innerHTML = `<i data-feather="trash"></i>`;
    a.dataset.taskId = task.id;
    aCell.appendChild(a);
    dayCell.innerText = task.dayOfWeek;
    timeCell.innerText = task.time.slice(0,-3);
    typeCell.innerText = task.type;
    stateCell.innerText = task.stateToSchedule;
    tempCell.innerText = (task.stateToSchedule === "off") ? "- °C" : parseFloat(task.temperatureToSchedule).toFixed(1) + " °C";
    dayCell.classList.add("lowerText");
    typeCell.classList.add("lowerText");
    stateCell.classList.add("lowerText");
    row.appendChild(dayCell);
    row.appendChild(timeCell);
    row.appendChild(typeCell);
    row.appendChild(stateCell);
    row.appendChild(tempCell);
    row.appendChild(aCell);
    tableBody.appendChild(row);
    feather.replace()
    addLinkListener(a);

}

function addLinkListener(a) {
    a.addEventListener("click", function () {
        fetch(`http://localhost:8080/device/${id}/control/schedule/${a.dataset.taskId}`, {
            mode: "cors",
            method: "DELETE",
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(response => {
            this.parentElement.parentElement.parentElement.removeChild(this.parentElement.parentElement);
        })
    })
}