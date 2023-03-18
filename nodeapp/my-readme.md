# Create package.json
npm init

# Create app.js file

# run
node app.js

# Add VS Support: creates .vscode\launch.json
Add Configuration - > Node.js  

## Debug F5: Don't need to add any other config for node

# ##########################################################
# Docker
# BEST WAY IS TO Initialize Docker from VS Code: Creates Dockerfile that can be Debugged in the container
# VS Code - > Run -> Add Configuration -> "Add Docker Files to Workspace"
# Debug -> "Docker Node.js Launch"

# Add at least one npm package... so node_modules is created (default docker file is expectiog one)
npm install lodash --save

# App gets published on:
http://localhost:32772/

# Attach a Shell
## Can do this from the Docker Extension - > Attach Shell
## OR: executing "sh"
docker exec -it nodeapp-dev sh
