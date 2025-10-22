import {NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "../../auth/[...nextauth]/authOptions";

type Body = {
  mode: "create" | "append";
  title?: string;
  documentId?: string;
  content: string;
};

async function docsFetch(path: string, token: string, init: RequestInit) {
  const res = await fetch(`https://docs.googleapis.com/v1/${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init.headers || {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || `Docs API request failed: ${res.status}`);
  }

  return res.json();
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const accessToken = (session as any)?.access_token;

    if (!accessToken) {
      return NextResponse.json({error: "UNAUTHORIZED"}, {status: 401});
    }

    const body = (await req.json()) as Body;

    if (body.mode === "create") {
      const created = await docsFetch("documents", accessToken, {
        method: "POST",
        body: JSON.stringify({title: body.title ?? "PapiOS Export"}),
      });

      await docsFetch(
        `documents/${created.documentId}:batchUpdate`,
        accessToken,
        {
          method: "POST",
          body: JSON.stringify({
            requests: [
              {
                insertText: {
                  text: body.content,
                  location: {index: 1},
                },
              },
            ],
          }),
        }
      );

      return NextResponse.json({ok: true, documentId: created.documentId});
    }

    if (body.mode === "append" && body.documentId) {
      const doc = await docsFetch(`documents/${body.documentId}`, accessToken, {
        method: "GET",
      });

      const endIndex: number = doc.body.content.at(-1)?.endIndex ?? 1;

      await docsFetch(`documents/${body.documentId}:batchUpdate`, accessToken, {
        method: "POST",
        body: JSON.stringify({
          requests: [
            {
              insertText: {
                text: body.content,
                location: {index: endIndex - 1},
              },
            },
          ],
        }),
      });

      return NextResponse.json({ok: true, documentId: body.documentId});
    }

    return NextResponse.json({error: "Bad request"}, {status: 400});
  } catch (err: any) {
    console.error("Docs API error:", err);
    return NextResponse.json(
      {error: err.message || "Internal Server Error"},
      {status: 500}
    );
  }
}
