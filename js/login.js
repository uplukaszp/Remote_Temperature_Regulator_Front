function loadModalLogin() {
    fetch('login.html')
        .then(response => response.text())
        .then(response => {
            const dom = new DOMParser().parseFromString(response, 'text/html');
            document.querySelector('.container-fluid').appendChild(dom.body.firstChild);
            const modal = document.querySelector('#loginModal');
            const form = modal.querySelector("form");
            const login = modal.querySelector('#loginInput');
            const password = modal.querySelector('#passwordInput');
            form.addEventListener("submit", function (e) {
                e.preventDefault();
                var token = (login.value + ':' + password.value);
                window.localStorage.setItem('Basic', btoa(unescape(encodeURIComponent(token))));

                fetch("http://localhost:8080/device/find", {
                    mode: "cors",
                    method: "get",
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Basic ' + window.localStorage.getItem('Basic')
                    }
                }).then(response => {
                    if (response.ok) {
                        const alert=form.querySelector('.alert');
                        if(alert)alert.remove();
                        location.reload();
                    } else {
                        if (!form.querySelector(".alert")) {
                            const alert = document.createElement("div");
                            alert.classList.add("alert");
                            alert.classList.add("alert-danger");
                            alert.classList.add("alert-dismissible");
                            alert.classList.add("fade");
                            alert.classList.add("show");
                            alert.classList.add("mx-5")
                            alert.classList.add("mt-3");
                            alert.classList.add("mb-1");
                            alert.innerHTML = `Wrong login or password <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                   <span aria-hidden="true">&times;</span>
                 </button>`;
                            form.insertAdjacentElement('afterbegin', alert);
                        }
                    }
                })
            })
        })
}
function addLogoutListener(){
    const navbar=document.querySelector('.navbar');
    const logout=navbar.querySelector('.nav-item');
    console.log(logout);
    logout.addEventListener('click',function(){
        window.localStorage.removeItem('Basic');
    })
}
function showModalLogin() {
    $("#loginModal").modal();
}

function hideModalLogin() {
    $("#loginModal").modal('hide');
}