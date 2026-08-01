export interface HtmlClient {
  get(url: string): Promise<string>;
}