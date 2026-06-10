// Showcase público de un proyecto — sirve solo el subconjunto "showcase"
// del .rz-manifest.json (sin reglas críticas, presupuesto ni umbrales).

import { NextRequest, NextResponse } from "next/server";
import { publicShowcase } from "@/lib/manifest";

type Params = { params: Promise<{ projectId: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { projectId } = await params;
  const showcase = publicShowcase(projectId);

  if (!showcase) {
    return NextResponse.json({ error: "proyecto sin manifiesto" }, { status: 404 });
  }

  return NextResponse.json(showcase);
}
