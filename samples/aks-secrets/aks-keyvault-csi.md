# 28-08-2023
# SOURCE:
https://azure.github.io/secrets-store-csi-driver-provider-azure/docs/demos/standard-walkthrough/


# Standard Walkthrough
You will need Azure CLI installed and a Kubernetes cluster.

# Run the following commands to set Azure-related environment variables and login to Azure via az login:
export SUBSCRIPTION_ID="26b58bc5-ccfe-48a9-b00e-51d89e19a4db"
export TENANT_ID="599fd2f6-80be-4f0d-9b03-b3e74fdcf211"

# login as a user and set the appropriate subscription ID
az login --tenant pietronromanolive.onmicrosoft.com
az account set -s "${SUBSCRIPTION_ID}"

export KEYVAULT_RESOURCE_GROUP="rg-management"
export KEYVAULT_LOCATION="westeurope"
export KEYVAULT_NAME="pnrkv1"

## MINE: Check env variables
printenv | grep SERVICE_

# Install / Login to Kubernetes [MY ADDITION]
az aks install-cli
kubectl version
rg="aks-rg"
clu="pnraks1"
az aks get-credentials --resource-group $rg --name $clu

# 1. Deploy Azure Key Vault Provider for Secrets Store CSI Driver
## Deploy the Azure Key Vault Provider and Secrets Store CSI Driver components:

helm repo add csi-secrets-store-provider-azure https://azure.github.io/secrets-store-csi-driver-provider-azure/charts
helm install csi csi-secrets-store-provider-azure/csi-secrets-store-provider-azure


# 2. Create Keyvault and set secrets
## Create an Azure Keyvault instance:

  az group create -n ${KEYVAULT_RESOURCE_GROUP} --location ${KEYVAULT_LOCATION}
  az keyvault create -n ${KEYVAULT_NAME} -g ${KEYVAULT_RESOURCE_GROUP} --location ${KEYVAULT_LOCATION}

## Add a secret to your Keyvault:
az keyvault secret set --vault-name ${KEYVAULT_NAME} --name secret1 --value "Hello\!"

# 3. Create an identity on Azure and set access policies

# Create a service principal to access keyvault
az ad sp create-for-rbac --name http://secrets-store-test
export SERVICE_PRINCIPAL_CLIENT_SECRET="smQ8Q~WdEPd~0KK6FDVqdw4mqeVSWD3VCJTsldf9"

export SERVICE_PRINCIPAL_CLIENT_ID="0f6493cd-c1e2-43af-a92e-1485491cb4a0"

## Set the access policy for keyvault objects:
az keyvault set-policy -n ${KEYVAULT_NAME} --secret-permissions get --spn ${SERVICE_PRINCIPAL_CLIENT_ID}

# 4. Create the Kubernetes Secret with credentials
kubectl create secret generic secrets-store-creds --from-literal clientid=${SERVICE_PRINCIPAL_CLIENT_ID} --from-literal clientsecret=${SERVICE_PRINCIPAL_CLIENT_SECRET}

kubectl label secret secrets-store-creds secrets-store.csi.k8s.io/used=true
## NOTE: This step is required only if you’re using service principal to provide access to Keyvault.

# 5. Deploy SecretProviderClass
## Refer to section on the required and configurable parameters in SecretProviderClass object.
## Create SecretProviderClass in your cluster that contains all the required parameters:

## NOTE: I did this with a yaml
kubectl apply -f SecretProviderClass.yaml

## Original instructions:
cat <<EOF | kubectl apply -f -
apiVersion: secrets-store.csi.x-k8s.io/v1
kind: SecretProviderClass
metadata:
  name: azure-kvname
  namespace: default
spec:
  provider: azure
  parameters:
    usePodIdentity: "false"
    useVMManagedIdentity: "false"
    userAssignedIdentityID: ""
    keyvaultName: "${KEYVAULT_NAME}"
    objects: |
      array:
        - |
          objectName: secret1
          objectType: secret
          objectVersion: ""
    tenantID: "${TENANT_ID}"
EOF


# 6. Deployment and Validation
## NOTE: POD DIDN'T GET CREATED!!!, HUNG IN CREATION STAGE
Create the pod with volume referencing the secrets-store.csi.k8s.io driver:
## NOTE: I did this with a yaml
kubectl apply -f PodWithVolume.yaml

## Original instructions:
cat <<EOF | kubectl apply -f -
kind: Pod
apiVersion: v1
metadata:
  name: busybox-secrets-store-inline
spec:
  containers:
  - name: busybox
    image: registry.k8s.io/e2e-test-images/busybox:1.29-4
    command:
      - "/bin/sleep"
      - "10000"
    volumeMounts:
    - name: secrets-store-inline
      mountPath: "/mnt/secrets-store"
      readOnly: true
  volumes:
    - name: secrets-store-inline
      csi:
        driver: secrets-store.csi.k8s.io
        readOnly: true
        volumeAttributes:
          secretProviderClass: "azure-kvname"
        nodePublishSecretRef:                       # Only required when using service principal mode
          name: secrets-store-creds                 # Only required when using service principal mode
EOF

# To validate, once the pod is started, you should see the new mounted content at the volume path specified in your deployment yaml.

## show secrets held in secrets-store
kubectl exec busybox-secrets-store-inline -- ls /mnt/secrets-store/

## print a test secret held in secrets-store
kubectl exec busybox-secrets-store-inline -- cat /mnt/secrets-store/secret1

## If successful, the output will be similar to:
kubectl exec busybox-secrets-store-inline -- ls /mnt/secrets-store/
secret1

kubectl exec busybox-secrets-store-inline -- cat /mnt/secrets-store/secret1
Hello!
