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

resource "azurerm_public_ip" "public_ip" {
  allocation_method   = "Static"
  location            = azurerm_resource_group.resource_group.location
  name                = "pip-${local.common_resource_suffix}"
  resource_group_name = azurerm_resource_group.resource_group.name
}

resource "azurerm_network_interface" "network_interface" {
  ip_configuration {
    name                          = "ipc-${local.common_resource_suffix}"
    private_ip_address_allocation = "Dynamic"

    #checkov:skip=CKV_AZURE_119: A public IP address is needed to SSH into VM.
    public_ip_address_id = azurerm_public_ip.public_ip.id
    subnet_id            = azurerm_subnet.subnet.id
  }
  location            = var.location
  name                = "nic-${local.common_resource_suffix}"
  resource_group_name = azurerm_resource_group.resource_group.name
}

resource "azurerm_network_security_group" "network_security_group" {
  location            = azurerm_resource_group.resource_group.location
  name                = "nsg-${local.common_resource_suffix}"
  resource_group_name = azurerm_resource_group.resource_group.name
}

resource "azurerm_network_security_rule" "network_security_rule" {
  access                      = "Allow"
  destination_address_prefix  = "VirtualNetwork"
  destination_port_range      = "22"
  direction                   = "Inbound"
  name                        = "nsr-${local.common_resource_suffix}"
  network_security_group_name = azurerm_network_security_group.network_security_group.name
  priority                    = "100"
  protocol                    = "Tcp"
  resource_group_name         = azurerm_resource_group.resource_group.name
  source_address_prefix       = "*"
  source_port_range           = "*"
}

resource "azurerm_network_interface_security_group_association" "network_interface_security_group_association" {
  network_interface_id      = azurerm_network_interface.network_interface.id
  network_security_group_id = azurerm_network_security_group.network_security_group.id
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
    caching              = "ReadOnly"
    name                 = "osdisk-${local.common_resource_suffix}"
    storage_account_type = "Standard_LRS"

    diff_disk_settings {
      option = "Local"
    }
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
