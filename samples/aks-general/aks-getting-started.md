

# VS Code Add-ins
    Kubernetes
    Azure Kubernetes Service
    Azure Terraform

## Run selected text in file in the terminal
- CTRL+SHIFT+P -> Preferences: Open Keyboard Shortcuts -> Terminal -> Run Selected Text in Active Terminal
- My Choice: CTRL+E

# Install Azure Cli
https://learn.microsoft.com/en-us/cli/azure/install-azure-cli

# Login
    az version
    az upgrade
    az login --tenant pietronromanolive.onmicrosoft.com
    az account set --subscription "26b58bc5-ccfe-48a9-b00e-51d89e19a4db"

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

# Main Variables
    rg="aks-rg"
    clu="pnraks1"
    loc="westeurope"

# Create RG and Cluster
    az group create -n $rg --location $loc
    az aks create -g $rg -n $clu --enable-managed-identity --node-count 1 --enable-addons monitoring --generate-ssh-keys
    az aks show -g $rg -n $clu > $clu".json"

# Get context
    az aks get-credentials --resource-group $rg --name $clu

# Configure Autoscaling
    az aks update -g $rg -n $clu --enable-cluster-autoscaler --min-count 1 --max-count 3

# Stop the cluster
    az aks stop -g $rg  -n $clu

# Delete the cluster
    az aks delete -g $rg  -n $clu