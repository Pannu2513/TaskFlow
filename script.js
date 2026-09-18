const taskInput = document.getElementById("taskInput");
const taskSummary = document.getElementById("taskSummary");
const deadlineInput = document.getElementById("deadlineInput");
let currentFilter = "all";
const searchInput = document.getElementById("searchInput");
const addTaskButton = document.getElementById("addTaskButton");
const taskList = document.getElementById("taskList");

const totalTasks = document.getElementById("totalTasks");
const pendingTasks = document.getElementById("pendingTasks");
const completedTasks = document.getElementById("completedTasks");

let tasks = [];
const savedTasks = localStorage.getItem("tasks");

if (savedTasks) {
    tasks = JSON.parse(savedTasks);
}

displayTasks();
updateStats();

addTaskButton.addEventListener("click", function() {

  const taskName = taskInput.value.trim();   
    const deadline = deadlineInput.value;
    const today = new Date().toISOString().split("T")[0];

if (deadline < today) {
    alert("Please select today or a future date.");
    return;
}

    if (taskName === "" || deadline === "") {
        alert("Please enter the task name and deadline.");
        return;
    }

    const task = {
        name: taskName,
        deadline: deadline,
        completed: false
    };

    tasks.push(task);
localStorage.setItem("tasks", JSON.stringify(tasks));
    displayTasks();
    updateStats();

    taskInput.value = "";
    deadlineInput.value = "";

});


function displayTasks() {

    taskList.innerHTML = "";

    if (tasks.length === 0) {

        taskList.innerHTML = `
            <div class="empty-state">
                <h3>📝 No tasks yet</h3>
                <p>Add your first task to get started!</p>
            </div>
        `;

        return;
    }

    tasks.forEach(function(task, index) {

        const taskElement = document.createElement("div");
        taskElement.classList.add("task-card");

        if (task.completed) {
            taskElement.classList.add("completed-task");
        }

        taskElement.innerHTML = `
            <h3>${task.name}</h3>
            <p>Deadline: ${formatDate(task.deadline)}</p>
<p>Status: ${getDeadlineStatus(task)}</p>

            <button onclick="completeTask(${index})">
                ${task.completed ? "Completed" : "Mark Complete"}
            </button>

            <button onclick="editTask(${index})">
                Edit
            </button>

            <button onclick="deleteTask(${index})">
                Delete
            </button>
        `;

        taskList.appendChild(taskElement);

    });

}

function updateStats() {

    totalTasks.textContent = tasks.length;

    pendingTasks.textContent = tasks.filter(function(task) {
        return task.completed === false;
    }).length;

    completedTasks.textContent = tasks.filter(function(task) {
        return task.completed === true;
    }).length;
    taskSummary.textContent =
    `${tasks.length} tasks • ${tasks.filter(function(task) {
        return task.completed === false;
    }).length} pending • ${tasks.filter(function(task) {
        return task.completed === true;
    }).length} completed`;

}
function completeTask(index) {

    tasks[index].completed = true;

    localStorage.setItem("tasks", JSON.stringify(tasks));

    displayTasks();
    updateStats();

}
function deleteTask(index) {
    const confirmDelete = confirm("Are you sure you want to delete this task?");

    if (!confirmDelete) {
        return;
    }

    tasks.splice(index, 1);

    localStorage.setItem("tasks", JSON.stringify(tasks));

    displayTasks();
    updateStats();
}
function editTask(index) {

    const newName = prompt("Enter new task name:", tasks[index].name);

    if (newName === null || newName === "") {
        return;
    }

    const newDeadline = prompt("Enter new deadline (YYYY-MM-DD):", tasks[index].deadline);

    if (newDeadline === null || newDeadline === "") {
        return;
    }

    tasks[index].name = newName;
    tasks[index].deadline = newDeadline;

    localStorage.setItem("tasks", JSON.stringify(tasks));

    displayTasks();
    updateStats();

}
function showAllTasks() {
    currentFilter = "all";
    applyFilters();
    updateActiveFilter();
}



  function showPendingTasks() {
    currentFilter = "pending";
    applyFilters();
    updateActiveFilter();
}
function showCompletedTasks() {
    currentFilter = "completed";
    applyFilters();
    updateActiveFilter();
}
function displayFilteredTasks(filteredTasks) {

    taskList.innerHTML = "";
        if (filteredTasks.length === 0) {
        taskList.innerHTML = `
            <div class="empty-state">
                <h3>🔍 No matching tasks found</h3>
                <p>Try a different search or filter.</p>
            </div>
        `;
        return;
    }

    filteredTasks.forEach(function(task) {

        const index = tasks.indexOf(task);

        const taskElement = document.createElement("div");
        taskElement.classList.add("task-card");
        if (task.completed) {
    taskElement.classList.add("completed-task");
}
        if (task.completed) {
    taskElement.classList.add("completed-task");
}

        taskElement.innerHTML = `
            <h3>${task.name}</h3>
            <p>Deadline: ${formatDate(task.deadline)}</p>
<p>Status: ${getDeadlineStatus(task)}</p>

            <button onclick="completeTask(${index})">
                ${task.completed ? "Completed" : "Mark Complete"}
            </button>

            <button onclick="editTask(${index})">
                Edit
            </button>

            <button onclick="deleteTask(${index})">
                Delete
            </button>
        `;

        taskList.appendChild(taskElement);

    });

}
function formatDate(dateString) {

    const date = new Date(dateString);

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });

}
function setActiveFilter(activeButton) {

    document.getElementById("allFilter").classList.remove("active-filter");
    document.getElementById("pendingFilter").classList.remove("active-filter");
    document.getElementById("completedFilter").classList.remove("active-filter");

    activeButton.classList.add("active-filter");

}
function getDeadlineStatus(task) {

    if (task.completed) {
        return '<span class="status-completed">Completed ✅</span>';
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const deadline = new Date(task.deadline);
    deadline.setHours(0, 0, 0, 0);

    if (deadline < today) {
        return '<span class="status-overdue">Overdue 🔴</span>';
    }

   return '<span class="status-soon">Due soon 🟢</span>';
}
searchInput.addEventListener("input", function() {
    const searchText = searchInput.value.toLowerCase();

    const filteredTasks = tasks.filter(function(task) {
        return task.name.toLowerCase().includes(searchText);
    });

    displayFilteredTasks(filteredTasks);
});
function applyFilters() {
    const searchText = searchInput.value.toLowerCase();

    const filteredTasks = tasks.filter(function(task) {

        const matchesSearch = task.name
            .toLowerCase()
            .includes(searchText);

        let matchesFilter = true;

        if (currentFilter === "pending") {
            matchesFilter = task.completed === false;
        }

        if (currentFilter === "completed") {
            matchesFilter = task.completed === true;
        }

        return matchesSearch && matchesFilter;
    });

    displayFilteredTasks(filteredTasks);
}
function updateActiveFilter() {
    const filterButtons = document.querySelectorAll(".filter-bar button");

    filterButtons.forEach(function(button) {
        button.classList.remove("active-filter");
    });

    if (currentFilter === "all") {
        filterButtons[0].classList.add("active-filter");
    }

    if (currentFilter === "pending") {
        filterButtons[1].classList.add("active-filter");
    }

    if (currentFilter === "completed") {
        filterButtons[2].classList.add("active-filter");
    }
}