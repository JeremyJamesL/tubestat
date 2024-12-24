# Tubestats

Get the status of the London tube from the command line.

Check which lines are down or delayed without having to go to TFL's website

## Installation

Globally

```console
npm install tubestat
```

Just to run once

```console
npx tubestat
```

## Usage

Status of all lines

```console
tubestat
```

Status of one line

```console
tubestat --line bakerloo
```

Status of multiple lines

```console
tubestat --line bakerloo,victoria
```

Detailed view.

```console
tubestat -D --l  bakerloo
```
