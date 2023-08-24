# 24-08-2023
# SOURCE:
https://helm.sh/docs/intro/quickstart/


# Check Artifact Hub for available Helm chart repositories.

helm repo add bitnami https://charts.bitnami.com/bitnami
## Once this is installed, you will be able to list the charts you can install:
helm search repo nginx

# login to Azure
az login --tenant pietronromanolive.onmicrosoft.com

## Configure kubectl
az aks get-credentials -g cntr-rg -n pnraks1

# nginx: SOURCE
https://artifacthub.io/packages/helm/ingress-nginx/ingress-nginx
## Add repository
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
## Install chart
helm install my-ingress-nginx ingress-nginx/ingress-nginx --version 4.7.1

## See contents of the chart
helm show all ingress-nginx/ingress-nginx

## See status
helm status my-ingress-nginx

## List currently installed charts
helm list

## Uninstall
helm uninstall my-ingress-nginx