# 26-March-2023
# SOURCE: https://learn.microsoft.com/en-us/azure/aks/azure-disk-csi
# CONTINUES FROM aks-stoage.md

# Create a volumesnapshot class with the kubectl apply command:
kubectl apply -f https://raw.githubusercontent.com/kubernetes-sigs/azuredisk-csi-driver/master/deploy/example/snapshot/storageclass-azuredisk-snapshot.yaml
> volumesnapshotclass.snapshot.storage.k8s.io/csi-azuredisk-vsc created

## Now let's create a volume snapshot from the PVC that we dynamically created at the beginning of this tutorial, pvc-azuredisk.
kubectl apply -f https://raw.githubusercontent.com/kubernetes-sigs/azuredisk-csi-driver/master/deploy/example/snapshot/azuredisk-volume-snapshot.yaml
> volumesnapshot.snapshot.storage.k8s.io/azuredisk-volume-snapshot created

# To verify that the snapshot was created correctly, run the following command:
kubectl describe volumesnapshot azuredisk-volume-snapshot


# Create a new PVC based on a volume snapshot
kubectl apply -f https://raw.githubusercontent.com/kubernetes-sigs/azuredisk-csi-driver/master/deploy/example/snapshot/pvc-azuredisk-snapshot-restored.yaml
kubectl apply -f https://raw.githubusercontent.com/kubernetes-sigs/azuredisk-csi-driver/master/deploy/example/snapshot/nginx-pod-restored-snapshot.yaml

>persistentvolumeclaim/pvc-azuredisk-snapshot-restored created
>pod/nginx-restored created

# Finally, let's make sure it's the same PVC created before by checking the contents by running the following command:

kubectl exec nginx-restored -it -- sh
ls /mnt/azuredisk
lost+found
outfile
test.txt


