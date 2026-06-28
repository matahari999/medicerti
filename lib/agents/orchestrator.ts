import { writerAgent } from './writer';
import { reviewerAgent } from './reviewer';
import { managerAgent } from './manager';
import { retrieveRelevantChunks } from '@/lib/rag';

export interface AgentPipelineResult {
  documentJson: string;
  parsedDocument: any;
  reviewResult: { score: number; passed: boolean; issues: any[]; summary: string };
  managerResult: { overallScore: number; grade: string; improvementSuggestions: string[]; suggestedStatus: string; nextActions: string[] };
  ragChunks: Array<{ content: string; chapterNumber: string | null; itemNumber: string | null; score: number }>;
  pipelineTimeMs: number;
  stages: Array<{ name: string; durationMs: number }>;
}

export async function runAgentPipeline(
  userRequest: string,
  hospitalType: string,
  hospitalName: string,
  apiKey: string,
): Promise<AgentPipelineResult> {
  const startAll = Date.now();
  const stages: Array<{ name: string; durationMs: number }> = [];

  // Stage 1: RAG 검색
  const ragStart = Date.now();
  let ragChunks: Array<{ content: string; chapterNumber: string | null; itemNumber: string | null; score: number }> = [];
  try {
    ragChunks = await retrieveRelevantChunks(userRequest, hospitalType, apiKey, 5);
  } catch (e) {
    console.error('[Orchestrator] RAG 검색 실패:', e);
  }
  stages.push({ name: 'RAG 검색', durationMs: Date.now() - ragStart });

  const ragContext = ragChunks
    .map(c => `[${c.chapterNumber || ''} ${c.itemNumber || ''}] ${c.content} (유사도: ${(c.score * 100).toFixed(0)}%)`)
    .join('\n\n');

  // Stage 2: 작성 에이전트
  const writeStart = Date.now();
  let documentJson: string;
  try {
    documentJson = await writerAgent(userRequest, hospitalType, hospitalName, ragContext, apiKey);
  } catch (e) {
    throw new Error(`문서 작성 실패: ${e instanceof Error ? e.message : String(e)}`);
  }
  stages.push({ name: '작성 에이전트', durationMs: Date.now() - writeStart });

  // JSON 파싱
  let parsedDocument: any = {};
  try {
    const cleaned = documentJson.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
    parsedDocument = JSON.parse(cleaned);
  } catch {
    parsedDocument = { raw: documentJson.slice(0, 1000) };
  }

  // Stage 3: 검토 에이전트
  const reviewStart = Date.now();
  const reviewResult = await reviewerAgent(documentJson, hospitalType, apiKey);
  stages.push({ name: '검토 에이전트', durationMs: Date.now() - reviewStart });

  // Stage 4: 매니저 에이전트
  const mgrStart = Date.now();
  const managerResult = await managerAgent(documentJson, JSON.stringify(reviewResult), apiKey);
  stages.push({ name: '매니저 에이전트', durationMs: Date.now() - mgrStart });

  return {
    documentJson,
    parsedDocument,
    reviewResult,
    managerResult,
    ragChunks,
    pipelineTimeMs: Date.now() - startAll,
    stages,
  };
}
