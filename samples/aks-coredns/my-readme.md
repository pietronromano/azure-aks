# DATE: 31-08-2023
# COURSE: 
- https://www.udemy.com/course/learn-aks-network-security 
# SOURCE: 
- https://github.com/HoussemDellai/docker-kubernetes-course

# Login
    az login --tenant pietronromanolive.onmicrosoft.com

# Get context
    rg="aks-rg1"
    clu="pnraks1"
    acr="pnracr1"
    az aks get-credentials --resource-group $rg --name $clu --overwrite-existing

# Stop the cluster
az aks stop -g $rg  -n $clu