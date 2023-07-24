export interface ImageData {
  name: string;
  description: string;
  url: string;
  tags: { name: string; confidence: number }[];
  created_at: Date; // Modifiez le type en string
}

