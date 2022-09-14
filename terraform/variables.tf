variable "hostname" {
  default     = "starsandmanifolds.xy"
  description = "The hostname used for the DNS A record."
  type        = string
}

variable "google_domains_dynamic_dns_api_username" {
  description = "The username for the Dynamic DNS API on Google Domains."
  sensitive   = true
  type        = string
}

variable "google_domains_dynamic_dns_api_password" {
  description = "The password for the Dynamic DNS API on Google Domains."
  sensitive   = true
  type        = string
}

variable "location" {
  default     = "EastUS"
  description = "The region where the resources exist."
  type        = string
}

variable "project_name" {
  default     = "starsandmanifolds"
  description = "The name of the project."
  type        = string
}

variable "public_key" {
  description = "The public SSH key used to access the virtual machine."
  type        = string
  sensitive   = true
}

variable "username" {
  description = "The username of the user that has credentials to access the virtual machine."
  type        = string
  sensitive   = true
}
