# KISSEZ

A frontend for manga scraping & reading, keeping it simple and stupid.

## Installing

Download the corresponding zip file from the releases page for your operating system. Unzip the file, and run the server executable. Finally, open `http://localhost:8080` in the browser.

If you're on MacOS or binary releases are not available, you can also compile manually.

### Pre Reqs

Install `cargo`, `node`, and `pnpm`, then clone this repo.

```shell
git clone https://github.com/SpicyRicecaker/kissez.git
pnpm i
pnpm dist
cd server && cargo run --release
# or cargo build --release if you don't want to open the binary right away
```

## Developing

To run things in development, clone this repository, initialize the (currently private) submodules, then

```shell
# in the root directory
# initialize the server, which is in charge of making cross-origin requests
cd server && cargo run
# frontend that the server serves
pnpm i
pnpm run dev
```

The vite server opens on port 3000, and during development proxies requests to the rust server on port 8080, while enabling live reload. Check the `server` section of `vite.config.ts` for more details.

Highly recommend disabling `eslint` during development.
