function openModal(id) {
  document.getElementById(id).classList.add("open");
}

function closeModal(id) {
  document.getElementById(id).classList.remove("open");
}

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("modal-overlay")) {
    e.target.classList.remove("open");
  }
});

document.querySelectorAll(".filter-group").forEach((group) => {
  group.addEventListener("click", (e) => {
    if (e.target.tagName === "BUTTON") {
      group.querySelectorAll("button").forEach((b) => b.classList.remove("active"));
      e.target.classList.add("active");
    }
  });
});
