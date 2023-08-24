# 24-08-2023
# SOURCE: https://learn.microsoft.com/en-us/azure/application-gateway/tutorial-ingress-controller-add-on-existing

# WORKED FINE!


# Variables
rg="aks-ingress-rg"
loc="westeurope"
clu="pnraksing"
appgw="app-gateway-aks-ingress"
vnet="vnet-app-gateway"
pip="ingress-pip"

# Resource Group
az group create --name $rg --location $loc

# AKS Cluster - with Kubenet (example uses CNI)
az aks create -n $clu -g $rg --network-plugin kubenet --enable-managed-identity --generate-ssh-keys

# App Gateway
az network public-ip create -n $pip -g $rg --allocation-method Static --sku Standard
az network vnet create -n $vnet -g $rg --address-prefix 10.0.0.0/16 --subnet-name mySubnet --subnet-prefix 10.0.0.0/24 
az network application-gateway create -n $appgw -l $loc -g $rg --sku Standard_v2 --public-ip-address $pip --vnet-name $vnet --subnet mySubnet --priority 100

# Enable the AGIC add-on in existing AKS cluster through Azure CLI
appgwId=$(az network application-gateway show -n $appgw -g $rg -o tsv --query "id") 
az aks enable-addons -n $clu -g $rg -a ingress-appgw --appgw-id $appgwId

# Peer the two virtual networks together
nodeResourceGroup=$(az aks show -n $clu -g $rg -o tsv --query "nodeResourceGroup")
aksVnetName=$(az network vnet list -g $nodeResourceGroup -o tsv --query "[0].name")

aksVnetId=$(az network vnet show -n $aksVnetName -g $nodeResourceGroup -o tsv --query "id")
az network vnet peering create -n AppGWtoAKSVnetPeering -g $rg --vnet-name $vnet --remote-vnet $aksVnetId --allow-vnet-access

appGWVnetId=$(az network vnet show -n $vnet -g $rg -o tsv --query "id")
az network vnet peering create -n AKStoAppGWVnetPeering -g $nodeResourceGroup --vnet-name $aksVnetName --remote-vnet $appGWVnetId --allow-vnet-access

# Route Table: in portal [THIS WAS ALREADY DONE WHEN I CHECKED]
## using Kubenet mode you need to update the route table to help the packets destined for a POD IP reach the node which is hosting the pod. A simple way to achieve this is by associating the same route table created by AKS to the Application Gateway's subnet.

# Deploy a sample application using AGIC
az aks get-credentials -n $clu -g $rg
kubectl apply -f https://raw.githubusercontent.com/Azure/application-gateway-kubernetes-ingress/master/docs/examples/aspnetapp.yaml

# Check that the application is reachable
kubectl get ingress
curl <public-ip>