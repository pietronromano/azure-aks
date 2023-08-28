# 28-08-2023

# SOURCE:
https://learn.microsoft.com/en-us/azure/aks/workload-identity-deploy-cluster


# Export environmental variables
export CLUSTER="pnraks1"
export RESOURCE_GROUP="aks-rg"
export LOCATION="westeurope"
export SERVICE_ACCOUNT_NAMESPACE="default"
export SERVICE_ACCOUNT_NAME="workload-identity-sa"
export SUBSCRIPTION="$(az account show --query id --output tsv)"
export USER_ASSIGNED_IDENTITY_NAME="myIdentity"
export FEDERATED_IDENTITY_CREDENTIAL_NAME="myFedIdentity"

# Login
az login --tenant pietronromanolive.onmicrosoft.com

# Resource Group
az group create -l "${LOCATION}" -n "${RESOURCE_GROUP}"

# Create an AKS cluster using the az aks create command with the --enable-oidc-issuer parameter to use the OIDC Issuer.
az aks create -g "${RESOURCE_GROUP}" -n "${CLUSTER}" --enable-oidc-issuer --enable-workload-identity --generate-ssh-keys

## Get the OIDC Issuer URL and save it to an environmental variable
export AKS_OIDC_ISSUER="$(az aks show -n "${CLUSTER}" -g "${RESOURCE_GROUP}" --query "oidcIssuerProfile.issuerUrl" -otsv)"

# Create a managed identity
az identity create --name "${USER_ASSIGNED_IDENTITY_NAME}" --resource-group "${RESOURCE_GROUP}" --location "${LOCATION}" --subscription "${SUBSCRIPTION}"

# Create a variable for the managed identity ID.
export USER_ASSIGNED_CLIENT_ID="$(az identity show --resource-group "${RESOURCE_GROUP}" --name "${USER_ASSIGNED_IDENTITY_NAME}" --query 'clientId' -otsv)"

# Create Kubernetes service account
az aks get-credentials -n "${CLUSTER}" -g "${RESOURCE_GROUP}"

# DIDN'T WORK: DIDN'T FIND ENV VARS Apply ServiceAccount.yaml
kubectl apply -f ServiceAccount.yaml

## Multi-line command
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: ServiceAccount
metadata:
  annotations:
    azure.workload.identity/client-id: "${USER_ASSIGNED_CLIENT_ID}"
  name: "${SERVICE_ACCOUNT_NAME}"
  namespace: "${SERVICE_ACCOUNT_NAMESPACE}"
EOF

# Establish federated identity credential
az identity federated-credential create --name ${FEDERATED_IDENTITY_CREDENTIAL_NAME} --identity-name "${USER_ASSIGNED_IDENTITY_NAME}" --resource-group "${RESOURCE_GROUP}" --issuer "${AKS_OIDC_ISSUER}" --subject system:serviceaccount:"${SERVICE_ACCOUNT_NAMESPACE}":"${SERVICE_ACCOUNT_NAME}" --audience api://AzureADTokenExchange

# Deploy App (MINE: Added the Load Balancer so I could test)
## WORKED FINE!
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: nodeapp1-pod
  namespace: "${SERVICE_ACCOUNT_NAMESPACE}"
  labels:
    app: nodeapp1
    rel: latest
    azure.workload.identity/use: "true"
spec:
  serviceAccountName: "${SERVICE_ACCOUNT_NAME}"
  containers:
  - name: nodeapp1
    image: pietronromano/nodeapp1:latest
    ports: 
    - containerPort: 8080
    resources: {}
---
apiVersion: v1
kind: Service
metadata:
 name: nodeapp1-lb
spec:
 type: LoadBalancer
 selector:
    app: nodeapp1
 ports:
 - port: 81
   targetPort: 8080
EOF

# Create & Access a Key Vault
export KEYVAULT_NAME="pnrkv1"
export USER_ASSIGNED_CLIENT_ID="$(az identity show --resource-group "${RESOURCE_GROUP}" --name "${USER_ASSIGNED_IDENTITY_NAME}" --query 'clientId' -otsv)"

## Create key Vault in Management Group
az keyvault create --name "${KEYVAULT_NAME}" --resource-group "rg-management" --location "${LOCATION}"
# Set a get Policy
az keyvault set-policy --name "${KEYVAULT_NAME}" --secret-permissions get --spn "${USER_ASSIGNED_CLIENT_ID}"