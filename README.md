<p align="center">
  <img alt="Logo" src="docs/public/android-chrome-192x192.png" />
</p>

# RomPatcher.ts
> Zero-dependency JS ROM patching library for browsers

### [Installable (PWA) Web Demo](https://dragonsnapx.github.io/rompatcher-ts/)

RomPatcher.ts is a re-write of MarcroBledo's [RomPatcher.js](https://www.marcrobledo.com/RomPatcher.js/) - providing modularity, typing & simplicity.

To install, run

```npm
npm install rompatcher-ts
```

As of now, only Browsers are supported. For Node support, check out [node-rompatcher](https://gitlab.com/hearthero/node-rompatcher/-/blob/master/package.json) on Gitlab.

## Supported Formats

- BPS
- UPS
- IPS

*PR Contributions for more formats are welcome.*

## Usage

```typescript
import Patcher from 'rompatcher-ts';

// 1. Initialize a patcher instance with a format.
const patcher = new Patcher([
  new IPSPattern,
  new BPSPattern,
  new UPSPattern
]);

// 2. Load ROM file
patcher.setROMFile(romFile);

// 3. Load Patch file asynchronously (2 & 3 can be interchanged)
try {
  await patcher.setPatchFile(patchFile)
} catch(e) {
  // Cannot recognize type of patch file
}

// This returns the pattern that will be used - i.e. IPS
// Must be called after patch file is loaded.
const patternToUse: string = patcher.pattern;

// 4. Load files asynchronously
await patcher.loadFiles();

// 5. Parse files
patcher.parseFile();

// 6. Patch the ROM
const resultPreparedFile = patcher.patch();

// 7. The blob can be obtained by calling export() on the resulting PreparedPatchFile.
const resBlob: Blob = resultPreparedFile.export();

```

## API & Helpers

### Patcher `Patcher.ts`
- `constructor(patternsToLoad: IPatchPattern[])` <br>
Initialize a patcher instance with the patterns to be used.


- `async setPatchFile(patchFile: File): Promise<void>` <br>
Asynchronously sets a patch file, which determines the type of the patch file supplied. If it is not recognized, it throws an Error.


- `setROMFile(romFile: File)` <br>
Sets a ROM file to be patched


- `async loadFiles()` <br>
Asynchronously loads the supplied ROM file & patch file into the stateful supplied pattern. Throws an error if both are not supplied.


- `parseFile()` <br>
Parses the supplied ROM file & patch file with the supplied pattern. Throws an error if both are not supplied.


- `patch(validateStrictly = false)` (Do not change validateStrictly) <br>
Patches the ROM file with the patch file, returning a `PreparedPatchFile` instance with the resulting file.

### Utils `utils/crc.ts`

- `crc32Table()` <br>
Generates a CRC32 table. Caching recommended.


- `crc32(preparedPatcherFile: PreparedPatchFile, headerSize: number | boolean, ignoreLastFourBytes: boolean)` <br>
Uses a CRC32 table to return a crc32 value for checksum purposes.

### PreparedPatchFile `utils.ts`

- `static async create(file: File)` <br>
Asynchronously create an instance of a `PreparedPatchFile`, using the `load` function.


- `static createEmpty(size: number)` <br>
Ccreate an instance of a `PreparedPatchFile`, Create an empty PreparedPatchFile with the size of the provided integer.


- `async load(file: File)` <br>
Asynchronously load the supplied file, which creates an internal Uint8Array byte array of the data.


- `public copyTo(target: PreparedPatchFile, offsetSource: number, length?: number, offsetTarget: number = offsetSource)` <br>
Copy the current instance to the target.


- `seek(offset: number)` <br>
Set internal offset to offset.


- `skip(offset: number)` <br>
Skip internal offset by the value of offset.


- `slice(offset: number, length?: number)` <br>
Create a copy of the current file, starting from the offset of the current file with the length of the provided number. Returns the new file.

- `isEOF()` <br>
Returns if the internal offset counter is at the end of file.


- `readString(len: number)` <br>
Reads the string of byte array. Adds to internal offset counter by len.


- `readBytes(len: number)` <br>
Reads the bytes of the byte array. Adds to internal offset counter by len.


- `writeBytes(len: number)` <br>
Reads the bytes of the byte array. Adds to internal offset counter by len.


- `read/writeU*(forceLittleEndian?: boolean = false)` <br>
Reads or writes bits. forceLittleEndian options are for U16 and higher. Increases the internal offset counter by bytes read or written.


- `export()` <br>
Returns a `Blob` of the current instance.

## Writing Patterns

All patterns extend `IPatchPattern`, where you must implement these methods:

```typescript
interface IPatchPattern {
  // Magic string for patch formats - i.e. BPS - "BPS1"
  MAGIC: string;

  // Constructor. Load the rom file & the patch file here, using
  // PreparedPatchFile.create(romFile | patchFile) here.
  // Initialize class variables here too.
  // Load the romFile and the patchFile as a class variable.
  init(romFile: File, patchFile: File): void;

  // Parse the patch file - current implementations use an array
  // to go through the Uint8Array and digest it to array of records or actions.
  parse(): void;

  // Create an output file with createEmpty(), and using the array of
  // records/actions created in parse(), write to the output file.
  // This varies by format.
  patch(strictValidation?: boolean): PreparedPatchFile;

  // Uses header to check if it belongs to the pattern.
  belongsTo(header: string): boolean;

  // Name of the patch - i.e. ups - "ups"
  name(): string;
}
```

Refer to implemented examples and MarcroBledo's [RomPatcher.js](https://www.marcrobledo.com/RomPatcher.js/).

## Contributing

- Run prettier
- Respect ESLint rules
- Testing before creating a PR. Unfortunately, tests cannot be done due to licensing issues for Nintendo ROMs.
- For changing content inside `/docs/` folder (which is the demo app), run `npm run docs:build` before pushing.

## Examples

View the source code for the web demo in the `docs/` directory, or go [here](https://dragonsnapx.github.io/rompatcher-ts/) for the installable live demo.

## License

This library is licensed under GPLv3.
