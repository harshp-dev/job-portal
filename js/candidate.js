// user route protection, if candidate will try to access the recruiter's page then it won't allow
document.addEventListener("DOMContentLoaded", function () {
  const userRole = sessionStorage.getItem("userRole");
  if (userRole !== "candidate") {
    alert("You are not allowed to access this page");
    if (userRole === "recruiter") {
      window.location.href = "../recruiter.html";
    } else {
      window.location.href = "../index.html";
    }
  }
});
document.addEventListener("DOMContentLoaded", function () {
  // Load job listings on page load
  fetchJobs();

  // Search Functionality
  document.getElementById("search-btn").addEventListener("click", searchJobs);

  // Close Modal on Click
  document.querySelector(".close").addEventListener("click", () => {
    document.getElementById("apply-modal").style.display = "none";
  });

  // Add logout functionality
  document.getElementById("logout-btn").addEventListener("click", function () {
    localStorage.removeItem("loggedInUser");
    window.location.href = "index.html";
  });
});

// Fetch jobs from `jobs.json`
function fetchJobs() {
  fetch("../data/jobs.json")
    .then((response) => response.json())
    .then((jobs) => {
      displayJobs(jobs);
    })
    .catch((error) => console.error("Error loading jobs:", error));
}

function displayJobs(jobs) {
  const jobContainer = document.getElementById("job-listings");
  jobContainer.innerHTML = ""; // Clear previous results

  jobs.forEach((job) => {
    const jobCard = document.createElement("div");
    jobCard.classList.add("job-card");

    jobCard.innerHTML = `
              <h3>${job.title}</h3>
              <p><strong>Company:</strong> ${job.company}</p>
              <p><strong>Category:</strong> ${job.category}</p>
              <p><strong>Department:</strong> ${job.department}</p>
              <p><strong>Level:</strong> ${job.level}</p>
              <p><strong>Location:</strong> ${job.location}</p>
              <p><strong>Description:</strong> ${job.description}</p>
              <button class="apply-btn" data-job-id="${job.id}" ${
      job.applied ? "disabled" : ""
    }>
                  ${job.applied ? "Applied" : "Apply"}
              </button>
          `;

    jobContainer.appendChild(jobCard);
  });

  // Add event listeners to Apply buttons
  document.querySelectorAll(".apply-btn").forEach((button) => {
    button.addEventListener("click", openApplyModal);
  });
}

function searchJobs() {
  const searchQuery = document
    .getElementById("search-input")
    .value.toLowerCase();

  fetch("../data/jobs.json")
    .then((response) => response.json())
    .then((jobs) => {
      const filteredJobs = jobs.filter(
        (job) =>
          job.category.toLowerCase().includes(searchQuery) ||
          job.department.toLowerCase().includes(searchQuery) ||
          job.level.toLowerCase().includes(searchQuery)
      );
      displayJobs(filteredJobs);
    })
    .catch((error) => console.error("Error searching jobs:", error));
}

function openApplyModal(event) {
  const jobId = event.target.getAttribute("data-job-id");
  localStorage.setItem("applyingJobId", jobId);

  // Show Modal
  document.getElementById("apply-modal").style.display = "flex";

  // Remove any existing event listeners
  const form = document.getElementById("apply-form");
  const newForm = form.cloneNode(true);
  form.parentNode.replaceChild(newForm, form);

  // Add new event listener
  newForm.addEventListener("submit", applyForJob);
}

function applyForJob(event) {
  event.preventDefault();

  const name = document.getElementById("applicant-name").value.trim();
  const email = document.getElementById("applicant-email").value.trim();
  const cv = document.getElementById("applicant-cv").files[0];

  if (!name || !email || !cv) {
    alert("Please fill out all fields.");
    return;
  }

  // Validate PDF file
  if (cv.type !== "application/pdf") {
    alert("Only PDF files are allowed.");
    return;
  }

  const jobId = localStorage.getItem("applyingJobId");

  // Store application data in Local Storage
  let applications = JSON.parse(localStorage.getItem("jobApplications")) || [];
  applications.push({ jobId, name, email, cvName: cv.name });
  localStorage.setItem("jobApplications", JSON.stringify(applications));

  // Mark job as "Applied" in UI
  document.querySelector(`[data-job-id="${jobId}"]`).innerText = "Applied";
  document.querySelector(`[data-job-id="${jobId}"]`).style.backgroundColor = "chocolate";
  document.querySelector(`[data-job-id="${jobId}"]`).disabled = true;

  alert("Application submitted successfully!");

  // Close Modal
  document.getElementById("apply-modal").style.display = "none";
}