# Linux Fundamental Assignment

> ### Task 1

## Soft Links vs Hard Links

Hard Links points directly to the same inode as the original file. The data is only removed when the link count on the inode drops to 0.

<ul>
    <li>Cannot link across different filesystems/partitions.
    <li>Cannot hard-link a directory.
    <li>If you edit content via one hard link, the change appears in the other too.
</ul>

Soft Links are separate files that contains the path to the target file. It has its own inode, distinct from the target's inode.

<ul>
    <li>Can span across filesystems/partitions.
    <li>Can link to directories.
    <li>If the original file is deleted or moved, the symlink becomes broken/dangling.
</ul>

```bash
touch test.txt
ln test.txt ptrHard
ln -s test.txt ptrSoft
ls 
ptrHard  ptrSoft  test.txt
ls -li
total 3
29098451 -rw-rw-r-- 2 ujjwalsahu ujjwalsahu    0 Sep  1 01:24 ptrHard
29098495 lrwxrwxrwx 1 ujjwalsahu ujjwalsahu    8 Sep  1 01:32 ptrSoft -> test.txt
29098451 -rw-rw-r-- 2 ujjwalsahu ujjwalsahu    0 Sep  1 01:24 test.txt
```

> ### Task 2

## adduser vs useradd

useradd is available on virtually every Linux distro (Ubuntu, CentOS, RHEL, Debian, etc.) since it's part of the base system. It creates the user without a home directory, without setting a password, and without prompting for anything. You have to pass explicit flags for everything.

```bash
sudo useradd -m -d /home/john -s /bin/bash -c "Ujjwal Sahu" john
sudo passwd john
```

- m → create home directory
- d → specify home directory path
- s → set login shell
- c → comment/full name field

adduser that wraps around useradd, it automatically creates the home directory, copies default config files from /etc/skel, prompts you interactively to set a password, and asks for extra info

```bash
sudo adduser john
```

On Ubuntu, adduser is preferred for manual/day-to-day use because it's safer and easier; useradd is preferred inside scripts/automation where you need full non-interactive control.

```bash
sudo adduser test
[sudo: authenticate] Password:     
sudo: Authentication failed, try again.
[sudo: authenticate] Password:     
New password: 
BAD PASSWORD: The password is shorter than 8 characters
Retype new password: 
passwd: password updated successfully
Changing the user information for test
Enter the new value, or press ENTER for the default
        Full Name []: Test
        Room Number []: 
        Work Phone []: 
        Home Phone []: 
        Other []: 
Is the information correct? [Y/n] 
```

> ### Task 3
## journalctl

journalctl is the query tool for systemd's journal — the centralized logging system used by most modern Linux distros.

### Core Commands

```bash
# View the entire journal (oldest first), paged like `less`
journalctl

# Follow logs live, like `tail -f`
journalctl -f

# Logs since the most recent boot
journalctl -b

# Logs from the previous boot (crash investigation)
journalctl -b -1

# Reverse order — newest entries first
journalctl -r

# Logs for one systemd unit/service
journalctl -u ssh.service
journalctl -u nginx

# Follow a specific service live
journalctl -u nginx -f

# Combine: today's logs for a service only
journalctl -u nginx --since today
```

> ### Task 4

## Linux Command 

```bash
pwd
ls
ls -al
mkdir testDir
cd testDir
touch test.txt
cat test.txt
chmod 755 test.txt
rm test.txt
rmdir testDir
ps aux
top
kill PID
ping https://google.com
ifconfig
curl 
whoami
uptime
hostname
```
