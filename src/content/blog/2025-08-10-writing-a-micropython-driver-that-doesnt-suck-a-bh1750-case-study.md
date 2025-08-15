---
title: "Writing a MicroPython Driver That Doesn't Suck: A BH1750 Case Study"
excerpt: "Let's be honest, most quick-and-dirty sensor scripts are fragile things. We'll take a battle-hardened BH1750 driver and see what makes it tick, so your next IoT project can be less 'fire and pray' and more 'plug and play'."
tags: ["MicroPython", "Embedded", "IoT", "Sensors", "Python", "I2C"]
state: "published"
---

You’ve got a new sensor, a microcontroller, and a brilliant idea. You hunt down a MicroPython driver, stitch it into your code, and... it works! High-fives all around. But then you leave it running overnight, and the whole thing crashes. Or the sensor throws a fit if a wire jiggles. Suddenly, your weekend project feels more like a full-time firefighting gig.

What’s the difference between a script that *works* and a driver that’s *reliable*? It’s not black magic, it’s just a bit of thoughtful engineering.

Let's dissect a driver for the humble [BH1750 ambient light sensor](https://github.com/adyavanapalli/bh1750.py) to see how we can build drivers that don't suck.

### Principle 1: Respect Your Microcontroller's Tiny, Stressed-Out Brain

Your microcontroller has about as much RAM as a potato. Every time you create a new object, you're asking its tiny brain to find a clean spot to put it. Do this a few thousand times in a loop, and you get memory fragmentation, it's like trying to find a parking spot in a crowded lot, and your code eventually just gives up and has a panic attack.

A good driver is a minimalist. It cleans up after itself and, more importantly, avoids making a mess in the first place.

**Meal Prep for Your Code: Pre-allocate Buffers**

Instead of creating new `bytearray` objects for I2C communication every single time you talk to the sensor, make them once when the driver starts. It’s like meal prepping for your code: do the work upfront so you can be lazy and efficient later.

```python
# from bh1750.py
class BH1750:
    def __init__(self, i2c: I2C, ...):
        # ...
        # Make these once and reuse them forever.
        self._write_buf = bytearray(1)
        self._read_buf = bytearray(2)
        # ...

    def _write_cmd(self, cmd: int):
        # No new memory allocated here!
        self._write_buf[0] = cmd
        self.i2c.writeto(self.addr, self._write_buf)
```

**Use `const()` Because Change is Scary**

Hardware addresses and command codes aren't going to change. By using `micropython.const()`, you're telling the interpreter, "This is a number, not a variable." It saves a bit of RAM, but more importantly, it makes your code's intent clearer.

```python
# from bh1750.py
from micropython import const

_ADDR_LOW = const(0x23)
_POWER_DOWN = const(0x00)
```

### Principle 2: Don't Let Your Code Throw a Tantrum

Hardware is chaos. Wires get loose, power flickers, and cosmic rays flip bits for fun. If your code assumes the world is perfect, it will crash the moment it isn't. A robust driver is a zen master, it anticipates chaos and handles it gracefully.

The simplest way to do this is to wrap every single hardware interaction in a `try...except OSError` block. This is your safety net. If the sensor stops responding, you won't get a system-halting crash, you'll get a manageable exception that your main application can handle.

```python
# from bh1750.py
@property
def raw(self) -> int:
    """Reads the raw 16-bit sensor value."""
    try:
        # The dangerous part where we talk to the outside world.
        self.i2c.readfrom_into(self.addr, self._read_buf)
        return (self._read_buf[0] << 8) | self._read_buf[1]
    except OSError as e:
        # If it fails, we don't panic. We just report the problem.
        raise OSError(f"BH1750 I2C read failed: {e}")
```

### Principle 3: Write Code You'd Actually *Want* to Use

A good API feels intuitive. Think about driving a car. You have `car.speed` (a property, something you check) and `car.drive_to_the_store()` (a method, an action you perform).

We can do the same in our driver.
- **Getting a value?** Use a `@property`.
- **Telling the sensor to *do* something?** Use a method.

The `lux` reading is a perfect candidate for a property. It lets the user write `current_light = sensor.lux`, which is clean and simple. Behind the scenes, the property can hide all the messy details of waking the sensor, waiting for the measurement, and doing the math.

```python
# from bh1750.py
@property
def lux(self) -> float:
    """Reads the ambient light in lux."""
    # All this complexity...
    is_one_shot = (self.mode & 0xF0) == 0x20
    if is_one_shot:
        self.set_mode(self.mode, force=True)
    
    # ...is hidden from the user.
    raw_val = self.raw
    lux = (raw_val / 1.2) * (_MTREG_DEFAULT / self.mtreg)
    return lux

# User just does this:
# light = sensor.lux
```

### Principle 4: Teach Your Sensor to Take a Nap

Many sensors, including the BH1750, have low-power modes. For a battery-powered project, this isn't a feature, it's a necessity. A great driver makes power-saving the easy path.

The BH1750 has a "one-shot" mode where it takes a reading and immediately goes back to sleep. Our `lux` property is smart enough to handle this automatically. If it's in one-shot mode, it wakes the sensor up before every reading. The user doesn't have to think about it.

```python
# from bh1750.py
# This logic inside the lux property handles napping automatically.
is_one_shot = (self.mode & 0xF0) == 0x20
if is_one_shot:
    self.set_mode(self.mode, force=True) # Wake up and take a picture!
```

This way, the user can get the latest reading by simply calling `sensor.lux`, and the sensor stays asleep the rest of the time, sipping power like a connoisseur.

### The Glorious Result

When you put it all together, you get application code that is clean, readable, and robust.

```python
import machine
import time
from bh1750 import BH1750, ONE_TIME_HIGH_RESOLUTION

i2c = machine.I2C(0, scl=machine.Pin(9), sda=machine.Pin(8))

# Initialize in a power-saving mode.
sensor = BH1750(i2c, mode=ONE_TIME_HIGH_RESOLUTION)

print("Reading sensor every 5 seconds...")
for _ in range(5):
    try:
        # Just read the property. The driver does all the hard work.
        print(f"Luminosity: {sensor.lux:.2f} lx")
    except OSError as e:
        print(f"Oops, the sensor threw a fit: {e}")
    
    time.sleep(5)
```

So, the next time you write a driver, take a moment to think beyond just making it work. A little bit of discipline can save you a world of pain later and turn your project from a fragile prototype into something you can proudly deploy in the wild.

Check out the full driver and its tests over at the [adyavanapalli/bh1750.py repository on GitHub](https://github.com/adyavanapalli/bh1750.py).
