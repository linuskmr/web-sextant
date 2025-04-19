# Sextant-Calculator

[Live Demo](https://sextant.linu.sk/)

A sextant is an old nautical instrument to measure the angle between the sun and the horizon. Together with a clock, this can be used to determine the observer's position on the earth. In the following, it is first motivated why a sextant can still be useful although we have much more precise and easier ways to determine the position like GPS. Then, the sextant is introduced in more detail, limitations are mentioned and other approaches are discussed before going into the actual computations involved in determining the position using a sextant measurement. To avoid doing the computations by hand, the [sextant calculator](./calculator/) can be used, which is implemented as a [Rust library](https://github.com/linuskmr/sextant-rs) executed in the browser via WebAssembly. The [sextant emulator](./emulator/) uses the camera and the gyroscope of the device (e.g. smartphone) to do a sextant measurement without needing a real sextant. For an introduction into the topic, see `index.html` in this repository (also hosted at [sextant.linu.sk](https://sextant.linu.sk)).


## Install

The WebAssembly wrapper (in `sextant-wasm-lib/`) for the [sextant calculation library](https://github.com/linuskmr/sextant-rs) needs to be build first. This requires the Rust toolchain and the `wasm-pack` tool. See [rustwasm.github.io](https://rustwasm.github.io/wasm-pack/installer/) on how to install it. Then, the sextant WebAssembly library can be built by invoking `make`.

The sextant web application itself is static HTML, CSS, JavaScript and WebAssembly, and can simply be served by any HTTP file server.


<br>

---

> Acknowledgements: This project is based on group work done for the course "Design of WWW Services" at Aalto University with Theodora Papakonstantinou and Patrik Palviainen. It was implemented in Svelte and also featured a backend with a database for additional features not implemented here.  
This repository is a re-implementation with a focus on simplicity, as no frontend framework is used. The [Rust sextant calculation library](https://github.com/linuskmr/sextant-rs) always has been solely my own project.