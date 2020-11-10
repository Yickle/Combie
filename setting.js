const runningPs = document.querySelector("#selApp");
const currApp = document.querySelector("#currApp");
const refreshBtn = document.querySelector("#refreshBtn");

let usrNm;

const ipc = require("electron").ipcRenderer;

window.onload = () => {
    const params = new URLSearchParams(location.search);
    usrNm = params.get("usrNm");

    getRunnPs();
    getPsList();
};

refreshBtn.addEventListener("animationend", (e) => {
    e.target.classList.remove("spin");
});

function getRunnPs() {
    const psList = ipc.sendSync("request");

    let result = [];
    runningPs.innerHTML = "";

    let currPsList = [];
    if (localStorage.psList) {
        currPsList = JSON.parse(localStorage.psList);
    }

    psList.forEach((value) => {
        if (!currPsList.includes(value.imageName)) {
            result.push(value.imageName);
        }
    });

    result = result.filter((item, index) => result.indexOf(item) === index);

    result.forEach((value) => {
        const newOption = document.createElement("option");
        newOption.value = value;
        newOption.innerText = value.replace(/\.[^/.]+$/, "");

        runningPs.appendChild(newOption);
    });

    refreshBtn.classList.add("spin");
}

function getPsList() {
    let psList = [];

    if (localStorage.psList) {
        psList = JSON.parse(localStorage.psList);
    }

    currApp.innerHTML = "";

    psList.forEach((value) => {
        const newOption = document.createElement("option");
        newOption.value = value;
        newOption.innerText = value.replace(/\.[^/.]+$/, "");

        currApp.appendChild(newOption);
    });
}

function addPs() {
    let psList = [];

    if (localStorage.psList) {
        psList = JSON.parse(localStorage.psList);
    }

    if (runningPs.value && !psList.includes(runningPs.value)) {
        psList.push(runningPs.value);
        localStorage.psList = JSON.stringify(psList);
        getPsList();
        getRunnPs();
    }
}

function removePs() {
    let psList = JSON.parse(localStorage.psList);

    if (currApp.value && psList.includes(currApp.value)) {
        psList = psList.filter((e) => e !== currApp.value);
        localStorage.psList = JSON.stringify(psList);
        getPsList();
        getRunnPs();
    }
}

function logout() {
    window.close();
    localStorage.removeItem("usrNm");
    localStorage.removeItem("pw");
    ipc.sendSync("logout");
}

function deleteAcc() {
    Swal.fire({
        title: "계정 탈퇴",
        text: "계정을 탈퇴하려면 비밀번호를 입력하세요.",
        input: "password",
        inputPlaceholder: "비밀번호를 입력하세요.",
        inputAttributes: {
            autocapitalize: "off",
        },
        showCancelButton: true,
        confirmButtonText: "탈퇴",
        cancelButtonText: "취소",
        showLoaderOnConfirm: true,
    }).then((result) => {
        if (result.isConfirmed) {
            const xhr = new XMLHttpRequest();
            xhr.onreadystatechange = () => {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    const reqResult = JSON.parse(xhr.responseText);
                    console.log(reqResult);
                    if (reqResult.success) {
                        swal.fire("계정 탈퇴", "계정 탈퇴에 성공하였습니다.", "success").then(() => {
                            logout();
                        });
                    } else {
                        swal.fire("계정 탈퇴", "계정 탈퇴에 실패하였습니다.", "error");
                    }
                }
            };
            xhr.open("POST", "https://gkak1345.cafe24.com/deleteAcc.php");
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            xhr.send(`usrNm=${usrNm}&pw=${result.value}`);
        }
    });
}

function startOnBoot() {
    const isEnabled = ipc.sendSync("isAutoLaunchEnabled");

    if (isEnabled) {
        Swal.fire({
            title: "앱 자동 실행",
            text: "앞으로 부팅 시 앱을 자동으로 실행할까요?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "예",
            cancelButtonText: "아니오",
        }).then((result) => {
            if (result.isConfirmed) {
                ipc.sendSync("toggleAutoLaunch");
                Swal.fire("앱 자동 실행", "앞으로 부팅 시 앱을 자동으로 실행합니다.", "success");
            }
        });
    } else {
        Swal.fire({
            title: "앱 자동 실행",
            text: "앞으로 부팅 시 앱 자동 실행을 중지할까요?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "예",
            cancelButtonText: "아니오",
        }).then((result) => {
            if (result.isConfirmed) {
                ipc.sendSync("toggleAutoLaunch");
                Swal.fire("앱 자동 실행", "앞으로 부팅 시 앱을 자동으로 실행하지 않습니다.", "success");
            }
        });
    }
}
