terraform {
  cloud {
    organization = "starsandmanifolds"

    workspaces {
      name = "starsandmanifolds-xyz"
    }
  }

  required_providers {
    azurerm = {
      source = "hashicorp/azurerm"
    }
  }
}

provider "azurerm" {
  features {}

  use_oidc = true
}

locals {
  resource_group_name  = "rg-${var.project_name}-${lower(var.location)}"
  storage_account_name = "st${var.project_name}${lower(join("", regexall("[A-Z]", var.location)))}"
}

output "storage_account_name" {
  value = local.storage_account_name
}

resource "azurerm_resource_group" "resource_group" {
  location = var.location
  name     = local.resource_group_name
}

resource "azurerm_storage_account" "storage_account" {
  account_replication_type = "LRS"
  account_tier             = "Standard"
  location                 = azurerm_resource_group.resource_group.location
  name                     = local.storage_account_name
  resource_group_name      = azurerm_resource_group.resource_group.name
}
