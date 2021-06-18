export class Modal {
  constructor() {
    this.modal = modal;
    this.title = this.modal.querySelector("#note-title-input");
    this.note = this.modal.querySelector("#note-input");
    this.imagelist = this.modal.querySelector("#note-image");
    this.isEdit = null;
    this.modal.querySelector("#close").addEventListener("click", () => {
      this.close();
    });
    this.modal.querySelector(".delete-note").addEventListener("click", () => {
      this.delete();
    });
    this.modal.querySelector(".save-note").addEventListener("click", () => {
      this.save();
    });
    this.modal.querySelector("#camera").addEventListener("click", () => {
      this.camera();
    });
    this.default();
  }
  default() {
    this.title.innerText = "Note Title";
    this.note.innerHTML = "Type your note here..";
    this.imagelist.innerHTML = "";
    this.isEdit = null;
  }
  show() {
    this.modal.style.display = "block";
  }
  close() {
    this.modal.style.display = "none";
    this.default();
  }
  delete() {
    if (this.isEdit === null) {
      this.close();
    } else {
      this.onDelete(this.isEdit);
      this.close();
    }
  }
  save() {
    let imageNode = this.imagelist.querySelectorAll("img");
    let imageSrc = Array.from(imageNode).map((image) => image.src);
    if (this.isEdit === null) {
      this.onSave([this.title.innerText, this.note.innerHTML, imageSrc]);
    } else {
      this.onEdit(
        [this.title.innerText, this.note.innerHTML, imageSrc],
        this.isEdit
      );
    }
    this.close();
  }
  edit(DOmNote) {
    this.isEdit = DOmNote;
    this.title.innerText = this.isEdit["note"][0];
    this.note.innerHTML = this.isEdit["note"][1];
    this.isEdit["note"][2].forEach((imageSrc) => {
      this.image(imageSrc);
    });
    this.show();
  }
  on(event, handler) {
    this[event] = handler;
  }
  camera() {
    let Modal = this;
    navigator.camera.getPicture(onSuccess, null, {
      quality: 50,
      destinationType: Camera.DestinationType.FILE_URI,
      sourceType: Camera.PictureSourceType.CAMERA,
      encodingType: Camera.EncodingType.JPEG,
    });

    function onSuccess(imageURI) {
      Modal.image(imageURI);
    }
  }
  image(imgUrl) {
    const div = document.createElement("div");
    const img = document.createElement("img");
    img.src = imgUrl;
    const span = document.createElement("span");
    span.innerHTML = "&times;";
    div.appendChild(img);
    div.appendChild(span);
    span.addEventListener("click", () => {
      this.onRmImg(img.src);
      div.innerHTML = "";
      div.remove();
    });
    this.imagelist.appendChild(div);
  }
}
