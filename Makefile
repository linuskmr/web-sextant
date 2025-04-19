.PHONY: build-wasm

build-wasm:
	wasm-pack build sextant-wasm-lib/ --target web