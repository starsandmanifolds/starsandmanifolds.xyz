variable "dns_credentials" {
  description = "The dynamic DNS credentials associated with the domain on domains.google used for updating the domain's A/AAAA record using the Dynamic DNS API."
  sensitive   = true
  type        = string
}

variable "domain" {
  default     = "starsandmanifolds.xyz"
  description = "The default domain that this repository is hosting."
  type        = string
}

variable "project" {
  default     = "starsandmanifolds"
  description = "The default project to manage resources in."
  type        = string
}

variable "region" {
  default     = "us-east1"
  description = "The default region to manage resources in."
  type        = string
}

variable "ssh_keys" {
  description = "The ssh-keys metadata value used for providing SSH access to virtual machines."
  sensitive   = true
  type        = string
}

variable "zone" {
  default     = "us-east1-b"
  description = "The default zone to manage resources in."
  type        = string
}