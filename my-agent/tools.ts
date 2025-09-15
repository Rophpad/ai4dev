import { tool } from "ai";
import { simpleGit } from "simple-git";
import { z } from "zod";

const excludeFiles = ["dist", "bun.lock"];

const fileChange = z.object({
  rootDir: z.string().min(1).describe("The root directory"),
});

type FileChange = z.infer<typeof fileChange>

async function getFileChangesInDirectory({ rootDir }: FileChange) {
  const git = simpleGit(rootDir);
  const summary = await git.diffSummary();
  const diffs: { file: string; diff: string }[] = [];

  for (const file of summary.files) {
    if (excludeFiles.includes(file.file)) continue;
    const diff = await git.diff(["--", file.file]);
    diffs.push({ file: file.file, diff });
  }

  return diffs;
}

export const getFileChangesInDirectoryTool = tool({
  description: "Gets the code changes made in given directory",
  inputSchema: fileChange,
  execute: getFileChangesInDirectory,
});

import { promises as fs } from "fs";

// Tool to generate a commit message from a diff summary
const commitMessageInput = z.object({
  diff: z.string().min(1).describe("The git diff or summary of changes"),
});
type CommitMessageInput = z.infer<typeof commitMessageInput>;

async function generateCommitMessage({ diff }: CommitMessageInput) {
  // For demo: simple template, but you could call an LLM here
  return `Commit message suggestion:\n\n${diff.substring(0, 200)}...`;
}

export const generateCommitMessageTool = tool({
  description: "Generates a commit message from a diff or summary",
  inputSchema: commitMessageInput,
  execute: generateCommitMessage,
});

// Tool to write review to a markdown file
const writeReviewInput = z.object({
  review: z.string().min(1).describe("The review text to write"),
  filePath: z.string().min(1).describe("The markdown file path"),
});
type WriteReviewInput = z.infer<typeof writeReviewInput>;

async function writeReviewToMarkdown({ review, filePath }: WriteReviewInput) {
  await fs.writeFile(filePath, review, "utf-8");
  return `Review written to ${filePath}`;
}

export const writeReviewToMarkdownTool = tool({
  description: "Writes the review text to a markdown file",
  inputSchema: writeReviewInput,
  execute: writeReviewToMarkdown,
});