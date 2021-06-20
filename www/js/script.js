import { Modal } from "./classes.js";

//initialize
const todoInput = document.querySelector(".todo-input");
const todos = document.querySelector(".todo-list");
const notes = document.querySelector(".note-container");
const modalEl = new Modal(document.querySelector("#modal"));
const todoStorage = "todo";
const noteStorage = "note";
let isDeviceReady = false;
let filter = "all";
let imageDir = null;

modalEl.on("onSave", createNote);
modalEl.on("onEdit", editNote);
modalEl.on("onDelete", deleteNote);
modalEl.on("onRmImg", removeImg);

//event listener
document.addEventListener("deviceready", onDeviceReady, false);

todos.addEventListener("click", deleteCheck);

document.querySelector(".todo-filter").addEventListener("change", (select) => {
  filter = select.target.value;
  todos.childNodes.forEach((todo) => {
    filterTodo(todo);
  });
});

document.querySelector(".todo-button").addEventListener("click", (event) => {
  event.preventDefault();
  createTodo([todoInput.value, false]);
  todoInput.value = "";
});

document.querySelector(".new-note").addEventListener("click", () => {
  modalEl.show();
});

document.querySelector(".navbar-menu").addEventListener("click", (click) => {
  document.querySelector(".navbar-menu-item.active").classList.toggle("active");
  click.target.classList.toggle("active");
});

//function

function onDeviceReady() {
  window.resolveLocalFileSystemURL(
    cordova.file.dataDirectory,
    (fs) => {
      console.log(fs);
      fs.getDirectory(
        "Gambar",
        { create: true, exclusive: false },
        function (d) {
          console.log(d);
          imageDir = d;
          isDeviceReady = true;
        },
        (err) => {
          console.log("error get directory: " + err.code);
        }
      );
    },
    (err) => {
      console.log("error get dataDir code: " + err.code);
    }
  );
  let Todos = getTodos();
  let Notes = getNotes();
  console.log(Todos, Notes);
  Todos.forEach((todo) => {
    createTodo(todo);
  });
  Notes.forEach((note) => {
    createNote(note);
  });
}
function createTodo(Todo) {
  const todoDOM = document.createElement("div");
  todoDOM.classList.add("todo");

  const newTodo = document.createElement("li");
  newTodo.innerText = Todo[0];
  newTodo.classList.add("todo-item");
  todoDOM.appendChild(newTodo);

  const completedButton = document.createElement("button");
  completedButton.innerHTML = '<i class="fas fa-check"></i>';
  completedButton.classList.add("complete-btn");
  todoDOM.appendChild(completedButton);
  const deleteButton = document.createElement("button");
  deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
  deleteButton.classList.add("trash-btn");
  todoDOM.appendChild(deleteButton);

  if (Todo[1]) {
    completedButton.classList.add("completed-btn");
    todoDOM.classList.add("completed");
  }

  todoDOM["todo"] = Todo;
  todoDOM["check"] = () => {
    completedButton.classList.toggle("completed-btn");
    todoDOM.classList.toggle("completed");
    todoDOM["todo"][1] = !todoDOM["todo"][1];
  };
  todoDOM["show"] = () => {
    todoDOM.style.display = "flex";
  };
  todoDOM["hide"] = () => {
    todoDOM.style.display = "none";
  };
  todoDOM["complete"] = () => {
    return todoDOM["todo"][1];
  };

  todos.appendChild(todoDOM);
  filterTodo(todoDOM);
  saveTodos();
}
function deleteCheck(click) {
  var item = click.target;
  const todo = item.parentElement;
  //deleteCheck
  if (item.classList.contains("trash-btn")) {
    todo.remove();
    saveTodos();
  }
  //check
  if (item.classList.contains("complete-btn")) {
    todo.check();
    filterTodo(todo);
    saveTodos();
  }
}
function filterTodo(todo) {
  switch (filter) {
    case "all":
      todo.show();
      break;
    case "completed":
      if (todo.complete()) {
        todo.show();
      } else {
        todo.hide();
      }
      break;
    case "uncompleted":
      if (!todo.complete()) {
        todo.show();
      } else {
        todo.hide();
      }
      break;
  }
}
function createNote(Note) {
  const noteDOM = document.createElement("li");
  noteDOM.classList.add("note");
  //header
  const noteHeader = document.createElement("div");
  noteHeader.innerText = Note[0];
  noteHeader.classList.add("note-head");
  noteDOM.appendChild(noteHeader);
  //body
  const noteBody = document.createElement("div");
  noteBody.innerHTML = Note[1];
  noteBody.classList.add("note-body");
  noteDOM.appendChild(noteBody);
  noteDOM["note"] = Note;
  if (Note[2].length > 0) {
    const img = document.createElement("span");
    img.classList.add("note-image");
    img.innerHTML = '<i class="fas fa-image"></i>';
    noteDOM.appendChild(img);
    if (isDeviceReady) {
      moveImgArray(noteDOM["note"][2]).then((imgSrcs) => {
        noteDOM["note"][2] = imgSrcs;
        saveNotes();
      });
    }
  }
  console.log(noteDOM["note"]);
  noteDOM.addEventListener("click", (click) => {
    modalEl.edit(click.target);
  });

  notes.appendChild(noteDOM);
  saveNotes();
}
function editNote(Note, noteDOM) {
  noteDOM.children[0].innerText = Note[0];
  noteDOM.children[1].innerHTML = Note[1];
  noteDOM["note"] = Note;
  if (Note[2].length > 0) {
    if (!noteDOM.children[2]) {
      const img = document.createElement("span");
      img.classList.add("note-image");
      img.innerHTML = '<i class="fas fa-image"></i>';
      noteDOM.appendChild(img);
    }
    moveImgArray(noteDOM["note"][2]).then((imgSrcs) => {
      noteDOM["note"][2] = imgSrcs;
      saveNotes();
    });
  } else {
    if (noteDOM.children[2]) {
      noteDOM.children[2].remove();
    }
  }
  saveNotes();
}
function deleteNote(noteDom) {
  noteDom["note"][2].forEach((imgUri) => {
    removeImg(imgUri);
  });
  noteDom.innerHTML = "";
  noteDom.remove();
  saveNotes();
}
function saveTodos() {
  let Todos = Array.from(todos.childNodes).map((todo) => todo["todo"]);
  console.log(Todos);
  localStorage.setItem(todoStorage, JSON.stringify(Todos));
}
function getTodos() {
  let todos;
  if (localStorage.getItem(todoStorage) === null) {
    todos = [];
    localStorage.setItem(todoStorage, JSON.stringify(todos));
  } else {
    todos = JSON.parse(localStorage.getItem(todoStorage));
  }
  return todos;
}
function saveNotes() {
  let Notes = Array.from(notes.childNodes).map((note) => note["note"]);
  console.log(Notes);
  localStorage.setItem(noteStorage, JSON.stringify(Notes));
}
function getNotes() {
  let notes;
  if (localStorage.getItem(noteStorage) === null) {
    notes = [];
    localStorage.setItem(noteStorage, JSON.stringify(notes));
  } else {
    notes = JSON.parse(localStorage.getItem(noteStorage));
  }
  return notes;
}
function moveImagetoDataStorage(imgUri) {
  return new Promise(function (resolve, reject) {
    window.resolveLocalFileSystemURL(
      imgUri,
      (fileEntry) => {
        if (fileEntry.filesystem.name !== "files") {
          console.log("moving");
          fileEntry.moveTo(
            imageDir,
            fileEntry.name,
            (newSrc) => {
              console.log(newSrc);
              resolve(newSrc.nativeURL);
            },
            (err) => {
              reject("Move error: " + err.code);
            }
          );
        } else {
          console.log("Not moving");
          resolve(fileEntry.nativeURL);
        }
      },
      (err) => {
        reject("error code: " + err.code);
      }
    );
  });
}
function moveImgArray(arraySrc) {
  return new Promise(async (resolve, reject) => {
    const Src = arraySrc.map(async (src) => {
      const dest = await moveImagetoDataStorage(src);
      return dest;
    });
    const newSrc = await Promise.all(Src);
    resolve(newSrc);
  });
}
function removeImg(imgUri) {
  window.resolveLocalFileSystemURL(
    imgUri,
    (file) => {
      file.remove(
        () => {
          console.log("Removed");
        },
        (err) => {
          console.log("Remove error code: " + err.code);
        }
      );
    },
    (err) => {
      console.log("error code: " + err.code);
    }
  );
}
