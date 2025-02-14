GENERAL ENVIRONMENT CREATION SCRIPT:

conda create --name ENVIRONMENT-NAME python=3.9.21

--------------------------------------------------
ENV-1: DATASET PREPARATION - LABELLING
--------------------------------------------------

ENVIRONMENT NAME, python=3.9.21

INSTALLATION SCRIPT:

conda activate PhD_LABELLING_06
conda -V
conda config --add channels conda-forge
conda install -n base -c conda-forge mamba
mamba install -c conda-forge gdal=3.4.1 rasterio=1.2.10 geopandas=0.9.0 shapely=1.7.1
mamba install -c conda-forge jupyterlab
conda list

--------------------------------------------------
ENV-2: DATASET PREPARATION – AUGMENTATION AND SPLITTING
--------------------------------------------------

ENVIRONMENT NAME, python=3.9.21

INSTALLATION SCRIPT:

conda activate PhD_DATASET-AUGMENTATION_01
conda -V
conda config --add channels conda-forge
conda install -n base -c conda-forge mamba
mamba install -c conda-forge albumentations opencv scikit-learn
mamba install -c conda-forge jupyterlab
conda list

--------------------------------------------------
ENV-3: DEEPLEARNING – TRAINING AND PREDICT
--------------------------------------------------

ENVIRONMENT NAME, python=3.9.21

INSTALLATION SCRIPT 1 OF 2:

conda activate PhD_YOLO_02
conda -V
conda config --add channels conda-forge
conda install -n base -c conda-forge mamba
mamba install -c conda-forge -c pytorch -c nvidia pytorch torchvision pytorch-cuda=11.8 ultralytics
conda list

CHECK SCRIPT:

python -c "import torch; print(f'CUDA Available: {torch.cuda.is_available()}'); print(f'PyTorch CUDA Version: {torch.version.cuda}'); print(f'Device Name: {torch.cuda.get_device_name(0) if torch.cuda.is_available() else \"No CUDA device found\"}')"

PROMPT ANSWER:

CUDA Available: True
PyTorch CUDA Version: 11.8
Device Name: NVIDIA GeForce GTX 1070

INSTALLATION SCRIPT 2 OF 2:

mamba install -c conda-forge jupyterlab
mamba install -c conda-forge svgwrite
mamba install -c conda-forge geopandas shapely
mamba install -c conda-forge gdal
conda env config vars set GDAL_DATA="C:\ProgramData\Anaconda3\envs\PhD_YOLO_02\Library\share\gdal"
conda deactivate
conda activate PhD_YOLO_02
mamba install -c conda-forge rasterio
conda list

--------------------------------------------------
ENV-4: PLOT STATISTICS
--------------------------------------------------
section in progress...




--------------------------------------------------
ENV-5: LCP
--------------------------------------------------
section in progress...






