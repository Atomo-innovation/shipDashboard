const fs = require("fs");
const path = require("path");

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(from, to);
    else fs.copyFileSync(from, to);
  }
}

const outStatic = path.join(".vercel", "output", "static");
fs.rmSync(outStatic, { recursive: true, force: true });
copyDir("public", outStatic);

const config = {
  version: 3,
  routes: [
    { src: "/api/(.*)", dest: "/api/$1" },
    { handle: "filesystem" },
    { src: "/twin", dest: "/three_realistic.html" },
  ],
};

fs.mkdirSync(path.join(".vercel", "output"), { recursive: true });
fs.writeFileSync(
  path.join(".vercel", "output", "config.json"),
  JSON.stringify(config, null, 2)
);

console.log("Vercel static output ready:", outStatic);
