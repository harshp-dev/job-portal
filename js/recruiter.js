//1. Check Authentication
document.addEventListener(
  "DOMContentLoaded",
  function checkUserAuthenticated() {
    const userRole = sessionStorage.getItem("userRole");
    if (userRole !== "recruiter") {
      alert("You are not allowed to access this page.");
      if (userRole === "candidate") {
        window.location.href = "../pages/candidate.html";
      }
    }
  }
);

// 2. Element Initialization
document.addEventListener("DOMContentLoaded", () => {
  const jobList = document.getElementById("jobList");
  const searchBar = document.getElementById("searchBar");
  const logoutBtn = document.getElementById("logoutBtn");
  const createJobModal = document.getElementById("createJobModal");
  const createJobForm = document.getElementById("createJobForm");
  const closeBtn = document.querySelector(".close");
  // const userRole = localStorage.getItem("userRole");

  let jobs = [];

  // 3. Fetch jobs from jobs.json
  async function fetchJobs() {
    try {
      const response = await fetch("../data/jobs.json");
      if (!response.ok) throw new Error("Failed to fetch job data");
      jobs = await response.json();
      renderJobs();
    } catch (error) {
      jobList.innerHTML = `<p class="error">Error loading job data. Please try again later.</p>`;
    }
  }

  // Search functionality with real-time filtering
  searchBar.addEventListener("input", () => {
    renderJobs(searchBar.value);
  });

  // Render job listings
  let currentPage = 1;
  const itemsPerPage = 6; // Number of job cards per page

  function renderJobs(filter = "") {
    jobList.innerHTML = ""; // Clear current listings

    const filteredJobs = jobs.filter(
      (job) =>
        job.title.toLowerCase().includes(filter.toLowerCase()) ||
        job.department.toLowerCase().includes(filter.toLowerCase()) ||
        job.category.toLowerCase().includes(filter.toLowerCase()) ||
        job.company.toLowerCase().includes(filter.toLowerCase()) ||
        job.level.toLowerCase().includes(filter.toLowerCase()) ||
        job.location.toLowerCase().includes(filter.toLowerCase())
    );

    if (filteredJobs.length === 0) {
      jobList.innerHTML =
        '<p style="color:white; text-align:center;">No jobs found.</p>';
      return;
    }

    // Pagination logic
    let editingJobId = null;
    const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const jobsToShow = filteredJobs.slice(startIndex, endIndex);

    jobsToShow.forEach((job) => {
      const isEditing = job.id === editingJobId;
      const jobCard = document.createElement("div");
      jobCard.classList.add("job-card");

      if (isEditing) {
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
            <button class="editBtn" data-id="${job.id}">Edit</button>
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
        // jobCard
        //   .querySelector(".deleteBtn")
        //   .addEventListener("click", () => deleteJob(job.id));
        jobCard
          .querySelector(".viewApplicantsBtn")
          .addEventListener("click", () => viewApplicants(job.id));
      }

      jobList.appendChild(jobCard);
    });

    renderPaginationButtons(totalPages);
  }

  // Function to render pagination buttons
  function renderPaginationButtons(totalPages) {
    const paginationContainer = document.getElementById("pagination");
    paginationContainer.innerHTML = ""; // Clear existing buttons

    if (totalPages > 1) {
      const prevButton = document.createElement("button");
      prevButton.textContent = "Previous";
      prevButton.disabled = currentPage === 1;
      prevButton.addEventListener("click", () => {
        currentPage--;
        renderJobs(searchBar.value);
      });

      const nextButton = document.createElement("button");
      nextButton.textContent = "Next";
      nextButton.disabled = currentPage === totalPages;
      nextButton.addEventListener("click", () => {
        currentPage++;
        renderJobs(searchBar.value);
      });

      paginationContainer.appendChild(prevButton);
      paginationContainer.appendChild(nextButton);
    }
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
  // Use single event listener for all dynamically generated job buttons
  jobList.addEventListener("click", (e) => {
    const id = Number(e.target.getAttribute("data-id"));
    if (e.target.classList.contains("editBtn")) {
      editJob(id);
    } else if (e.target.classList.contains("deleteBtn")) {
      deleteJob(id);
    }
  });

  // Edit job functionality
  function editJob(id) {
    const editBtn = document.querySelector(`.editBtn[data-id="${id}"]`);
    if (!editBtn) {
      console.error(`Edit button not found for job with id: ${id}`);
      return;
    }

    const jobCard = editBtn.closest(".job-card");
    if (!jobCard) {
      console.error(`Job card not found for job with id: ${id}`);
      return;
    }

    const job = jobs.find((job) => job.id === id);
    if (!job) {
      alert("Job not found!");
      return;
    }

    console.log("Editing job:", job);

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

  // View applications for each job card
  function viewApplicants(id) {
    const getApplications = localStorage.getItem("jobApplications");

    if (!getApplications) {
      alert("No applications found.");
      return;
    }

    const applications = JSON.parse(getApplications);
    const filteredApplications = applications.filter(
      (app) => String(app.jobId) === String(id)
    );

    // Get modal elements
    const modal = document.getElementById("applicants-modal");
    const modalContent = document.getElementById("applicants-list");

    // this thing will clear previous data
    modalContent.innerHTML = "";

    if (filteredApplications.length === 0) {
      modalContent.innerHTML = "<p>No applicants for this job.</p>";
    } else {
      filteredApplications.forEach((app) => {
        const applicantDiv = document.createElement("div");
        applicantDiv.classList.add("applicant");

        applicantDiv.innerHTML = `
                <p><strong>Name:</strong> ${app.name}</p>
                <p><strong>Email:</strong> ${app.email}</p>
                <p><strong>CV:</strong> <a href="#" onclick="downloadCV('${app.cvName}')">${app.cvName}</a></p>
                <hr>
            `;
        modalContent.appendChild(applicantDiv);
      });
    }

    // Show Modal
    modal.style.display = "flex";
  }

  // Function to Close the Modal
  document.querySelector("#applicants-modal").addEventListener("click", () => {
    document.getElementById("applicants-modal").style.display = "none";
  });

  // Close Modal When Clicking Outside
  window.addEventListener("click", (event) => {
    const modal = document.getElementById("applicants-modal");
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });
  // Logout button
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("currentUser");
    window.location.href = "/index.html";
  });

  // Fetch jobs on page load
  fetchJobs();
});
