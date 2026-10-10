// ===============================
// NexaBoard - Smart Dashboard
// ===============================

const addTaskBtn = document.querySelector(".add-task");
const taskList = document.querySelector(".task-list");
const searchInput = document.querySelector(".search input");
const saveNoteBtn = document.querySelector(".save-note");
const noteArea = document.querySelector("textarea");
const notificationBtn = document.querySelector(".icon-btn");

let tasks = JSON.parse(localStorage.getItem("nexaTasks")) || [];

function saveTasks() {
    localStorage.setItem("nexaTasks", JSON.stringify(tasks));
}

// ===============================
// PRIORITY
// ===============================

function normalizePriority(priority) {
    if (priority === "high" || priority === "low") {
        return priority;
    }

    return "medium";
}

function getPriorityLabel(priority) {
    return {
        high: "High",
        medium: "Medium",
        low: "Low"
    }[normalizePriority(priority)];
}

const priorityOrder = {
    high: 1,
    medium: 2,
    low: 3
};

// ===============================
// TIME
// ===============================

function formatTime(time) {
    if (!time) return "";

    const [hours, minutes] = time.split(":");

    let hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";

    hour = hour % 12 || 12;

    return `${hour}:${minutes} ${ampm}`;
}

// ===============================
// DEADLINE
// ===============================

function formatDate(date) {
    if (!date) return "";

    const dateObject = new Date(date + "T00:00:00");

    return dateObject.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

function getDeadlineStatus(task) {
    if (!task.dueDate) {
        return "no-date";
    }

    if (task.completed) {
        return "completed";
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueDate = new Date(task.dueDate + "T00:00:00");
    dueDate.setHours(0, 0, 0, 0);

    const difference =
        dueDate.getTime() - today.getTime();

    const days = Math.round(
        difference / (1000 * 60 * 60 * 24)
    );

    if (days < 0) return "overdue";
    if (days === 0) return "today";
    if (days === 1) return "tomorrow";

    return "upcoming";
}

function getDeadlineText(task) {
    const status = getDeadlineStatus(task);

    if (!task.dueDate) {
        return "No deadline";
    }

    if (status === "overdue") {
        return `Overdue • ${formatDate(task.dueDate)}`;
    }

    if (status === "today") {
        return `Due Today • ${formatDate(task.dueDate)}`;
    }

    if (status === "tomorrow") {
        return `Due Tomorrow • ${formatDate(task.dueDate)}`;
    }

    if (status === "completed") {
        return `Completed • ${formatDate(task.dueDate)}`;
    }

    return `Due • ${formatDate(task.dueDate)}`;
}

// ===============================
// ANALYTICS
// ===============================

function getAnalytics() {
    const total = tasks.length;

    const completed = tasks.filter(
        task => task.completed
    ).length;

    const pending = total - completed;

    const high = tasks.filter(
        task => normalizePriority(task.priority) === "high"
    ).length;

    const medium = tasks.filter(
        task => normalizePriority(task.priority) === "medium"
    ).length;

    const low = tasks.filter(
        task => normalizePriority(task.priority) === "low"
    ).length;

    const overdue = tasks.filter(
        task => getDeadlineStatus(task) === "overdue"
    ).length;

    const today = tasks.filter(
        task => getDeadlineStatus(task) === "today"
    ).length;

    const upcoming = tasks.filter(
        task => getDeadlineStatus(task) === "upcoming"
    ).length;

    const percentage =
        total === 0
            ? 0
            : Math.round((completed / total) * 100);

    return {
        total,
        completed,
        pending,
        high,
        medium,
        low,
        overdue,
        today,
        upcoming,
        percentage
    };
}

// ===============================
// UPDATE STAT CARDS
// ===============================

function updateAnalytics() {
    const analytics = getAnalytics();

    const statCards =
        document.querySelectorAll(".stat-card");

    if (statCards.length >= 1) {
        const value =
            statCards[0].querySelector("h2");

        const label =
            statCards[0].querySelector("p");

        if (value) {
            value.textContent = analytics.total;
        }

        if (label) {
            label.textContent = "Total Tasks";
        }
    }

    if (statCards.length >= 2) {
        const value =
            statCards[1].querySelector("h2");

        const small =
            statCards[1].querySelector("small");

        if (value) {
            value.textContent = analytics.completed;
        }

        if (small) {
            small.textContent =
                `${analytics.percentage}% completion`;
        }
    }

    if (statCards.length >= 3) {
        const value =
            statCards[2].querySelector("h2");

        const label =
            statCards[2].querySelector("p");

        if (value) {
            value.textContent = analytics.pending;
        }

        if (label) {
            label.textContent = "Pending Tasks";
        }
    }

    if (statCards.length >= 4) {
        const value =
            statCards[3].querySelector("h2");

        const label =
            statCards[3].querySelector("p");

        if (value) {
            value.textContent = analytics.overdue;
        }

        if (label) {
            label.textContent = "Overdue Tasks";
        }
    }

    updateAnalyticsPanel(analytics);
}

// ===============================
// ANALYTICS PANEL
// ===============================

function createAnalyticsPanel() {
    const existing =
        document.querySelector(".analytics-panel");

    if (existing) {
        return;
    }

    const panel = document.createElement("div");
    panel.className =
        "panel analytics-panel";

    panel.innerHTML = `
        <div class="analytics-heading">
            <div>
                <h3>Task Analytics</h3>
                <p>Real-time overview of your tasks</p>
            </div>

            <div class="analytics-percent">
                <strong id="analyticsPercentage">0%</strong>
                <span>Complete</span>
            </div>
        </div>

        <div class="analytics-progress">
            <div id="analyticsProgressBar"></div>
        </div>

        <div class="analytics-grid">

            <div class="analytics-item">
                <span class="analytics-dot dot-completed"></span>
                <div>
                    <strong id="analyticsCompleted">0</strong>
                    <small>Completed</small>
                </div>
            </div>

            <div class="analytics-item">
                <span class="analytics-dot dot-pending"></span>
                <div>
                    <strong id="analyticsPending">0</strong>
                    <small>Pending</small>
                </div>
            </div>

            <div class="analytics-item">
                <span class="analytics-dot dot-overdue"></span>
                <div>
                    <strong id="analyticsOverdue">0</strong>
                    <small>Overdue</small>
                </div>
            </div>

            <div class="analytics-item">
                <span class="analytics-dot dot-today"></span>
                <div>
                    <strong id="analyticsToday">0</strong>
                    <small>Due Today</small>
                </div>
            </div>

        </div>

        <div class="priority-summary">

            <div class="priority-summary-row">
                <span>🔴 High Priority</span>
                <strong id="analyticsHigh">0</strong>
            </div>

            <div class="priority-summary-row">
                <span>🟡 Medium Priority</span>
                <strong id="analyticsMedium">0</strong>
            </div>

            <div class="priority-summary-row">
                <span>🟢 Low Priority</span>
                <strong id="analyticsLow">0</strong>
            </div>

        </div>
    `;

    const dashboardGrid =
        document.querySelector(".dashboard-grid");

    if (dashboardGrid) {
        dashboardGrid.insertBefore(
            panel,
            dashboardGrid.firstElementChild
        );
    }
}

function updateAnalyticsPanel(analytics) {
    const percentage =
        document.getElementById(
            "analyticsPercentage"
        );

    const progress =
        document.getElementById(
            "analyticsProgressBar"
        );

    const completed =
        document.getElementById(
            "analyticsCompleted"
        );

    const pending =
        document.getElementById(
            "analyticsPending"
        );

    const overdue =
        document.getElementById(
            "analyticsOverdue"
        );

    const today =
        document.getElementById(
            "analyticsToday"
        );

    const high =
        document.getElementById(
            "analyticsHigh"
        );

    const medium =
        document.getElementById(
            "analyticsMedium"
        );

    const low =
        document.getElementById(
            "analyticsLow"
        );

    if (percentage) {
        percentage.textContent =
            `${analytics.percentage}%`;
    }

    if (progress) {
        progress.style.width =
            `${analytics.percentage}%`;
    }

    if (completed) {
        completed.textContent =
            analytics.completed;
    }

    if (pending) {
        pending.textContent =
            analytics.pending;
    }

    if (overdue) {
        overdue.textContent =
            analytics.overdue;
    }

    if (today) {
        today.textContent =
            analytics.today;
    }

    if (high) {
        high.textContent =
            analytics.high;
    }

    if (medium) {
        medium.textContent =
            analytics.medium;
    }

    if (low) {
        low.textContent =
            analytics.low;
    }
}

// ===============================
// FILTER BAR
// ===============================

function createFilterBar() {
    if (
        document.querySelector(
            ".task-filter-bar"
        )
    ) {
        return;
    }

    const filterBar =
        document.createElement("div");

    filterBar.className =
        "task-filter-bar";

    const filters = [
        ["all", "All"],
        ["high", "🔴 High"],
        ["medium", "🟡 Medium"],
        ["low", "🟢 Low"]
    ];

    filters.forEach(([value, label]) => {
        const button =
            document.createElement("button");

        button.type = "button";
        button.className =
            "priority-filter";

        button.dataset.priority = value;
        button.textContent = label;

        if (value === "all") {
            button.classList.add("active");
        }

        button.addEventListener("click", () => {
            document
                .querySelectorAll(
                    ".priority-filter"
                )
                .forEach(item => {
                    item.classList.remove(
                        "active"
                    );
                });

            button.classList.add("active");

            renderTasks(
                searchInput
                    ? searchInput.value
                    : "",
                value
            );
        });

        filterBar.appendChild(button);
    });

    const panel =
        taskList.closest(".panel");

    if (panel) {
        const heading =
            panel.querySelector("h3");

        if (heading) {
            heading.insertAdjacentElement(
                "afterend",
                filterBar
            );
        }
    }
}

function getActivePriority() {
    const active =
        document.querySelector(
            ".priority-filter.active"
        );

    return active
        ? active.dataset.priority
        : "all";
}

// ===============================
// RENDER TASKS
// ===============================

function renderTasks(
    search = "",
    priorityFilter = "all"
) {
    taskList.innerHTML = "";

    const searchText =
        search.toLowerCase().trim();

    const filteredTasks =
        tasks
            .map(task => ({
                ...task,
                priority:
                    normalizePriority(
                        task.priority
                    )
            }))
            .filter(task => {
                const matchesSearch =
                    task.name
                        .toLowerCase()
                        .includes(searchText);

                const matchesPriority =
                    priorityFilter === "all" ||
                    task.priority ===
                        priorityFilter;

                return (
                    matchesSearch &&
                    matchesPriority
                );
            })
            .sort((a, b) => {
                return (
                    priorityOrder[a.priority] -
                    priorityOrder[b.priority]
                );
            });

    if (filteredTasks.length === 0) {
        const empty =
            document.createElement("div");

        empty.className =
            "empty-task-message";

        if (searchText) {
            empty.textContent =
                "No matching tasks found.";
        } else if (
            priorityFilter !== "all"
        ) {
            empty.textContent =
                `No ${getPriorityLabel(
                    priorityFilter
                ).toLowerCase()} priority tasks.`;
        } else {
            empty.textContent =
                "No tasks yet.";
        }

        taskList.appendChild(empty);

        updateAnalytics();
        return;
    }

    filteredTasks.forEach(task => {
        const originalTask =
            tasks.find(
                item =>
                    item.id === task.id
            );

        if (!originalTask) return;

        const taskItem =
            document.createElement("label");

        taskItem.className = "task";

        if (task.completed) {
            taskItem.classList.add(
                "completed"
            );
        }

        const checkbox =
            document.createElement("input");

        checkbox.type = "checkbox";
        checkbox.checked =
            task.completed;

        const taskText =
            document.createElement("span");

        taskText.textContent =
            task.name;

        const priorityBadge =
            document.createElement(
                "span"
            );

        priorityBadge.className =
            `priority-badge priority-${task.priority}`;

        priorityBadge.textContent =
            getPriorityLabel(
                task.priority
            );

        const taskTime =
            document.createElement("small");

        taskTime.className =
            "task-time";

        taskTime.textContent =
            task.time;

        const deadline =
            document.createElement("small");

        deadline.className =
            `task-deadline deadline-${getDeadlineStatus(
                task
            )}`;

        deadline.textContent =
            getDeadlineText(task);

        const actions =
            document.createElement("div");

        actions.className =
            "task-actions";

        const editBtn =
            document.createElement(
                "button"
            );

        editBtn.type = "button";
        editBtn.className =
            "edit-task";

        editBtn.textContent = "✏️";
        editBtn.title = "Edit task";

        const deleteBtn =
            document.createElement(
                "button"
            );

        deleteBtn.type = "button";
        deleteBtn.className =
            "delete-task";

        deleteBtn.textContent = "🗑️";
        deleteBtn.title = "Delete task";

        actions.appendChild(editBtn);
        actions.appendChild(deleteBtn);

        taskItem.appendChild(checkbox);
        taskItem.appendChild(taskText);
        taskItem.appendChild(
            priorityBadge
        );
        taskItem.appendChild(taskTime);
        taskItem.appendChild(deadline);
        taskItem.appendChild(actions);

        checkbox.addEventListener(
            "change",
            () => {
                originalTask.completed =
                    checkbox.checked;

                saveTasks();

                renderTasks(
                    searchInput
                        ? searchInput.value
                        : "",
                    getActivePriority()
                );
            }
        );

        editBtn.addEventListener(
            "click",
            event => {
                event.preventDefault();
                event.stopPropagation();

                openEditModal(
                    originalTask
                );
            }
        );

        deleteBtn.addEventListener(
            "click",
            event => {
                event.preventDefault();
                event.stopPropagation();

                const confirmed =
                    confirm(
                        `Delete "${originalTask.name}"?`
                    );

                if (!confirmed) return;

                tasks =
                    tasks.filter(
                        item =>
                            item.id !==
                            originalTask.id
                    );

                saveTasks();

                renderTasks(
                    searchInput
                        ? searchInput.value
                        : "",
                    getActivePriority()
                );
            }
        );

        taskList.appendChild(taskItem);
    });

    updateAnalytics();
}

// ===============================
// MODAL
// ===============================

function createTaskModal(
    mode = "add",
    task = null
) {
    const oldModal =
        document.querySelector(
            ".task-modal"
        );

    if (oldModal) {
        oldModal.remove();
    }

    const modal =
        document.createElement("div");

    modal.className = "task-modal";

    const modalBox =
        document.createElement("div");

    modalBox.className =
        "modal-box";

    const header =
        document.createElement("div");

    header.className =
        "modal-header";

    const title =
        document.createElement("h3");

    title.textContent =
        mode === "edit"
            ? "Edit Task"
            : "Add New Task";

    const closeBtn =
        document.createElement(
            "button"
        );

    closeBtn.type = "button";
    closeBtn.className =
        "close-modal";

    closeBtn.textContent = "×";

    header.appendChild(title);
    header.appendChild(closeBtn);

    const body =
        document.createElement("div");

    body.className =
        "modal-body";

    const nameLabel =
        document.createElement(
            "label"
        );

    nameLabel.textContent =
        "Task Name";

    const nameInput =
        document.createElement(
            "input"
        );

    nameInput.type = "text";
    nameInput.className =
        "task-input";

    nameInput.placeholder =
        "Enter task name";

    const timeLabel =
        document.createElement(
            "label"
        );

    timeLabel.textContent =
        "Time";

    const timeInput =
        document.createElement(
            "input"
        );

    timeInput.type = "time";
    timeInput.className =
        "task-time-input";

    const priorityLabel =
        document.createElement(
            "label"
        );

    priorityLabel.textContent =
        "Priority";

    const prioritySelect =
        document.createElement(
            "select"
        );

    prioritySelect.className =
        "task-priority-input";

    [
        ["high", "🔴 High"],
        ["medium", "🟡 Medium"],
        ["low", "🟢 Low"]
    ].forEach(
        ([value, label]) => {
            const option =
                document.createElement(
                    "option"
                );

            option.value = value;
            option.textContent =
                label;

            prioritySelect.appendChild(
                option
            );
        }
    );

    const dateLabel =
        document.createElement(
            "label"
        );

    dateLabel.textContent =
        "Due Date";

    const dateInput =
        document.createElement(
            "input"
        );

    dateInput.type = "date";
    dateInput.className =
        "task-date-input";

    const errorMessage =
        document.createElement(
            "div"
        );

    errorMessage.className =
        "input-error";

    errorMessage.textContent =
        "Please enter a task name.";

    errorMessage.style.display =
        "none";

    const actions =
        document.createElement(
            "div"
        );

    actions.className =
        "modal-actions";

    const cancelBtn =
        document.createElement(
            "button"
        );

    cancelBtn.type = "button";
    cancelBtn.className =
        "cancel-task";

    cancelBtn.textContent =
        "Cancel";

    const saveBtn =
        document.createElement(
            "button"
        );

    saveBtn.type = "button";
    saveBtn.className =
        "create-task";

    saveBtn.textContent =
        mode === "edit"
            ? "Save Changes"
            : "Create Task";

    actions.appendChild(cancelBtn);
    actions.appendChild(saveBtn);

    body.appendChild(nameLabel);
    body.appendChild(nameInput);

    body.appendChild(timeLabel);
    body.appendChild(timeInput);

    body.appendChild(priorityLabel);
    body.appendChild(prioritySelect);

    body.appendChild(dateLabel);
    body.appendChild(dateInput);

    body.appendChild(errorMessage);
    body.appendChild(actions);

    modalBox.appendChild(header);
    modalBox.appendChild(body);

    modal.appendChild(modalBox);

    document.body.appendChild(modal);

    if (mode === "edit" && task) {
        nameInput.value =
            task.name;

        prioritySelect.value =
            normalizePriority(
                task.priority
            );

        if (task.rawTime) {
            timeInput.value =
                task.rawTime;
        }

        if (task.dueDate) {
            dateInput.value =
                task.dueDate;
        }
    }

    function closeModal() {
        modal.remove();
    }

    closeBtn.addEventListener(
        "click",
        closeModal
    );

    cancelBtn.addEventListener(
        "click",
        closeModal
    );

    modal.addEventListener(
        "click",
        event => {
            if (
                event.target ===
                modal
            ) {
                closeModal();
            }
        }
    );

    saveBtn.addEventListener(
        "click",
        () => {
            const taskName =
                nameInput.value.trim();

            const selectedTime =
                timeInput.value;

            const selectedPriority =
                prioritySelect.value;

            const selectedDate =
                dateInput.value;

            if (!taskName) {
                errorMessage.style.display =
                    "block";

                nameInput.classList.add(
                    "input-error-border"
                );

                nameInput.focus();

                return;
            }

            errorMessage.style.display =
                "none";

            nameInput.classList.remove(
                "input-error-border"
            );

            if (
                mode === "edit" &&
                task
            ) {
                task.name =
                    taskName;

                task.priority =
                    selectedPriority;

                task.dueDate =
                    selectedDate;

                if (selectedTime) {
                    task.rawTime =
                        selectedTime;

                    task.time =
                        formatTime(
                            selectedTime
                        );
                }

                saveTasks();

                renderTasks(
                    searchInput
                        ? searchInput.value
                        : "",
                    getActivePriority()
                );

                closeModal();

                return;
            }

            const newTask = {
                id: Date.now(),
                name: taskName,
                rawTime:
                    selectedTime,
                time: selectedTime
                    ? formatTime(
                          selectedTime
                      )
                    : "No time",
                priority:
                    selectedPriority,
                dueDate:
                    selectedDate,
                completed: false
            };

            tasks.push(newTask);

            saveTasks();

            renderTasks(
                searchInput
                    ? searchInput.value
                    : "",
                getActivePriority()
            );

            closeModal();
        }
    );

    nameInput.addEventListener(
        "keydown",
        event => {
            if (
                event.key ===
                "Enter"
            ) {
                saveBtn.click();
            }
        }
    );

    nameInput.focus();
}

// ===============================
// ADD / EDIT
// ===============================

if (addTaskBtn) {
    addTaskBtn.addEventListener(
        "click",
        () => {
            createTaskModal("add");
        }
    );
}

function openEditModal(task) {
    createTaskModal(
        "edit",
        task
    );
}

// ===============================
// SEARCH
// ===============================

if (searchInput) {
    searchInput.addEventListener(
        "input",
        () => {
            renderTasks(
                searchInput.value,
                getActivePriority()
            );
        }
    );
}

// ===============================
// QUICK NOTE
// ===============================

if (saveNoteBtn && noteArea) {
    const savedNote =
        localStorage.getItem(
            "nexaNote"
        );

    if (savedNote) {
        noteArea.value =
            savedNote;
    }

    saveNoteBtn.addEventListener(
        "click",
        () => {
            localStorage.setItem(
                "nexaNote",
                noteArea.value
            );

            saveNoteBtn.textContent =
                "Saved ✓";

            setTimeout(() => {
                saveNoteBtn.textContent =
                    "Save Note";
            }, 1500);
        }
    );
}

// ===============================
// NOTIFICATION
// ===============================

if (notificationBtn) {
    notificationBtn.addEventListener(
        "click",
        () => {
            const analytics =
                getAnalytics();

            alert(
                `Tasks: ${analytics.total}\n` +
                `Completed: ${analytics.completed}\n` +
                `Pending: ${analytics.pending}\n` +
                `Overdue: ${analytics.overdue}`
            );
        }
    );
}



// ===============================
// INITIALIZE
// ===============================

tasks = tasks.map(task => ({
    ...task,
    priority:
        normalizePriority(
            task.priority
        ),
    dueDate:
        task.dueDate || ""
}));

saveTasks();

createFilterBar();
createAnalyticsPanel();
renderTasks();

console.log(
    "NexaBoard loaded successfully 🚀"
);

// ===============================
// SIDEBAR PAGE NAVIGATION
// ===============================

const sidebarLinks = document.querySelectorAll(".sidebar-link");
const pages = document.querySelectorAll(".page-section");


sidebarLinks.forEach(link => {

    link.addEventListener("click", (e) => {

        e.preventDefault();

        const targetPage = link.dataset.page;


        sidebarLinks.forEach(item => {
            item.classList.remove("active");
        });


        link.classList.add("active");


        pages.forEach(page => {
            page.classList.add("hidden-page");
        });


        const selectedPage =
            document.getElementById(targetPage);


        if (selectedPage) {
            selectedPage.classList.remove("hidden-page");
        }

    });

});