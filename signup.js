function showAgg() {
    Swal.fire({
        title: "이용 약관",
        html:
          "<div style='text-align: left; font-size: 13px'>" +
          "ㆍ 사용자가 입력한 이름, 비밀번호는 암호화되어 서버에 저장됩니다.<br>" +
          "ㆍ 서버에 저장된 정보는 서비스가 종료되거나 사용자가 계정을 삭제하기 전까지 유지됩니다.<br>" +
          "ㆍ 컴퓨터 이용 통계를 포함한 모든 정보는 암호화되어 서버에 저장됩니다." +
          "</div>",
        showCloseButton: true,
        showConfirmButton: false
      })
}

function signup() {
    const info = {
        usrNm: document.querySelector("#usrNm").value,
        pw: document.querySelector("#pw").value,
        pwRe: document.querySelector("#pwRe").value,
    };

    if(info.pw === info.pwRe) {
        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = () => {
            if(xhr.readyState == 4 && xhr.status == 200) {
                const result = JSON.parse(xhr.responseText);
                if(result.success) {
                    Swal.fire(
                    "회원가입 성공",
                    '회원가입에 성공하였습니다.',
                    "success"
                    ).then(() => {
                        location.href = "./index.html";
                    });
                } else if (result.error) {
                    Swal.fire(
                    "회원가입 실패",
                    `오류가 발생하였습니다. 에러 코드: ${result.code}`,
                    "error"
                    );
                } else {
                    Swal.fire(
                    "회원가입 실패",
                    "이름이 이미 사용되고 있습니다.",
                    "warning"
                    );
                }
            }
        }
        xhr.open("POST", "https://gkak1345.cafe24.com/signup.php");
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.send(`usrNm=${document.querySelector("#usrNm").value}&pw=${document.querySelector("#pw").value}`);
    } else {
        Swal.fire(
            '회원가입 실패',
            '비밀번호 확인이 일치하지 않습니다.',
            'warning'
          );
    }
}