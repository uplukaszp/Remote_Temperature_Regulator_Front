const id = location.hash.substr(1);
document.addEventListener('DOMContentLoaded', function () {
    loadModalLogin();
    addLogoutListener();
    addFormListener();
    loadTasks();
    feather.replace()
})

function addFormListener() {
    const form = document.querySelector("form");
    const type = form.querySelector("#selectType");
    const state = form.querySelector("#selectState");
    const day = form.querySelector("#selectDay");
    const time = form.querySelector("#inputTime");
    const temp = form.querySelector("#inputTemp");
    const submit = form.querySelector(".btn");
    state.addEventListener("change", function () {
        if (this.value === 'OFF' || this.value === "ON") {
            temp.parentElement.classList.add("d-none");
            temp.required = false;
        } else {
            temp.parentElement.classList.remove("d-none");
            temp.required = true;
        }
    })
    form.addEventListener("submit", function (e) {
        submit.classList.add("disabled");
        submit.innerText = "Adding";
        e.preventDefault();
        const body = {
            dayOfWeek: day.selectedIndex,
            time: time.value,
            type: type.value.toLowerCase(),
            stateToSchedule: state.value.toLowerCase(),
            temperatureToSchedule: temp.value,
        };

        fetch(`http://localhost:8080/device/${id}/control/schedule/`, {
            mode: "cors",
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + window.localStorage.getItem('Basic')
            },
            body: JSON.stringify(body)

        }).then(response => {
            
            if (response.status === 401) {
                showModalLogin();
            }
            if (response.ok) {
                submit.classList.remove("disabled");
                submit.innerText = "Add";
                if (response.ok)
                    response.json().then(response => {
                        loadTask(response);
                        form.reset();
                    })
                else throw response;
            }
        }).catch(response => {
            if (response.status === 409) {
                if (!form.querySelector(".alert")) {
                    const alert = document.createElement("div");
                    alert.classList.add("alert");
                    alert.classList.add("alert-danger");
                    alert.classList.add("alert-dismissible");
                    alert.classList.add("fade");
                    alert.classList.add("show");
                    alert.innerHTML = `Cannot create two or more tasks in the same time <button type="button" class="close" data-dismiss="alert" aria-label="Close">
           <span aria-hidden="true">&times;</span>
         </button>`;
                    form.appendChild(alert);
                }
            } else console.log(response);
        })
    })
}

function loadTasks() {
    fetch(`http://localhost:8080/device/${id}/control/schedule/`, {
        mode: "cors",
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + window.localStorage.getItem('Basic')
        }
    }).then(response => {
        if (response.status === 401) {
            showModalLogin();
        }
        if (response.ok)
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
    timeCell.innerText = task.time.slice(0, -3);
    typeCell.innerText = task.type;
    stateCell.innerText = task.stateToSchedule;
    tempCell.innerText = (task.stateToSchedule === "off"||task.stateToSchedule === "on") ? "- °C" : parseFloat(task.temperatureToSchedule).toFixed(1) + " °C";
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
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + window.localStorage.getItem('Basic')
            }
        }).then(response => {
            if (response.status === 401) {
                showModalLogin();
            }
            if (response.ok)
                this.parentElement.parentElement.parentElement.removeChild(this.parentElement.parentElement);
        })
    })
}