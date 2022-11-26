import * as core from "@actions/core";
import * as github from '@actions/github'
import parse from "parse-diff";

async function run() {
  try {
    const owner = core.getInput("owner", { required: true });
    const repo = core.getInput("repo", { required: true });
    const pull_number = Number(core.getInput("pr_number", { required: true }));
    const token = core.getInput("github-token", { required: true });
    const findText = core.getInput("check", { required: true });

    const octokit = github.getOctokit(token);

    const prDiff: any = await octokit.rest.pulls.get({
      owner,
      repo,
      pull_number,
      mediaType: {
        format: "diff",
      },
    });
    const files = parse(prDiff);
    core.exportVariable("files", files);
    core.setOutput("files", files);

    const result: parse.Change[] = [];
    let additionCount = 0;
    let deletetionCount = 0;

    files.forEach(function (file) {
      file.chunks.forEach(function (chunk) {
        chunk.changes.forEach(function (change) {
          if (change.content.includes(findText)) {
            result.push(change);
            if (change.type === "del") {
              deletetionCount++;
            } else if (change.type === "add") {
              additionCount++;
            }
          }
        });
      });
    });

    core.exportVariable("result", result);
    core.setOutput("result", result);

    /**
     * Create a comment on the PR with the information we compiled from the
     * list of changed files.
     */
    await octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number: pull_number,
      body: `
      ${findText} addition/removal details for #${pull_number}: \n
      - ${additionCount} additions \n
      - ${deletetionCount} deletions \n
    `,
    });
  } catch (error) {
    let errorMessage = "Failed to do something exceptional";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    core.setFailed(errorMessage);
  }
}

run();
