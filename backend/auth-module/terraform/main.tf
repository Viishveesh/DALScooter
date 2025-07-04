provider "aws" {
  region = var.aws_region
}

data "aws_caller_identity" "current" {}

# Data source to package the single Custom Auth Lambda
data "archive_file" "question_answer_lambda_zip" {
  type        = "zip"
  source_file = "${path.module}/../lambdas/custom_auth_handler.py"
  output_path = "${path.module}/../lambdas/custom_auth_handler.zip"
}

# Data source to package store_qa_lambda
data "archive_file" "store_qa_lambda_zip" {
  type        = "zip"
  source_file = "${path.module}/../lambdas/store_qa_lambda.py"
  output_path = "${path.module}/../lambdas/store_qa_lambda.zip"
}

# DynamoDB Table for User Details
resource "aws_dynamodb_table" "dalscooter_users" {
  name           = "DALScooterUsers"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "userId"

  attribute {
    name = "userId"
    type = "S"
  }

  tags = {
    Name = "DALScooterUsers"
  }
}

# Cognito User Pool
resource "aws_cognito_user_pool" "dalscooter_user_pool" {
  name = "DALScooterUserPool"
  username_attributes = ["email"]
  auto_verified_attributes = ["email"]

  password_policy {
    minimum_length    = 8
    require_lowercase = true
    require_numbers   = true
    require_symbols   = true
    require_uppercase = true
  }

  schema {
    name                = "email"
    attribute_data_type = "String"
    required            = true
  }

  lambda_config {
    define_auth_challenge         = aws_lambda_function.custom_auth_lambda.arn
    create_auth_challenge         = aws_lambda_function.custom_auth_lambda.arn
    verify_auth_challenge_response = aws_lambda_function.custom_auth_lambda.arn
  }

  tags = {
    Name = "DALScooterUserPool"
  }
}

# Cognito User Pool Client
resource "aws_cognito_user_pool_client" "dalscooter_client" {
  name         = "DALScooterClient"
  user_pool_id = aws_cognito_user_pool.dalscooter_user_pool.id

  # --- THIS IS THE CRITICAL FIX ---
  # By removing "ALLOW_USER_PASSWORD_AUTH", we force Cognito to use our custom flow.
  explicit_auth_flows = [
    "ALLOW_CUSTOM_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH"
  ]

  generate_secret = false
}

resource "aws_cognito_user_group" "registered_customers" {
  user_pool_id = aws_cognito_user_pool.dalscooter_user_pool.id
  name         = "RegisteredCustomers"
  description  = "Group for registered customers"
  precedence   = 1
}

resource "aws_cognito_user_group" "bike_franchise" {
  user_pool_id = aws_cognito_user_pool.dalscooter_user_pool.id
  name         = "BikeFranchise"
  description  = "Group for franchise operators (admin users)"
  precedence   = 2
}

# The single, consolidated Custom Auth Lambda
resource "aws_lambda_function" "custom_auth_lambda" {
  filename      = data.archive_file.question_answer_lambda_zip.output_path
  function_name = "DALScooterCustomAuthLambda"
  role          = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/LabRole"
  handler       = "custom_auth_handler.lambda_handler"
  runtime       = "python3.9"
  timeout       = 30

  environment {
    variables = {
      DYNAMODB_TABLE = aws_dynamodb_table.dalscooter_users.name
    }
  }

  depends_on = [data.archive_file.question_answer_lambda_zip]
}

# Permission for Cognito to invoke our single custom auth lambda
resource "aws_lambda_permission" "allow_cognito_custom_auth" {
  statement_id  = "AllowExecutionFromCognitoCustomAuth"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.custom_auth_lambda.function_name
  principal     = "cognito-idp.amazonaws.com"
  source_arn    = aws_cognito_user_pool.dalscooter_user_pool.arn
}

# HTTP API Gateway for Lambda Integration
resource "aws_apigatewayv2_api" "dalscooter_http_api" {
  name          = "DALScooterHTTPAPI"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = ["*"]
    allow_methods = ["POST", "OPTIONS", "GET"]
    allow_headers = ["*"]
    expose_headers = ["*"]
    max_age        = 3600
  }
}

resource "aws_apigatewayv2_stage" "default_stage" {
  api_id      = aws_apigatewayv2_api.dalscooter_http_api.id
  name        = "$default"
  auto_deploy = true
}

resource "aws_lambda_function" "store_qa_lambda" {
  function_name = "DALScooterStoreQALambda"
  filename      = data.archive_file.store_qa_lambda_zip.output_path
  handler       = "store_qa_lambda.handler"
  runtime       = "python3.9"
  role          = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/LabRole"

  environment {
    variables = {
      DYNAMODB_TABLE = aws_dynamodb_table.dalscooter_users.name
    }
  }

  depends_on = [data.archive_file.store_qa_lambda_zip]
}

resource "aws_apigatewayv2_integration" "store_qa_integration" {
  api_id             = aws_apigatewayv2_api.dalscooter_http_api.id
  integration_type   = "AWS_PROXY"
  integration_uri    = aws_lambda_function.store_qa_lambda.invoke_arn
  integration_method = "POST"
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "store_qa_route" {
  api_id    = aws_apigatewayv2_api.dalscooter_http_api.id
  route_key = "POST /store-qa"
  target    = "integrations/${aws_apigatewayv2_integration.store_qa_integration.id}"
}

resource "aws_lambda_permission" "store_qa_api_permission" {
  statement_id  = "AllowInvokeStoreQALambda"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.store_qa_lambda.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.dalscooter_http_api.execution_arn}/*/*"
}