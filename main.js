const welcomeMessage = {
    0: [ // 1시간 미만
        "컴퓨터 사용 시간이 매우 짧네요. 😀",
        "컴퓨터를 거의 사용하지 않으셨네요. 😁",
        "오늘 하루 컴퓨터 사용을 줄여봐요! 😄"
    ],
    1: [ // 2시간 미만
        "컴퓨터 사용 시간이 1시간을 넘어섰어요. 🙄",
        "과한 컴퓨터 사용은 독이 됩니다. 🤢",
        "컴퓨터 사용 시간을 계획한 후 사용해봐요. 😊"
    ],
    2: [ // 3시간 미만
        "컴퓨터 사용 시간이 벌써 2시간을 넘어섰네요. 😏",
        "컴퓨터 사용 중 스트레칭은 잊지 마세요. 😎",
        "컴퓨터를 너무 오래 사용하지 않도록 주의하세요! 🤫"
    ],
    3: [ // 4시간 미만
        "벌써 컴퓨터를 3시간 넘게 사용하셨어요! 😮",
        "하루의 8분의 1 이상을 컴퓨터에 사용하셨군요. 🙄",
        "과도한 컴퓨터 사용은 정상적인 일상 생활에 지장을 줄 수 있어요. 🤫"
    ],
    4: [ // 5시간 미만
        "컴퓨터를 4시간 넘게 사용하시고 계세요! 🙁",
        "하루의 6분의 1 이상을 컴퓨터에 사용하셨어요! 😦",
        "오늘 하루동안 컴퓨터를 너무 많이 사용하신 건 아닌가요? 🤫"
    ],
    5: [ // 6시간 미만
        "컴퓨터를 5시간 넘게 쓰고 계시군요. 🤔",
        "컴퓨터를 너무 많이 사용하신 것 같아요! 😦",
        "혹시 컴퓨터 때문에 피로하시진 않으신가요? 🤫"
    ],
    6: [ // 7시간 미만
        "하루의 4분의 1 이상을 컴퓨터를 하느라 사용해버리셨어요! 😱",
        "이제 컴퓨터를 그만 하시는 것을 추천드려요. 😬",
        "컴퓨터 때문에 늦게 주무시는 건 아니죠? 🤫"
    ],
    7: [ // 8시간 미만
        "이제 컴퓨터를 그만 하시고 다른 것을 찾아보시는게 어떤가요? 😯",
        "컴퓨터를 정말 많이 사용하셨네요. 😕",
        "컴퓨터 중독이 오래 지속되면 한 사람의 삶을 망쳐버릴 수도 있어요. 😬"
    ],
    8: [ // 9시간 미만
        "하루의 3분의 1 이상을 컴퓨터에 사용하셨어요. 😥",
        "컴퓨터를 너무 많이 하셨군요. 이제 그만 하실거죠? 😑",
        "컴퓨터 중독이 여러 정신 질환의 원인이 될 수도 있어요. 😞"
    ]
};

const themeColor = document.querySelector("meta[name='theme-color']");
const topBar = document.querySelector(".top");
const chrt1 = document.querySelector("#chart1");
const chrt2 = document.querySelector("#chart2");
const itrMsg1 = document.querySelector("#introMessage1");
const itrMsg2 = document.querySelector("#introMessage2");
const selDay = document.querySelector("#selDay");
const refreshDiv = document.querySelector(".top .refresh");

const ipc = require("electron").ipcRenderer;

let chart1;
let chart2;
let lastIndex;
let lastDay;
let elapsedTime = 0;
let usrNm;
let pw;

const thisWeek = {
    day: () => {
        let d = new Date();
        let result = [];
        for(var i = 6; i >= 0; i -= 1) {
            result[i] = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"][d.getDay()] + (i === 6 ? " (오늘)" : "");
            d.setDate(d.getDate() - 1);
        }
        return(result);
    },
    select: () => {
        let d = new Date();
        selDay.innerHTML = "";
        for(var i = 6; i >= 0; i -= 1) {
            let newOption = document.createElement("option");
            newOption.value = d.yyyymmdd();
            newOption.innerHTML = `${["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"][d.getDay()]} (${d.korean()})`;
            selDay.appendChild(newOption);
            d.setDate(d.getDate() - 1);
        }
    },
    totalTime: (data) => {
        let d = new Date();
        let result = [];
        for(var i = 6; i >= 0; i -= 1) {
            result[i] = dayTime.totalTime(data, d);
            d.setDate(d.getDate() - 1);
        }
        return(result);
    },
    topApps: (data) => {
        let result = {};

        Object.values(data).forEach((dayData) => {
            Object.values(JSON.parse(dayData)).forEach((apps) => {
                apps.forEach((app) => {
                    if(app in result) {
                        result[app] += 1;
                    } else {
                        result[app] = 1;
                    }
                });
            });
        });

        result = Object.keys(result).sort((a, b) => {
            return(result[b] - result[a]);
        });

        return result;
    },
    appDatasets: (data) => {
        let result = [];
        const topApps = thisWeek.topApps(data).slice(0, 5);

        topApps.forEach((app, index) => {

            let chrtData = [];
            let d = new Date();
            d.setDate(d.getDate() - 6);

            for(var i = 0; i < 7; i ++) {
                if(d.yyyymmdd() in data) {
                    Object.values(JSON.parse(data[d.yyyymmdd()])).forEach((apps) => {
                        apps.forEach((_app) => {
                            if(app === _app){
                                chrtData[i] = !chrtData[i] ? 1 : chrtData[i] + 1;
                            }
                        });
                    });
                } else {
                    chrtData[i] = 0;
                }
                d.setDate(d.getDate() + 1);
            }

            result[index] = {
                label: app,
                backgroundColor: ["#f44336", "#ff9800", "#ffeb3b", "#4caf50", "#2196f3"][index],
                data: chrtData
            };
        });
        return(result);
    }
};

const dayTime = {
    totalTime: (data, date) => {
        if(date.yyyymmdd() in data) {
            const dayData = JSON.parse(data[date.yyyymmdd()]);
            return(Object.keys(dayData).length);
        } else {
            return(0);
        }
    },
    appTime: (data, date) => {
        if(date.yyyymmdd() in data) {
            let result = {};
            Object.values(data).forEach((apps) => {
                apps.forEach((app) => {
                    if(app in result) {
                        result[app] += 1;
                    } else {
                        result[app] = 1;
                    }
                });
            });
            return(result);
        } else {
            return({});
        }
    },
    timeTable: (data, date, trs) => {
        trs.forEach((tr) => {
            tr.querySelectorAll("td").forEach((td) => {
                td.removeAttribute("data-tooltip-text");
                td.className = "";
            });
        });

        const topApps = thisWeek.topApps(data).slice(0, 5);

        if((data[date.yyyymmdd()])) {
            Object.keys(JSON.parse(data[date.yyyymmdd()])).forEach((time) => {
                let apps = JSON.parse(data[date.yyyymmdd()])[time];
                let td = trs[parseInt(time.split(":")[0])].querySelectorAll("td")[parseInt(time.split(":")[1])]

                if(apps.length > 0){
                    td.setAttribute("data-tooltip-text", apps.join("\n"));
                }

                if(apps.filter(value => topApps.includes(value)).length > 1) {
                    td.className = "purple";
                } else if(apps.includes(topApps[0])) {
                    td.className = "red";
                } else if(apps.includes(topApps[1])) {
                    td.className = "orange";
                } else if(apps.includes(topApps[2])) {
                    td.className = "yellow";
                } else if(apps.includes(topApps[3])) {
                    td.className = "green";
                } else if(apps.includes(topApps[4])) {
                    td.className = "blue";
                } else {
                    td.className = "white";
                }
            });
        }
    }
};

window.onscroll = () => {
    if(window.scrollY < 50) {
        topBar.style.backgroundColor = "transparent";
        themeColor.setAttribute("content",  "#202020");
    } else {
        topBar.style.backgroundColor = "rgb(73, 73, 73)";
        themeColor.setAttribute("content",  "#494949");
    }
};

window.onload = () => {
    const params = new URLSearchParams(location.search);
    usrNm = params.get("usrNm");
    pw = params.get("pw");

    document.querySelector(".top h1").innerHTML = `${usrNm}님의 컴퓨터 사용 통계`;

    getWholeData(usrNm, pw, (wholeData) => {
        const todTotalTm = dayTime.totalTime(wholeData, new Date(), true);
        {
            if(todTotalTm >= 60) {
                itrMsg1.innerHTML = `오늘 컴퓨터를 ${parseInt(todTotalTm / 60)}시간 ${todTotalTm % 60}분 사용하셨어요.`;
            } else {
                itrMsg1.innerHTML = `오늘 컴퓨터를 ${todTotalTm}분 사용하셨어요.`;
            }

            introMessage2.innerHTML = welcomeMessage[parseInt(todTotalTm / 60)][Math.floor(Math.random() * 3)];
            lastIndex = parseInt(todTotalTm / 60);
        } //itrMsg

        thisWeek.select();
        lastDay = new Date().getDate();

        let ctx = chrt1.getContext("2d");
        chart1 = new Chart(ctx, {
            type: "bar",
        
            data: {
                labels: thisWeek.day(),
                datasets: [{
                    backgroundColor: "rgb(255, 255, 255)",
                    data: thisWeek.totalTime(wholeData)
                }]
            },
        
            options: {
                maintainAspectRatio: false,
                title: {
                    display: true,
                    text: "지난 7일간 컴퓨터 사용 시간"
                },
                tooltips: {
                    enabled: true,
                    mode: "single",
                    callbacks: {
                        label: function(tooltipItems, data) {
                            if(data.datasets[0].data[tooltipItems.index] >= 60) {
                                return `${parseInt(data.datasets[0].data[tooltipItems.index] / 60)}시간 ${data.datasets[0].data[tooltipItems.index] % 60}분`;
                            } else {
                                return `${data.datasets[0].data[tooltipItems.index]}분`;
                            }
                        }
                    }
                },
                legend: {
                    display: false
                }
            }
        });

        ctx = chrt2.getContext("2d");
        chart2 = new Chart(ctx, {
            type: "horizontalBar",
        
            data: {
                labels: thisWeek.day(),
                datasets: thisWeek.appDatasets(wholeData)
            },
        
            options: {
                maintainAspectRatio: false,
                title: {
                    display: true,
                    text: "지난 7일간 앱 사용 시간"
                },
                tooltips: {
                    callbacks: {
                      label: function(tooltipItem, data) {
                        let time = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                        let name = data.datasets[tooltipItem.datasetIndex].label

                        if(time >= 60) {
                            return `${name}: ${parseInt(time / 60)}시간 ${time % 60}분`;
                        } else if(time > 0) {
                            return `${name}: ${time}분`;
                        } else {
                            return "";
                        }
                      }
                    }
                }
            }
        });
        
        dayTime.timeTable(wholeData, new Date(), document.querySelectorAll("#timeTable tr"));
        selDay.addEventListener("change", (e) => {
            dayTime.timeTable(wholeData, (e.target.value).ymdToDate(), document.querySelectorAll("#timeTable tr"));
        });
    });

    setInterval(refresh, 60000);
    setInterval(() => {
        elapsedTime += 1;
        refreshDiv.setAttribute("data-tooltip-text", `클릭하여 새로고침\n(${elapsedTime}초 전 갱신)`);
    }, 1000);
};

refreshDiv.querySelector("h2").addEventListener("animationend", (e) => {
    e.target.parentNode.classList.remove("color");
});

function refresh() {
    send(usrNm, pw, () => {
        getWholeData(usrNm, pw, (wholeData) => {
            const todTotalTm = dayTime.totalTime(wholeData, new Date(), true);
            {
                if(todTotalTm >= 60) {
                    itrMsg1.innerHTML = `오늘 컴퓨터를 ${parseInt(todTotalTm / 60)}시간 ${todTotalTm % 60}분 사용하셨어요.`;
                } else {
                    itrMsg1.innerHTML = `오늘 컴퓨터를 ${todTotalTm}분 사용하셨어요.`;
                }
    
                if(lastIndex === undefined || lastIndex !== parseInt(todTotalTm / 60)) {
                    introMessage2.innerHTML = welcomeMessage[parseInt(todTotalTm / 60)][Math.floor(Math.random() * 3)];
                    lastIndex = parseInt(todTotalTm / 60);
                }
            } //itrMsg
    
            {
                if(lastDay !== new Date().getDate()) {
                    thisWeek.select();
                    lastDay = new Date().getDate();
                }
            } //refresh select
    
            chart1.data = {
                labels: thisWeek.day(),
                datasets: [{
                    backgroundColor: "rgb(255, 255, 255)",
                    data: thisWeek.totalTime(wholeData)
                }]
            };
            chart1.update();
        
            chart2.data = {
                labels: thisWeek.day(),
                datasets: thisWeek.appDatasets(wholeData)
            };
            chart2.update();
            
            dayTime.timeTable(wholeData, new Date(), document.querySelectorAll("#timeTable tr"));
    
            refreshDiv.classList.add("color");
            elapsedTime = 0;
        });
    });
}

function send(usrNm, pw, cb) {
    const runningPs = ipc.sendSync("request").map(e => e.imageName);
    const psList = JSON.parse(localStorage.psList ? localStorage.psList : "[]").filter(e => runningPs.includes(e)).map(e => e.replace(/\.[^/.]+$/, ""));
    const req = [].concat(psList);
    const xhr = new XMLHttpRequest();

    xhr.onreadystatechange = () => {
        if(xhr.readyState == 4 && xhr.status == 200) {
            cb();
        }
    };

    xhr.open("POST", "https://gkak1345.cafe24.com/update.php");
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send(`usrNm=${usrNm}&pw=${pw}&req=${JSON.stringify(req)}`);
}

function getTimeTable() {
    dayTime.timeTable(wholeData, selDay.value, document.querySelectorAll("tr"));
}

function getWholeData(usrNm, pw, cb) {
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
        if(xhr.readyState == 4 && xhr.status == 200) {
            const result = JSON.parse(xhr.responseText);
            if(result.success) {
                Object.keys(result.stat).forEach((key) => {
                    if(!result.stat[key]) {
                        result.stat[key] = "{}";
                    }
                });
                cb(result.stat);
            } else if (result.error) {
                Swal.fire(
                    "로그인 실패",
                    `오류가 발생하였습니다. 에러 코드: ${result.code}`,
                    "error"
                );
            } else {
                Swal.fire(
                    "로그인 실패",
                    "이름과 비밀번호를 확인하세요.",
                    "warning"
                );
            }
        }
    }
    xhr.open("POST", "https://gkak1345.cafe24.com/get.php");
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send(`usrNm=${usrNm}&pw=${pw}`);
}

Date.prototype.yyyymmdd = function() {
    const yyyy = this.getFullYear().toString();
    const mm = (this.getMonth() + 1).toString();
    const dd = this.getDate().toString();
    return yyyy + (mm[1] ? mm : '0'+mm[0]) + (dd[1] ? dd : '0'+dd[0]);
}

Date.prototype.korean = function() {
    const m = (this.getMonth() + 1).toString();
    const d = this.getDate().toString();
    return `${m}월 ${d}일`;
}

String.prototype.ymdToDate = function() {
    const sYear = this.substring(0,4);
    const sMonth = this.substring(4,6);
    const sDate = this.substring(6,8);

    return new Date(Number(sYear), Number(sMonth)-1, Number(sDate));
}