# KISSEZ

A frontend for manga scraping & reading, keeping it simple and stupid.

![image](https://user-images.githubusercontent.com/54951411/189483767-646df960-4cf1-45fd-86d0-670068da6cbb.png)

## Installing

Download the corresponding zip file from the releases page for your operating system. Unzip the file, and run the server executable. Finally, open `http://localhost:8080` in the browser.

On linux, run `chmod +rwx server` to make the server file executable. 

If you're on MacOS or binary releases are not available, you can also compile manually below.

## Compiling

### Requirements

Install `cargo`, `node`, and `pnpm`, then clone this repo.

```shell
git clone https://github.com/SpicyRicecaker/kissez.git
git submodule init
git submodule update
pnpm i
pnpm dist
cd server && cargo run --release
# or cargo build --release if you don't want to open the binary right away
```

## Development

```shell
# in repo root
pnpm run dev
# in second terminal
cd server && cargo run
```

The vite development server listens on port 3000, and during development proxies requests to the rust server on port 8080, while enabling live reload. Check the `server` section of `vite.config.ts` for more details.

Highly recommend disabling `eslint` during development.
