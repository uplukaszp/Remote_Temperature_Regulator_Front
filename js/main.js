document.addEventListener('DOMContentLoaded', function () {
    addNewDevicesIds();
    addFormListener();
    loadRegistredDevices();
    addModalListener();
})

function addNewDevicesIds() {
    const deviceSelector = document.querySelector("#selectId");

    fetch("http://localhost:8080/device/find", {
        mode: "cors",
        method: "get",
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(response => {
        response.json().then(response => {
            while (deviceSelector.length > 0) deviceSelector.remove(deviceSelector.length - 1);
            response.forEach(element => {
                const opt = document.createElement("option");
                opt.innerText = element.id;
                deviceSelector.add(opt);
            });
        })
    })
}

function addFormListener() {
    const form = document.querySelector("form");
    const deviceSelector = document.querySelector("#selectId");
    const deviceNameInput = document.querySelector("#inputName");
    console.log(form);
    form.addEventListener("submit", function (e) {
        e.preventDefault();
        console.log('fetch');
        fetch("http://localhost:8080/device/", {
            mode: "cors",
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: deviceSelector.value,
                name: deviceNameInput.value
            })
        }).then(response => {
            response.json().then(response => {
                const deviceList = document.querySelector("#deviceList");
                deviceList.appendChild(createDeviceCard(response));
                form.reset();
                addNewDevicesIds();
            })
        })
    })
}

function loadRegistredDevices() {
    fetch("http://localhost:8080/device/", {
        mode: "cors",
        method: "GET",
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(response => {
        response.json().then(response => {
            const deviceList = document.querySelector("#deviceList");
            while (deviceList.hasChildNodes()) deviceList.removeChild(deviceList.firstChild);
            response.forEach(device => {
                deviceList.appendChild(createDeviceCard(device));
                feather.replace();

            });
        })
    })
}

function createDeviceCard(device) {
    const content = document.createElement("div");
    content.setAttribute("id", "card-"+device.id);
    content.classList.add("col-12");
    content.classList.add("col-md-6");
    content.classList.add("mb-3");
    content.innerHTML = `<div class="card">
    <div class="card-header h4">
      ${device.name}
    </div>
    <div class="card-body row">
      <div class="col-5 col-xl-6 border rounded ml-auto ml-xl-2 mr-3 mb-3 py-3 px-0">
        <p class="h6 ml-3">Current temperature</p>
        <p class="text-center h1 my-3 text-nowrap" id="currentTemp">${parseFloat(device.info.currentTemperature).toFixed(1)}°C</p>
      </div>
      <div class="col-5 border rounded ml-0 mr-auto mr-xl-2 mb-3 py-3 px-0">
            <p class="h6 ml-3">Target temperature</p>
            <p class="text-center h1 my-3 text-nowrap ${(device.info.state==="auto")?"":"text-muted"}" id="targetTemp">${parseFloat(device.info.savedTemperature).toFixed(1)}°C</p>
       </div>

      <div class="col-4 border rounded ml-auto ml-xl-2 mr-3 py-3 px-0">
        <p class="h6 ml-3">Current state</p>
        <p class="h1 text-center" id="currentState">${device.info.state}</p>
      </div>

      <div class="col-3 border rounded mx-0 py-3 px-0">
        <p class="h6 ml-3">Mode</p>
        <div class="text-center my-3">
            <button type="button" class="btn btn-primary btn-lg" data-toggle="modal" data-target="#modeModal">Edit</button>
        </div>
        </div>

        <div class="col-3 ml-3 mr-auto mr-xl-3 border rounded py-3 px-0">
            <p class="h6 ml-3">Tasks</p>
            <div class="text-center my-3">
                <a href=task.html#${device.id} class="btn btn-primary btn-lg">Edit</a>
            </div>
     </div>
    </div>
  </div>
    `;
    const button = content.querySelector(".btn");
    button.dataset.device = JSON.stringify(device);
    addButtonListener(button, device.id);
    return content;
}



function addButtonListener(button, id) {
    button.addEventListener("click", function () {
        const device=JSON.parse(this.dataset.device);
        const info=device.info;
        const modal = document.querySelector(".modal");
        const radios = modal.querySelectorAll(".form-check-input");
        const tempInput = modal.querySelector(".form-control");
        tempInput.value = info.savedTemperature;
        modal.dataset.id = device.id;
        radios.forEach(radio => {
            radio.checked = false;
        })
        if (info.state === "auto") radios[0].checked = true;
        if (info.state === "on") radios[1].checked = true;
        if (info.state === "off") radios[2].checked = true;

        if (info.state === "auto") tempInput.disabled = false;
        else tempInput.disabled = true;
    })


}

function updateDeviceCardInfo(id, parameter) {
    const card = document.querySelector(`#card-${id}`);
    card.querySelector("#currentTemp").innerText = parseFloat(parameter.currentTemperature).toFixed(1) + '°C';
    card.querySelector("#currentState").innerText = parameter.state;
    card.querySelector("#targetTemp").innerText = parseFloat(parameter.savedTemperature).toFixed(1) + " °C";
    const device=JSON.parse(card.querySelector("button").dataset.device);
    device.parameters=parameter;
    card.querySelector("button").dataset.device=JSON.stringify(device);
    if (parameter.state === "auto") card.querySelector("#targetTemp").classList.remove("text-muted");
    else card.querySelector("#targetTemp").classList.add("text-muted");

}

function addModalListener() {
    const modal = document.querySelector(".modal");
    const saveButton = modal.querySelector(".btn-danger");
    const radios = modal.querySelectorAll(".form-check-input");
    const tempInput = modal.querySelector(".form-control");
    const form = modal.querySelector("form");
    form.addEventListener("submit", function (e) {
        if (tempInput.checkValidity()) {
            e.preventDefault();
            radios.forEach(radio => {
                if (radio.checked) {
                    const mode = radio.id.replace("Radio", "");
                    const url = `http://localhost:8080/device/${modal.dataset.id}/control/${mode}`;
                    const body = (mode === "auto") ? {
                        temperature: tempInput.value
                    } : "";
                    fetch(url, {
                        mode: "cors",
                        method: "PUT",
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(body),

                    }).then(resp => {
                        $('.modal').modal('hide');

                        resp.json().then(resp => {
                            console.log(resp);
                            updateDeviceCardInfo(modal.dataset.id, resp);
                        })
                    })
                }
            });
        } else {
            e.preventDefault();
        }

    })
    radios.forEach(radio => {
        radio.addEventListener("click", function () {
            if (this.id === "autoRadio") tempInput.disabled = false;
            else tempInput.disabled = true;
        })
    })
}