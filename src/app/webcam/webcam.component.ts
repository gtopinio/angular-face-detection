import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import * as faceapi from 'face-api.js';

@Component({
  selector: 'app-webcam',
  templateUrl: './webcam.component.html',
  styles: [
  ]
})
export class WebcamComponent implements OnInit {

  WIDTH = 440;
  HEIGHT = 280;
  @ViewChild('video',{ static: true })
  public video!: ElementRef;
  @ViewChild('canvas',{ static: true })
  public canvasRef!: ElementRef;
  constructor(private elRef: ElementRef) {}
  stream: any;
  detection: any;
  resizedDetections: any;
  canvas: any;
  canvasEl: any;
  displaySize: any;
  videoInput: any;

  async ngOnInit() {
    await Promise.all([
      await faceapi.nets.ssdMobilenetv1.loadFromUri('../../assets/models'),
      await faceapi.nets.tinyFaceDetector.loadFromUri('../../assets/models'),
      await faceapi.nets.faceLandmark68Net.loadFromUri('../../assets/models'),
      await faceapi.nets.faceRecognitionNet.loadFromUri('../../assets/models'),
      await faceapi.nets.faceExpressionNet.loadFromUri('../../assets/models'),]).then(() => {
      this.startVideo();
    });
  }
  /*
  * In startVideo() we are going to request for user webcam and get the stream from it.
  * To get the video stream we are accessing the video tag using ElementRef & the same for canvas.
  * we have already declared all variables.
  *
  * This is the original code, but we have to fix it:
  * this.videoInput = this.video.nativeElement;
    navigator.getUserMedia(
      { video: {}, audio: false },
      (stream) => (this.videoInput.srcObject = stream),
      (err) => console.log(err)
    );
    this.detect_Faces();
  *
  */
  startVideo() {
    this.videoInput = this.video.nativeElement;
    navigator.mediaDevices.getUserMedia({
      video: {
        width: this.WIDTH,
        height: this.HEIGHT
      },
      audio: false
    }).then(stream => {
      this.stream = stream;
      this.videoInput.srcObject = stream;
      this.videoInput.addEventListener('loadeddata', async () => {
      await this.detect_Faces();
      });
    });
  }

  async detect_Faces() {
    this.elRef.nativeElement.querySelector('video').addEventListener('play', async () => {
      this.canvas = faceapi.createCanvasFromMedia(this.videoInput);
      let container = this.elRef.nativeElement.querySelector('#canvasContainer');
      container.appendChild(this.canvas);
      this.canvas.setAttribute('id', 'canvass');
      this.canvas.setAttribute(
        'style',`position: fixed;
      top: 0;
      left: 0;`
      );
      this.displaySize = {
        width: this.videoInput.width,
        height: this.videoInput.height,
      };
      faceapi.matchDimensions(this.canvas, this.displaySize);
      setInterval(async () => {
        this.detection = await faceapi.detectAllFaces(
          this.videoInput,
          new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions();
        this.resizedDetections = faceapi.resizeResults(
          this.detection,
          this.displaySize
        );
        // Access expressions for each detection
        console.log(this.resizedDetections[0].expressions);
        this.canvas.getContext('2d').clearRect(0, 0,      this.canvas.width,this.canvas.height);
        faceapi.draw.drawDetections(this.canvas, this.resizedDetections);
        faceapi.draw.drawFaceLandmarks(this.canvas, this.resizedDetections);
        faceapi.draw.drawFaceExpressions(this.canvas, this.resizedDetections);
      }, 100);
    });
  }
}

/*
* I got an error:
* Uncaught (in promise): Error: createCanvasFromMedia - media has not finished loading yet.
*
* To fix this, I added the following code:
*
* this.videoInput = this.video.nativeElement;
* this.videoInput.addEventListener('loadeddata', async () => {
*  this.detect_Faces();
* });
*
*
*
* */
