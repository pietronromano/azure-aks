# 24-08-2023
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

## It takes a few minutes for the service to return a public IP address. Monitor progress using the kubectl get service command with the --watch argument.
kubectl get service azure-vote-front --watch

