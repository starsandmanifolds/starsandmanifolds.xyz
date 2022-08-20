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

resource "azurerm_resource_group" "resource_group" {
  location = var.location
  name     = local.resource_group_name
}

resource "azurerm_storage_account" "storage_account" {
  #checkov:skip=CKV_AZURE_33: Storage logging need not be enabled because the Queue service is not used.
  #checkov:skip=CKV_AZURE_43: Ignore because checkov doesn't understand that that the storage account is named properly.
  #checkov:skip=CKV2_AZURE_1: Customer Manager key is not needed for this use case.
  #checkov:skip=CKV2_AZURE_18: Customer Manager key is not needed for this use case.

  account_replication_type         = "LRS"
  account_tier                     = "Standard"
  cross_tenant_replication_enabled = false
  location                         = azurerm_resource_group.resource_group.location
  name                             = local.storage_account_name
  resource_group_name              = azurerm_resource_group.resource_group.name

  min_tls_version = "TLS1_2"
  static_website {
    index_document = "index.html"
  }
}

data "azurerm_storage_container" "storage_container" {
  name                 = "$web"
  storage_account_name = azurerm_storage_account.storage_account.name
}

resource "azurerm_storage_blob" "storage_blob" {
  name                   = "index.html"
  storage_account_name   = azurerm_storage_account.storage_account.name
  storage_container_name = data.azurerm_storage_container.storage_container.name
  type                   = "Block"

  content_type = "text/html"
  source       = "../starsandmanifolds.xyz/index.html"
}
