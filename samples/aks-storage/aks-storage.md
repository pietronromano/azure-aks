# 26-March-2023
# SOURCE: https://learn.microsoft.com/en-us/azure/aks/azure-disk-csi

# login
az login
az aks get-credentials --resource-group iot-rg --name pnraks1

# Get the available storage clases
kubectl get sc
kubectl get sc managed-csi
>NAME          PROVISIONER          RECLAIMPOLICY   VOLUMEBINDINGMODE   ALLOWVOLUMEEXPANSION   AGE
>managed-csi   disk.csi.azure.com   Delete          WaitForFirstConsumer   true                12d
# Show full yaml details
kubectl get sc managed-csi -o yaml
allowVolumeExpansion: true
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  creationTimestamp: "2023-03-13T21:39:53Z"
  labels:
    addonmanager.kubernetes.io/mode: EnsureExists
    kubernetes.io/cluster-service: "true"
  name: managed-csi
  resourceVersion: "362"
  uid: 9c5ba5cb-b50c-42cf-85ff-5f4a9381dd8f
parameters:
  skuname: StandardSSD_LRS
provisioner: disk.csi.azure.com
reclaimPolicy: Delete
volumeBindingMode: WaitForFirstConsumer


# Dynamically create Azure Disks PVs by using the built-in storage classes
kubectl apply -f https://raw.githubusercontent.com/kubernetes-sigs/azuredisk-csi-driver/master/deploy/example/pvc-azuredisk-csi.yaml

## NOTE: Can see in Azure Portal: Kubernetes Resources -> Storage -> Persistent Volume Claims
## pvc-azuredisk status in "pending" state until used 
kubectl get pvc

# Sample pod
kubectl apply -f https://raw.githubusercontent.com/kubernetes-sigs/azuredisk-csi-driver/master/deploy/example/nginx-pod-azuredisk.yaml

# pvc now shows as bound
kubectl get pvc
NAME            STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS   AGE
pvc-azuredisk   Bound    pvc-2f1a5e8c-7fcb-4242-ad44-768a05b7317c   10Gi       RWO            managed-csi    19m

# After the pod is in the running state, run the following command to create a new file called test.txt.
kubectl exec -it nginx-azuredisk -- sh
/$ touch /mnt/azuredisk/test.txt

# How much disk free for the azure mount?
/$ df -h | grep azure
/dev/sdc                  9.7G    116.0K      9.7G   0% /mnt/azuredisk

# Resize
## Create a large file - approx 1 GB, 1M blocks
dd if=/dev/urandom of=largefile1 bs=1M count=1000

# Expand the PVC by increasing the spec.resources.requests.storage field running the following command:
kubectl patch pvc pvc-azuredisk --type merge --patch '{"spec": {"resources": {"requests": {"storage": "15Gi"}}}}'