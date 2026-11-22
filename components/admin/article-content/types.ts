export type BlockType =
  | "paragraph"
  | "heading"
  | "quote"
  | "divider"
  | "image";

export interface BaseBlock {
  id: string;
  type: BlockType;
}

export interface ParagraphBlock extends BaseBlock {
  type: "paragraph";
  text: string;
}

export interface HeadingBlock extends BaseBlock {
  type: "heading";
  level: 2 | 3;
  text: string;
}

export interface QuoteBlock extends BaseBlock {
  type: "quote";
  text: string;
  author: string;
}

export interface DividerBlock extends BaseBlock {
  type: "divider";
  
}
export type ImageBlock = BaseBlock & {
  type: "image";
  src: string;
  alt: string;
  caption: string;
  credit: string;
};
export type ArticleBlock =
  | ParagraphBlock
  | HeadingBlock
  | QuoteBlock
  | DividerBlock
  | ImageBlock;

export interface ArticleDocument {
  version: 1;
  blocks: ArticleBlock[];
}