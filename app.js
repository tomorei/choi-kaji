const tasks = [
  "洗面台をサッと拭く","鏡の汚れを1か所拭く","トイレの床を少し拭く",
  "キッチンのシンクを流す","コンロ周りを軽く拭く","冷蔵庫の表面を拭く",
  "テーブルの上をリセット","床のゴミを3つ拾う","玄関の靴をそろえる",
  "ドアノブを拭く","ゴミを1つまとめる","空き缶を集める",
  "不要な紙を5枚捨てる","レシートを整理する","カバンの中を整理する",
  "財布の中を整理する","机の引き出しを1段片付ける","洗濯物を少したたむ",
  "ハンガーをそろえる","タオルをたたみ直す","アプリを3つ消す",
  "写真を5枚消す","デスクトップを整理する","タブを閉じる",
  "不要なメールを5通消す","通知を1つオフにする","スクショ整理",
  "パスワードを1つ確認","ホーム画面整理","植物に水をあげる",
  "布団を整える","クッションを整える","棚の上を拭く",
  "リモコンを拭く","充電ケーブルをまとめる","時計を見る（深呼吸）"
];

const startBtn = document.getElementById("startBtn");
const skipBtn = document.getElementById("skipBtn");
const taskEl = document.getElementById("task");
const timerEl = document.getElementById("timer");
const messageEl = document.getElementById("message");
const streakEl = document.getElementById("streak");
const bar = document.getElementById("bar");

function todayStr() {
  const d = new Date();
  d.setHours(d.getHours() + 9);
  return d.toISOString().slice(0,10);
}
const today = todayStr();

let timer;
let timeLeft = 180;

let data = JSON.parse(localStorage.getItem("kajiData")) || {
  lastDate: null,
  streak: 0,
  status: null,
  running: null
};

function save() {
  localStorage.setItem("kajiData", JSON.stringify(data));
}

function yesterday() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0,10);
}

function updateStreak() {
  streakEl.textContent =
    data.streak > 0 ? `🔥 ゆる連続 ${data.streak}日` : "無理しないでOK";
}

function format(sec) {
  return `${String(Math.floor(sec/60)).padStart(2,"0")}:${String(sec%60).padStart(2,"0")}`;
}

function playFinishSound() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = 880;
  gain.gain.value = 0.03;
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.15);
}

function finishTask() {
  clearInterval(timer);
  timerEl.textContent = "完了！";
  playFinishSound();

  if (data.lastDate !== yesterday()) data.streak = 1;
  else data.streak++;

  data.lastDate = today;
  data.status = "done";
  data.running = null;
  save();
  updateStreak();

  messageEl.textContent = "ちょい家事、完了。今日はここまで 🌱";
}

function startTimer(startTime) {
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  timeLeft = Math.max(180 - elapsed, 0);
  timerEl.textContent = format(timeLeft);
  bar.style.width = (timeLeft / 180) * 100 + "%";

  timer = setInterval(() => {
    timeLeft--;
    timerEl.textContent = format(timeLeft);
    bar.style.width = (timeLeft / 180) * 100 + "%";
    if (timeLeft <= 0) finishTask();
  }, 1000);
}

updateStreak();

if (data.running && data.lastDate !== today) {
  taskEl.textContent = data.running.task;
  startBtn.disabled = true;
  skipBtn.disabled = true;
  startTimer(data.running.start);
}

startBtn.onclick = () => {
  const task = tasks[Math.floor(Math.random() * tasks.length)];
  taskEl.textContent = task;
  startBtn.disabled = true;
  skipBtn.disabled = true;

  data.running = { start: Date.now(), task };
  save();
  startTimer(data.running.start);
};

skipBtn.onclick = () => {
  data.lastDate = today;
  data.status = "skip";
  data.running = null;
  save();
  startBtn.disabled = true;
  skipBtn.disabled = true;
  taskEl.textContent = "今日は休もう";
  timerEl.textContent = "✓";
  bar.style.width = "0%";
  messageEl.textContent = "また明日、ちょい家事 🌙";
};
