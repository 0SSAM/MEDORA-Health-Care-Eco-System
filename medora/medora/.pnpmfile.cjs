function readPackage(pkg) {
  if (pkg.name === "express" && pkg.version === "4.21.2") {
    pkg.dependencies = {
      ...pkg.dependencies,
      "body-parser": "1.20.6",
      "path-to-regexp": "0.1.13",
      qs: "6.16.0",
    };
  }

  if (pkg.name === "body-parser" && pkg.version === "1.20.3") {
    pkg.dependencies = {
      ...pkg.dependencies,
      qs: "~6.16.0",
    };
  }

  return pkg;
}

module.exports = {
  hooks: {
    readPackage,
  },
};
