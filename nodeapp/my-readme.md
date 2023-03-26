# Create package.json
npm init

# Create app.js file

# run
node app.js
# From browser:
localhost:8080/info

# Add VS Support: creates .vscode\launch.json
Add Configuration - > Node.js  

## Debug F5: Don't need to add any other config for node

# ##########################################################
# Docker - Debug
# BEST WAY IS TO Initialize Docker from VS Code: Creates Dockerfile that can be Debugged in the container
# VS Code - > Run -> Add Configuration -> "Add Docker Files to Workspace"
# Debug -> "Docker Node.js Launch"

# I rename to Dockerfile.debug
## Also in tasks.json
"dockerBuild": {
				"dockerfile": "${workspaceFolder}/Dockerfile.debug",

# Add at least one npm package... so node_modules is created (default docker file is expectiog one)
npm install lodash --save

# App gets published on:
http://localhost:32772/

# Attach a Shell to the Debug image
## Can do this from the Docker Extension - > Attach Shell
## OR: executing "sh"
docker exec -it --user=root nodeapp-dev sh
## NOTE Alpine: to install Curl (note though that I added curl to the Dockerfile)
## To be able to install need to exec as Root (no sudo)
docker exec -it --user=root nodeapp-dev sh
>/usr/src/app # apk add curl

# Build as nodeapp1/2
docker image build -t nodeapp1 -f Dockerfile.nodeapp1 .
docker image build -t nodeapp2 -f Dockerfile.nodeapp2 .

## Run the containers locally, exposing ports 81,82 on host
docker container ls
docker container run -it -p 81:8080 --name nodeapp1 nodeapp1
docker container run -it -p 82:8080 --name nodeapp2 nodeapp2

# exec into container, exec curl (was installed in dockerfile)
docker exec -it nodeapp1 sh
> curl localhost:8080/info

# THINKPAD ###############################################################################
# On Thinkpad, if necessary, remove existing directory and files
rm -rf nodeapp
mkdir nodeapp

# Copy everything to the thinkpad
scp -r ./* pietronromano@thinkpadu:mycontainers/containers/nodeapp
## OR: upload to git
git push origin main

## ssh if running remotely
ssh pietronromano@thinkpadu
cd mycontainers/containers/nodeapp

## Run from Thinkpad, can see results in the Thinkpad's browser or with curl
npm install
node app.js app-thinkpad

## With ufw enabled (Uncomplicated Firewall), TRY accessing remotely - from this host - can't as port isn't exposed by default by ufw blocks everything IF enabled 
http://thinpadu:8080

## On Thinkpad, run the ufw command to allow access through that port:
sudo ufw allow 8080
sudo ufw status
## Can now acccess port 8080 remotely, from this host

# ####################################

# Docker Build on Thinkpad
cd mycontainers/containers/nodeapp
## List images currently on the host
sudo docker images
## Build the images based on node:alpine, (don't forget the period at the end .)
## -t tags the image with a name (app1,app2)
sudo docker image build -t nodeapp1 -f Dockerfile.nodeapp1 .
sudo docker image build -t nodeapp2 -f Dockerfile.nodeapp2 .
## Note that the second image builds much faster, as all the shared layers were already downloaded

## Run the containers locally in detached mode
sudo docker container ls
sudo docker container run -d --name nodeapp1 nodeapp1
sudo docker container run -d --name nodeapp2 nodeapp2
## From host, try to access 8080 -> we can't, as no ports are exposed

## Remove the containers, then Expose port 81,82 on the host, mapped to the 8080 on the app
sudo docker container rm -f nodeapp1 nodeapp2
sudo docker container  run -d -p 81:8080 --name nodeapp1 nodeapp1
sudo docker container  run -d -p 82:8080 --name nodeapp2 nodeapp2

## Can now access from the browser on the host or with curl
curl localhost:81/info
# exec into container, exec curl (was installed in dockerfile)
sudo docker exec -it nodeapp1 sh
# Access on internal POD por 8080
curl localhost:8080/info 

# KUBERNETES #######################################################################
# 
# Upload image to docker hub
## NOTE: Need to login before trying to push, otherwise get a: 
### "denied: requested access to the resource is denied"
sudo docker login 
>user: pietronromano
>pwd: ax…0

## First need to tag the image with the dockerhub account as a prefix
sudo docker image tag nodeapp1 pietronromano/nodeapp1:latest
sudo docker image tag nodeapp2 pietronromano/nodeapp2:latest

# Docker hub
https://hub.docker.com/u/pietronromano

## then push
sudo docker image push pietronromano/nodeapp1:latest
sudo docker image push pietronromano/nodeapp2:latest
# ACR
## Upload to acr
az acr login -n pnracr1
docker tag app1 pnracr1.azurecr.io/app1:1.0
docker push pnracr1.azurecr.io/app1:1.0

docker tag app2 pnracr1.azurecr.io/app2:2.0
docker push pnracr1.azurecr.io/app2:2.0


# KUBERNETES ############################################################
# Pod Definition
alias k='microk8s kubectl'
k get pods

# PODs
k apply -f ./yml/nodeapp1.pod.yml
# Pods just have a "containerPort": 8080 -> with just that, can only access from within the pod
# Note, "port" isn't valid in this yaml, only the internally used containerport
kubectl exec nodeapp1-pod -it -- sh
curl localhost: 8080

# NOTE: Port forwarding: privileged ports like 80 can fail - permission denied, 8080 is ok
kubectl port-forward nodeapp1-pod 8081:8080

k apply -f ./yml/nginx.pod.yml
kubectl exec nodeapp1-pod -it -- sh
curl localhost:8080/info


# Another example
https://kubernetes.io/docs/concepts/workloads/pods/
kubectl apply -f https://k8s.io/examples/pods/simple-pod.yaml
kubetcl get pods

# Deployments
## With this Service definition, the app is available on the kubernetes host at 31001 (and also externally to the host, from PC)
 ports:
 - port: 81
   targetPort: 8080
   nodePort: 31001

kubectl apply -f ./yml/nodeapp1.dep.yml
kubectl get pods
kubectl get deployments --show-labels
kubectl scale deployment nodeapp1-dep --replicas=5
kubectl logs  deployment/nodeapp1-dep

# AKS ######################################################################
az login

## Install kubectl
az aks install-cli
## NOTE: Need to add "C:\Users\pietr\.azure-kubectl" to System-> Environment Variables
## Otherwise kubetcl doesn't get recognized

az aks get-credentials --resource-group iot-rg --name pnraks1
kubectl apply -f ./yml/nodeapp1.dep.yml

# SERVICES ###########################################
## check the external IPs - note that the NodePort didn't create an external IP
kubectl get svc
NAME         TYPE           CLUSTER-IP     EXTERNAL-IP   PORT(S)        AGE
np-app1      NodePort       10.0.1.173     <none>        81:31001/TCP   43s

## Apply an LB service
kubectl apply -f ./yml/nodeapp1.lb.yml 

kubectl get svc
NAME         TYPE           CLUSTER-IP   EXTERNAL-IP    PORT(S)        AGE
kubernetes   ClusterIP      10.0.0.1     <none>         443/TCP        3d7h
lb-app1      LoadBalancer   10.0.57.22   20.86.233.58   81:30686/TCP   8s
np-app1      NodePort       10.0.1.173   <none>         81:31001/TCP   6m6s

## App now available on 20.71.15.99:81/info
curl 20.71.15.99:81/info
{"podApp":"nodeapp1","podHostName":"nodeapp1-dep-58fcf446fb-6vh2w","remoteAddress":"Request received from: ::ffff:10.244.0.1:25801","requestHostHeader":"20.71.15.99:81","time":"Sat, 25 Mar 2023 10:53:26 GMT"}

# NEXT .....
# Ingress
kubectl apply -f ingress.yml

## app1/app2 now available from the ingress external IP + /app1 or /app2
http://20.93.226.80/app1
http://20.93.226.80/app2

