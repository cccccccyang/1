// ====== Elements ======
const emailInput = document.getElementById('emailOrUsername');
const codeInput = document.getElementById('activationCode');
const sendBtn = document.getElementById('sendActivationCode');
const submitBtn = document.getElementById('submitBtn');
const countdownEl = document.getElementById('countdownDisplay');
const emailErr = document.getElementById('emailOrUsername-error');
const codeErr = document.getElementById('activationCode-error');
const statusMsg = document.getElementById('statusMessage');

// ====== Validation ======
function isValidIdentity(v){
  const s = (v || '').trim();
  if (!s) return false;
  if (s.includes('@')) {
    // 必须是 @wustl.edu
    return /^[^\s@]+@wustl\.edu$/i.test(s);
  }
  return s.length >= 3; // 用户名
}
function isValidCode(v){
  return (v || '').trim().length >= 6;
}

// 从邮箱/用户名推导用户名（用于跳转 query）
function deriveUsername(identity){
  const v = (identity || '').trim();
  const at = v.indexOf('@');
  return at > 0 ? v.slice(0, at) : v;
}

// ====== UI Sync ======
function syncButtons(){
  // 发送按钮：当身份合法且未在倒计时中，才可点
  const locked = sendBtn.dataset.locked === '1';
  sendBtn.disabled = !isValidIdentity(emailInput.value) || locked;

  // 登录按钮：身份合法 + code 合法 才可点
  submitBtn.disabled = !(isValidIdentity(emailInput.value) && isValidCode(codeInput.value));
}

// 即时校验提示
emailInput.addEventListener('input', () => {
  emailErr.textContent = isValidIdentity(emailInput.value)
    ? '' : 'Please enter a valid @wustl.edu email or a username (≥ 3 chars).';
  syncButtons();
});
codeInput.addEventListener('input', () => {
  codeErr.textContent = isValidCode(codeInput.value)
    ? '' : 'Please enter the 6-digit activation code.';
  syncButtons();
});

// ====== Countdown ======
function startCountdown(seconds = 60){
  sendBtn.dataset.locked = '1';
  let t = seconds;

  const render = () => {
    sendBtn.disabled = true;
    sendBtn.querySelector('.btn-text').textContent = `Resend in ${t}s`;
    countdownEl.textContent = `Resend available in ${t}s…`;
  };
  render();

  const timer = setInterval(() => {
    t -= 1;
    if (t <= 0){
      clearInterval(timer);
      delete sendBtn.dataset.locked;
      sendBtn.disabled = !isValidIdentity(emailInput.value);
      sendBtn.querySelector('.btn-text').textContent = 'Resend Activation Code';
      countdownEl.textContent = '';
      return;
    }
    render();
  }, 1000);
}

// ====== Send Activation Code ======
sendBtn.addEventListener('click', async () => {
  // 模拟异步发送
  const oldText = sendBtn.querySelector('.btn-text').textContent;
  sendBtn.disabled = true;
  sendBtn.querySelector('.btn-text').textContent = 'Sending…';

  await new Promise(r => setTimeout(r, 1000)); // 1s mock

  // 成功提示
  countdownEl.textContent = 'Activation code sent to your WashU email.';
  statusMsg.textContent = ''; // 全局状态区域可选
  startCountdown(60);
});

// ====== Submit/Login ======
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  // 前置校验
  const okIdentity = isValidIdentity(emailInput.value);
  const okCode = isValidCode(codeInput.value);
  emailErr.textContent = okIdentity ? '' : 'Please enter a valid @wustl.edu email or a username (≥ 3 chars).';
  codeErr.textContent = okCode ? '' : 'Please enter the 6-digit activation code.';
  if (!okIdentity || !okCode) return;

  // Loading 态
  submitBtn.disabled = true;
  const btnText = submitBtn.querySelector('.btn-text');
  const oldBtnLabel = btnText.textContent;
  btnText.textContent = 'Verifying…';

  // 模拟验证
  await new Promise(r => setTimeout(r, 600));

  // 成功 → 0.6s 后跳转 /dashboard?user=<username>
  statusMsg.textContent = 'Login successful. Redirecting…';
  setTimeout(() => {
    const user = encodeURIComponent(deriveUsername(emailInput.value));
    window.location.href = `/dashboard?user=${user}`;
  }, 600);

  // 若你需要失败分支，可按需添加并恢复按钮
});

// 初始同步
syncButtons();
