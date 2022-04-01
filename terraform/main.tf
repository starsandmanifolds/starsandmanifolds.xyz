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

resource "random_pet" "firewall_name" {}
resource "google_compute_firewall" "firewall" {
  allow {
    protocol = "icmp"
  }

  allow {
    ports    = ["22", "80", "443"]
    protocol = "tcp"
  }

  name          = random_pet.firewall_name.id
  network       = data.google_compute_network.network.name
  source_ranges = ["0.0.0.0/0"]

  # This needs reference `random_pet.instance_name.id` instead of
  # `google_compute_instance.instance.id` because otherwise it would be
  # circular dependency.
  target_tags = [random_pet.instance_name.id]
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
  name         = random_pet.instance_name.id

  network_interface {
    access_config {}
    network = data.google_compute_network.network.name
  }

  metadata = {
    ssh-keys = var.ssh_keys
  }

  tags = google_compute_firewall.firewall.target_tags[*]
}

data "http" "google_domains_dynamic_dns" {
  url = "https://${var.dns_credentials}@domains.google.com/nic/update?hostname=${var.domain}&myip=${google_compute_instance.instance.network_interface.0.access_config.0.nat_ip}"
}
