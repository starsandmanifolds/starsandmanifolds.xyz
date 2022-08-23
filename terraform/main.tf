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
  common_resource_suffix = "${var.project_name}-${lower(var.location)}"
}

resource "azurerm_resource_group" "resource_group" {
  location = var.location
  name     = "rg-${local.common_resource_suffix}"
}

resource "azurerm_virtual_network" "virtual_network" {
  address_space       = ["10.0.0.0/16"]
  location            = azurerm_resource_group.resource_group.location
  name                = "vnet-${local.common_resource_suffix}"
  resource_group_name = azurerm_resource_group.resource_group.name
}

resource "azurerm_subnet" "subnet" {
  address_prefixes     = ["10.0.0.0/24"]
  name                 = "snet-${local.common_resource_suffix}"
  resource_group_name  = azurerm_resource_group.resource_group.name
  virtual_network_name = azurerm_virtual_network.virtual_network.name
}

resource "azurerm_network_interface" "network_interface" {
  ip_configuration {
    private_ip_address_allocation = "Dynamic"
    name                          = "ipc-${local.common_resource_suffix}"
    subnet_id                     = azurerm_subnet.subnet.id
  }
  location            = var.location
  name                = "nic-${local.common_resource_suffix}"
  resource_group_name = azurerm_resource_group.resource_group.name
}

data "azurerm_platform_image" "platform_image" {
  location  = var.location
  offer     = "0001-com-ubuntu-minimal-jammy"
  publisher = "Canonical"
  sku       = "minimal-22_04-lts-gen2"
}

resource "azurerm_linux_virtual_machine" "linux_virtual_machine" {
  admin_username        = var.username
  location              = azurerm_resource_group.resource_group.location
  name                  = "vm-${local.common_resource_suffix}"
  network_interface_ids = [azurerm_network_interface.network_interface.id]
  os_disk {
    caching              = "None"
    name                 = "osdisk-virtual-machine-eastus"
    storage_account_type = "Standard_LRS"
  }
  resource_group_name = azurerm_resource_group.resource_group.name
  size                = "Standard_B1ls"

  admin_ssh_key {
    public_key = var.public_key
    username   = var.username
  }
  allow_extension_operations = false
  source_image_reference {
    offer     = data.azurerm_platform_image.platform_image.offer
    publisher = data.azurerm_platform_image.platform_image.publisher
    sku       = data.azurerm_platform_image.platform_image.sku
    version   = data.azurerm_platform_image.platform_image.version
  }
}
