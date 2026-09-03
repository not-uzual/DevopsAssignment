# Shell Scripting Assignment
```bash
#!/bin/bash

current_date=$(date)
host_name=$(hostname)
current_user=$(whoami)
echo "Current date : $current_date"
echo "Hostname : $host_name"
echo "Current user: $current_user"
df -h
ps aux | head -n 10
read -p "Enter a name for your report directory: " dir_name
mkdir -p "$dir_name"
touch testProcess.txt
ps aux > testProcess.txt
```
