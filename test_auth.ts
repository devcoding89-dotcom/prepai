import { admin, T, supabaseRepo } from "./src/lib/db/supabase";
import { signUp, signIn } from "./src/lib/auth";

async function test() {
  try {
    console.log("Testing Supabase connection...");
    console.log("T('profiles'):", T("profiles"));
    
    // Check if profiles table exists and can be queried
    const { data, error } = await admin().from(T("profiles")).select("count", { count: "exact", head: true });
    console.log("Profiles check:", { count: data, error });

    // Check auth.admin
    const users = await admin().auth.admin.listUsers({ page: 1, perPage: 5 });
    console.log("Auth users check:", { count: users.data?.users?.length, error: users.error });
  } catch (err) {
    console.error("Test failed:", err);
  }
}

test();
