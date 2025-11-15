
export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface BestFrameResponse {
  frameNumber: number;
  reasoning: string;
}
