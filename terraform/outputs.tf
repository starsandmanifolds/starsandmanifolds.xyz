output "ssh_connect_command" {
  description = "The command to use to connect to the virtual machine over SSH."
  value       = "ssh ${var.username}@${google_compute_instance.instance.network_interface.0.access_config.0.nat_ip}"
}
