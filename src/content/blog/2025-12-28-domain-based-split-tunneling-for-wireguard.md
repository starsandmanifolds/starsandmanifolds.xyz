---
title: "Domain-Based Split Tunneling for WireGuard"
excerpt: "Most WireGuard split tunneling guides hardcode IP ranges. But CDNs rotate IPs constantly, making this approach brittle. What if you could route by domain instead? Route traffic to specific domains through WireGuard while everything else uses your regular connection. This guide covers the full stack: intercepting DNS with dnsmasq, dynamically populating nftables sets, policy routing with fwmarks, and connection tracking to keep long-lived connections working."
tags: ["dnsmasq", "nftables", "policy-routing", "split-tunneling", "vpn", "wireguard"]
state: published
---

Table of Contents

1. #1-overview
2. #2-architecture
3. #3-prerequisites
4. #4-configuration-files
5. #5-how-it-works
6. #6-data-flow
7. #7-managing-domains
8. #8-key-technical-discoveries
9. #9-troubleshooting
10. #10-maintenance
11. #11-limitations-and-caveats
12. #12-security-considerations
13. #13-alternative-approaches
14. #14-quick-reference

---
1. Overview

1.1 The Problem

You have a WireGuard VPN and want to route only traffic to specific domains through it, while all other traffic uses your regular internet connection. This is called split tunneling.

The challenge is that:

1. VPNs route by IP address, not domain names
2. Domain IPs are dynamic — CDNs like Cloudflare return different IPs based on load, geography, and time
3. The routing decision must happen at DNS resolution time — when any application looks up a domain, the resulting IP must automatically be routed through the VPN

1.2 The Solution

Intercept DNS queries, extract the resolved IP addresses for configured domains, and dynamically add them to a routing policy that sends matching traffic through WireGuard.

1.3 Components Used

| Component      | Role                                                           |
|----------------|----------------------------------------------------------------|
| dnsmasq        | DNS server that intercepts queries and populates nftables sets |
| nftables       | Kernel packet filter that marks packets destined for VPN IPs   |
| Policy Routing | Linux routing rules that send marked packets to WireGuard      |
| WireGuard      | VPN tunnel that encrypts and transmits the traffic             |
| systemd        | Service management and startup ordering                        |

---
2. Architecture

┌─────────────────────────────────────────────────────────────────────────────┐
│                              APPLICATION                                     │
│                         (browser, curl, etc.)                               │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ 1. DNS Query: "ipv4.icanhazip.com"
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                               DNSMASQ                                        │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ • Receives DNS query                                                   │ │
│  │ • Forwards to upstream DNS (1.1.1.1, 8.8.8.8)                         │ │
│  │ • Gets response: 104.16.184.241, 104.16.185.241                       │ │
│  │ • ADDS IPs to nftables set via netlink (if domain is configured)     │ │
│  │ • Returns response to application                                     │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  Config: nftset=/ipv4.icanhazip.com/4#inet#wg_routing#wg_domains4,...       │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ 2. Adds IP to nftables set
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           NFTABLES (kernel)                                  │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ table inet wg_routing {                                                │ │
│  │     set wg_domains4 { type ipv4_addr; timeout 5m; ... }               │ │
│  │     set wg_domains6 { type ipv6_addr; timeout 5m; ... }               │ │
│  │                                                                        │ │
│  │     chain output (type route, hook output, priority mangle) {         │ │
│  │         ct state new ip daddr @wg_domains4 ct mark set 0x1            │ │
│  │         ct state new ip6 daddr @wg_domains6 ct mark set 0x1           │ │
│  │         ct mark 0x1 meta mark set ct mark                              │ │
│  │     }                                                                  │ │
│  │                                                                        │ │
│  │     chain postrouting (type nat, hook postrouting, priority srcnat) { │ │
│  │         oifname "b1" masquerade                                       │ │
│  │     }                                                                  │ │
│  │ }                                                                      │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ 3. Packet to 104.16.184.241 gets mark 0x1
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          POLICY ROUTING (kernel)                             │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ Rule: fwmark 0x1 → lookup table 100                                   │ │
│  │ Table 100: default dev b1 (WireGuard interface)                       │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ 4. Marked packets → WireGuard
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            WIREGUARD (b1)                                    │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ • Encrypts packet                                                      │ │
│  │ • Encapsulates in UDP                                                  │ │
│  │ • Sends to VPN endpoint: 73.218.227.44:51820                          │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘

---
3. Prerequisites

3.1 Required Packages

sudo apt install dnsmasq wireguard nftables

3.2 Version Requirements

| Package      | Minimum Version                | Check Command     |
|--------------|--------------------------------|-------------------|
| dnsmasq      | 2.87 (nftset support)          | dnsmasq --version |
| nftables     | 1.0.0 (timeout+interval flags) | nft --version     |
| Linux kernel | 5.6+ (WireGuard built-in)      | uname -r          |

3.3 Verify dnsmasq Has nftset Support

dnsmasq --version | grep -o nftset
# Should output: nftset

If it shows no-nftset, you need to install dnsmasq-full or recompile with HAVE_NFTSET.

---
4. Configuration Files

4.1 File Overview

| File                                                         | Purpose                                           |
|--------------------------------------------------------------|---------------------------------------------------|
| /etc/dnsmasq.d/wireguard.conf                                | dnsmasq configuration with domain list            |
| /etc/systemd/system/dnsmasq.service.d/nftables.conf          | Creates nftables table/sets before dnsmasq starts |
| /etc/systemd/system/wg-quick@b1.service.d/after-dnsmasq.conf | Ensures WireGuard starts after dnsmasq            |
| /etc/wireguard/b1.conf                                       | WireGuard interface configuration                 |
| /etc/resolv.conf                                             | Points system DNS to dnsmasq                      |
| /etc/systemd/resolved.conf.d/no-stub.conf                    | Disables systemd-resolved stub listener           |

---
4.2 /etc/dnsmasq.d/wireguard.conf

# WireGuard domain-based split tunneling
user=root

# --- Domains to route through VPN ---
# Combined syntax using inet family for dual-stack support
nftset=/ipv4.icanhazip.com/4#inet#wg_routing#wg_domains4,6#inet#wg_routing#wg_domains6
nftset=/ipv6.icanhazip.com/4#inet#wg_routing#wg_domains4,6#inet#wg_routing#wg_domains6

# --- DNS settings ---
listen-address=127.0.0.53
port=53
bind-interfaces
no-resolv
server=1.1.1.1
server=8.8.8.8
cache-size=1000

Configuration Breakdown

| Directive                 | Purpose                                                                   |
|---------------------------|---------------------------------------------------------------------------|
| user=root                 | Required for dnsmasq to have CAP_NET_ADMIN to modify nftables via netlink |
| nftset=...                | Adds resolved IPs to nftables sets (see syntax below)                     |
| listen-address=127.0.0.53 | Listen on localhost (same as systemd-resolved stub)                       |
| port=53                   | Standard DNS port                                                         |
| bind-interfaces           | Only bind to specified interfaces                                         |
| no-resolv                 | Don't read /etc/resolv.conf for upstream servers                          |
| server=1.1.1.1            | Upstream DNS server (Cloudflare)                                          |
| server=8.8.8.8            | Backup upstream DNS server (Google)                                       |
| cache-size=1000           | Cache up to 1000 DNS entries                                              |

nftset Directive Syntax

nftset=/<domain>/[4|6]#[family#]<table>#<set>[,[4|6]#[family#]<table>#<set>]

| Component | Meaning                                                     |
|-----------|-------------------------------------------------------------|
| <domain>  | Domain to match (e.g., example.com)                         |
| 4 or 6    | Which DNS records to capture: 4 = A (IPv4), 6 = AAAA (IPv6) |
| <family>  | nftables family: inet (dual-stack), ip (IPv4), ip6 (IPv6)   |
| <table>   | nftables table name                                         |
| <set>     | nftables set name                                           |

Critical: You MUST use the combined comma-separated syntax for both IPv4 and IPv6 on the same line. Separate lines have a bug where IPv6 doesn't work (see Section 8.1).

---
4.3 /etc/systemd/system/dnsmasq.service.d/nftables.conf

[Service]
# Create nftables table and sets before dnsmasq starts
# timeout 5m: IPs expire after 5 minutes, re-added on next DNS query
ExecStartPre=/usr/sbin/nft add table inet wg_routing
ExecStartPre=/usr/sbin/nft add set inet wg_routing wg_domains4 "{ type ipv4_addr; flags interval,timeout; timeout 5m; }"
ExecStartPre=/usr/sbin/nft add set inet wg_routing wg_domains6 "{ type ipv6_addr; flags interval,timeout; timeout 5m; }"

# Clean up when dnsmasq stops
ExecStopPost=-/usr/sbin/nft delete table inet wg_routing

Configuration Breakdown

| Directive                       | Purpose                                    |
|---------------------------------|--------------------------------------------|
| ExecStartPre                    | Commands run before dnsmasq starts         |
| add table inet wg_routing       | Creates the nftables table                 |
| type ipv4_addr / type ipv6_addr | Set holds IP addresses                     |
| flags interval,timeout          | Enables IP ranges and automatic expiration |
| timeout 5m                      | IPs expire after 5 minutes                 |
| ExecStopPost=-...               | Cleanup on stop (the - ignores errors)     |

---
4.4 /etc/systemd/system/wg-quick@b1.service.d/after-dnsmasq.conf

[Unit]
# Ensure dnsmasq (and thus nftables table/sets) exists before WireGuard starts
After=dnsmasq.service
Requires=dnsmasq.service

This ensures WireGuard won't start until dnsmasq (and thus the nftables table/sets) is ready.

---
4.5 /etc/wireguard/b1.conf

[Interface]
Address = 10.1.0.2/24
PrivateKey = <your-private-key>
Table = off

# nftables setup (idempotent - safe to run multiple times)
PostUp = nft add chain inet wg_routing output "{ type route hook output priority mangle; }" 2>/dev/null || true
PostUp = nft flush chain inet wg_routing output
# Mark NEW connections to VPN destinations, save to conntrack
PostUp = nft add rule inet wg_routing output ct state new ip daddr @wg_domains4 ct mark set 0x1
PostUp = nft add rule inet wg_routing output ct state new ip6 daddr @wg_domains6 ct mark set 0x1
# Restore mark from conntrack for established connections
PostUp = nft add rule inet wg_routing output ct mark 0x1 meta mark set ct mark
# NAT chain
PostUp = nft add chain inet wg_routing postrouting "{ type nat hook postrouting priority srcnat; }" 2>/dev/null || true
PostUp = nft flush chain inet wg_routing postrouting
PostUp = nft add rule inet wg_routing postrouting oifname "%i" masquerade

# Policy routing (idempotent)
PostUp = ip rule del fwmark 0x1 table 100 priority 100 2>/dev/null || true
PostUp = ip route del default dev %i table 100 2>/dev/null || true
PostUp = ip rule add fwmark 0x1 table 100 priority 100
PostUp = ip route add default dev %i table 100
PostUp = ip -6 rule del fwmark 0x1 table 100 priority 100 2>/dev/null || true
PostUp = ip -6 route del default dev %i table 100 2>/dev/null || true
PostUp = ip -6 rule add fwmark 0x1 table 100 priority 100
PostUp = ip -6 route add default dev %i table 100

# Cleanup
PostDown = nft flush chain inet wg_routing output 2>/dev/null || true
PostDown = nft flush chain inet wg_routing postrouting 2>/dev/null || true
PostDown = ip rule del fwmark 0x1 table 100 priority 100 2>/dev/null || true
PostDown = ip route del default dev %i table 100 2>/dev/null || true
PostDown = ip -6 rule del fwmark 0x1 table 100 priority 100 2>/dev/null || true
PostDown = ip -6 route del default dev %i table 100 2>/dev/null || true

[Peer]
PublicKey = <peer-public-key>
AllowedIPs = 0.0.0.0/0, ::/0
Endpoint = <vpn-server>:51820
PersistentKeepalive = 25

Configuration Breakdown

[Interface] Section:

| Directive   | Purpose                                                                    |
|-------------|----------------------------------------------------------------------------|
| Address     | IP address assigned to the WireGuard interface                             |
| PrivateKey  | Your WireGuard private key                                                 |
| Table = off | Prevents wg-quick from adding default routes (we handle routing ourselves) |
| PostUp      | Commands run after interface comes up                                      |
| PostDown    | Commands run after interface goes down                                     |
| %i          | Replaced with interface name (e.g., b1)                                    |

[Peer] Section:

| Directive                    | Purpose                                             |
|------------------------------|-----------------------------------------------------|
| PublicKey                    | VPN server's public key                             |
| AllowedIPs = 0.0.0.0/0, ::/0 | Accept all IPs (required for our routing to work)   |
| Endpoint                     | VPN server address and port                         |
| PersistentKeepalive          | Send keepalive every 25 seconds (for NAT traversal) |

PostUp Commands Explained

1. Create output chain (mangle priority, route type):
nft add chain inet wg_routing output "{ type route hook output priority mangle; }"
1. The type route hook is critical — it causes the kernel to re-evaluate routing after marking.
2. Flush existing rules (idempotent):
nft flush chain inet wg_routing output
3. Mark NEW connections and save to conntrack:
nft add rule inet wg_routing output ct state new ip daddr @wg_domains4 ct mark set 0x1
3. Only marks the first packet of a connection, storing the mark in conntrack.
4. Restore mark for established connections:
nft add rule inet wg_routing output ct mark 0x1 meta mark set ct mark
4. Subsequent packets get their mark from conntrack, ensuring consistent routing.
5. Masquerade NAT:
nft add rule inet wg_routing postrouting oifname "%i" masquerade
5. Rewrites source IP to the WireGuard interface IP (essential for return traffic).
6. Policy routing rules:
ip rule add fwmark 0x1 table 100 priority 100
ip route add default dev %i table 100
6. Marked packets use routing table 100, which routes through WireGuard.

---
4.6 /etc/resolv.conf

nameserver 127.0.0.53

Points the system to dnsmasq for DNS resolution.

Important: This file may be managed by systemd-resolved or NetworkManager. You may need to make it immutable:

sudo chattr +i /etc/resolv.conf

---
4.7 /etc/systemd/resolved.conf.d/no-stub.conf

[Resolve]
DNSStubListener=no

Disables systemd-resolved's stub listener on 127.0.0.53:53, freeing the port for dnsmasq.

After creating this file:

sudo systemctl restart systemd-resolved

---
5. How It Works

5.1 dnsmasq and nftset

When dnsmasq receives a DNS query for a configured domain:

1. It forwards the query to upstream DNS (1.1.1.1, 8.8.8.8)
2. Upon receiving the response, it extracts all IP addresses
3. It uses netlink to add each IP to the specified nftables set
4. It returns the DNS response to the client

The nftset directive uses netlink sockets (not the nft command), which requires CAP_NET_ADMIN capability — hence user=root.

5.2 nftables Packet Marking

The output chain in the wg_routing table processes every outgoing packet:

1. For new connections: If the destination IP is in @wg_domains4 or @wg_domains6, set ct mark to 0x1
2. For all packets: If ct mark is 0x1, copy it to meta mark

The connection tracking mark (ct mark) persists for the lifetime of the connection, ensuring all packets of a connection follow the same route.

5.3 The type route Hook

This is the critical piece that makes rerouting work:

type route hook output priority mangle

Unlike regular output hooks, a type route hook causes the kernel to re-evaluate the routing decision after the chain processes. When we set meta mark 0x1, the kernel checks policy routing rules again and finds our rule that sends marked packets to table 100.

Without type route, the routing decision is already made before our rules run, and marking would have no effect.

5.4 Policy Routing

Linux supports multiple routing tables. We use:

- Priority 100: fwmark 0x1 → lookup table 100
- Table 100: default dev b1 (all traffic goes to WireGuard)

The priority ensures our rule is checked before the default routing table (priority 32766).

5.5 Masquerade NAT

When a packet is rerouted to WireGuard, its source IP is still your LAN address (e.g., 192.168.1.100). The VPN peer can't route replies back to this address.

Masquerade NAT rewrites the source IP to the WireGuard interface's IP (10.1.0.2), which the peer knows how to reach. The kernel's connection tracking remembers this translation and reverses it for reply packets.

5.6 Set Timeout

IPs in the nftables sets have a 5-minute timeout:

elements = { 104.16.184.241 expires 4m32s100ms }

When the timeout expires, the IP is automatically removed. The next DNS query for that domain will re-add it. This keeps the sets fresh and bounded, preventing unbounded growth as CDN IPs change.

---
6. Data Flow

6.1 Complete Request Flow

Let's trace what happens when you run curl ipv4.icanhazip.com:

Step 1: DNS Resolution

curl calls getaddrinfo("ipv4.icanhazip.com")
    → libc reads /etc/resolv.conf → nameserver 127.0.0.53
    → UDP packet to dnsmasq on 127.0.0.53:53

Step 2: dnsmasq Processing

dnsmasq receives A record query for ipv4.icanhazip.com
    → Matches nftset rule for this domain
    → Forwards query to 1.1.1.1 (upstream)
    → Receives response: 104.16.184.241, 104.16.185.241
    → Calls netlink to add IPs to inet wg_routing wg_domains4
    → Returns response to curl

Step 3: TCP Connection Initiation

curl creates TCP socket
    → connect() to 104.16.184.241:80
    → Kernel creates SYN packet
    → Source: 192.168.1.100 (your LAN IP)
    → Destination: 104.16.184.241

Step 4: nftables Output Chain

Packet enters "inet wg_routing output" chain
    → Rule: ct state new ip daddr @wg_domains4 ct mark set 0x1
    → 104.16.184.241 IS in wg_domains4
    → This is a NEW connection (SYN packet)
    → ct mark set to 0x1 (stored in conntrack)
    → Rule: ct mark 0x1 meta mark set ct mark
    → meta mark set to 0x1
    → "type route" hook triggers routing re-evaluation

Step 5: Policy Routing

Kernel re-evaluates routing for marked packet
    → Checks ip rules in priority order
    → Priority 100: fwmark 0x1 lookup table 100 ← MATCH
    → Table 100: default dev b1
    → Packet routed to WireGuard interface b1

Step 6: Masquerade NAT

Packet enters "inet wg_routing postrouting" chain
    → Rule: oifname "b1" masquerade
    → Source IP rewritten: 192.168.1.100 → 10.1.0.2
    → Conntrack records the NAT translation

Step 7: WireGuard Encryption

WireGuard receives packet on b1 interface
    → Looks up peer for destination (AllowedIPs = 0.0.0.0/0 matches)
    → Encrypts with session keys (ChaCha20-Poly1305)
    → Encapsulates in UDP
    → Sends to endpoint 73.218.227.44:51820

Step 8: Response Path

VPN peer receives packet, decrypts, forwards to internet
    → Remote server responds
    → VPN peer encrypts response, sends back
    → WireGuard on b1 receives and decrypts
    → Conntrack matches the connection, reverses NAT
    → Destination IP: 10.1.0.2 → 192.168.1.100
    → Response delivered to curl

Step 9: Subsequent Packets

For subsequent packets of this connection:
    → ct state is ESTABLISHED (not NEW)
    → First rule (ct state new) doesn't match
    → But ct mark is already 0x1 (set on first packet)
    → Second rule copies ct mark to meta mark
    → Packet gets marked and routed through VPN

This is why connection tracking is important — it ensures all packets of a connection follow the same route, even if the IP is removed from the set mid-connection.

---
7. Managing Domains

7.1 Adding a New Domain

Edit /etc/dnsmasq.d/wireguard.conf and add a new nftset line:

nftset=/example.com/4#inet#wg_routing#wg_domains4,6#inet#wg_routing#wg_domains6

Then restart dnsmasq:

sudo systemctl restart dnsmasq

7.2 Domain Patterns

Single Domain

nftset=/example.com/4#inet#wg_routing#wg_domains4,6#inet#wg_routing#wg_domains6

Wildcard (All Subdomains)

# Matches *.example.com but NOT example.com itself
nftset=/.example.com/4#inet#wg_routing#wg_domains4,6#inet#wg_routing#wg_domains6

Apex + Wildcard

# Matches example.com AND *.example.com
nftset=/example.com/.example.com/4#inet#wg_routing#wg_domains4,6#inet#wg_routing#wg_domains6

Multiple Domains on One Line

nftset=/site1.com/site2.com/site3.com/4#inet#wg_routing#wg_domains4,6#inet#wg_routing#wg_domains6

7.3 Removing a Domain

Delete or comment out the nftset line and restart dnsmasq:

sudo systemctl restart dnsmasq

Existing IPs will expire after the timeout (5 minutes). Existing connections will continue routing through VPN until they close (due to connection tracking).

7.4 Viewing Current Sets

# Show all IPs currently in the sets
sudo nft list table inet wg_routing

# Show just IPv4 set
sudo nft list set inet wg_routing wg_domains4

# Show just IPv6 set
sudo nft list set inet wg_routing wg_domains6

7.5 Manually Flushing Sets

# Clear all IPs (they'll be re-added on next DNS query)
sudo nft flush set inet wg_routing wg_domains4
sudo nft flush set inet wg_routing wg_domains6

---
8. Key Technical Discoveries

8.1 The dnsmasq IPv6 nftset Bug

Problem: When using separate nftset lines for IPv4 and IPv6 records of the same domain, only IPv4 works. IPv6 addresses are silently not added to the set.

# ❌ BROKEN - IPv6 silently fails
nftset=/example.com/4#inet#wg_routing#wg_domains4
nftset=/example.com/6#inet#wg_routing#wg_domains6

Solution: Use the combined comma-separated syntax on a single line:

# ✅ WORKING - Both IPv4 and IPv6 work
nftset=/example.com/4#inet#wg_routing#wg_domains4,6#inet#wg_routing#wg_domains6

This appears to be a bug in dnsmasq where separate lines for the same domain cause the second line to not be processed correctly.

8.2 Why user=root is Required

dnsmasq uses netlink sockets to communicate directly with the kernel's nftables subsystem. This requires CAP_NET_ADMIN capability.

When running as user nobody (default), dnsmasq drops privileges and loses this capability. The nftset operations fail silently — no error messages, IPs just don't get added.

Attempted alternative: Using AmbientCapabilities=CAP_NET_ADMIN in the systemd service. This doesn't work because:
1. ExecStartPre commands run as root anyway
2. dnsmasq itself needs the capability at runtime for nftset operations
3. The way dnsmasq's nftset is implemented requires root

8.3 The type route Hook

Regular nftables output hooks cannot cause packet rerouting — the routing decision is already made before the hook runs.

The type route hook output priority mangle is special: it tells the kernel to re-evaluate the routing decision after the chain processes. This is what makes fwmark-based policy routing work.

Without type route:
Packet → Routing decision → Output hook (too late to reroute)

With type route:
Packet → Output hook (set mark) → Re-evaluate routing → New route

8.4 Why Masquerade is Essential

When a packet is rerouted to WireGuard:
- Original source IP: 192.168.1.100 (your LAN IP)
- WireGuard peer doesn't know how to reach 192.168.1.100
- Reply would be lost

Masquerade NAT:
- Rewrites source to 10.1.0.2 (WireGuard interface IP)
- Peer knows this IP (it's in the WireGuard tunnel)
- Conntrack reverses the NAT for replies

8.5 The inet Family Simplification

nftables supports three address families:
- ip — IPv4 only
- ip6 — IPv6 only
- inet — Both IPv4 and IPv6

Using inet allows:
- Single table for both protocols
- Same chain handles both IPv4 and IPv6 packets
- Simpler configuration
- Works correctly with dnsmasq's nftset

8.6 Connection Tracking for Consistent Routing

Without connection tracking:
First packet: marked, routed through VPN
IP expires from set after 5 minutes
Subsequent packets: not marked, routed directly
Connection breaks or behaves strangely

With connection tracking:
First packet: marked, ct mark set, routed through VPN
ct mark persists for connection lifetime
IP expires from set after 5 minutes
Subsequent packets: ct mark restored, routed through VPN
Connection works correctly until closed

8.7 AppArmor Blocks External Scripts

Ubuntu's AppArmor profile for wg-quick only allows execution of:
- /usr/sbin/ip
- /usr/sbin/nft
- /usr/sbin/sysctl

External scripts (even with proper permissions) are blocked with "Permission denied".

Solution: Inline all commands directly in the WireGuard config rather than using external scripts.

---
9. Troubleshooting

9.1 DNS Not Working

Symptom: No internet connectivity, DNS resolution fails.

Check:
# Is dnsmasq running?
sudo systemctl status dnsmasq

# Is something listening on 127.0.0.53:53?
ss -tlnp | grep ':53'

# Can you query dnsmasq directly?
dig @127.0.0.53 google.com

# What does /etc/resolv.conf point to?
cat /etc/resolv.conf

Common fixes:
# Restart dnsmasq
sudo systemctl restart dnsmasq

# Check for config errors
sudo dnsmasq --test

# View logs
sudo journalctl -u dnsmasq -f

9.2 IPs Not Added to Sets

Symptom: DNS works but IPs aren't appearing in nftables sets.

Check:
# Query a configured domain
dig @127.0.0.53 ipv4.icanhazip.com

# Check the set
sudo nft list set inet wg_routing wg_domains4

Common causes:
1. Missing user=root in dnsmasq config
2. Using separate lines for IPv4/IPv6 (see Section 8.1)
3. nftables table/sets don't exist

Fix:
# Verify dnsmasq is running as root
ps aux | grep dnsmasq

# Verify table exists
sudo nft list tables | grep wg_routing

# Restart dnsmasq to recreate table
sudo systemctl restart dnsmasq

9.3 WireGuard Won't Start

Symptom: wg-quick up b1 fails.

Check:
# View detailed error
sudo wg-quick up b1

# Check if interface already exists
ip link show b1

# View WireGuard logs
sudo journalctl -u wg-quick@b1 -f

Common causes:
1. Interface already exists: sudo wg-quick down b1 first
2. nftables table doesn't exist: ensure dnsmasq is running
3. Syntax error in config: check quotes and escaping

9.4 Traffic Not Going Through VPN

Symptom: VPN is up but traffic to configured domains uses direct connection.

Check:
# Verify IP is in the set
sudo nft list set inet wg_routing wg_domains4

# Check if rules exist
sudo nft list chain inet wg_routing output

# Check policy routing
ip rule show | grep fwmark
ip route show table 100

# Test with curl
curl -v ipv4.icanhazip.com

Debugging:
# Add counter to see if rule matches
sudo nft add rule inet wg_routing output ip daddr @wg_domains4 counter

# Make requests then check counters
sudo nft list chain inet wg_routing output

9.5 VPN Works but Returns Wrong IP

Symptom: curl ipv4.icanhazip.com returns your real IP, not VPN IP.

Causes:
1. DNS cached old IP before VPN setup
2. IP expired from set

Fix:
# Flush DNS cache and sets
sudo nft flush set inet wg_routing wg_domains4
sudo systemctl restart dnsmasq

# Query again
dig @127.0.0.53 ipv4.icanhazip.com
curl ipv4.icanhazip.com

9.6 Connection Drops After 5 Minutes

Symptom: Long-running connections break after ~5 minutes.

This shouldn't happen with connection tracking properly configured. The ct mark persists for the connection lifetime.

Check:
# Verify ct mark rules exist
sudo nft list chain inet wg_routing output | grep "ct mark"

Should show:
ct state new ip daddr @wg_domains4 ct mark set 0x00000001
ct mark 0x00000001 meta mark set ct mark

---
10. Maintenance

10.1 Starting the VPN

sudo wg-quick up b1

10.2 Stopping the VPN

sudo wg-quick down b1

10.3 Checking VPN Status

# WireGuard status
sudo wg show

# Check if traffic is flowing
sudo wg show b1

# View transfer stats
watch -n 1 'sudo wg show b1'

10.4 Viewing Logs

# dnsmasq logs
sudo journalctl -u dnsmasq -f

# WireGuard logs (if using systemd)
sudo journalctl -u wg-quick@b1 -f

# All related logs
sudo journalctl -f | grep -E '(dnsmasq|wireguard|wg)'

10.5 Enabling VPN at Boot

sudo systemctl enable wg-quick@b1

10.6 Disabling VPN at Boot

sudo systemctl disable wg-quick@b1

10.7 Testing Split Tunneling

# Should show VPN IP
curl ipv4.icanhazip.com

# Should show your real IP
curl api.ipify.org

# Compare
echo "VPN IP: $(curl -s ipv4.icanhazip.com)"
echo "Real IP: $(curl -s api.ipify.org)"

10.8 Reloading After Config Changes

After changing domains (/etc/dnsmasq.d/wireguard.conf):
sudo systemctl restart dnsmasq

After changing WireGuard config (/etc/wireguard/b1.conf):
sudo wg-quick down b1
sudo wg-quick up b1

After changing systemd drop-ins:
sudo systemctl daemon-reload
sudo systemctl restart dnsmasq

---
11. Limitations and Caveats

11.1 DNS Bypass

Applications can bypass your DNS resolver:
- Hardcoded DNS servers (e.g., 8.8.8.8)
- DNS-over-HTTPS (DoH)
- DNS-over-TLS (DoT)

If an app bypasses dnsmasq, its traffic won't be routed through VPN.

Mitigation: Block outgoing DNS to non-local servers (optional, may break DoH):
sudo nft add rule inet wg_routing output udp dport 53 ip daddr != 127.0.0.53 drop

11.2 Direct IP Access

If an application connects directly to an IP address without DNS lookup, it won't be routed through VPN (unless you manually add the IP).

11.3 IPv6 VPN Support

This setup supports IPv6, but your VPN server must also support IPv6:
- Server needs an IPv6 address
- Server must route IPv6 traffic
- Your WireGuard config needs an IPv6 address

If your VPN doesn't support IPv6, IPv6 traffic to configured domains will fail.

11.4 DNS Cache Timing

DNS responses are cached by dnsmasq. If a domain's IP changes while cached, traffic goes to the old (cached) IP until the cache expires.

The nftables set timeout (5 minutes) and DNS cache are independent. For best results, keep them roughly aligned.

11.5 No Subdomain Inference

Adding example.com does NOT automatically include subdomains. You must explicitly add:
nftset=/example.com/.example.com/4#inet#wg_routing#wg_domains4,6#inet#wg_routing#wg_domains6

11.6 Startup Race Condition

If WireGuard starts before dnsmasq, the nftables table won't exist and PostUp commands will fail.

Mitigated by: The systemd dependency in /etc/systemd/system/wg-quick@b1.service.d/after-dnsmasq.conf

11.7 dnsmasq as Root

Running dnsmasq as root is a security consideration. If dnsmasq has vulnerabilities, they would be exploitable with root privileges.

Acceptable for: Personal workstations
Consider alternatives for: Servers, multi-user systems

---
12. Security Considerations

12.1 Trust Model

This setup requires trusting:
1. Your VPN provider — They can see all traffic routed through them
2. Upstream DNS servers (1.1.1.1, 8.8.8.8) — They see all your DNS queries
3. dnsmasq running as root — Potential attack surface

12.2 DNS Privacy

DNS queries to upstream servers are unencrypted and visible to your ISP.

For better privacy, consider:
- DNS-over-TLS via stubby
- DNS-over-HTTPS via cloudflared
- Routing DNS through VPN

12.3 Private Key Security

The WireGuard private key in /etc/wireguard/b1.conf should be protected:
sudo chmod 600 /etc/wireguard/b1.conf
sudo chown root:root /etc/wireguard/b1.conf

12.4 AllowedIPs Security

We use AllowedIPs = 0.0.0.0/0, ::/0 which means WireGuard accepts traffic claiming to be from any IP. This is required for our routing to work but means the VPN server could inject traffic.

Acceptable if: You trust your VPN endpoint.

---
13. Alternative Approaches

13.1 Network Namespaces

Run specific applications in a network namespace with only VPN access:

# Create namespace
ip netns add vpn
ip link set wg0 netns vpn

# Run application in namespace
ip netns exec vpn firefox

Pros: Complete isolation, no DNS interception needed
Cons: Must launch apps specially, more complex management

13.2 Tailscale / Headscale

Managed WireGuard with built-in split DNS:

Pros: Zero-maintenance, built-in features
Cons: Less control, vendor lock-in

13.3 cgroups net_cls

Route traffic based on process rather than destination:

# Create cgroup
mkdir /sys/fs/cgroup/net_cls/vpn
echo 0x00010001 > /sys/fs/cgroup/net_cls/vpn/net_cls.classid

# Run process in cgroup
cgexec -g net_cls:vpn curl example.com

Pros: Per-process routing
Cons: Requires cgroups v1, more management

13.3 Transparent Proxy

Route matched traffic through a local proxy that tunnels through VPN.

Pros: Application-layer inspection possible
Cons: More complex, performance overhead

---
14. Quick Reference

14.1 File Locations

| File                                                         | Purpose               |
|--------------------------------------------------------------|-----------------------|
| /etc/dnsmasq.d/wireguard.conf                                | Domain list           |
| /etc/systemd/system/dnsmasq.service.d/nftables.conf          | Set creation          |
| /etc/systemd/system/wg-quick@b1.service.d/after-dnsmasq.conf | Startup order         |
| /etc/wireguard/b1.conf                                       | WireGuard config      |
| /etc/resolv.conf                                             | System DNS            |
| /etc/systemd/resolved.conf.d/no-stub.conf                    | Disable resolved stub |

14.2 Common Commands

# Start VPN
sudo wg-quick up b1

# Stop VPN
sudo wg-quick down b1

# Check VPN status
sudo wg show

# Restart dnsmasq (after config changes)
sudo systemctl restart dnsmasq

# View nftables sets
sudo nft list table inet wg_routing

# Test split tunneling
curl ipv4.icanhazip.com   # Should show VPN IP
curl api.ipify.org        # Should show real IP

# View logs
sudo journalctl -u dnsmasq -f
sudo journalctl -u wg-quick@b1 -f

14.3 Adding a New Domain

1. Edit /etc/dnsmasq.d/wireguard.conf:
nftset=/newdomain.com/4#inet#wg_routing#wg_domains4,6#inet#wg_routing#wg_domains6
2. Restart dnsmasq:
sudo systemctl restart dnsmasq

14.4 Troubleshooting Checklist

1. ☐ Is dnsmasq running? sudo systemctl status dnsmasq
2. ☐ Is the nftables table created? sudo nft list tables
3. ☐ Are IPs in the sets? sudo nft list set inet wg_routing wg_domains4
4. ☐ Is WireGuard up? sudo wg show
5. ☐ Do policy routing rules exist? ip rule show
6. ☐ Does table 100 have a route? ip route show table 100

---
Appendix: Complete Configuration Files

A.1 /etc/dnsmasq.d/wireguard.conf

# WireGuard domain-based split tunneling
user=root

# --- Domains to route through VPN ---
# Combined syntax using inet family for dual-stack support
nftset=/ipv4.icanhazip.com/4#inet#wg_routing#wg_domains4,6#inet#wg_routing#wg_domains6
nftset=/ipv6.icanhazip.com/4#inet#wg_routing#wg_domains4,6#inet#wg_routing#wg_domains6

# --- DNS settings ---
listen-address=127.0.0.53
port=53
bind-interfaces
no-resolv
server=1.1.1.1
server=8.8.8.8
cache-size=1000

A.2 /etc/systemd/system/dnsmasq.service.d/nftables.conf

[Service]
# Create nftables table and sets before dnsmasq starts
# timeout 5m: IPs expire after 5 minutes, re-added on next DNS query
ExecStartPre=/usr/sbin/nft add table inet wg_routing
ExecStartPre=/usr/sbin/nft add set inet wg_routing wg_domains4 "{ type ipv4_addr; flags interval,timeout; timeout 5m; }"
ExecStartPre=/usr/sbin/nft add set inet wg_routing wg_domains6 "{ type ipv6_addr; flags interval,timeout; timeout 5m; }"

# Clean up when dnsmasq stops
ExecStopPost=-/usr/sbin/nft delete table inet wg_routing

A.3 /etc/systemd/system/wg-quick@b1.service.d/after-dnsmasq.conf

[Unit]
# Ensure dnsmasq (and thus nftables table/sets) exists before WireGuard starts
After=dnsmasq.service
Requires=dnsmasq.service

A.4 /etc/wireguard/b1.conf

[Interface]
Address = 10.1.0.2/24
PrivateKey = <your-private-key>
Table = off

# nftables setup (idempotent - safe to run multiple times)
PostUp = nft add chain inet wg_routing output "{ type route hook output priority mangle; }" 2>/dev/null || true
PostUp = nft flush chain inet wg_routing output
# Mark NEW connections to VPN destinations, save to conntrack
PostUp = nft add rule inet wg_routing output ct state new ip daddr @wg_domains4 ct mark set 0x1
PostUp = nft add rule inet wg_routing output ct state new ip6 daddr @wg_domains6 ct mark set 0x1
# Restore mark from conntrack for established connections
PostUp = nft add rule inet wg_routing output ct mark 0x1 meta mark set ct mark
# NAT chain
PostUp = nft add chain inet wg_routing postrouting "{ type nat hook postrouting priority srcnat; }" 2>/dev/null || true
PostUp = nft flush chain inet wg_routing postrouting
PostUp = nft add rule inet wg_routing postrouting oifname "%i" masquerade

# Policy routing (idempotent)
PostUp = ip rule del fwmark 0x1 table 100 priority 100 2>/dev/null || true
PostUp = ip route del default dev %i table 100 2>/dev/null || true
PostUp = ip rule add fwmark 0x1 table 100 priority 100
PostUp = ip route add default dev %i table 100
PostUp = ip -6 rule del fwmark 0x1 table 100 priority 100 2>/dev/null || true
PostUp = ip -6 route del default dev %i table 100 2>/dev/null || true
PostUp = ip -6 rule add fwmark 0x1 table 100 priority 100
PostUp = ip -6 route add default dev %i table 100

# Cleanup
PostDown = nft flush chain inet wg_routing output 2>/dev/null || true
PostDown = nft flush chain inet wg_routing postrouting 2>/dev/null || true
PostDown = ip rule del fwmark 0x1 table 100 priority 100 2>/dev/null || true
PostDown = ip route del default dev %i table 100 2>/dev/null || true
PostDown = ip -6 rule del fwmark 0x1 table 100 priority 100 2>/dev/null || true
PostDown = ip -6 route del default dev %i table 100 2>/dev/null || true

[Peer]
PublicKey = <peer-public-key>
AllowedIPs = 0.0.0.0/0, ::/0
Endpoint = <vpn-server>:51820
PersistentKeepalive = 25

A.5 /etc/resolv.conf

nameserver 127.0.0.53

A.6 /etc/systemd/resolved.conf.d/no-stub.conf

[Resolve]
DNSStubListener=no