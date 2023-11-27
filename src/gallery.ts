import { openRequest } from "./db.js";

const galleryContainer: HTMLDivElement =
    document.querySelector(".gallery-cont")!;
let db: IDBDatabase | null = null;
openRequest.onsuccess = () => {
    db = openRequest.result;
    if (db) {
        /**
         * VIDEO
         */

        const transaction = db.transaction("video", "readwrite");
        const videoStore = transaction.objectStore("video");
        const videoRequest = videoStore.getAll();

        videoRequest.onsuccess = (e) => {
            const videoResult = videoRequest.result;
            videoResult.forEach((videoDB) => {
                const mediaElement = document.createElement("div");
                mediaElement.setAttribute("class", "media-cont");
                mediaElement.setAttribute("id", `${videoDB?.id}`);

                const url = URL.createObjectURL(videoDB.blobData);

                mediaElement.innerHTML = `
                <div class="media">
                    <video muted autoplay src=${url} loop></video>
                </div>
                <div class="delete">DELETE</div>
                <div class="download">DOWNLOAD</div>
                `;

                galleryContainer.appendChild(mediaElement);
                const deleteBtn: HTMLElement =
                    mediaElement.querySelector(".delete")!;
                const downloadBtn: HTMLDivElement =
                    mediaElement.querySelector(".download")!;

                deleteBtn.onclick = (e) => {
                    galleryContainer.removeChild(mediaElement);
                    deleteFunc(e.target!, "vid");
                };

                downloadBtn.onclick = () => {
                    downloadFile(url, "vid");
                };
            });
        };

        /**
         * IMAGE
         */

        const IMGTransaction = db.transaction("image", "readwrite");
        const imgStore = IMGTransaction.objectStore("image");
        const imgRequest = imgStore.getAll();

        imgRequest.onsuccess = (e) => {
            const IMGResult = imgRequest.result;
            IMGResult.forEach((IMG) => {
                const mediaElement = document.createElement("div");
                mediaElement.setAttribute("class", "media-cont");
                mediaElement.setAttribute("id", `${IMG?.id}`);

                mediaElement.innerHTML = `
                <div class="media">
                    <img src=${IMG.url}>
                </div>
                <div class="delete">DELETE</div>
                <div class="download">DOWNLOAD</div>
                `;

                galleryContainer.appendChild(mediaElement);

                const deleteBtn: HTMLDivElement =
                    mediaElement.querySelector(".delete")!;
                const downloadBtn: HTMLDivElement =
                    mediaElement.querySelector(".download")!;

                deleteBtn.onclick = (e) => {
                    galleryContainer.removeChild(mediaElement);
                    deleteFunc(e.target!, "img");
                };
                downloadBtn.onclick = () => {
                    downloadFile(IMG.url, "img");
                };
            });
        };
    } else {
        console.log("no");
    }
};

function downloadFile(url: string, type: "img" | "vid") {
    const a = document.createElement("a");
    a.href = url;
    if (type === "img") {
        a.download = "image.jpg";
    }
    if (type === "vid") {
        a.download = "video";
    }
    a.click();
}
function deleteFunc(e: EventTarget, type: "img" | "vid") {
    const id: number = Number(
        (e as HTMLElement).parentElement?.getAttribute("id")!
    );
    if (type === "img") {
        const IMGTransaction = db?.transaction("image", "readwrite");
        const imgStore = IMGTransaction?.objectStore("image");
        imgStore?.delete(id);
    }
    if (type === "vid") {
        const transaction = db?.transaction("video", "readwrite");
        const videoStore = transaction?.objectStore("video");
        videoStore?.delete(id);
    }
}
