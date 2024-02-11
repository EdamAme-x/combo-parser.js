import { ComboParser } from "./parser/mod.ts";

const filePath = prompt("Enter combo file path: ", import.meta.resolve("./"))
  ?.replace(/^file:\/\/\//, "").replace(/^\"/, "").replace(/\"$/, "");

if (!filePath) {
  console.error("No file path provided.");
  Deno.exit(1);
}

try {
  if (!(await Deno.stat(filePath)).isFile) {
    console.error("Invalid file path.");
    Deno.exit(1);
  }
} catch (error) {
  console.error(`Error getting file status: ${error}`);
  Deno.exit(1);
}

let file;
try {
  console.log(`Opening file: ${filePath}`);
  file = await Deno.open(filePath, { read: true });
} catch (error) {
  console.error(`Error opening file: ${error}`);
  Deno.exit(1);
}

const reader = new TextDecoder("utf-8");
const stream = Deno.iter(file);

const outputPath = filePath + ".result.txt";
try {

  await Deno.create(outputPath);
    
  if ((await Deno.stat(outputPath)).isFile) {
    console.log(`Removing existing output file: ${outputPath}`);
    await Deno.remove(outputPath);
    console.log(`Creating output file: ${outputPath}`);
    await Deno.create(outputPath);
  }
} catch (error) {
  console.error(`Error creating output file: ${error}`);
  Deno.exit(1);
}
const searchValue = prompt("Enter search value: ") ?? "";

const minPasswordLength = prompt(
  "Enter minimum password length (default: 4): ",
  "4",
)

if (!minPasswordLength || isNaN(Number(minPasswordLength))) {
  console.error("No minimum password length provided.");
  Deno.exit(1);
}

const comboParser = new ComboParser(
  searchValue,
  Number(minPasswordLength),
)

let index = 0;

const alreadyURL = new Set();

try {
  let buffer = "";
  for await (const chunk of stream) {
    buffer += reader.decode(chunk, { stream: true });
    let newLineIndex;
    while ((newLineIndex = buffer.indexOf("\n")) !== -1) {
      const line = buffer.slice(0, newLineIndex);
      buffer = buffer.slice(newLineIndex + 1);
      const parsed = comboParser.parse(line);

      if (index % 10000 === 0) {
        console.log(`Processed ${index} lines...`);
      }

      if (parsed.success) {
        if (!alreadyURL.has(parsed.url)) {
          alreadyURL.add(parsed.url);
          await Deno.writeTextFile(outputPath + ".urls.txt", parsed.url + "\n", { append: true });
        }
      }
      index++;
    }
  }
} catch (error) {
  console.error(`Error processing file: ${error}`);
  Deno.exit(1);
} finally {
  file.close();
  Deno.exit(0);
}
