# Docker Network Assignment

> ### Task 1
```bash
docker network ls
docker ps
docker inspect backend
NETWORK ID     NAME           DRIVER    SCOPE
fb7ed84c49fd   backend-net    bridge    local
67f08aa77f81   bridge         bridge    local
f13ffad7e473   database-net   bridge    local
8204086a49de   frontend-net   bridge    local
5a4153b1013e   host           host      local
f612115048cb   none           null      local
CONTAINER ID   IMAGE               COMMAND                  CREATED              STATUS              PORTS                                         NAMES
cceadf4fed85   nginx               "/docker-entrypoint.…"   About a minute ago   Up About a minute   0.0.0.0:8080->80/tcp, [::]:8080->80/tcp       frontend
df6b03fc17aa   alpine              "/bin/sh"                2 minutes ago        Up 2 minutes                                                      backend
6608b1725d65   mysql:8.0           "docker-entrypoint.s…"   3 minutes ago        Up 3 minutes        3306/tcp, 33060/tcp                           database
46e8fbd27717   docker-multistage   "docker-entrypoint.s…"   2 hours ago          Up 2 hours          0.0.0.0:8000->3000/tcp, [::]:8000->3000/tcp   multistage-container
0bf9367390d5   nginx-hello         "/docker-entrypoint.…"   2 hours ago          Up 2 hours          0.0.0.0:8083->80/tcp, [::]:8083->80/tcp       nginx-container
dbc1652d453d   apache-hello        "httpd-foreground"       2 hours ago          Up 2 hours          0.0.0.0:8081->80/tcp, [::]:8081->80/tcp       apache-container
[
    {
        "Id": "df6b03fc17aaadca34735586da019aaf7520a18e2dde581871f91e42fd51c317",
        "Created": "2026-09-03T08:28:29.617415818Z",
        "Path": "/bin/sh",
        "Args": [],
        "State": {
            "Status": "running",
            "Running": true,
            "Paused": false,
            "Restarting": false,
            "OOMKilled": false,
            "Dead": false,
            "Pid": 1712,
            "ExitCode": 0,
            "Error": "",
            "StartedAt": "2026-09-03T08:28:29.830571445Z",
            "FinishedAt": "0001-01-01T00:00:00Z"
        },
        "Image": "sha256:28bd5fe8b56d1bd048e5babf5b10710ebe0bae67db86916198a6eec434943f8b",
        "ResolvConfPath": "/var/lib/docker/containers/df6b03fc17aaadca34735586da019aaf7520a18e2dde581871f91e42fd51c317/resolv.conf",
        "HostnamePath": "/var/lib/docker/containers/df6b03fc17aaadca34735586da019aaf7520a18e2dde581871f91e42fd51c317/hostname",
        "HostsPath": "/var/lib/docker/containers/df6b03fc17aaadca34735586da019aaf7520a18e2dde581871f91e42fd51c317/hosts",
        "LogPath": "/var/lib/docker/containers/df6b03fc17aaadca34735586da019aaf7520a18e2dde581871f91e42fd51c317/df6b03fc17aaadca34735586da019aaf7520a18e2dde581871f91e42fd51c317-json.log",
        "Name": "/backend",
        "RestartCount": 0,
        "Driver": "overlayfs",
        "Platform": "linux",
        "MountLabel": "",
        "ProcessLabel": "",
        "AppArmorProfile": "",
        "ExecIDs": null,
        "HostConfig": {
            "Binds": null,
            "ContainerIDFile": "",
            "LogConfig": {
                "Type": "json-file",
                "Config": {}
            },
            "NetworkMode": "backend-net",
            "PortBindings": {},
            "RestartPolicy": {
                "Name": "no",
                "MaximumRetryCount": 0
            },
            "AutoRemove": false,
            "VolumeDriver": "",
            "VolumesFrom": null,
            "ConsoleSize": [
                36,
                123
            ],
            "CapAdd": null,
            "CapDrop": null,
            "CgroupnsMode": "private",
            "Dns": null,
            "DnsOptions": [],
            "DnsSearch": [],
            "ExtraHosts": null,
            "GroupAdd": null,
            "IpcMode": "private",
            "Cgroup": "",
            "Links": null,
            "OomScoreAdj": 0,
            "PidMode": "",
            "Privileged": false,
            "PublishAllPorts": false,
            "ReadonlyRootfs": false,
            "SecurityOpt": null,
            "UTSMode": "",
            "UsernsMode": "",
            "ShmSize": 67108864,
            "Runtime": "runc",
            "Isolation": "",
            "CpuShares": 0,
            "Memory": 0,
            "NanoCpus": 0,
            "CgroupParent": "",
            "BlkioWeight": 0,
            "BlkioWeightDevice": [],
            "BlkioDeviceReadBps": [],
            "BlkioDeviceWriteBps": [],
            "BlkioDeviceReadIOps": [],
            "BlkioDeviceWriteIOps": [],
            "CpuPeriod": 0,
            "CpuQuota": 0,
            "CpuRealtimePeriod": 0,
            "CpuRealtimeRuntime": 0,
            "CpusetCpus": "",
            "CpusetMems": "",
            "Devices": [],
            "DeviceCgroupRules": null,
            "DeviceRequests": null,
            "MemoryReservation": 0,
            "MemorySwap": 0,
            "MemorySwappiness": null,
            "OomKillDisable": null,
            "PidsLimit": null,
            "Ulimits": [],
            "CpuCount": 0,
            "CpuPercent": 0,
            "IOMaximumIOps": 0,
            "IOMaximumBandwidth": 0,
            "MaskedPaths": [
                "/proc/acpi",
                "/proc/asound",
                "/proc/interrupts",
                "/proc/kcore",
                "/proc/keys",
                "/proc/latency_stats",
                "/proc/sched_debug",
                "/proc/scsi",
                "/proc/timer_list",
                "/proc/timer_stats",
                "/sys/devices/virtual/powercap",
                "/sys/firmware"
            ],
            "ReadonlyPaths": [
                "/proc/bus",
                "/proc/fs",
                "/proc/irq",
                "/proc/sys",
                "/proc/sysrq-trigger"
            ]
        },
        "Storage": {
            "RootFS": {
                "Snapshot": {
                    "Name": "overlayfs"
                }
            }
        },
        "Mounts": [],
        "Config": {
            "Hostname": "df6b03fc17aa",
            "Domainname": "",
            "User": "",
            "AttachStdin": false,
            "AttachStdout": false,
            "AttachStderr": false,
            "Tty": true,
            "OpenStdin": true,
            "StdinOnce": false,
            "Env": [
                "PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
            ],
            "Cmd": [
                "/bin/sh"
            ],
            "Image": "alpine",
            "Volumes": null,
            "WorkingDir": "/",
            "Entrypoint": null,
            "Labels": {}
        },
        "NetworkSettings": {
            "SandboxID": "2bd35dfd476a7aa4f686a1b3487b49e34b1676db865475111c2508ea793ba05f",
            "SandboxKey": "/var/run/docker/netns/2bd35dfd476a",
            "Ports": {},
            "Networks": {
                "backend-net": {
                    "IPAMConfig": null,
                    "Links": null,
                    "Aliases": null,
                    "DriverOpts": null,
                    "GwPriority": 0,
                    "NetworkID": "fb7ed84c49fd3f6fe569ee57f0b48d73a03cc6a4c746d8122d42541c8b26db7e",
                    "EndpointID": "16418cf83adda455198e70a69cb8bb563aaad6aa8ecbe6f6bf2dbbfd54f6db7c",
                    "Gateway": "172.19.0.1",
                    "IPAddress": "172.19.0.2",
                    "MacAddress": "0e:37:c3:17:31:37",
                    "IPPrefixLen": 16,
                    "IPv6Gateway": "",
                    "GlobalIPv6Address": "",
                    "GlobalIPv6PrefixLen": 0,
                    "DNSNames": [
                        "backend",
                        "df6b03fc17aa"
                    ]
                },
                "database-net": {
                    "IPAMConfig": {},
                    "Links": null,
                    "Aliases": [],
                    "DriverOpts": {},
                    "GwPriority": 0,
                    "NetworkID": "f13ffad7e4737b63de128a8bf1d7cb3389aacb6099f5b1a80b489591cbbb2e5e",
                    "EndpointID": "39622832db196c61a5c2927c72a11d8788126ee65717364ef9a441f6687c0588",
                    "Gateway": "172.20.0.1",
                    "IPAddress": "172.20.0.3",
                    "MacAddress": "82:24:0d:a0:a7:d9",
                    "IPPrefixLen": 16,
                    "IPv6Gateway": "",
                    "GlobalIPv6Address": "",
                    "GlobalIPv6PrefixLen": 0,
                    "DNSNames": [
                        "backend",
                        "df6b03fc17aa"
                    ]
                },
                "frontend-net": {
                    "IPAMConfig": {},
                    "Links": null,
                    "Aliases": [],
                    "DriverOpts": {},
                    "GwPriority": 0,
                    "NetworkID": "8204086a49de55e8fc8a63b6c4a132933b2b9592c9072c14b603dbd05af695c1",
                    "EndpointID": "589e632dc3b791251143df5d5a5507ee80a097587f90abfdeef5ebca5924b59e",
                    "Gateway": "172.18.0.1",
                    "IPAddress": "172.18.0.3",
                    "MacAddress": "16:8b:1f:fa:20:2f",
                    "IPPrefixLen": 16,
                    "IPv6Gateway": "",
                    "GlobalIPv6Address": "",
                    "GlobalIPv6PrefixLen": 0,
                    "DNSNames": [
                        "backend",
                        "df6b03fc17aa"
                    ]
                }
            }
        },
        "ImageManifestDescriptor": {
            "mediaType": "application/vnd.oci.image.manifest.v1+json",
            "digest": "sha256:79ff19e9084a00eece421b2523fb93e22d730e2c0e525905de047e848e56d95f",
            "size": 1022,
            "annotations": {
                "com.docker.official-images.bashbrew.arch": "amd64",
                "org.opencontainers.image.base.name": "scratch",
                "org.opencontainers.image.created": "2026-06-16T00:01:04Z",
                "org.opencontainers.image.revision": "398ff0c866d27e9f46f53e48184fe36c674b8897",
                "org.opencontainers.image.source": "https://github.com/alpinelinux/docker-alpine.git#398ff0c866d27e9f46f53e48184fe36c674b8897:x86_64",
                "org.opencontainers.image.url": "https://hub.docker.com/_/alpine",
                "org.opencontainers.image.version": "3.24.1"
            },
            "platform": {
                "architecture": "amd64",
                "os": "linux"
            }
        }
    }
]
```

```bash
docker exec -it backend sh
/ # apk add --no-cache iputils
(1/6) Installing libcap2 (2.78-r0)
(2/6) Installing iputils-arping (20250605-r2)
(3/6) Installing iputils-clockdiff (20250605-r2)
(4/6) Installing iputils-ping (20250605-r2)
(5/6) Installing iputils-tracepath (20250605-r2)
(6/6) Installing iputils (20250605-r2)
Executing busybox-1.37.0-r31.trigger
OK: 8449 KiB in 22 packages
/ # ping database
PING database (172.20.0.2) 56(84) bytes of data.
64 bytes from database.database-net (172.20.0.2): icmp_seq=1 ttl=64 time=2.23 ms
64 bytes from database.database-net (172.20.0.2): icmp_seq=2 ttl=64 time=0.206 ms
64 bytes from database.database-net (172.20.0.2): icmp_seq=3 ttl=64 time=0.137 ms
64 bytes from database.database-net (172.20.0.2): icmp_seq=4 ttl=64 time=0.118 ms
64 bytes from database.database-net (172.20.0.2): icmp_seq=5 ttl=64 time=0.155 ms
64 bytes from database.database-net (172.20.0.2): icmp_seq=6 ttl=64 time=0.138 ms
64 bytes from database.database-net (172.20.0.2): icmp_seq=7 ttl=64 time=0.160 ms
64 bytes from database.database-net (172.20.0.2): icmp_seq=8 ttl=64 time=0.164 ms
64 bytes from database.database-net (172.20.0.2): icmp_seq=9 ttl=64 time=0.137 ms
^C
--- database ping statistics ---
54 packets transmitted, 54 received, 0% packet loss, time 54244ms
rtt min/avg/max/mdev = 0.041/0.295/7.037/0.969 ms
/ # ping frontend
PING frontend (172.18.0.2) 56(84) bytes of data.
64 bytes from frontend.frontend-net (172.18.0.2): icmp_seq=1 ttl=64 time=0.316 ms
64 bytes from frontend.frontend-net (172.18.0.2): icmp_seq=2 ttl=64 time=0.130 ms
64 bytes from frontend.frontend-net (172.18.0.2): icmp_seq=3 ttl=64 time=0.119 ms
64 bytes from frontend.frontend-net (172.18.0.2): icmp_seq=4 ttl=64 time=0.121 ms
64 bytes from frontend.frontend-net (172.18.0.2): icmp_seq=5 ttl=64 time=0.073 ms
64 bytes from frontend.frontend-net (172.18.0.2): icmp_seq=6 ttl=64 time=0.122 ms
64 bytes from frontend.frontend-net (172.18.0.2): icmp_seq=7 ttl=64 time=0.056 ms
^C
--- frontend ping statistics ---
7 packets transmitted, 7 received, 0% packet loss, time 6131ms
rtt min/avg/max/mdev = 0.056/0.133/0.316/0.078 ms
/ # exit
```
> ### Task 2

```bash
docker ps
curl http://localhost
CONTAINER ID   IMAGE     COMMAND              CREATED          STATUS          PORTS                                 NAMES
982c74cdd8d1   httpd     "httpd-foreground"   54 seconds ago   Up 54 seconds   0.0.0.0:80->80/tcp, [::]:80->80/tcp   apache-host
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>
<head>
<title>It works! Apache httpd</title>
</head>
<body>
<p>It works!</p>
</body>
</html>
```

> ### Task 3

```bash
docker run -d \
  --name nginx-bind \
  -p 8081:80 \
  -v "$(pwd):/usr/share/nginx/html" \
  nginx
50981b8092557ac13e6d4e3cd9fc00154204465a61a2d09c6f8435c451658faf
curl http://localhost:8081
Hello students
echo "Hello students - Updated!" > index.html
echo "Hello students - Updated!" > index.html
curl http://localhost:8081
Hello students - Updated!
```

> ### Task 4

### What is an Overlay Network?

A Docker overlay network allows containers running on different Docker hosts to communicate over a common virtual network.

### Use Cases

- Docker Swarm
- Multi-host container communication
- Distributed applications
- Microservices

### How It Works

Docker creates a virtual network spanning multiple Docker hosts. Containers connected to the overlay network can communicate with each other even when they are running on different physical or virtual machines.