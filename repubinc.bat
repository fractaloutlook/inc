@echo off
REM Copy the html game file to the server
REM call plink ubuntu@64.181.202.3 -no-antispoof -i "D:\keys\newdualsys.ppk" "~/inc/inc/quantum-garden.html" 0<"E:\AI\claude\incremental_2\quantum-garden.html"

pscp -i "D:\keys\newdualsys.ppk" "E:\AI\claude\incremental_2\quantum-garden.html" ubuntu@64.181.202.3:/var/www/garden/quantum-garden.html

