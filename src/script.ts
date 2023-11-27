import { db } from "./db.js";
let video = document.querySelector("video")!;
let recordBtnCont = document.querySelector(".record-btn-cont")!;
let captureBtnCont = document.querySelector(".capture-btn-cont")!;
let recordBtn = document.querySelector(".record-btn")!;
let captureBtn = document.querySelector(".capture-btn")!;
let filter_layer: HTMLDivElement = document.querySelector(".filter-layer")!;
let allFilters = document.querySelectorAll(".filter")!;

let filter_color: string;
let recordFlag = false;
let recorder: MediaRecorder;
let chunks: Blob[] = [];

const constraints = {
    video: true,
    // audio: true,
};

navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
    document.querySelector("video")!.srcObject = stream;

    recorder = new MediaRecorder(stream);

    recorder.addEventListener("start", (e) => {
        chunks = [];
    });
    recorder.addEventListener("dataavailable", (e) => {
        chunks.push(e.data);
    });
    recorder.addEventListener("stop", (e) => {
        //converstion to media
        let blob = new Blob(chunks, { type: "video/mp4" });
        let videoURL = URL.createObjectURL(blob);
        if (db) {
            let videoId = Date.now();
            let dbTransaction = db.transaction("video", "readwrite");
            let videoStore = dbTransaction.objectStore("video");
            let videoEntry = {
                id: videoId,
                blobData: blob,
            };
            videoStore.add(videoEntry);
        }
        // let a = document.createElement("a");
        // a.href = videoURL;
        // a.download = "stream";
        // a.click();
    });
});

/**
 * RECORD VIDEO
 */

recordBtnCont.addEventListener("click", (e) => {
    if (!recorder) return;
    recordFlag = !recordFlag;
    if (recordFlag) {
        startTimer();
        recorder.start();
        recordBtn.classList.add("scale-record");
    } else {
        stopTimer();
        recorder.stop();
        recordBtn.classList.remove("scale-record");
    }
});

/**
 * CAPTURE IMAGE
 */

captureBtnCont.addEventListener("click", () => {
    //Animation
    captureBtn.classList.add("scale-capture");

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");

    ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);

    // FILTER COLOR
    if (filter_color) {
        ctx!.fillStyle = filter_color;
        ctx?.fillRect(0, 0, canvas.width, canvas.height);
    }
    const imageUrl = canvas.toDataURL();
    if (db) {
        let transaction = db.transaction("image", "readwrite");
        let imageStore = transaction.objectStore("image");
        const imageEntry = {
            id: Date.now(),
            url: imageUrl,
        };
        imageStore.add(imageEntry);
    }

    setTimeout(() => {
        captureBtn.classList.remove("scale-capture");
    }, 400);
});

/**
 * VIDEO TIMER
 */

let intervalId: number | null;
let timer: HTMLDivElement = document.querySelector(".timer")!;
let counter = 0;

function startTimer() {
    timer.style.display = "block";
    timer.innerText = "00:00:00";
    intervalId = setInterval(() => {
        counter += 1;
        let hour = Math.floor(counter / 3600);
        let min = Math.floor((counter % 3600) / 60);
        let sec = Math.floor((counter % 3600) % 60);
        timer.innerHTML = `${hour < 10 ? "0" + hour : hour}:${
            min < 10 ? "0" + min : min
        }:${sec < 10 ? "0" + sec : sec}`;
    }, 1000);
}

function stopTimer() {
    clearInterval(intervalId!);
    timer.style.display = "none";
    timer.innerText = "00:00:00";
}

/**
 * FILTERS EVENTLISTENER
 */

allFilters.forEach((filter) => {
    filter.addEventListener("click", () => {
        filter_color =
            getComputedStyle(filter).getPropertyValue("background-color");
        filter_layer.style.backgroundColor = filter_color;
    });
});
