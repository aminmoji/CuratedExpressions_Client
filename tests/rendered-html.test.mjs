import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("defines Curated Expressions metadata and social preview", async () => {
  const layout = await readFile(new URL("../app/layout.tsx", import.meta.url), "utf8");

  assert.match(layout, /title: "Curated Expressions"/);
  assert.match(
    layout,
    /A considered collection of original art from independent makers\./,
  );
  assert.match(layout, /url: "\/og\.png"/);
});

test("configures durable artwork and image storage", async () => {
  const wrangler = JSON.parse(
    await readFile(new URL("../wrangler.jsonc", import.meta.url), "utf8"),
  );
  const migration = await readFile(
    new URL("../drizzle/0000_new_liz_osborn.sql", import.meta.url),
    "utf8",
  );
  const profileMigration = await readFile(
    new URL("../drizzle/0001_funny_the_professor.sql", import.meta.url),
    "utf8",
  );
  const signupPage = await readFile(
    new URL("../app/signup/page.tsx", import.meta.url),
    "utf8",
  );

  assert.equal(wrangler.d1_databases[0].binding, "DB");
  assert.equal(wrangler.r2_buckets[0].binding, "BUCKET");
  assert.match(migration, /CREATE TABLE `artworks`/);
  assert.match(migration, /CREATE UNIQUE INDEX `artworks_slug_unique`/);
  assert.match(profileMigration, /CREATE TABLE `artist_profiles`/);
  assert.match(profileMigration, /artist_profiles_email_unique/);
  assert.doesNotMatch(signupPage, /ChatGPT/);
  assert.match(signupPage, /SignupForm/);
});

test("uses Firebase email and Google authentication", async () => {
  const signupForm = await readFile(
    new URL("../app/signup/SignupForm.tsx", import.meta.url),
    "utf8",
  );
  const serverAuth = await readFile(
    new URL("../lib/firebase-auth-server.ts", import.meta.url),
    "utf8",
  );

  assert.match(signupForm, /createUserWithEmailAndPassword/);
  assert.match(signupForm, /sendEmailVerification/);
  assert.match(signupForm, /GoogleAuthProvider/);
  assert.match(serverAuth, /accounts:lookup/);
});
