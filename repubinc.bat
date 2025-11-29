@echo off
REM Copy the html game file to the server
call plink ubuntu@64.181.202.3 -no-antispoof -i "D:\keys\newdualsys.ppk" "~/inc/inc/quantum-garden.html" 0<"E:\AI\claude\incremental_2\inc\quantum-garden.html"

REM Publish the module using bash to load environment properly
REM call plink ubuntu@64.181.202.3 -no-antispoof -i "C:\Users\USER\My Documents\oracle\newdualsys.ppk" "bash -l -c 'cd ~/status-module && REM 
REM spacetime publish --project-path . status-module'"
