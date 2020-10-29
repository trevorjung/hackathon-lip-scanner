const video = document.getElementById('video')

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('./models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('./models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('./models')
]).then(startVideo)

function startVideo() {
  navigator.getUserMedia(
    { video: {} },
    stream => video.srcObject = stream,
    err => console.error(err)
  )
}

let lipSwatch = 'purple'

function getSwatch(swatch) {
  console.info(`updated with swatch ${swatch}`)
  lipSwatch = swatch
}

video.addEventListener('play', () => {
  const canvas = faceapi.createCanvasFromMedia(video)
  const overlayInsert = document.createElement('div')
  overlayInsert.id = 'lips';
  document.body.append(overlayInsert);
  document.body.append(canvas)
  const displaySize = { width: video.width, height: video.height }
  faceapi.matchDimensions(canvas, displaySize)
  setInterval(async () => {
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks()
    // https://www.pyimagesearch.com/wp-content/uploads/2017/04/facial_landmarks_68markup.jpg
    const mouthCoordinates = detections[0].landmarks._positions.slice(49); // 49-68
    // console.log('mouth: ', mouthCoordinates)
    const leftCornerMouth = mouthCoordinates[0].x; // 49
    const rightCornerMouth = mouthCoordinates[6].x; // 55
    const topMouth = mouthCoordinates[2].y; // 51
    const bottomMouth = mouthCoordinates[9].y; // 58
    const lipWidth = rightCornerMouth - leftCornerMouth;
    const lipHeight = bottomMouth - topMouth;
    const overlay = document.getElementById('lips');
    overlay.style.cssText = `
      width: ${lipWidth+15}px;
      height: ${lipHeight}px;
      left: calc(50% - ${323-leftCornerMouth}px);
      top: calc(50% - ${235-topMouth}px);
      background: #${lipSwatch};
      border-radius: 80%;
      opacity: 0.35;
      position: absolute;`;
    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    // faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
  }, 100)
})