OPEN THE ANACONDA PROMPT AND RUN:

conda activate NAME-ENVIRONMENT

yolo detect train data=…\PATH TO\FILE.yaml model=yolo11…MODEL TASK AND LEVEL… .pt epochs=…NUMBER OF ITERATIONS… imgsz=…PATCH SIZE… device=…0 or 1 or cpu, etc…

-------------------------------------------------
THE TRAINING RESULTS WILL BE STORED IN:

C:\Users\...\runs\detect OR C:\Windows\System32\runs\detect

-------------------------------------------------
COPY TRAIN FOLDER IN 4.2_TRAINING-results AND COPY GEOTIFF TO PREDICT IN 5.1_PREDICT
