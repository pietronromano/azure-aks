# DATE: 30-08-2023
# COURSE: 
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

## Scale
    kubectl scale --replicas=5 deployment/nginx-dep

# Exec into pods (NOTE "/bin/sh" Failed on Thinkpad & Galaxy, just "sh" worked ok)
    kubectl exec -it nginx -- sh
    curl localhost
    curl 10.224.0.136

# Services
## Create a ClusterIP service
    kubectl expose deployment nginx-dep --name=nginx-svc --port=80 -o yaml --dry-run=client > nginx-svc.yaml
    kubectl apply -f ./nginx-svc.yaml
    kubectl get svc
    kubectl describe svc nginx-svc

## Exec into a pod
   kubectl exec -it nginx -- sh
   curl http://nginx-svc

## Edit svc, Change to ClusterIP -> LoadBalancer
    kubectl edit svc nginx-svc
    kubectl describe svc nginx-svc
    curl http://20.82.35.39