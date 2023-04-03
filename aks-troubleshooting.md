# SOURCE:
https://learn.microsoft.com/en-us/azure/aks/node-access

# Access Nodes
## Get all nodes
k get nodes -o wide

## Debug
kubectl debug node/<my node pool> -it --image=mcr.microsoft.com/dotnet/runtime-deps:6.0
kubectl debug node/aks-agentpool-31569319-vmss00000b -it --image=mcr.microsoft.com/dotnet/runtime-deps:6.0

### You can interact with the node session by running chroot /host from the privileged container.
chroot /host

## Kubelet (note that we need to have done chroot /host before)
### Get kubelet logs
journalctl -u kubelet -o cat

### Linux Service status
systemctl status kubelet
systemctl status containerd

## Container Runtime Interface (CRI) Plugin
crictl images
crictl ps
crictl logs c9f876fb22616
