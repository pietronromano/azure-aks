
# Example: 
https://learn.microsoft.com/en-us/azure/aks/azure-files-csi#use-a-persistent-volume-with-azure-files

az aks get-credentials --resource-group iot-rg --name pnraks1

kubectl apply -f https://raw.githubusercontent.com/kubernetes-sigs/azurefile-csi-driver/master/deploy/example/pvc-azurefile-csi.yaml
kubectl apply -f https://raw.githubusercontent.com/kubernetes-sigs/azurefile-csi-driver/master/deploy/example/nginx-pod-azurefile.yaml


# Validate
kubectl exec -it nginx-azurefile -- sh
kubectl ls -l /mnt/azurefile
cat /mnt/azurefile/outfile
df -h /mnt/azurefile

# Expand
kubectl patch pvc pvc-azurefile --type merge --patch '{"spec": {"resources": {"requests": {"storage": "200Gi"}}}}'
kubectl get pvc

# pvc-azurefile
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: pvc-azurefile
spec:
  accessModes:
    - ReadWriteMany
  resources:
    requests:
      storage: 100Gi
  storageClassName: azurefile-csi


# nginx
---
kind: Pod
apiVersion: v1
metadata:
  name: nginx-azurefile
spec:
  nodeSelector:
    "kubernetes.io/os": linux
  containers:
    - image: mcr.microsoft.com/oss/nginx/nginx:1.19.5
      name: nginx-azurefile
      command:
        - "/bin/bash"
        - "-c"
        - set -euo pipefail; while true; do echo $(date) >> /mnt/azurefile/outfile; sleep 1; done
      volumeMounts:
        - name: persistent-storage
          mountPath: "/mnt/azurefile"
  volumes:
    - name: persistent-storage
      persistentVolumeClaim:
        claimName: pvc-azurefile