// Integración GitHub API (doc §4) — ramas aisladas, PRs y merge tras "Va que Va".
// Se activa configurando GITHUB_TOKEN. El repo objetivo viene del manifiesto
// de cada proyecto (campo "repo"). REST puro, sin octokit.

import type { RzManifest } from "./manifest";

const API = "https://api.github.com";

export function githubConfigured(): boolean {
  return !!process.env.GITHUB_TOKEN;
}

function headers() {
  return {
    "Authorization":        `Bearer ${process.env.GITHUB_TOKEN}`,
    "Accept":               "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "Content-Type":         "application/json",
  };
}

export interface GitHubResult {
  ok:      boolean;
  message: string;
  url?:    string;
}

type Repo = { owner: string; name: string; default_branch: string };

function repoFromManifest(manifest: RzManifest | null): Repo | null {
  return manifest?.repo ?? null;
}

/** Crea una rama temporal ai-feature/* copiando HEAD de la rama principal (doc §4 aislamiento). */
export async function createBranch(manifest: RzManifest | null, slug: string): Promise<GitHubResult> {
  const repo = repoFromManifest(manifest);
  if (!githubConfigured()) return { ok: false, message: "GITHUB_TOKEN no configurado" };
  if (!repo) return { ok: false, message: "el manifiesto del proyecto no declara repositorio" };

  const refRes = await fetch(`${API}/repos/${repo.owner}/${repo.name}/git/ref/heads/${repo.default_branch}`, { headers: headers() });
  if (!refRes.ok) return { ok: false, message: `no se pudo leer ${repo.default_branch} (${refRes.status})` };
  const sha = (await refRes.json()).object?.sha;

  const branch = `ai-feature/${slug}`;
  const createRes = await fetch(`${API}/repos/${repo.owner}/${repo.name}/git/refs`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ ref: `refs/heads/${branch}`, sha }),
  });

  if (createRes.status === 422) return { ok: true, message: `rama ${branch} ya existe` };
  if (!createRes.ok) return { ok: false, message: `error al crear rama (${createRes.status})` };
  return { ok: true, message: `rama ${branch} creada desde ${repo.default_branch}` };
}

/** Busca el PR abierto más reciente con prefijo ai-feature/. */
export async function findOpenAiPr(manifest: RzManifest | null): Promise<{ number: number; url: string } | null> {
  const repo = repoFromManifest(manifest);
  if (!githubConfigured() || !repo) return null;

  const res = await fetch(
    `${API}/repos/${repo.owner}/${repo.name}/pulls?state=open&sort=created&direction=desc&per_page=20`,
    { headers: headers() },
  );
  if (!res.ok) return null;
  const prs = (await res.json()) as { number: number; html_url: string; head: { ref: string } }[];
  const aiPr = prs.find((p) => p.head.ref.startsWith("ai-feature/"));
  return aiPr ? { number: aiPr.number, url: aiPr.html_url } : null;
}

/** Merge del PR de IA abierto (tras "Va que Va" + aprobación del Juez de Hierro). */
export async function mergeAiPr(manifest: RzManifest | null): Promise<GitHubResult> {
  const repo = repoFromManifest(manifest);
  if (!githubConfigured()) return { ok: false, message: "GITHUB_TOKEN no configurado — merge registrado en acta, sin acción remota" };
  if (!repo) return { ok: false, message: "sin repositorio en el manifiesto — merge registrado en acta, sin acción remota" };

  const pr = await findOpenAiPr(manifest);
  if (!pr) return { ok: false, message: "no hay PR de ia (ai-feature/*) abierto en el repositorio" };

  const res = await fetch(`${API}/repos/${repo.owner}/${repo.name}/pulls/${pr.number}/merge`, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify({ merge_method: "squash" }),
  });

  if (!res.ok) return { ok: false, message: `github rechazó el merge del PR #${pr.number} (${res.status})`, url: pr.url };
  return { ok: true, message: `PR #${pr.number} fusionado a ${repo.default_branch}`, url: pr.url };
}

/** Purga: cierra el PR de IA y borra la rama temporal ("Darle cuello"). */
export async function purgeAiPr(manifest: RzManifest | null): Promise<GitHubResult> {
  const repo = repoFromManifest(manifest);
  if (!githubConfigured()) return { ok: false, message: "GITHUB_TOKEN no configurado — purga registrada en acta, sin acción remota" };
  if (!repo) return { ok: false, message: "sin repositorio en el manifiesto — purga registrada en acta, sin acción remota" };

  const pr = await findOpenAiPr(manifest);
  if (!pr) return { ok: false, message: "no hay PR de ia abierto que purgar" };

  // Leer la rama del PR antes de cerrarlo
  const prRes = await fetch(`${API}/repos/${repo.owner}/${repo.name}/pulls/${pr.number}`, { headers: headers() });
  const branch: string | undefined = prRes.ok ? (await prRes.json()).head?.ref : undefined;

  const closeRes = await fetch(`${API}/repos/${repo.owner}/${repo.name}/pulls/${pr.number}`, {
    method: "PATCH",
    headers: headers(),
    body: JSON.stringify({ state: "closed" }),
  });
  if (!closeRes.ok) return { ok: false, message: `no se pudo cerrar el PR #${pr.number} (${closeRes.status})` };

  if (branch?.startsWith("ai-feature/")) {
    await fetch(`${API}/repos/${repo.owner}/${repo.name}/git/refs/heads/${branch}`, {
      method: "DELETE",
      headers: headers(),
    });
  }

  return { ok: true, message: `PR #${pr.number} cerrado y rama temporal destruida`, url: pr.url };
}
