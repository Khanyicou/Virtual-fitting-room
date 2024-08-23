from flask import Flask, render_template, Response
import cv2
import os
from cvzone.PoseModule import PoseDetector

app = Flask(__name__)

# Initialize webcam and pose detector
cap = cv2.VideoCapture(0)
detector = PoseDetector()

# Path to shirt images
shirtFolderPath = "static/images/shirts"
listShirts = os.listdir(shirtFolderPath)

# Calculate the fixed aspect ratio
fixedRatio = 262 / 190  # widthOfShirt / widthOfPoint11to12
shirtRatioHeightWidth = 581 / 440

# Initialize image number for shirt selection
imageNumber = 0

def generate_frames():
    global imageNumber

    while True:
        success, img = cap.read()
        if not success:
            break
        
        img = detector.findPose(img)
        lmList, bboxInfo = detector.findPosition(img, bboxWithHands=False, draw=False)

        if lmList:
            # Calculate necessary parameters for shirt placement
            lm11 = lmList[11][1:3]
            lm12 = lmList[12][1:3]
            imgShirt = cv2.imread(os.path.join(shirtFolderPath, listShirts[imageNumber]), cv2.IMREAD_UNCHANGED)

            # Calculate the width of the shirt based on pose landmarks
            widthOfShirt = int((lm11[0] - lm12[0]) * fixedRatio)
            imgShirt = cv2.resize(imgShirt, (widthOfShirt, int(widthOfShirt * shirtRatioHeightWidth)))

            # Calculate offset based on current scale
            currentScale = (lm11[0] - lm12[0]) / 190
            offset = int(44 * currentScale), int(48 * currentScale)

            # Overlay the shirt on the person's body
            try:
                for c in range(3):
                    img[lm12[1] - offset[1]:lm12[1] - offset[1] + imgShirt.shape[0], 
                        lm12[0] - offset[0]:lm12[0] - offset[0] + imgShirt.shape[1], c] = \
                        img[lm12[1] - offset[1]:lm12[1] - offset[1] + imgShirt.shape[0], 
                            lm12[0] - offset[0]:lm12[0] - offset[0] + imgShirt.shape[1], c] * \
                        (1 - imgShirt[:, :, 3] / 255.0)
            except:
                pass
        
        # Encode the processed frame
        ret, buffer = cv2.imencode('.jpg', img)
        img = buffer.tobytes()

        # Yield the processed frame
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + img + b'\r\n')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == "__main__":
    app.run(debug=True)

