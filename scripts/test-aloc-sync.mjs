const token = process.env.ALOC_ACCESS_TOKEN || "QB-05efc0cc3a1ed7a0b78d";

async function run() {
  console.log("Testing ALOC API fetch with token:", token.slice(0, 5) + "...");
  const url = "https://questions.aloc.com.ng/api/v2/m/5?subject=biology&type=wassce";
  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      AccessToken: token,
    },
  });

  console.log("ALOC Response status:", res.status);
  const json = await res.json();
  console.log("Total received:", json.data?.length);

  if (Array.isArray(json.data) && json.data.length > 0) {
    const q = json.data[0];
    console.log("Sample question:", q.question);
    console.log("Options:", q.option);
    console.log("Answer key:", q.answer);
    console.log("Exam type:", q.examtype, "Year:", q.examyear);
    console.log("✅ ALOC WAEC questions API test passed successfully!");
  } else {
    console.error("❌ Unexpected response structure:", json);
  }
}

run().catch(console.error);
