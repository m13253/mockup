.PHONY: all clean

all: scripts.js

clean:
	rm -f scripts.js scripts.js.map

scripts.js: scripts.ts
	tsc -t ES2019 -m amd --lib esnext,dom --sourceMap --strict $<
