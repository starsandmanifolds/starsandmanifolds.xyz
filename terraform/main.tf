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

    random = {
      source = "hashicorp/random"
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

resource "google_compute_firewall" "firewall_http" {
  allow {
    ports    = ["80"]
    protocol = "tcp"
  }

  name          = "allow-http"
  network       = data.google_compute_network.network.name
  source_ranges = ["0.0.0.0/0"]
  target_tags   = [google_compute_instance.instance.name]
}

resource "google_compute_firewall" "firewall_https" {
  allow {
    ports    = ["443"]
    protocol = "tcp"
  }

  name          = "allow-https"
  network       = data.google_compute_network.network.name
  source_ranges = ["0.0.0.0/0"]
  target_tags   = [google_compute_instance.instance.name]
}

resource "google_compute_firewall" "firewall_ssh" {
  allow {
    ports    = ["22"]
    protocol = "tcp"
  }

  name          = "allow-ssh"
  network       = data.google_compute_network.network.name
  source_ranges = var.firewall_ssh_source_ranges
  target_tags   = [google_compute_instance.instance.name]
}

resource "random_pet" "instance_name" {}
resource "google_compute_instance" "instance" {
  boot_disk {
    initialize_params {
      image = data.google_compute_image.image.name
    }
  }

  hostname     = var.domain
  machine_type = var.machine_type

  metadata = {
    ssh-keys = var.ssh_keys
  }

  name = random_pet.instance_name.id

  network_interface {
    access_config {}
    network = data.google_compute_network.network.name
  }

  service_account {
    scopes = []
  }
}

data "http" "google_domains_dynamic_dns" {
  url = "https://${var.dns_credentials}@domains.google.com/nic/update?hostname=${var.domain}&myip=${google_compute_instance.instance.network_interface.0.access_config.0.nat_ip}"
}
