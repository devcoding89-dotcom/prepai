async function run() {
  try {
    const res = await fetch("http://localhost:3000/auth/signup");
    console.log("Signup page status:", res.status);
    const text = await res.text();
    console.log("Signup page HTML snippet:", text.slice(0, 300));
  } catch (err) {
    console.error("Fetch failed:", err);
  }
}
run();
