const password = process.env.SHOWCASE_TEST_PASSWORD ?? "";
console.log(JSON.stringify({ present: Boolean(password) }));
