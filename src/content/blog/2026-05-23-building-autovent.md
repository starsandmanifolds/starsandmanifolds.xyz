---
title: Building AutoVent
excerpt: "An Android app that reads an AirGradient air quality sensor via HTTP, decides when the kitchen needs venting, and flips a Tuya smart plug using the local encrypted protocol, all running as a foreground service."
tags: ["Android", "IoT", "Air Quality", "Kotlin", "Tuya", "AirGradient"]
state: published
---

Air quality monitors are useful right up until you have to act on the data yourself. After a few weeks of checking my AirGradient dashboard and manually flipping a fan switch, I wrote an Android app, AutoVent, that does the checking and flipping for me.

It polls an [AirGradient](https://www.airgradient.com/) sensor over the local network, decides whether the kitchen needs exhausting based on configurable thresholds for CO₂, PM2.5, TVOC, and NOx, and controls a Tuya-compatible smart plug via its local encrypted protocol. The whole thing runs as a foreground service so it keeps going even when I close the app.

## What it talks to

### The sensor

My sensor is an AirGradient I-9PSL, their indoor monitor that measures particulate matter (PM1, PM2.5, PM10), CO₂, temperature, humidity, TVOC, and NOx. It runs a local HTTP server on the same WiFi network and exposes a JSON endpoint at `http://airgradient_<serial>.local/measures/current`.

A typical response looks like this (trimmed to the fields I care about):

```json
{
  "rco2": 505,
  "pm02Compensated": 27,
  "tvocIndex": 86,
  "noxIndex": 1
}
```

The app fetches this endpoint every second over plain HTTP.

### The plug

The exhaust fan is plugged into a smart plug compatible with the Tuya/Smart Life app, which is required to obtain the local key to reach its local API. Under the hood it runs Tuya's firmware and speaks Tuya's local protocol (version 3.5).

The plug is controlled by opening an encrypted TCP socket to its IP address on port 6668. The Tuya protocol uses a sequence of handshake messages to derive a session key, then exchanges AES-GCM encrypted JSON payloads to read and write datapoints (dps). The specific datapoint that controls the relay is `dps["1"]`: set it to `true` to turn the fan on, `false` to turn it off.

```python
# Simplified: the actual implementation is in Kotlin
message = '{"protocol":5,"t":' + timestamp + ',"data":{"dps":{"1":true}}}'
send_encrypted(socket, session_key, message)
```

To query the physical state of the plug, the app sends a query command and reads the response.

## How the app works

```text
+-----------------+     HTTP (every 1s)     +--------------+
|  AirGradient    | <---------------------- |  AutoVent    |
|  I-9PSL Sensor  |                         |  Android App |
+-----------------+                         |              |
                                            |  Foreground  |
+-----------------+     TCP :6668 (enc)     |  Service     |
|  Tuya Smart     | <---------------------- |              |
|  Plug           |     AES-GCM / v3.5      +--------------+
+-----------------+
```

The app is written in Kotlin and split into a few pieces:

- **AutoVentConfig**: reads thresholds, ranges, intervals, and metric definitions from `assets/autovent.json` so you can edit defaults without touching code. Slider changes in the UI are saved to SharedPreferences on top of these defaults.
- **AirQualityClient**: fetches and parses the AirGradient JSON endpoint.
- **TuyaFanClient**: implements the Tuya local protocol: session handshake, AES-GCM encryption, command send, response read.
- **ThresholdPolicy**: given current readings and the configured thresholds, decides whether to turn the fan on, turn it off, or hold.
- **AutomationService**: runs a coroutine loop that polls the sensor, checks thresholds, drives the Tuya plug, and keeps a notification updated. The notification shows the current fan state and readings. The user only needs to open the app to adjust thresholds.

The hysteresis logic is deliberate:

- The fan turns **on** when *any* metric exceeds its upper threshold.
- The fan turns **off** only when *every* metric has dropped below its lower threshold.

This prevents the fan from cycling on and off rapidly when a reading hovers near the boundary.

Default thresholds, configured in `autovent.json`:

<table style="width: 100%; border-collapse: collapse; margin: 1.5rem 0; font-size: 0.95rem; text-align: left; border: 1px solid var(--color-ctp-surface1, #45475a); border-radius: 8px; overflow: hidden;">
  <thead>
    <tr style="background-color: var(--color-ctp-surface0, #313244); border-bottom: 2px solid var(--color-ctp-surface1, #45475a);">
      <th style="padding: 10px 15px; font-weight: bold; color: var(--color-ctp-text, #cdd6f4);">Metric</th>
      <th style="padding: 10px 15px; font-weight: bold; color: var(--color-ctp-text, #cdd6f4);">Range</th>
      <th style="padding: 10px 15px; font-weight: bold; color: var(--color-ctp-text, #cdd6f4);">Off below</th>
      <th style="padding: 10px 15px; font-weight: bold; color: var(--color-ctp-text, #cdd6f4);">On above</th>
    </tr>
  </thead>
  <tbody>
    <tr style="border-bottom: 1px solid var(--color-ctp-surface0, #313244);">
      <td style="padding: 10px 15px; font-weight: bold;">CO₂</td>
      <td style="padding: 10px 15px;">400–1000 ppm</td>
      <td style="padding: 10px 15px; color: var(--color-ctp-subtext1, #a6adc8);">500</td>
      <td style="padding: 10px 15px; color: var(--color-ctp-teal, #94e2d5); font-weight: bold;">800</td>
    </tr>
    <tr style="border-bottom: 1px solid var(--color-ctp-surface0, #313244);">
      <td style="padding: 10px 15px; font-weight: bold;">PM2.5</td>
      <td style="padding: 10px 15px;">0–100 ug/m³</td>
      <td style="padding: 10px 15px; color: var(--color-ctp-subtext1, #a6adc8);">35</td>
      <td style="padding: 10px 15px; color: var(--color-ctp-teal, #94e2d5); font-weight: bold;">50</td>
    </tr>
    <tr style="border-bottom: 1px solid var(--color-ctp-surface0, #313244);">
      <td style="padding: 10px 15px; font-weight: bold;">TVOC</td>
      <td style="padding: 10px 15px;">0–300 index</td>
      <td style="padding: 10px 15px; color: var(--color-ctp-subtext1, #a6adc8);">90</td>
      <td style="padding: 10px 15px; color: var(--color-ctp-teal, #94e2d5); font-weight: bold;">160</td>
    </tr>
    <tr>
      <td style="padding: 10px 15px; font-weight: bold;">NOx</td>
      <td style="padding: 10px 15px;">1–10 index</td>
      <td style="padding: 10px 15px; color: var(--color-ctp-subtext1, #a6adc8);">2</td>
      <td style="padding: 10px 15px; color: var(--color-ctp-teal, #94e2d5); font-weight: bold;">2</td>
    </tr>
  </tbody>
</table>

<img src="/images/blog/autovent/autovent-main.png" alt="AutoVent main UI" style="max-width: 320px; width: 100%; height: auto; display: block; margin: 2rem auto; border-radius: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.15);" />

## The TVOC mystery

The most interesting thing I've learned is that my TVOC reading drifts upward over time even when nothing obvious is happening. Sitting in the living room (the sensor is in the bedroom) with the door closed, the TVOC index slowly creeps from around 80 to 150+ over a few hours. Venting the room, opening a window or running the exhaust fan, brings it back down to baseline within minutes.

There are no obvious sources: no cooking, no cleaning products, no candles, no fresh paint. Just a person breathing. The sensor is a metal oxide semiconductor type, and they're known to drift with temperature, humidity, and accumulated exposure. It may also be picking up real but subtle VOCs from everyday off-gassing: furniture, electronics, even the person in the next room exhaling CO₂ and trace organics.

I don't have a clean answer for why it drifts. But it consistently does, and it consistently responds to ventilation. If nothing else, it's validation that the exhaust fan serves a real purpose even when the kitchen isn't actively in use.

The full source is on [GitHub](https://github.com/adyavanapalli/autovent).
