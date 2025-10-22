import {NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "../../auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);
  const accessToken = session?.access_token;
  if (!accessToken)
    return NextResponse.json({error: "UNAUTHORIZED"}, {status: 401});

  const params = new URLSearchParams({
    q: "mimeType='application/vnd.google-apps.document' and trashed=false",
    fields: "files(id,name,modifiedTime)",
    orderBy: "modifiedTime desc",
    pageSize: "10",
    spaces: "drive",
  });

  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?${params}`,
    {
      headers: {Authorization: `Bearer ${accessToken}`},
      cache: "no-store",
    }
  );

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json(
      {error: text || "Drive API error"},
      {status: res.status}
    );
  }

  const data = await res.json();
  return NextResponse.json({files: data.files ?? []});
}
