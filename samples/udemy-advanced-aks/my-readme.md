# DATE: 30-08-2023
# COURE: https://www.udemy.com/course/learn-aks-network-security 
# SOURCE: https://github.com/HoussemDellai/docker-kubernetes-course

# Login
az login --tenant pietronromanolive.onmicrosoft.com

# Get context
rg="aks-rg"
clu="pnraks1"
az aks get-credentials --resource-group $rg --name $clu

# Create a pod yaml with dry-run: 
## NOTE: ImagePull failed with a cluster AZure AD and linked to an ACR
kubectl run nginx --image=ngnix -o yaml --dry-run=client > nginx-pod.yaml

# Create pod yaml with image from linked ACR
kubectl run nodeapp1 --image=pnracr1.azurecr.io/nodeapp1:latest --dry-run=client -o yaml > nodapp1-pod.yaml


## Run the pod
kubectl apply -f ./nginx-pod.yaml
kubectl apply -f ./nodapp1-pod.yaml
kubectl get pods

