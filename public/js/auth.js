document.addEventListener('DOMContentLoaded', () => {
  const loginTab = document.getElementById('loginTab');
  const signupTab = document.getElementById('signupTab');
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');

  // Check URL parameters for redirect target
  const urlParams = new URLSearchParams(window.location.search);
  const redirectTarget = urlParams.get('redirect') || '/index.html';

  // Check if user is already logged in
  checkAlreadyLoggedIn();

  async function checkAlreadyLoggedIn() {
    try {
      await API.getMe();
      // Already logged in, redirect away
      window.location.href = redirectTarget;
    } catch (err) {
      // Not logged in, stay on auth page
    }
  }

  // Switch between Login and Sign Up Tabs
  loginTab.addEventListener('click', () => {
    loginTab.classList.add('active');
    signupTab.classList.remove('active');
    loginForm.classList.add('active');
    signupForm.classList.remove('active');
  });

  signupTab.addEventListener('click', () => {
    signupTab.classList.add('active');
    loginTab.classList.remove('active');
    signupForm.classList.add('active');
    loginForm.classList.remove('active');
  });

  // Handle Login Submission
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    try {
      const res = await API.login(email, password);
      showToast(res.message || 'Login successful!', 'success');
      
      // Redirect to target after brief delay
      setTimeout(() => {
        window.location.href = redirectTarget;
      }, 1000);
    } catch (err) {
      showToast(err.message || 'Login failed. Check credentials.', 'error');
    }
  });

  // Handle Signup Submission
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('signupUsername').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;

    if (password !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    try {
      const res = await API.signup(username, email, password);
      showToast(res.message || 'Account created successfully!', 'success');
      
      // Redirect after brief delay
      setTimeout(() => {
        window.location.href = redirectTarget;
      }, 1000);
    } catch (err) {
      showToast(err.message || 'Sign up failed. User might already exist.', 'error');
    }
  });
});
