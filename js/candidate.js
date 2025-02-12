document.addEventListener("DOMContentLoaded", function () {
  fetchJobs();
  document.getElementById("search-btn").addEventListener("click", searchJobs);
});

function fetchJobs() {
  fetch("../data/jobs.json")
    .then((response) => response.json())
    .then((jobs) => {
      displayJobs(jobs);
    })
    .catch((error) => {
      console.log("Error Occured", error);
    });
}

function displayJobs(jobs) {
  const jobContainer = document.getElementById("job-listings");
  jobContainer.innerHTML = "";
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
  document.querySelectorAll(".apply-btn").forEach((button) => {
    button.addEventListener("click", openApplyModal);
  });
}

// Jobs Data Set
// {
//     "id": 2,
//     "title": "Backend Engineer",
//     "company": "Innovatech Solutions",
//     "category": "Node.js",
//     "department": "Software Development",
//     "level": "Senior",
//     "location": "New York, USA",
//     "description": "Looking for an experienced Node.js developer to design and maintain backend services.",
//     "postedDate": "2025-02-08",
//     "applied": false
//   },

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
          job.level.toLowerCase().includes(searchQuery) ||
          job.title.toLowerCase().includes(searchQuery) ||
          job.location.toLowerCase().includes(searchQuery)
      );
      displayJobs(filteredJobs);
    })
    .catch((error) => console.error("Error searching jobs:", error));
}

function openApplyModal(event) {
  const jobId = event.target.getAttribute("data-job-id");
  localStorage.setItem("applyingJobId", jobId); // Store job ID for reference

  // Show Modal
  document.getElementById("apply-modal").style.display = "flex";
}

// Close Modal Functionality
document.querySelector(".close").addEventListener("click", () => {
  document.getElementById("apply-modal").style.display = "none";
});

// Close Modal When Clicking Outside
window.addEventListener("click", function (event) {
  const modal = document.getElementById("apply-modal");
  if (event.target === modal) {
    modal.style.display = "none";
  }
});

// Handle Form Submission
document.getElementById("apply-form").addEventListener("submit", applyForJob);

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
  document.querySelector(`[data-job-id="${jobId}"]`).disabled = true;

  alert("Application submitted successfully!");

  // Close Modal
  document.getElementById("apply-modal").style.display = "none";
}

// Logout Functionality
document.getElementById("logout-btn").addEventListener("click", function () {
  localStorage.removeItem("loggedInUser");
  window.location.href = "index.html";
});
