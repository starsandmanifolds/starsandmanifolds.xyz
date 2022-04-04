terraform {
  cloud {
    organization = "starsandmanifolds"

    workspaces {
      name = "starsandmanifolds-xyz"
    }
  }

  required_providers {
    google = {
      source = "hashicorp/google"
    }

    http = {
      source = "hashicorp/http"
    }
  }
}

provider "google" {
  project = var.project
  region  = var.region
  zone    = var.zone
}

data "google_compute_image" "image" {
  family  = var.google_compute_image.family
  project = var.google_compute_image.project
}

data "google_compute_network" "network" {
  name = "default"
}

#tfsec:ignore:google-compute-no-public-ingress
resource "google_compute_firewall" "firewalls" {
  for_each = {
    allow-http = {
      port          = "80"
      source_ranges = ["0.0.0.0/0"]
    }

    allow-https = {
      port          = "443"
      source_ranges = ["0.0.0.0/0"]
    }

    allow-ssh = {
      port          = "22"
      source_ranges = var.firewall_ssh_source_ranges
    }
  }

  allow {
    ports    = [each.value.port]
    protocol = "tcp"
  }

  name          = each.key
  network       = data.google_compute_network.network.name
  source_ranges = each.value.source_ranges
}

#tfsec:ignore:google-compute-no-default-service-account
resource "google_compute_instance" "instance" {
  #checkov:skip=CKV_GCP_30:Default service account is not actually used.

  allow_stopping_for_update = true

  #checkov:skip=CKV_GCP_38:Boot disk on this instance contains no sensitive data.
  #tfsec:ignore:google-compute-vm-disk-encryption-customer-key
  boot_disk {
    initialize_params {
      image = data.google_compute_image.image.name
    }
  }

  hostname     = var.domain
  machine_type = var.machine_type

  metadata = {
    block-project-ssh-keys = true
    ssh-keys               = var.ssh_keys
  }

  name = "starsandmanifolds-xyz"

  network_interface {
    #checkov:skip=CKV_GCP_40:Public IP address needed for SSH access.
    #tfsec:ignore:google-compute-no-public-ip
    access_config {}
    network = data.google_compute_network.network.name
  }

  shielded_instance_config {
    enable_secure_boot = true
  }
}

data "http" "google_domains_dynamic_dns" {
  url = "https://${var.dns_credentials}@domains.google.com/nic/update?hostname=${var.domain}&myip=${google_compute_instance.instance.network_interface.0.access_config.0.nat_ip}"
}
