window.onload = () => {
    if (localStorage.usrNm && localStorage.pw) {
        login(localStorage.usrNm, localStorage.pw, true);
    }
};

function login(usrNm = document.querySelector("#usrNm").value, pw = document.querySelector("#pw").value, auto = false) {
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
        if (xhr.readyState == 4 && xhr.status == 200) {
            const result = JSON.parse(xhr.responseText);
            if (result.success) {
                if (document.querySelector("#save").checked) {
                    localStorage.usrNm = usrNm;
                    localStorage.pw = pw;
                }
                post(
                    "./main.html",
                    {
                        usrNm: usrNm,
                        pw: pw,
                    },
                    "get"
                );
            } else if (result.error) {
                if (auto) {
                    localStorage.removeItem("usrNm");
                    localStorage.removeItem("pw");
                }
                Swal.fire("로그인 실패", `오류가 발생하였습니다. 에러 코드: ${result.code}`, "error");
            } else {
                if (auto) {
                    localStorage.removeItem("usrNm");
                    localStorage.removeItem("pw");
                }
                Swal.fire("로그인 실패", "이름과 비밀번호를 확인하세요.", "warning");
            }
        }
    };
    xhr.open("POST", "https://gkak1345.cafe24.com/login.php");
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send(`usrNm=${usrNm}&pw=${pw}`);
    return false;
}

function post(path, params, method = "post") {
    const form = document.createElement("form");
    form.method = method;
    form.action = path;

    for (const key in params) {
        if (params.hasOwnProperty(key)) {
            const hiddenField = document.createElement("input");
            hiddenField.type = "hidden";
            hiddenField.name = key;
            hiddenField.value = params[key];

            form.appendChild(hiddenField);
        }
    }

    document.body.appendChild(form);
    form.submit();
}
