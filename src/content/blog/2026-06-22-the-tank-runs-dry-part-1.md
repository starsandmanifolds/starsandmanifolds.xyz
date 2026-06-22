---
title: The Tank Runs Dry (Part 1)
excerpt: "My wife's family in India pumps water from an underground municipal reservoir up to a tank on the terrace, by hand, and only finds out the tank is empty after the water has already stopped."
tags: ["IoT", "Embedded"]
state: published
---

My wife's family lives in India, in a house that gets its water the way much of the country does: not from a tap that simply works, but from a municipal reservoir somewhere underground, pumped up into a tank on the terrace. The pump fills the tank. And the pump is turned on by a human being who walks over and flips a switch.

This arrangement works fine right up until the moment it doesn't, which is always the same moment: the tank runs dry. You do not find this out gradually. You find it out when the water stops, and you find it out *after* it has stopped, which is invariably the worst time to learn it. In the canonical worst case, this is mid-use in the bathroom, at a juncture from which there is no graceful retreat. The information "you are out of water" arrives strictly after the point at which you could have done anything about it.

Somebody has to flip that switch *before* the tank is empty, not after. But nobody does, because the only signal that the tank is low is the tank going dry, and by then it's too late.

## Ways to sense the level

This is generally solved by putting a sensor of some kind into the tank, or under the lid. There are more ways to do this than you'd expect:

**Float switch.** A buoyant float that rides the water surface and trips a switch as it rises or falls. The switch is either a physical contact the float pushes on, or a reed switch closed by a magnet sealed inside the float.

**Conductive probes.** Two or more electrodes hung at the levels you care about; water bridging a pair completes a low-voltage circuit, so "is the water touching this probe" becomes a yes-or-no reading.

**Ultrasonic.** A sensor mounted under the lid that chirps downward and times the echo off the water surface, turning time-of-flight into a distance and therefore a level, without anything touching the water.

**Capacitive.** A probe whose capacitance changes depending on how much of it is submerged, since water and air have very different dielectric constants.

**Hydrostatic pressure.** A pressure sensor at the bottom that reads the weight of the water column above it, which is proportional to depth.

## Acting on the signal

Knowing the tank is low is only half of it. That knowledge then has to get from the tank on the terrace to somewhere it can be acted on, a floor or two below. There are two ways to move it.

**A wire.** Run a conductor from the sensor down to wherever the signal is needed, so the reading travels as a closed or open circuit. Copper doesn't care about concrete or weather, but you have to physically route the wire down the outside of a multi-storey building and keep it intact against sun, rain, and time.

**A radio.** Put a transmitter at the tank and a receiver below, and send the reading over the air instead. No wire to run, but now the signal has to cross a concrete floor or two and stay reliable enough to trust with its one job.

## What was actually possible

I didn't evaluate a rich design space. The constraints knocked the options out one by one until one was left.

Wired contact went first. Switching the pump means working inside its mains enclosure, and my knowledge of power electronics is close to zero, so the likely result of me opening that box is a fire, not a relay. Whatever I built would be wireless and keep its hands off the mains.

But the pump starts only one way: someone pushes a button, it runs, and after some minutes it shuts itself off. There's no input to drive remotely. So the choice was a robot to press the button, or just tell a human the tank is low so they go press it. I went with telling a human.

The terrace settled the rest. There's no reliable power up there, and weatherproofing the one outlet is another fire I'd rather not start. So the device had to run on batteries, and last long enough that swapping them isn't a chore: a couple of months minimum, ideally a year. That means low power everywhere, including a frugal radio, which points at BLE.

The sensor then falls out for free. Of all the options above, only the float switch needs no power to take a reading: it's just a buoyant float that closes a circuit, nothing to energize or poll, where the others all want a probe driven or an echo timed. Better still, I can wire that closing into the radio's wake, so the device deep-sleeps drawing almost nothing and only wakes when the float opens or closes.

## The design

The design is two ESP32-C6 boards. One sits at the tank, wired to the float switch and running on a battery. The other sits indoors on mains power, listening, placed as close to the transmitter as the nearest socket allows. There's no reason to put it next to the pump; the pump-side board just has to alert a human, and being mains-powered it can spend as much energy as it likes staying within earshot of the tank.

The tank-side board spends almost all of its life in deep-sleep. The float switch is wired to a wake pin, so the board deep-sleeps until the float actually moves, then wakes, transmits the fact that the tank is empty, and goes back to sleep. It does nothing in between.

That behaviour is the whole reason the battery target is achievable. I used the Seeed Studio XIAO ESP32-C6, which the datasheet rates at 15 μA in deep sleep. At that draw the board can sit idle for months on a small battery without meaningfully discharging it. The only real power is spent during a transmission, and how much depends on how hard the radio is pushed. At the default transmit power of around 9 dBm the radio pulls roughly 100 mA, but I run it at 20 dBm to get through the floors, which is closer to 350 mA. That window is short either way: it advertises for roughly four seconds, and on average it only takes a single advertisement for the receiver to pick it up.

So suppose the float triggers twice a day. Sitting in deep sleep at 15 μA for a full day costs about 0.36 mAh. Two four-second transmissions at 350 mA cost about 0.8 mAh, for a total of roughly 1.2 mAh per day, or about 420 mAh over a year. Notice that at 20 dBm the transmissions now cost more than sleeping all day does, which is the price of the extra range.

That isn't the whole story, though, because a battery also leaks on its own. Self-discharge turns out to matter as much as the circuit here. I went with an 800 mAh lithium battery, which loses something like 3% of its charge a month just sitting there, around 290 mAh a year. Add the 420 mAh the device actually uses and you're drawing on the order of 700 mAh a year from an 800 mAh cell, which works out to a bit over a year before it needs a recharge. Past the one-year target, though not by a huge margin once the boosted transmit power is accounted for.

## Next

That's the device on paper. The harder question was whether I could trust it. This thing is supposed to sit on a terrace untouched for a year and fire exactly when it should, and a sensor that cries wolf, or worse, stays silent when the tank is actually empty, is worse than no sensor at all. I wanted to be damn sure every path through the firmware was accounted for, including the ugly ones where the radio drops mid-handshake or the board crashes and has to recover on its own.

So before trusting any of it, I modeled both halves as finite state machines, wrote down every state, event, and action, and formally checked that every path was handled and that the device always finds its way back to a sane state. That's the next post.
