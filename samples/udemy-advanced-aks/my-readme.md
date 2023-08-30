# DATE: 30-08-2023
# COURE: 
- https://www.udemy.com/course/learn-aks-network-security 
# SOURCE: 
- https://github.com/HoussemDellai/docker-kubernetes-course

# Login
    az login --tenant pietronromanolive.onmicrosoft.com

# Get context
    rg="aks-rg"
    clu="pnraks1"
    acr="pnracr1"
    az aks get-credentials --resource-group $rg --name $clu --overwrite-existing

# Create a Pod
## Create a pod yaml with dry-run: 
    kubectl run nginx --image=nginx -o yaml --dry-run=client > nginx-pod.yaml

## Create pod yaml with image from linked ACR
    kubectl run nodeapp1 --image=pnracr1.azurecr.io/nodeapp1:latest --dry-run=client -o yaml > nodapp1-pod.yaml

## MINE: Example of importing ngnix to ACR first, to avoid potential pull errors 
## Use --expose-token' to get an access token, which does not require Docker to be installed locally.
    az acr login -n $acr --expose-token
    az acr import \
        --name $acr \
        --source docker.io/library/nginx:latest \
        --image nginx:latest \ 
        --username pietronromano \
        --password axml-xsl0 

## Run the pod
    kubectl apply -f ./nginx-pod.yaml
    kubectl apply -f ./nodapp1-pod.yaml
    kubectl get pods
 
# Create a Deployment
## Create a depyotment yaml with dry-run, with 3 replicas: 
    kubectl create deployment nginx-dep --image=nginx --replicas=3 -o yaml --dry-run=client > nginx-dep.yaml

## Deploy
    kubectl apply -f ./nginx-dep.yaml

# Exec into pods (NOTE "/bin/sh" Failed on Thinkpad, just "sh" worked ok)
    kubectl exec -it nginx -- sh
    curl localhost
    curl 10.224.0.136