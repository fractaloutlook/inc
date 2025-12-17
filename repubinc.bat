@echo off
REM Deploy Quantum Garden to production server
REM Updated for modular architecture - deploys entire directory structure

echo Deploying Quantum Garden to production...

REM Deploy main HTML file
pscp -i "D:\keys\newdualsys.ppk" "E:\AI\claude\incremental_2\index.html" ubuntu@64.181.202.3:/var/www/garden/index.html

REM Deploy CSS directory
pscp -r -i "D:\keys\newdualsys.ppk" "E:\AI\claude\incremental_2\css" ubuntu@64.181.202.3:/var/www/garden/

REM Deploy JavaScript directory
pscp -r -i "D:\keys\newdualsys.ppk" "E:\AI\claude\incremental_2\js" ubuntu@64.181.202.3:/var/www/garden/

REM Deploy Data directory
pscp -r -i "D:\keys\newdualsys.ppk" "E:\AI\claude\incremental_2\data" ubuntu@64.181.202.3:/var/www/garden/

REM Also keep quantum-garden.html as backup (single-file version)
pscp -i "D:\keys\newdualsys.ppk" "E:\AI\claude\incremental_2\quantum-garden.html" ubuntu@64.181.202.3:/var/www/garden/quantum-garden.html

echo.
echo Deployment complete!
echo Main site: index.html
echo Backup: quantum-garden.html
echo.
