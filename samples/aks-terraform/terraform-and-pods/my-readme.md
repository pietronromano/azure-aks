# DATE: 30-08-2023
# COURSE: 
- https://www.udemy.com/course/learn-aks-network-security 
# SOURCE: 
- https://github.com/HoussemDellai/docker-kubernetes-course
- 08_aks_terraform

# Login
    az login --tenant pietronromanolive.onmicrosoft.com
     
# Follow:
    commands.sh to generate cluster
    samples/aks-general/aks-pod-dep-svc.md to run pods


# CLI
    rg="aks-rg"
    loc="westeurope"
    clu="pnraks"
    acr="pnracr"

    az aks show -g $rg -n $clu

    az provider register --namespace Microsoft.KubernetesConfiguration
    az provider show  -n Microsoft.KubernetesConfiguration