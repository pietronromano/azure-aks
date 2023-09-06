# 24-08-2023
# SOURCE: 
https://learn.microsoft.com/en-us/azure/aks/learn/quick-kubernetes-deploy-terraform?tabs=azure-cli

# init
terraform init -upgrade

# Run terraform plan to create an execution plan.
terraform plan -out tfplan

# Show output
terraform show -json tfplan > tfplan.json 
!!! jq: error (at <stdin>:1402): Cannot iterate over null (null)
cat tfplan.json | jq '.resources[] | {type: .type, name: .name}'  

 

# Apply
terraform apply main.tfplan

# Verify the results
resource_group_name=$(terraform output -raw resource_group_name)
echo $resource_group_name

# Run az aks list to display the name of the new Kubernetes cluster.
az aks list \
  --resource-group $resource_group_name \
  --query "[].{\"K8s cluster name\":name}" \
  --output table

# Get the Kubernetes configuration from the Terraform state and store it in a file that kubectl can read.
echo "$(terraform output kube_config)" > ./azurek8s

# Verify the previous command didn't add an ASCII EOT character.
## If you see << EOT at the beginning and EOT at the end, remove these characters from the file.
cat ./azurek8s

# Set an environment variable so that kubectl picks up the correct config.
export KUBECONFIG=./azurek8s

# Verify the health of the cluster.
kubectl get nodes


# Run kubectl apply to deploy the application.
kubectl apply -f ./yaml/azure-vote.yaml

# Test the app
kubectl get service azure-vote-front --watch

# Remove resources
## Run terraform plan and specify the destroy flag.
terraform plan -destroy -out main.destroy.tfplan

## Run terraform apply to apply the execution plan.
terraform apply main.destroy.tfplan

# Delete service principal
## Get the service principal ID.
sp=$(terraform output -raw sp)
echo $sp


# DIDN'T WORK: sp not in outpus Run az ad sp delete to delete the service principal.
az ad sp delete --id $sp

# Delete temp files
rm -rf ./.terraform
rm .terraform*
rm *.tfplan
rm *.tfstate*
