"use client";

import {useState, useCallback, useRef} from "react";
import {signIn, signOut, useSession} from "next-auth/react";
import Terminal from "./components/Terminal";

type GDoc = {id: string; name: string};

export default function Home() {
  const {data: session} = useSession();

  const [logs, setLogs] = useState<string[]>([
    "Welcome to PapiOS v1.0",
    "----------------------------------------",
    "System online. Type a prompt or use:",
    "^G  Google (list docs)  ·  clear  ·  export  ·  help",
    "Examples: google login | google docs | export new <title> | export to <#>",
    "----------------------------------------",
  ]);

  const [docs, setDocs] = useState<GDoc[]>([]);

  const logsRef = useRef(logs);
  const docsRef = useRef(docs);
  logsRef.current = logs;
  docsRef.current = docs;

  const append = (line: string) => setLogs((l) => [...l, line]);
  const replaceThinking = (line: string) =>
    setLogs((l) => (l.length ? [...l.slice(0, -1), line] : [line]));

  const handleCommand = useCallback(
    async (raw: string) => {
      const cmd = raw.trim();
      const lower = cmd.toLowerCase();

      if (lower === "help") {
        setLogs((l) => [
          ...l,
          "> help",
          "Available commands:",
          "  help                 - show this text",
          "  clear                - clear the screen",
          "  sudo reboot          - clear storage and sign out",
          "  export               - export (guided)",
          "  export new <title>   - create a new Google Doc",
          "  export to <#>        - append to one of your listed docs",
          "  google login         - sign in to Google",
          "  google docs          - list recent Google Docs",
          "  (anything else)      - send to Claude",
        ]);
        return;
      }

      if (lower === "clear") {
        setLogs([]);
        return;
      }

      if (lower === "sudo reboot") {
        append("> Requesting elevated privileges…");
        await new Promise((r) => setTimeout(r, 600));
        append("> Access granted.");
        await new Promise((r) => setTimeout(r, 400));
        append("> Rebooting system…");

        try {
          await signOut({redirect: false});
        } catch {}

        // Clear client-side data
        localStorage.clear();
        sessionStorage.clear();
        document.cookie.split(";").forEach((c) => {
          document.cookie = c
            .replace(/^ +/, "")
            .replace(/=.*/, `=;expires=${new Date(0).toUTCString()};path=/`);
        });

        await new Promise((r) => setTimeout(r, 800));
        append("> Shutting down sessions…");
        await new Promise((r) => setTimeout(r, 600));
        append("> Wiping caches…");
        await new Promise((r) => setTimeout(r, 600));
        append("> System reboot complete. Type `help` to begin anew.");
        return;
      }

      if (lower === "export") {
        if (!session?.access_token) {
          append("> Not logged in. Opening Google sign-in…");
          await signIn("google");
          return;
        }
        append(
          "> Tip: use `google docs` to pick a file, or `export new <title>`."
        );
        return;
      }

      if (lower === "google login") {
        if (session?.access_token) {
          append("> Already connected to Google.");
        } else {
          append("> Opening Google sign-in…");
          await signIn("google");
        }
        return;
      }

      if (lower === "google docs") {
        if (!session?.access_token) {
          append("> Not logged in. Type `google login`.");
          return;
        }
        append("> Fetching recent Google Docs…");
        const res = await fetch("/api/google/docs");
        if (res.status === 401) {
          append("> Session expired. Type `google login`.");
          return;
        }
        const data = await res.json();
        const files: GDoc[] = data.files || [];
        setDocs(files);

        if (!files.length) {
          append("> No docs found. Use `export new <title>` to create one.");
        } else {
          setLogs((l) => [
            ...l,
            ...files.map((f, i) => `  [${i + 1}] ${f.name} (${f.id})`),
            "Use: `export to <#>` to append your session.",
          ]);
        }
        return;
      }

      if (lower.startsWith("export new")) {
        if (!session?.access_token) {
          append("> Not logged in. Type `google login`.");
          return;
        }
        const title =
          cmd.replace(/^export new\s*/i, "").trim() || "PapiOS Export";
        append(`> Creating Google Doc "${title}"…`);

        const payload = {
          mode: "create",
          title,
          content: logsRef.current.join("\n") + "\n",
        };

        const res = await fetch("/api/google/export", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        append(
          res.ok
            ? `> Created: ${data.documentId}`
            : `> Error: ${data.error || "Export failed"}`
        );
        return;
      }

      if (lower.startsWith("export to")) {
        if (!session?.access_token) {
          append("> Not logged in. Type `google login`.");
          return;
        }
        const idx = Number(cmd.replace(/^export to\s*/i, ""));
        const file = docsRef.current[idx - 1];
        if (!file) {
          append("> Unknown index. Run `google docs` first.");
          return;
        }
        append(`> Appending to "${file.name}"…`);
        const payload = {
          mode: "append",
          documentId: file.id,
          content: logsRef.current.join("\n") + "\n",
        };
        const res = await fetch("/api/google/export", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        append(
          res.ok
            ? `> Appended to: ${data.documentId}`
            : `> Error: ${data.error || "Append failed"}`
        );
        return;
      }

      setLogs((l) => [...l, `> ${raw}`, "> Thinking…"]);

      try {
        const res = await fetch("/api/claude", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({messages: [{role: "user", content: raw}]}),
        });

        if (!res.ok || !res.body) {
          replaceThinking(`Error: ${res.statusText}`);
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const {done, value} = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, {stream: true});
          accumulated += chunk;
          replaceThinking("> " + accumulated.trim());
        }

        replaceThinking("> " + accumulated.trim());
      } catch (e: any) {
        replaceThinking(`Error: ${e.message}`);
      }
    },
    [session?.access_token]
  );

  const shortcuts = {
    g: () => handleCommand("google docs"), // ^G
    k: () => setLogs([]),
  };

  return (
    <Terminal logs={logs} onCommand={handleCommand} shortcuts={shortcuts} />
  );
}
