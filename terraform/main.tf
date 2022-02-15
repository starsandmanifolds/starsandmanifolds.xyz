terraform {
  backend "gcs" {
    bucket = "starsandmanifolds.xyz"
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

data "google_compute_network" "network" {
  name = "default"
}

data "google_compute_image" "image" {
  family  = "ubuntu-minimal-2110"
  project = "ubuntu-os-cloud"
}

data "http" "google_domains_dynamic_dns" {
  url = "https://${var.dns_credentials}@domains.google.com/nic/update?hostname=${var.domain}&myip=${google_compute_address.address.address}"
}

resource "random_pet" "instance_name" {}
resource "random_pet" "address_name" {}
resource "random_pet" "firewall_name" {}

resource "google_compute_address" "address" {
  name = random_pet.address_name.id
}

resource "google_compute_firewall" "firewall" {
  name    = random_pet.firewall_name.id
  network = data.google_compute_network.network.name

  allow {
    protocol = "icmp"
  }
  allow {
    ports    = ["22", "80", "443"]
    protocol = "tcp"
  }
  source_ranges = ["0.0.0.0/0"]
  target_tags   = [random_pet.instance_name.id]
}

resource "google_compute_instance" "instance" {
  boot_disk {
    initialize_params {
      image = data.google_compute_image.image.name
    }
  }
  machine_type = "f1-micro"
  name         = random_pet.instance_name.id
  network_interface {
    access_config {
      nat_ip = google_compute_address.address.address
    }
    network = data.google_compute_network.network.name
  }

  hostname = var.domain
  metadata = {
    ssh-keys = var.ssh_keys
  }
  tags = google_compute_firewall.firewall.target_tags[*]
}
