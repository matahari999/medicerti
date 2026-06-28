export async function retrieveRelevantChunks(
  query: string,
  hospitalType?: string,
  apiKey?: string,
  topK?: number,
): Promise<Array<{ content: string; chapterNumber: string | null; itemNumber: string | null; score: number }>> {
  return [];
}
