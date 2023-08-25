

# VS Code Add-ins
Kubernetes
Azure Kubernetes Service
## Run selected text in file in the terminal
CTRL+SHIFT+P -> Preferences: Open Keyboard Shortcuts -> Terminal -> Run Selected Text in Active Terminal
# MY CHOICE
CTRL+E

# Install Azure Cli
https://learn.microsoft.com/en-us/cli/azure/install-azure-cli

# Login
az version
az login
az account set --subscription 3ea0a827-ae7e-48da-a47c-a033b20041a1

# Install kubectl locally using the az aks install-cli command:
az aks install-cli
kubectl version

# Search for any extension with -e (pattern)=aks, -i (ignore case)
az extension list-available --output table | grep -i -e aks -e installed
az extension add --name aks-preview

# Check if Vertical Pod Autoscaler is registered
az feature show --namespace "Microsoft.ContainerService" --name "AKS-VPAPreview"
az feature register --namespace "Microsoft.ContainerService" --name "AKS-VPAPreview"
az provider register --namespace "Microsoft.ContainerService" 

# Get context
rg="aks-rg"
clu="pnraks1"
az aks get-credentials --resource-group $rg --name $clu