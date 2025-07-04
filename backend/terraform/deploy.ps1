# Set credentials
. .\aws-config.ps1

# Run terraform apply
terraform init
terraform plan
terraform apply -auto-approve

Write-Output "Deployment completed."