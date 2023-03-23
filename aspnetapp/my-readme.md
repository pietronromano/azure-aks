# 17-March-2023
# SOURCE: https://github.com/dotnet/dotnet-docker.git
# See Source for other Dockerfile images

# Build
docker build --pull -t aspnetapp -f Dockerfile.ubuntu-x64 .

# Run
docker container run  --name aspnetapp -it -p 8000:80 aspnetapp

# Run bash: NOTE: that curl isn't installed on linux by default
docker exec -it aspnetapp bash
# curl http://localhost:8000/Environment
{"runtimeVersion":".NET 7.0.2","osVersion":"Linux 5.15.79.1-microsoft-standard-WSL2 #1 SMP Wed Nov 23 01:01:46 UTC 2022","osArchitecture":"X64","user":"root","processorCount":16,"totalAvailableMemoryBytes":67430023168,"memoryLimit":9223372036854771712,"memoryUsage":100577280}

--------------------------------------------------------------
# DEBUG
# BEST WAY IS TO Initialize Docker from VS Code: Creates Dockerfile that can be Debugged in the container
# VS Code - > Run -> Add Configuration -> "Add Docker Files to Workspace"
# Debug -> "Docker .NET Launch"

# --------------------------------------------------------------------
# BINDS
## DID WORK ON LINUX!
## DIDN'T WORK ON WINDOWS!!: Didn't do anything - container wasn't watching host folder
docker container run  --name aspnetapp -it -p 8000:80 -v $(pwd):/app  aspnetapp

# VS Code Git Bash didn't work, nor did it from WSL or Terminal
## DIDN'T WORK: /w argument caused this error:
## docker: Error response from daemon: the working directory 'C:/Program Files/Git/app' is invalid, it needs to be an absolute path.
docker container run  --name aspnetapp -it -p 8000:80 -v $(pwd):/app -w "/app" aspnetapp

## DIDN'T WORK: https://docs.docker.com/get-started/06_bind_mounts/
## ERROR: Error response from daemon: failed to create shim task: OCI runtime create failed:
docker container run  --name aspnetapp -it -p 8000:80 --mount src="$(pwd)", target=app aspnetapp bash

