provider "aws" {
  region = var.aws_region
}

# provider "google" {
#   credentials = file(var.gcp_credentials_file)
#   project     = var.gcp_project_id
#   region      = var.gcp_region
# }

# Auth Module
module "auth_module" {
  source     = "../auth-module/terraform"
  aws_region = var.aws_region
}

# # Virtual Assistant Module (Placeholder for GCP Dialogflow)
# module "virtual_assistant" {
#   source            = "../backend/virtual-assistant/terraform"
#   gcp_project_id    = var.gcp_project_id
#   gcp_region        = var.gcp_region
#   gcp_credentials_file = var.gcp_credentials_file
# }

# # Notification Module (Placeholder for AWS SNS/SQS)
# module "notification" {
#   source     = "../backend/notification/terraform"
#   aws_region = var.aws_region
# }