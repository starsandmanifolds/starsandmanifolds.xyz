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
}

locals {
  resource_group_name  = "rg-${var.project_name}-${lower(var.location)}"
  storage_account_name = "st${var.project_name}${lower(join("", regexall("[A-Z]", var.location)))}"
}

resource "azurerm_resource_group" "resource_group" {
  location = var.location
  name     = local.resource_group_name
}

resource "azurerm_storage_account" "storage_account" {
  #checkov:skip=CKV_AZURE_33: Storage logging need not be enabled because the Queue service is not used.
  #checkov:skip=CKV2_AZURE_1: Customer Manager key is not needed for this use case.
  #checkov:skip=CKV2_AZURE_18: Customer Manager key is not needed for this use case.

  account_replication_type = "LRS"
  account_tier             = "Standard"
  location                 = azurerm_resource_group.resource_group.location
  name                     = local.storage_account_name
  resource_group_name      = azurerm_resource_group.resource_group.name

  min_tls_version = "TLS1_2"
  network_rules {
    bypass         = ["AzureServices"]
    default_action = "Deny"
  }
}
