# Network Fundamentals Assignment
```bash
#!/bin/bash

# ---- Variables ----
report_dir="net_reports"
timestamp=$(date +"%Y-%m-%d_%H-%M-%S")

# ---- Take user input ----
read -p "Enter hostname or IP to troubleshoot (e.g. google.com): " target

# ---- Create directory and file for the report ----
mkdir -p "$report_dir"
report_file="$report_dir/netcheck_${target}_${timestamp}.txt"
touch "$report_file"

echo "===== NETWORK TROUBLESHOOT REPORT for $target =====" > "$report_file"
echo "Generated on: $(date)" >> "$report_file"
echo "" >> "$report_file"

# ---- 1. Check network interfaces ----
echo "----- Network Interfaces -----" >> "$report_file"
ip addr show >> "$report_file" 2>&1
echo "" >> "$report_file"

# ---- 2. Check default gateway / routing table ----
echo "----- Routing Table -----" >> "$report_file"
ip route >> "$report_file" 2>&1
echo "" >> "$report_file"

# ---- 3. Ping test (connectivity + packet loss) ----
echo "----- Ping Test (4 packets) -----" >> "$report_file"
ping -c 4 "$target" >> "$report_file" 2>&1
ping_status=$?
echo "" >> "$report_file"

# ---- 4. DNS resolution check ----
echo "----- DNS Resolution -----" >> "$report_file"
nslookup "$target" >> "$report_file" 2>&1
echo "" >> "$report_file"

# ---- 5. Traceroute (path to host) ----
echo "----- Traceroute -----" >> "$report_file"
traceroute "$target" >> "$report_file" 2>&1
echo "" >> "$report_file"

# ---- 6. Check open/listening ports locally ----
echo "----- Local Listening Ports -----" >> "$report_file"
ss -tulpn >> "$report_file" 2>&1
echo "" >> "$report_file"

# ---- Summary based on ping result ----
echo "----- Summary -----" >> "$report_file"
if [ $ping_status -eq 0 ]; then
    echo "Result: $target is REACHABLE." | tee -a "$report_file"
else
    echo "Result: $target is UNREACHABLE. Check DNS, firewall, or cable/interface above." | tee -a "$report_file"
fi

echo ""
echo "Full report saved to: $report_file"
```
