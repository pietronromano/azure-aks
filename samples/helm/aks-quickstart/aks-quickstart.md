# 24-08-2023
# RESULTS: WORKED OK, BUT HELM FILES SEEM TRICKY!

# SOURCE:
https://learn.microsoft.com/en-us/azure/aks/quickstart-helm?tabs=azure-cli



# login to Azure
az login --tenant pietronromanolive.onmicrosoft.com

# Variables
rg="aks-rg"
loc="westeurope"
clu="pnraks1"
acr="pnracr1"

# Clone app
git clone https://github.com/Azure-Samples/azure-voting-app-redis.git
## Make sure in the right sub
cd azure-voting-app-redis/azure-vote/


# Resource Group
az group create --name $rg --location $loc

## ACR: note after creation: "loginServer": "pnracr1.azurecr.io",
az acr create --resource-group $rg --name $acr --sku Basic

# AKS Cluster - attach-acr
az aks create -n $clu -g $rg --network-plugin kubenet --attach-acr $acr --generate-ssh-keys 

## Configure kubectl
az aks get-credentials -g $rg -n $clu

## run the az acr build command to build and push an image to the registry.
az acr build --image azure-vote-front:v1 --registry $acr --file Dockerfile .
az acr repository list -n $acr

# Create your Helm chart
## Generate your Helm chart: [MY NOTE: Creates a directory with templates]
helm create azure-vote-front

## Update your helm chart dependencies using the helm dependency update command.
helm dependency update azure-vote-front

# Run your Helm chart
## Install your application using your Helm chart using the helm install command.
helm install azure-vote-front azure-vote-front/

### RETURNS:
NAME: azure-vote-front
LAST DEPLOYED: Fri Aug 25 15:25:29 2023
NAMESPACE: default
STATUS: deployed
REVISION: 1
NOTES:
1. Get the application URL by running these commands:
  export POD_NAME=$(kubectl get pods --namespace default -l "app.kubernetes.io/name=azure-vote-front,app.kubernetes.io/instance=azure-vote-front" -o jsonpath="{.items[0].metadata.name}")
  export CONTAINER_PORT=$(kubectl get pod --namespace default $POD_NAME -o jsonpath="{.spec.containers[0].ports[0].containerPort}")
  echo "Visit http://127.0.0.1:8080 to use your application"
  kubectl --namespace default port-forward $POD_NAME 8080:$CONTAINER_PORT


## It takes a few minutes for the service to return a public IP address. Monitor progress using the kubectl get service command with the --watch argument.
kubectl get service azure-vote-front --watch

