document.addEventListener("DOMContentLoaded", () => {
  const signUpBtn = document.getElementById("signUpBtn");
  const loginBtn = document.getElementById("loginBtn");

  if (signUpBtn) signUpBtn.addEventListener("click", handleSignUp);
  if (loginBtn) loginBtn.addEventListener("click", handleLogin);
});

function handleSignUp() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const role = document.getElementById("role").value;

  if (username && password && role) {
    let users = JSON.parse(localStorage.getItem("users")) || [];
    const userExists = users.find((user) => user.username === username);

    if (userExists) {
      alert("User already exists. Please login.");
      window.location.href = "index.html";
    } else {
      users.push({ username, password, role });
      localStorage.setItem("users", JSON.stringify(users));
      alert("Sign Up successful! You can now log in.");
      window.location.href = "index.html";
    }
  } else {
    alert("Please fill all the fields.");
  }
}
function handleLogin() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const role = document.getElementById("role").value;

  let users = JSON.parse(localStorage.getItem("users")) || [];
  const user = users.find(
    (user) =>
      user.username === username &&
      user.password === password &&
      user.role === role
  );

  if (user) {
    // using session instead of localstorage because to access the two tabs with different user side by side.
    sessionStorage.setItem("currentUser", JSON.stringify(user));
    sessionStorage.setItem("userRole", role);
    alert("Login successful!");
    if (role === "candidate") {
      window.location.href = "candidate.html";
    } else {
      window.location.href = "recruiter.html";
    }
  } else {
    alert("Invalid credentials or role. Please try again.");
  }
}