import {
  isRoleMatch,
  normalizeRoleForComparison,
  isAdminRole,
} from "../src/lib/roles";

function assert(cond: boolean, msg: string) {
  if (!cond) {
    console.error("FAILED:", msg);
    process.exitCode = 1;
  } else {
    console.log("OK:", msg);
  }
}

console.log("Running minimal role helper checks...");

// ppdb_admin legacy token should match PPDB_ADMIN enum and vice-versa
assert(
  isRoleMatch("ppdb_admin", ["ppdb_admin"]),
  "'ppdb_admin' matches itself"
);
assert(
  isRoleMatch("ppdb_admin", ["PPDB_ADMIN"]),
  "'ppdb_admin' matches 'PPDB_ADMIN'"
);
assert(
  isRoleMatch("PPDB_ADMIN", ["ppdb_admin"]),
  "'PPDB_ADMIN' matches 'ppdb_admin'"
);

// admin checks
assert(isAdminRole("admin"), "'admin' -> is admin");
assert(isAdminRole("ADMIN"), "'ADMIN' -> is admin");

// normalization behavior
assert(
  normalizeRoleForComparison("ppdb_admin") === "ppdb_admin",
  "normalize 'ppdb_admin' -> 'ppdb_admin'"
);

console.log("\nDone. If any assertions failed, check exit code.");
