document.addEventListener(
  "DOMContentLoaded",
  function checkUserAuthenticated() {
    const userRole = localStorage.getItem("userRole");
    if (userRole !== "recruiter") {
      alert("You are not allowed to access this page.");
      if (userRole === "candidate") {
        window.location.href = "../candidate.html";
      } else {
        window.location.href = "../index.html";
      }
    }
  }
);

document.addEventListener("DOMContentLoaded", () => {
  const jobList = document.getElementById("jobList");
  const searchBar = document.getElementById("searchBar");
  const logoutBtn = document.getElementById("logoutBtn");
  const createJobModal = document.getElementById("createJobModal");
  const createJobForm = document.getElementById("createJobForm");
  const closeBtn = document.querySelector(".close");
  // const userRole = localStorage.getItem("userRole");

  let jobs = [];
  // Fetch jobs from jobs.json
  async function fetchJobs() {
    try {
      const response = await fetch("data/jobs.json");
      if (!response.ok) throw new Error("Failed to fetch job data");
      jobs = await response.json();
      renderJobs();
    } catch (error) {
      jobList.innerHTML = `<p class="error">Error loading job data. Please try again later.</p>`;
    }
  }

  let editingJobId = null;

  // Search functionality with real-time filtering
  searchBar.addEventListener("input", () => {
    renderJobs(searchBar.value);
  });

  // Render job listings
  function renderJobs(filter = "") {
    jobList.innerHTML = ""; // Clear current listings

    const filteredJobs = jobs.filter(
      (job) =>
        job.title.toLowerCase().includes(filter.toLowerCase()) ||
        job.department.toLowerCase().includes(filter.toLowerCase()) ||
        job.category.toLowerCase().includes(filter.toLowerCase())
    );

    if (filteredJobs.length === 0) {
      jobList.innerHTML =
        '<p style="color:white; text-align:center;">No jobs found.</p>';
      return;
    }

    filteredJobs.forEach((job) => {
      const isEditing = job.id === editingJobId; // Check if this job is in edit mode
      const jobCard = document.createElement("div");
      jobCard.classList.add("job-card");

      if (isEditing) {
        // Render editable form for the job
        jobCard.innerHTML = `
          <div class="edit-form">
            <label>Title: <input type="text" id="editTitle" value="${job.title}"></label>
            <label>Company: <input type="text" id="editCompany" value="${job.company}"></label>
            <label>Category: <input type="text" id="editCategory" value="${job.category}"></label>
            <label>Department: <input type="text" id="editDepartment" value="${job.department}"></label>
            <label>Level: <input type="text" id="editLevel" value="${job.level}"></label>
            <label>Location: <input type="text" id="editLocation" value="${job.location}"></label>
            <label>Description: <textarea id="editDescription">${job.description}</textarea></label>
            <div class="edit-actions">
              <button class="saveBtn" data-id="${job.id}">Save</button>
              <button class="cancelBtn" data-id="${job.id}">Cancel</button>
            </div>
          </div>
        `;

        jobCard
          .querySelector(".saveBtn")
          .addEventListener("click", () => saveJobEdit(job.id));
        jobCard.querySelector(".cancelBtn").addEventListener("click", () => {
          editingJobId = null;
          renderJobs(filter);
        });
      } else {
        // Render standard job card
        jobCard.innerHTML = `
          <h2>${job.title}</h2>
          <p><strong>Company:</strong> ${job.company}</p>
          <p><strong>Category:</strong> ${job.category}</p>
          <p><strong>Department:</strong> ${job.department}</p>
          <p><strong>Level:</strong> ${job.level}</p>
          <p><strong>Location:</strong> ${job.location}</p>
          <p><strong>Description:</strong> ${job.description}</p>
          <p><strong>Posted On:</strong> ${job.postedDate}</p>
          <div class="job-actions">
            <button class="editBtn" data-id="${job.id}">Edit</button>
            <button class="deleteBtn" data-id="${job.id}">Delete</button>
            <button class="viewApplicantsBtn" data-id="${job.id}">View Applicants</button>
          </div>
        `;

        jobCard.querySelector(".editBtn").addEventListener("click", () => {
          editingJobId = job.id;
          renderJobs(filter);
        });

        jobCard
          .querySelector(".deleteBtn")
          .addEventListener("click", () => deleteJob(job.id));
        jobCard
          .querySelector(".viewApplicantsBtn")
          .addEventListener("click", () => viewApplicants(job.id));
      }

      jobList.appendChild(jobCard);
    });
  }

  // Open modal when "Create New Job" button is clicked
  document.getElementById("createJobBtn").addEventListener("click", () => {
    createJobModal.style.display = "block";
  });

  // Close modal when the close button (×) is clicked
  closeBtn.addEventListener("click", () => {
    createJobModal.style.display = "none";
  });

  // Close modal when clicking outside the modal content
  window.addEventListener("click", (event) => {
    if (event.target === createJobModal) {
      createJobModal.style.display = "none";
    }
  });

  // Handle form submission to add a new job
  createJobForm.addEventListener("submit", (event) => {
    event.preventDefault(); // Prevent form from refreshing the page

    const newJob = {
      id: jobs.length + 1, // Generate a new ID
      title: document.getElementById("jobTitle").value,
      company: document.getElementById("jobCompany").value,
      category: document.getElementById("jobCategory").value,
      department: document.getElementById("jobDepartment").value,
      level: document.getElementById("jobLevel").value,
      location: document.getElementById("jobLocation").value,
      description: document.getElementById("jobDescription").value,
      postedDate: new Date().toISOString().split("T")[0], // Current date
      applied: false,
    };

    jobs.push(newJob); // Add the new job to the jobs array
    localStorage.setItem("jobs", JSON.stringify(jobs)); // Save the updated array to localStorage

    renderJobs(); // Re-render the job list
    createJobModal.style.display = "none"; // Close the modal
    createJobForm.reset(); // Reset the form fields
  });

  // Handle job actions (Edit, Delete, View Applicants)
  jobList.addEventListener("click", (e) => {
    const id = Number(e.target.getAttribute("data-id"));
    if (e.target.classList.contains("editBtn")) {
      editJob(id);
    } else if (e.target.classList.contains("deleteBtn")) {
      deleteJob(id);
    } else if (e.target.classList.contains("viewApplicantsBtn")) {
      viewApplicants(id);
    }
  });

  // Edit job functionality
  function editJob(id) {
    const jobCard = document
      .querySelector(`.editBtn[data-id="${id}"]`)
      .closest(".job-card");
    const job = jobs.find((job) => job.id === id);
    if (!job) return alert("Job not found!");

    // Replace job card content with an editable form
    jobCard.innerHTML = `
      <div class="edit-form">
        <label>Title: <input type="text" id="editTitle" value="${job.title}"></label>
        <label>Company: <input type="text" id="editCompany" value="${job.company}"></label>
        <label>Category: <input type="text" id="editCategory" value="${job.category}"></label>
        <label>Department: <input type="text" id="editDepartment" value="${job.department}"></label>
        <label>Level: <input type="text" id="editLevel" value="${job.level}"></label>
        <label>Location: <input type="text" id="editLocation" value="${job.location}"></label>
        <label>Description: <textarea id="editDescription">${job.description}</textarea></label>
        <div class="edit-actions">
          <button class="saveBtn" data-id="${id}">Save</button>
          <button class="cancelBtn" data-id="${id}">Cancel</button>
        </div>
      </div>
    `;

    // Save and Cancel functionality
    jobCard.querySelector(".saveBtn").addEventListener("click", () => {
      saveJobEdit(id);
      renderJobs(searchBar.value); // This will ensure the job card is refreshed properly.
    });

    jobCard.querySelector(".cancelBtn").addEventListener("click", () => {
      renderJobs(searchBar.value); // This will restore the original view without keeping it in edit mode.
    });
  }

  function saveJobEdit(id) {
    const editedJob = {
      id,
      title: document.getElementById("editTitle").value,
      company: document.getElementById("editCompany").value,
      category: document.getElementById("editCategory").value,
      department: document.getElementById("editDepartment").value,
      level: document.getElementById("editLevel").value,
      location: document.getElementById("editLocation").value,
      description: document.getElementById("editDescription").value,
      postedDate: jobs.find((job) => job.id === id).postedDate,
    };

    // Update the job in the jobs array and localStorage
    jobs = jobs.map((job) => (job.id === id ? editedJob : job));
    localStorage.setItem("jobs", JSON.stringify(jobs));

    alert("Job updated successfully!");

    // Reset the editing state
    editingJobId = null;

    // Re-render the job list
    renderJobs(searchBar.value);
  }

  // Delete job functionality
  function deleteJob(id) {
    if (confirm("Are you sure you want to delete this job?")) {
      jobs = jobs.filter((job) => job.id !== id);
      localStorage.setItem("jobs", JSON.stringify(jobs));
      renderJobs(searchBar.value);
      alert("Job deleted successfully!");
    }
  }

  // View applicants functionality
  function viewApplicants(id) {
    window.location.href = `viewApplications.html?jobId=${id}`;
  }

  // Logout button
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("currentUser");
    window.location.href = "index.html";
  });

  // Fetch jobs on page load
  fetchJobs();
});
