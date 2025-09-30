---
title: "MdnsListener"
description: "A high-performance, production-ready multicast DNS (mDNS) listener built with .NET, designed to discover and monitor services on the local network using the mDNS protocol (RFC 6762)."
technologies: ["C#", ".NET", "mDNS", "Networking"]
state: published
githubUrl: "https://github.com/adyavanapalli/MdnsListener"
order: 2
---

## Overview

MdnsListener is a .NET library for discovering and monitoring services on your local network using the multicast DNS (mDNS) protocol.

## Features

- **Zero Configuration**: Automatic service discovery without manual network configuration
- **RFC 6762 Compliant**: Full implementation of the mDNS specification
- **High Performance**: Efficient packet processing and minimal allocations
- **Production Ready**: Comprehensive error handling and logging

## Use Cases

- IoT device discovery
- Network service monitoring
- Smart home automation
- Local API discovery

## Quick Start

```csharp
using MdnsListener;

var listener = new MdnsListener();
listener.ServiceDiscovered += (sender, service) => {
    Console.WriteLine($"Found service: {service.Name}");
};

await listener.StartAsync();
```

## Technical Details

The library uses raw socket programming to listen for mDNS packets on the `224.0.0.251` multicast address and parses DNS records according to RFC 6762.