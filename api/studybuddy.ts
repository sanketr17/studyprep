import type { IncomingMessage, ServerResponse } from 'node:http';
import { generateStudyBuddyReply, StudyBuddyServiceError } from '../src/services/studyBuddyService';

type VercelRequest = IncomingMessage & { body?: unknown };
type VercelResponse = ServerResponse & {
  status: (code: number) => VercelResponse;
  json: (body: unknown) => void;
};

async function readBody(request: VercelRequest): Promise<unknown> {
  if (request.body !== undefined) return request.body;

  let raw = '';
  for await (const chunk of request) raw += chunk;
  if (!raw) return undefined;
  try {
    return JSON.parse(raw);
  } catch {
    throw new StudyBuddyServiceError('Request body must be valid JSON.', 400, 'INVALID_JSON');
  }
}

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    response.statusCode = 405;
    response.end(JSON.stringify({ error: 'Method not allowed.', code: 'METHOD_NOT_ALLOWED' }));
    return;
  }

  try {
    const result = await generateStudyBuddyReply(await readBody(request));
    response.status(200).json(result);
  } catch (error) {
    const serviceError = error instanceof StudyBuddyServiceError ? error : null;
    if (!serviceError) console.error('StudyBuddy unexpected API error:', error);
    response.status(serviceError?.status || 500).json({
      error: serviceError?.message || 'Internal server error.',
      code: serviceError?.code || 'INTERNAL_ERROR',
    });
  }
}